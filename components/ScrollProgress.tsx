"use client";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  const glowOpacity = useTransform(scrollYProgress, [0, 0.02, 1], [0, 1, 1]);

  return (
    <>
      {/* Progress bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-circuit via-brass to-copper origin-left z-[100]"
      />
      {/* Glowing leading dot */}
      <motion.div
        style={{
          left: scaleX.get() ? undefined : 0,
          opacity: glowOpacity,
          scaleX: 1,
        }}
        className="fixed top-0 right-0 z-[100] pointer-events-none"
      >
        <motion.div
          style={{ x: useTransform(scaleX, (v) => `calc(${v * 100}vw - 6px)`) }}
          className="w-3 h-3 -top-[5px] absolute rounded-full"
        >
          <span className="absolute inset-0 rounded-full bg-brass shadow-[0_0_12px_4px_rgba(201,162,75,0.60)]" />
          <span className="absolute inset-[2px] rounded-full bg-champagne" />
        </motion.div>
      </motion.div>
    </>
  );
}
