"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BootSequence() {
  const [show, setShow] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

  const lines = [
    "INIT SYSTEM...",
    "LOADING KERNEL MODULES [OK]",
    "MOUNTING ROOT FILE SYSTEM [OK]",
    "STARTING HARDWARE ABSTRACTION LAYER [OK]",
    "INITIALIZING IOT PERIPHERALS...",
    "SENSOR ARRAY : CONNECTED",
    "FIRMWARE     : v2.6.0 (STABLE)",
    "BOOTING STASH21 ENVIRONMENT...",
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasBooted = sessionStorage.getItem("stash21_booted");
      if (!hasBooted) {
        setShow(true);
        sessionStorage.setItem("stash21_booted", "true");
        
        // Disable scroll during boot
        document.body.style.overflow = "hidden";
        
        // Progress text
        let currentIndex = 0;
        const interval = setInterval(() => {
          currentIndex++;
          setTextIndex(currentIndex);
          if (currentIndex >= lines.length) {
            clearInterval(interval);
            setTimeout(() => {
              setShow(false);
              document.body.style.overflow = "";
            }, 600); // short pause before fading out
          }
        }, 150);
        
        return () => {
          clearInterval(interval);
          document.body.style.overflow = "";
        };
      }
    }
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-black text-circuit font-mono text-sm sm:text-base flex flex-col p-8 md:p-16 overflow-hidden"
        >
          <div className="noise-overlay opacity-10" />
          
          <div className="flex flex-col gap-2 relative z-10 max-w-3xl">
            <div className="mb-8 opacity-80 text-steel text-xs">
              BIOS v1.02.4 (c) 2026 Stash21 Systems<br/>
              CPU: Steampunk Architecture @ 4.2GHz
            </div>
            
            {lines.slice(0, textIndex + 1).map((line, i) => (
              <div key={i} className={i === textIndex ? "animate-pulse" : ""}>
                {line}
              </div>
            ))}
            
            {textIndex >= lines.length && (
              <div className="mt-4 text-brass-light animate-pulse">
                [SYSTEM READY]
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
