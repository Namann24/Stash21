"use client";

import { motion, useScroll, useTransform } from "framer-motion";

/* SVG Gear path — 12-tooth cog */
function GearSVG({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
    >
      <path
        d="M50 10 L54 18 L62 14 L60 22 L68 22 L64 30 L72 32 L66 38 L74 44 L66 46 L70 54 L62 52 L62 60 L54 56 L50 64 L46 56 L38 60 L38 52 L30 54 L34 46 L26 44 L34 38 L28 32 L36 30 L32 22 L40 22 L38 14 L46 18 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.5"
      />
      <circle cx="50" cy="37" r="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <circle cx="50" cy="37" r="4" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export default function FloatingGears() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 250]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -120]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-5" aria-hidden="true">
      {/* Top-left large gear */}
      <motion.div
        className="floating-gear absolute -top-12 -left-12"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        style={{ willChange: "transform", y: y1 }}
      >
        <GearSVG size={180} />
      </motion.div>

      {/* Bottom-right medium gear — counter-rotating */}
      <motion.div
        className="floating-gear absolute -bottom-8 -right-8"
        animate={{ rotate: -360 }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        style={{ willChange: "transform", y: y2 }}
      >
        <GearSVG size={140} />
      </motion.div>

      {/* Center-right small gear */}
      <motion.div
        className="floating-gear absolute top-[40%] -right-4"
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        style={{ willChange: "transform", y: y3 }}
      >
        <GearSVG size={80} />
      </motion.div>

      {/* Bottom-left tiny gear */}
      <motion.div
        className="floating-gear absolute bottom-[20%] -left-6"
        animate={{ rotate: -360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        style={{ willChange: "transform", y: y4 }}
      >
        <GearSVG size={100} />
      </motion.div>
    </div>
  );
}
