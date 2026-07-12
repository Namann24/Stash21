"use client";
import { motion, type TargetAndTransition } from "framer-motion";
import { type ReactNode } from "react";

type AnimationType = "fade-up" | "fade-left" | "fade-right" | "scale-in" | "blur-in";

const animationVariants: Record<AnimationType, { initial: TargetAndTransition; animate: TargetAndTransition }> = {
  "fade-up": {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
  },
  "fade-left": {
    initial: { opacity: 0, x: -40 },
    animate: { opacity: 1, x: 0 },
  },
  "fade-right": {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
  },
  "scale-in": {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  },
  "blur-in": {
    initial: { opacity: 0, filter: "blur(8px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
  },
};

export default function ScrollReveal({
  children,
  delay = 0,
  className = "",
  animation = "fade-up",
  duration = 0.7,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  animation?: AnimationType;
  duration?: number;
}) {
  const variant = animationVariants[animation];

  return (
    <motion.div
      initial={variant.initial}
      whileInView={variant.animate}
      viewport={{ once: true, amount: 0.18 }}
      transition={{
        duration,
        delay: delay / 1000,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
