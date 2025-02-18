import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function ProgressBar({
  totalTimeInSeconds = 60,
}: {
  totalTimeInSeconds: number;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prevProgress + 100 / (totalTimeInSeconds * 10);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [totalTimeInSeconds]);

  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-5">
      <motion.div
        className="h-full bg-black"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{
          type: "spring",
          stiffness: 20,
          damping: 20,
        }}
      />
    </div>
  );
}
