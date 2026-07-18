"use client";

import { motion } from "framer-motion";

export default function RadarSweep() {
  return (
    <motion.div
      className="fixed left-0 right-0 h-[2px] z-40 pointer-events-none mix-blend-screen opacity-30"
      style={{
        background: "linear-gradient(90deg, transparent 0%, #4DD8E8 50%, transparent 100%)",
        boxShadow: "0 0 15px 2px #4DD8E8, 0 0 50px 10px rgba(77,216,232,0.3)",
      }}
      animate={{ top: ["-5%", "105%"] }}
      transition={{ 
        duration: 3,
        repeat: Infinity,
        repeatDelay: 12,
        ease: "linear"
      }}
    />
  );
}
