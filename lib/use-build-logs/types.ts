import type { MutableRefObject } from "react";

export interface StreamLogsOptions {
  since?: number;
  deploymentRef: MutableRefObject<Deployment | undefined | null>;
  onLog: (log: RawLog) => void;
  onResponse?: (res: Response) => void;
  deploymentId: string;
}

export interface ProcessedStep {
  finishedAt: number | null;
  logs: BuildLog[];
  startedAt: number;
  name: VisibleBuildStep;
}

export enum BuildStep {
  Building = "BUILDING",
  FetchingSourceCode = "FETCHING_SOURCE_CODE",
  PopulatingBuildCache = "POPULATING_BUILD_CACHE",
  PreparingBuildEnv = "PREPARING_BUILD_ENV",
  RestoringBuildCache = "RESTORING_BUILD_CACHE",
  UploadingBuildOutputs = "UPLOADING_BUILD_OUTPUTS",
}

export type VisibleBuildStep = Exclude<
  BuildStep,
  | BuildStep.PopulatingBuildCache
  | BuildStep.PreparingBuildEnv
  | BuildStep.RestoringBuildCache
>;

export enum BuildLogType {
  Delimiter = "delimiter",
  Stdout = "stdout",
  Stderr = "stderr",
}

interface BaseLogInfo {
  name: string;
}

interface BuildLogInfo extends BaseLogInfo {
  type: "build";
  entrypoint: string;
}

interface DelimiterLogInfo extends BaseLogInfo {
  type: "delimiter";
  step: BuildStep;
}

interface BaseLog<T extends BuildLogType> {
  deploymentId: string;
  id: string;
  info: T extends BuildLogType.Stdout ? BuildLogInfo : DelimiterLogInfo;
  serial: string;
  text: T extends BuildLogType.Stdout ? string : undefined;
  type: T;
  level?: "warning" | "error";
}

export interface RawLog<T extends BuildLogType = BuildLogType>
  extends BaseLog<T> {
  created: number;
  date: number;
}

interface ProcessedLog<T extends BuildLogType> extends BaseLog<T> {
  created: number;
}

export type BuildLog = ProcessedLog<BuildLogType.Stdout>;
export type DelimiterLog = ProcessedLog<BuildLogType.Delimiter>;
export type Log = BuildLog | DelimiterLog;

export interface LogsQuery {
  builds?: 0 | 1;
  delimiter?: 0 | 1;
  direction?: "backward" | "forward";
  follow?: 0 | 1;
  format?: "lines" | "array";
  limit?: number;
  name?: string;
  since?: number;
  statusCode?: number | string;
  until?: number;
}

type DeploymentStatus =
  | "QUEUED"
  | "BUILDING"
  | "READY"
  | "ERROR"
  | "CANCELED"
  | "DELETED";

type GitSource = {
  ref: string;
  sha: string;
} & (
  | { type: "github"; repoId: number }
  | { type: "github"; org: string; repo: string }
  | { type: "gitlab"; projectId: number }
  | { type: "bitbucket"; owner: string; slug: string }
);

type Target = "production" | "staging" | null;

interface Lambda {
  id: string;
  entrypoint?: string;
}

export interface Deployment {
  isPrivate?: boolean;
  id: string;
  uid?: string;
  url: string;
  name: string;
  host: string;
  source?: "git" | "import" | "cli" | "import/repo" | "v0-web";
  readyState: DeploymentStatus;
  readyStateReason?: string;
  readySubstate?: "STAGED" | "PROMOTED";
  softDeletedByRetention?: boolean;
  status: DeploymentStatus;
  state?: DeploymentStatus;
  ready: number;
  buildingAt: number;
  canceledAt?: number;
  readyStateAt?: number;

  meta: Record<string, string | number | boolean>;
  gitSource?: GitSource;
  lambdas: Lambda[];
  created?: number;
  createdAt: number;
  creator: {
    uid: string;
    username: string;
  };
  deleted?: number;
  undeleted?: number;
  aliasError?: {
    code: string;
    message: string;
  } | null;
  aliasWarning?: {
    code: string;
    message: string;
    link?: string;
    action?: string;
  };
  target?: Target;
  aliasAssigned: boolean;
  aliasAssignedAt?: number;
  alias: string[];
  automaticAliases?: string[];
  defaultRoute?: string;
  ownerId: string;
  projectId: string;
  public?: boolean;
  crons?: { schedule: string; path: string }[];
  errorCode?: string;
  errorLink?: string;
  errorMessage?: string;
  errorStep?: string;
  routes?: {
    dest?: string;
    src?: string;

    headers?: Record<string, string>;
    middleware?: number;
  }[];
  inspectorUrl: string;
  checksConclusion?: "succeeded" | "failed" | "skipped";
  userAliases?: string[];
  projectSettings?: {
    outputDirectory?: string | null;
    buildCommand?: string | null;
    installCommand?: string | null;
    devCommand?: string | null;
    framework?: string | null;
    commandForIgnoringBuildStep?: string | null;
    gitComments?: {
      onCommit: boolean;
      onPullRequest: boolean;
    };
  };
  isRollbackCandidate?: boolean;
  previewCommentsEnabled?: boolean;
  gitRepo?: {
    path: string;
    defaultBranch: string;
    name: string;
    private: boolean;
    type: "github" | "bitbucket" | "gitlab";
    ownerType: "team" | "user";
  };
  connectBuildsEnabled?: string;
  connectConfigurationId?: string;
  flags?: {
    definitions: {
      key: string;
      options: { label?: string; value?: unknown }[];
      origin?: string;
      description?: string;
    }[];
  };
  isFirstBranchDeployment?: boolean;
  buildSkipped: boolean;
  customEnvironment?: {
    id: string;
    slug?: string;
  };
  integrations?: {
    status: "pending" | "ready" | "error" | "skipped" | "timeout";
    startedAt: number;
    completedAt?: number;
    skippedAt?: number;
    skippedBy?: string;
  };
}
