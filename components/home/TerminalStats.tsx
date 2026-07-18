"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const SYSTEM_LOGS = [
  "> INITIALIZING LIVE DASHBOARD...",
  "> KERNEL: v2.6.0-stable",
  "> NETWORK: CONNECTED (0.3ms ping)",
  "> TOTAL_PROJECTS: 1,402",
  "> ACTIVE_NODES: 8,432",
  "> LATEST_COMMIT: 'Fix quantum sensor drift'",
  "> STATUS: OPERATIONAL [100%]"
];

export default function TerminalStats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);

  useEffect(() => {
    if (isInView) {
      let currentLine = 0;
      const interval = setInterval(() => {
        if (currentLine < SYSTEM_LOGS.length) {
          setDisplayedLines(prev => [...prev, SYSTEM_LOGS[currentLine]]);
          currentLine++;
        } else {
          clearInterval(interval);
        }
      }, 350);
      return () => clearInterval(interval);
    }
  }, [isInView]);

  return (
    <section className="py-20 relative px-4 z-10" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <div className="hud-corners bg-[#050505]/90 backdrop-blur-md border border-circuit/30 p-6 shadow-[0_0_30px_rgba(77,216,232,0.15)] relative overflow-hidden">
          {/* Top colored line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-circuit via-violet to-circuit" />
          
          {/* Terminal Window Header */}
          <div className="flex items-center gap-2 mb-4 opacity-70 pb-4 border-b border-circuit/20">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-4 font-mono text-xs tracking-widest text-steel">ROOT@STASH21:~#</span>
          </div>
          
          {/* Terminal Content */}
          <div className="font-mono text-sm md:text-base text-circuit flex flex-col gap-2 min-h-[220px]">
            {displayedLines.map((line, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="drop-shadow-[0_0_5px_rgba(77,216,232,0.6)]"
              >
                {line}
              </motion.div>
            ))}
            
            {/* Blinking Cursor */}
            <motion.div 
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              className="w-3 h-5 bg-circuit mt-1 drop-shadow-[0_0_8px_rgba(77,216,232,0.8)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
