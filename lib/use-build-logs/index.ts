import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TextLineStream from "textlinestream";
import queryString from "query-string";
import * as T from "./types";

const MAX_DISPLAYED_LOGS = 10_000;
const DONE_STATES = ["READY", "ERROR", "CANCELED", "DELETED"];

function isDeploymentFinished(deployment?: T.Deployment | null): boolean {
  if (!deployment) return false;
  const { readyState } = deployment;
  return DONE_STATES.includes(readyState);
}

/**
 * A type guard to check if a log is a delimiter.
 *
 * @param log - Log
 * @returns `true` if the Log is a delimiter.
 */
const isDelimiterLog = (log: T.Log): log is T.DelimiterLog =>
  log.type === T.BuildLogType.Delimiter;

/**
 * Streams logs from a supplied date (`since`).
 *
 * @param options - Options
 * @returns
 */
const fetchLogs = async ({
  onLog,
  onResponse,
  since,
  deploymentRef,
  deploymentId,
}: T.StreamLogsOptions): Promise<void> => {
  const query: T.LogsQuery = {
    builds: 1,
    since,
    direction: "forward",
    follow: !isDeploymentFinished(deploymentRef.current) ? 1 : undefined,
  };

  let lastSince = since ?? 0;

  return fetch(
    `/api/deployment-events/${deploymentId}?${queryString.stringify(query)}`
  ).then(async (res: Response) => {
    onResponse?.(res);

    if (res.status < 200 || res.status >= 300) {
      const text = await res.text();
      throw new Error(`Failed to fetch log stream: ${res.status} ${text}`);
    }

    if (query.follow !== 1) {
      // when not following, read all logs at once.
      for (const log of await res.json()) {
        onLog(log as T.RawLog);
      }
      return;
    }

    const reader = res.body
      ?.pipeThrough(new TextDecoderStream())
      .pipeThrough(
        new TextLineStream<T.RawLog | null>({
          mapperFun: (s: string) => {
            try {
              return JSON.parse(s) as T.RawLog;
            } catch {
              // when stream ends, parsing is likely to fail.
              return null;
            }
          },
        })
      )
      .getReader();

    if (!reader) {
      return;
    }

    while (true) {
      const { value, done } = (await reader.read()) as {
        value: T.RawLog;
        done: boolean;
      };

      if (done || !value) break;

      if ("created" in value) {
        // ignore keepalive which are the only logs without a creation date.
        lastSince = value.created + 1;
        onLog(value);
      }
    }

    await new Promise((r) => {
      setTimeout(r, 1000);
    });

    // The stream has ended, attempt to reconnect after a delay, only since the last known log.
    return fetchLogs({
      deploymentRef,
      since: lastSince,
      onLog,
      onResponse,
      deploymentId,
    });
  });
};

/**
 * Appends an `error` or `warning` boolean to each log, based on the log's text
 * content.
 *
 * If a log doesn't contain an `id`, nothing is returned.
 *
 * @param log - Log
 * @returns A processed log
 */
export const getLogWithType = (
  log: T.RawLog,
  previousLog: T.Log | undefined,
  opts: { useLevelFlag?: boolean } = {}
): T.BuildLog | undefined => {
  if (opts.useLevelFlag) {
    return log as T.BuildLog;
  }

  let level;

  // Ignore any logs without an ID.
  if (!log.id) return;

  if (log.text !== undefined) {
    const unified = removeAnsiCodes(log.text.toLowerCase());
    let linePrefix = "";
    if (previousLog?.text?.length) {
      const unifiedPrevious = removeAnsiCodes(previousLog.text);
      for (let i = 0; i < unifiedPrevious.length; i++) {
        if (TAB_PATTERNS.some((pattern) => linePrefix.endsWith(pattern))) {
          break;
        }
        if (unified[i] !== unifiedPrevious[i]) {
          break;
        }
        linePrefix += unifiedPrevious[i];
      }
    }

    if (
      TAB_PATTERNS.some(
        (pattern) =>
          unified.startsWith(pattern) ||
          unified.startsWith(`${linePrefix}${pattern}`)
      ) ||
      unified === ""
    ) {
      if (previousLog?.level) {
        level = previousLog.level;
      }
    }

    if (!level) {
      if (
        !unified.startsWith("warning") &&
        (/(^| |\[|eval|internal|range|reference|syntax|type|uri|fetch)err(or)?( |:)/i.test(
          unified
        ) ||
          ERROR_PATTERNS.some((pattern) => unified.includes(pattern)) ||
          unified.startsWith(" ⨯ ") ||
          unified.startsWith("    at ") ||
          unified.startsWith("npm err!"))
      ) {
        level = "error";
      } else if (
        WARNING_PATTERNS.some(
          (pattern) =>
            unified.includes(pattern) && !unified.includes("deprecationwarning")
        )
      ) {
        level = "warning";
      }
    }
  }

  return {
    ...log,
    level,
  } as T.BuildLog;
};

/**
 * These should all be lowercase.
 */
const ERROR_PATTERNS = [
  "command not found",
  "module not found",
  "failed to compile",
  "cannot open shared object file",
  "err_pnpm_",
  "please contact vercel.com/help",
  "exit code 1",
  "elifecycle",
  "exited",
  // initial space charater is important to differentiate between
  // the word appearing in a package.
  " error:",
];

const WARNING_PATTERNS = ["warning:", "warn:", "warn!"];

const TAB_PATTERNS = [
  // 2 spaces
  "  ",
  // 3 spaces
  "   ",
  // 4 spaces
  "    ",
  // Tab character
  "	",
  // Used to point to a line that caused an error/warning
  "> ",
];

/**
 * Returns build logs for a specified deployment.
 *
 * @param deployment - The deployment object
 * @returns Build logs and progress
 */
export function useBuildLogs(deployment: T.Deployment | null): {
  steps: T.ProcessedStep[];
  loading: boolean;
} {
  const [logs, setLogs] = useState<T.Log[]>([]);
  const [loading, setLoading] = useState(true);
  const createdAtRef = useRef<number | undefined>(undefined);
  // We use a ref here as state causes functions to be recreated.
  const logsRef = useRef<T.Log[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const deploymentRef = useRef<T.Deployment | null>(null);
  deploymentRef.current = deployment;

  const createdAt = deployment?.createdAt;
  const deploymentId = deployment?.id;

  const addLog = useCallback((log: T.RawLog) => {
    const previousLog = logsRef.current.at(-1);
    const newLog = getLogWithType(log, previousLog, { useLevelFlag: false });
    if (!newLog) return;
    const allLogs = [...logsRef.current, newLog];
    if (allLogs.length === MAX_DISPLAYED_LOGS) {
      allLogs[0].level = "warning";
      allLogs[0].text = `Warning: You're seeing the last ${MAX_DISPLAYED_LOGS} lines of logs. Any lines before that were automatically truncated.`;
    }
    logsRef.current = allLogs;

    setLogs(logsRef.current);
  }, []);

  // Fetch initial logs, and then stream any new logs.
  useEffect(() => {
    // we don't have a deploymentId, so clear the logs
    if (!deploymentId) {
      setLogs([]);
      logsRef.current = [];
      return;
    }
    setLoading(true);
    // Clear logs on a new deployment.
    if (createdAt !== createdAtRef.current) {
      createdAtRef.current = createdAt;
      setLogs([]);
      logsRef.current = [];
    }

    const controller = new AbortController();
    // cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLogs([]);
      logsRef.current = [];
    }
    abortControllerRef.current = controller;

    // Connect and stream logs.
    fetchLogs({
      onLog: addLog,
      onResponse: (): void => setLoading(false),
      deploymentRef,
      deploymentId,
    }).catch((e) => {
      setLoading(false);
      if (e instanceof Error && e.name === "AbortError") {
        return;
      }
    });

    return (): void => controller.abort();
  }, [addLog, createdAt, deploymentId]);

  const steps = useMemo(() => {
    const steps: T.ProcessedStep[] = [];

    for (const log of logs) {
      if (!isDelimiterLog(log)) {
        if (!steps[0]) {
          steps.push({
            finishedAt: null,
            logs: [],
            name: T.BuildStep.Building,
            startedAt: deployment?.buildingAt ?? log.created,
          });
        }

        const step = steps[0];

        // Add the new log.
        step.logs.push(log);

        // We don't get info that this ever completes, so we mark it as done
        // when the deployment is done.
        if (deployment?.readyState === "READY") {
          step.finishedAt = deployment?.ready;
        }
      }
    }

    return steps;
  }, [deployment?.buildingAt, deployment?.ready, deployment?.readyState, logs]);

  return { steps, loading };
}

function removeAnsiCodes(str: string): string {
  // ANSI escape codes start with the escape character followed by [,
  // then zero or more numbers separated by ;, and end with a letter from @ to ~.
  const ansiEscapeCodes = /\x1b\[[0-9;]*[a-zA-Z]/g;
  return str.replace(ansiEscapeCodes, "");
}
