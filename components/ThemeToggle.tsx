"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const trackRef = useRef<HTMLButtonElement>(null);
  const isDark = theme === "dark";

  return (
    <motion.button
      ref={trackRef}
      onClick={toggle}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="pcb-toggle"
      data-cursor-hover
    >
      {/* PCB trace track background */}
      <span className="pcb-toggle-track">
        {/* Copper trace lines etched into track */}
        <span className="pcb-trace pcb-trace-1" />
        <span className="pcb-trace pcb-trace-2" />
        <span className="pcb-trace pcb-trace-3" />

        {/* Via holes (PCB drill points) */}
        <span className="pcb-via pcb-via-left" />
        <span className="pcb-via pcb-via-right" />
      </span>

      {/* Active state glow behind track */}
      <motion.span
        className="pcb-toggle-active-glow"
        animate={{
          background: isDark
            ? "radial-gradient(circle at 25% 50%, rgba(77,216,232,0.2), transparent 60%)"
            : "radial-gradient(circle at 75% 50%, rgba(243,223,168,0.3), transparent 60%)"
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Label icons — etched into the PCB */}
      <span className="pcb-label pcb-label-left">
        {/* Moon symbol — crescent */}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="pcb-label-icon">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      <span className="pcb-label pcb-label-right">
        {/* Sun symbol */}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="pcb-label-icon">
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </span>

      {/* Sliding knob / component */}
      <motion.span
        className="pcb-knob"
        layout
        animate={{
          x: isDark ? 0 : 26,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
          mass: 0.8,
        }}
      >
        {/* Knob inner glow */}
        <motion.span
          className="pcb-knob-glow"
          animate={{
            boxShadow: isDark
              ? "0 0 12px 2px rgba(77,216,232,0.5), 0 0 24px 4px rgba(77,216,232,0.2), inset 0 0 6px rgba(77,216,232,0.3)"
              : "0 0 12px 2px rgba(243,223,168,0.6), 0 0 24px 4px rgba(201,162,75,0.25), inset 0 0 6px rgba(243,223,168,0.3)"
          }}
          transition={{ duration: 0.4 }}
        />

        {/* LED indicator dot */}
        <motion.span
          className="pcb-led"
          animate={{
            backgroundColor: isDark ? "#4DD8E8" : "#F3DFA8",
            boxShadow: isDark
              ? "0 0 6px 2px rgba(77,216,232,0.8)"
              : "0 0 6px 2px rgba(243,223,168,0.8)"
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.span>

      {/* Solder pads at ends */}
      <span className="pcb-pad pcb-pad-left" />
      <span className="pcb-pad pcb-pad-right" />
    </motion.button>
  );
}
