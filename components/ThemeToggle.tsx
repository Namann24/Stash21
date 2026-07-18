"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggle, mounted } = useTheme();
  const isDark = theme === "dark";
  const [isSurging, setIsSurging] = useState(false);

  if (!mounted) {
    return (
      <div className="pcb-toggle opacity-50 pointer-events-none" aria-hidden="true">
        <div className="pcb-toggle-track" />
      </div>
    );
  }

  const handleToggle = () => {
    if (isSurging) return; // Prevent spam clicking

    setIsSurging(true);

    // Trigger global body glitch surge
    document.body.classList.add("power-surge-active");

    // Wait half-way through the surge to actually flip the colors
    setTimeout(() => {
      toggle();
    }, 250);

    // Remove the class when surge is done
    setTimeout(() => {
      document.body.classList.remove("power-surge-active");
      setIsSurging(false);
    }, 600);
  };

  return (
    <motion.button
      onClick={handleToggle}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05 }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="pcb-toggle group"
      data-cursor-hover
    >
      {/* Background PCB Track */}
      <span className="pcb-toggle-track">
        {/* Copper Traces */}
        <span className="pcb-trace pcb-trace-1" />
        <span className="pcb-trace pcb-trace-2" />
        <span className="pcb-trace pcb-trace-3" />
        
        {/* Solder Pads */}
        <span className="pcb-pad pcb-pad-left" />
        <span className="pcb-pad pcb-pad-right" />
        
        {/* Drill Vias */}
        <span className="pcb-via pcb-via-left" />
        <span className="pcb-via pcb-via-right" />

        {/* Ambient track glow when hovered */}
        <motion.span
          className="pcb-toggle-active-glow"
          animate={{
            background: isDark
              ? "radial-gradient(circle at 20% 50%, rgba(77,216,232,0.15), transparent 60%)"
              : "radial-gradient(circle at 80% 50%, rgba(201,162,75,0.15), transparent 60%)"
          }}
          transition={{ duration: 0.5 }}
        />
      </span>

      {/* Under-track icons (visible when knob slides away) */}
      <span className="pcb-label pcb-label-left">
        <Moon className="pcb-label-icon w-3 h-3" />
      </span>
      <span className="pcb-label pcb-label-right">
        <Sun className="pcb-label-icon w-3.5 h-3.5" />
      </span>

      {/* Sliding Physical Component */}
      <motion.span
        className="pcb-knob"
        animate={{ x: isDark ? 0 : 34 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 25,
          mass: 0.8,
        }}
      >
        <span className="pcb-knob-glow" />
        
        {/* LED Indicator on the chip */}
        <motion.span
          className="pcb-led"
          animate={{
            backgroundColor: isDark ? "#4DD8E8" : "#E8CE8C",
            boxShadow: isDark 
              ? "0 0 8px 2px rgba(77,216,232,0.6)" 
              : "0 0 8px 2px rgba(232,206,140,0.6)"
          }}
          transition={{ duration: 0.2 }}
        />

        {/* High-voltage Spark Effect attached to the sliding knob */}
        <AnimatePresence>
          {isSurging && (
            <motion.svg
              className="absolute z-10 pointer-events-none w-10 h-10"
              style={{ top: -8, left: -8, color: isDark ? "#4DD8E8" : "#E8CE8C" }}
              viewBox="0 0 24 24"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0, 1, 0], scale: 1.2, rotate: [0, 15, -15, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <path
                d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1.5"
                filter="drop-shadow(0 0 6px currentColor)"
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.span>
    </motion.button>
  );
}
