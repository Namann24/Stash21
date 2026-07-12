"use client";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

import { Variants } from "framer-motion";

const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 18,
    filter: "blur(6px)",
    scale: 0.99,
  },
  enter: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(3px)",
    scale: 0.995,
    transition: {
      duration: 0.25,
      ease: "easeIn",
    },
  },
};

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        style={{ willChange: "transform, opacity, filter" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
