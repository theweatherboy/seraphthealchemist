"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [direction, setDirection] = useState<"forward" | "backward" | "neutral">("neutral");

  useEffect(() => {
    // Simple route depth tracking
    // / (0) -> /grimoire (1) -> /grimoire/slug (2)
    const currentDepth = pathname === "/" ? 0 : pathname.split("/").filter(Boolean).length;

    // We use a global window variable to track the previous depth
    // because template.tsx remounts on navigation.
    const prevDepth = (window as any)._prevDepth || 0;

    if (currentDepth > prevDepth) {
      setDirection("forward");
    } else if (currentDepth < prevDepth) {
      setDirection("backward");
    } else {
      setDirection("neutral");
    }

    (window as any)._prevDepth = currentDepth;
  }, [pathname]);

  const variants = {
    forward: {
      initial: { opacity: 0, x: 50, scale: 0.95, filter: "blur(10px)" },
      animate: { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" },
      exit: { opacity: 0, x: -50, scale: 1.05, filter: "blur(10px)" },
    },
    backward: {
      initial: { opacity: 0, x: -50, scale: 0.95, filter: "blur(10px)" },
      animate: { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" },
      exit: { opacity: 0, x: 50, scale: 1.05, filter: "blur(10px)" },
    },
    neutral: {
      initial: { opacity: 0, scale: 0.98, filter: "blur(5px)" },
      animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
      exit: { opacity: 0, scale: 1.02, filter: "blur(5px)" },
    },
  };

  const currentVariant = variants[direction];

  return (
    <motion.div
      initial={currentVariant.initial}
      animate={currentVariant.animate}
      exit={currentVariant.exit}
      transition={{
        duration: 0.7,
        ease: [0.43, 0.13, 0.23, 0.96] // Alchemical custom cubic-bezier
      }}
    >
      {children}
    </motion.div>
  );
}
