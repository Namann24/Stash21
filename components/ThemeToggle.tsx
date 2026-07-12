"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggle, mounted } = useTheme();
  const isDark = theme === "dark";

  if (!mounted) {
    return (
      <div className={`gear-toggle ${compact ? "gear-toggle-compact" : ""}`} aria-hidden="true">
        <span className="gear-toggle-track">
          <span className="gear-toggle-track-inner" />
        </span>
      </div>
    );
  }

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05 }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`gear-toggle ${compact ? "gear-toggle-compact" : ""}`}
      data-cursor-hover
    >
      {/* Track background */}
      <span className="gear-toggle-track">
        <span className="gear-toggle-track-inner" />

        {/* Active glow behind knob position */}
        <motion.span
          className="absolute inset-0 rounded-[16px] pointer-events-none"
          animate={{
            background: isDark
              ? "radial-gradient(circle at 22% 50%, rgba(77,216,232,0.18), transparent 55%)"
              : "radial-gradient(circle at 78% 50%, rgba(243,223,168,0.28), transparent 55%)"
          }}
          transition={{ duration: 0.5 }}
        />
      </span>

      {/* Tick marks decoration */}
      <span className="gear-toggle-ticks" />

      {/* Sliding knob with gear SVG */}
      <motion.span
        className="gear-toggle-knob"
        animate={{
          x: isDark ? 0 : compact ? 28 : 36,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 28,
          mass: 0.9,
        }}
      >
        {/* Knob background */}
        <motion.span
          className="gear-toggle-knob-inner"
          animate={{
            boxShadow: isDark
              ? "0 0 14px 3px rgba(77,216,232,0.40), inset 0 0 8px rgba(77,216,232,0.15)"
              : "0 0 14px 3px rgba(243,223,168,0.50), inset 0 0 8px rgba(243,223,168,0.20)"
          }}
          transition={{ duration: 0.4 }}
        />

        {/* Rotating gear border SVG */}
        <motion.svg
          className="absolute inset-[-3px] w-[32px] h-[32px]"
          viewBox="0 0 32 32"
          animate={{ rotate: isDark ? 0 : 180 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            mass: 1,
          }}
        >
          {/* Gear teeth */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45) * Math.PI / 180;
            const cx = 16 + Math.cos(angle) * 14;
            const cy = 16 + Math.sin(angle) * 14;
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r="2"
                fill={isDark ? "rgba(77,216,232,0.45)" : "rgba(201,162,75,0.55)"}
                className="transition-colors duration-300"
              />
            );
          })}
        </motion.svg>

        {/* Sun / Moon icon animated */}
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.svg
              key="moon"
              className="gear-toggle-icon"
              viewBox="0 0 24 24"
              fill="none"
              initial={{ rotate: -30, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 30, scale: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <path
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                stroke="#4DD8E8"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="rgba(77,216,232,0.15)"
              />
            </motion.svg>
          ) : (
            <motion.svg
              key="sun"
              className="gear-toggle-icon"
              viewBox="0 0 24 24"
              fill="none"
              initial={{ rotate: 30, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -30, scale: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <circle cx="12" cy="12" r="4" stroke="#C9A24B" strokeWidth="1.5" fill="rgba(201,162,75,0.20)" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const x1 = 12 + Math.cos(rad) * 7;
                const y1 = 12 + Math.sin(rad) * 7;
                const x2 = 12 + Math.cos(rad) * 9;
                const y2 = 12 + Math.sin(rad) * 9;
                return (
                  <line
                    key={deg}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#C9A24B"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                );
              })}
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.span>
    </motion.button>
  );
}
