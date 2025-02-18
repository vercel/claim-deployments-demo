import { useBuildLogs } from "@/lib/use-build-logs";
import type { Deployment } from "@/lib/use-build-logs/types";
import { motion, AnimatePresence } from "framer-motion";

export function BuildLogs({ deployment }: { deployment: Deployment | null }) {
  const { steps: buildLogSteps } = useBuildLogs(deployment);

  const latestLog = buildLogSteps[0]?.logs
    .filter((log) => log.text !== "")
    .at(-1) || { text: "Deployment started ...", id: "first" };

  return (
    <AnimatePresence mode="popLayout">
      {latestLog && (
        <motion.div
          key={latestLog.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="mt-3 text-gray-600 p-3 rounded-md border border-gray-200 font-mono text-sm"
        >
          {latestLog.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
