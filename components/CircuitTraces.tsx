"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export default function CircuitTraces() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  
  // Transform scroll progress to path length (0 to 1)
  const pathLength1 = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  const pathLength2 = useTransform(scrollYProgress, [0.2, 0.7], [0, 1]);
  const pathLength3 = useTransform(scrollYProgress, [0.4, 0.9], [0, 1]);

  const opacity1 = useTransform(scrollYProgress, [0.15, 0.2], [0, 1]);
  const opacity2 = useTransform(scrollYProgress, [0.35, 0.4], [0, 1]);
  const opacity3 = useTransform(scrollYProgress, [0.3, 0.35], [0, 1]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mix-blend-screen opacity-40">
      <svg className="w-full h-full" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="trace-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4DD8E8" stopOpacity="0" />
            <stop offset="50%" stopColor="#4DD8E8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8B6FE8" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Left Side Trace */}
        <motion.path
          d="M 50,0 V 300 L 100,350 V 800 L 40,860 V 1200"
          fill="transparent"
          stroke="url(#trace-grad)"
          strokeWidth="1.5"
          style={{ pathLength: pathLength1 }}
          className="drop-shadow-[0_0_8px_rgba(77,216,232,0.5)]"
        />

        {/* Right Side Trace */}
        <motion.path
          d="M calc(100% - 80px),0 V 500 L calc(100% - 140px),560 V 900 L calc(100% - 60px),980 V 1500"
          fill="transparent"
          stroke="url(#trace-grad)"
          strokeWidth="1"
          style={{ pathLength: pathLength2 }}
        />

        {/* Center Diagonal Trace */}
        <motion.path
          d="M 300,400 L 500,600 V 750 L 650,900"
          fill="transparent"
          stroke="rgba(201,162,75,0.4)"
          strokeWidth="1"
          strokeDasharray="4 4"
          style={{ pathLength: pathLength3 }}
        />
        
        {/* Connection nodes that appear */}
        <motion.circle 
          cx="100" cy="350" r="3" 
          fill="#4DD8E8" 
          style={{ opacity: opacity1 }}
        />
        <motion.circle 
          cx="40" cy="860" r="3" 
          fill="#4DD8E8" 
          style={{ opacity: opacity2 }}
        />
        <motion.circle 
          cx="calc(100% - 140px)" cy="560" r="3" 
          fill="#4DD8E8" 
          style={{ opacity: opacity3 }}
        />
      </svg>
    </div>
  );
}
