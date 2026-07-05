"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  const springX = useSpring(x, { stiffness: 420, damping: 34, mass: 0.22 });
  const springY = useSpring(y, { stiffness: 420, damping: 34, mass: 0.22 });

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateMode = () => setEnabled(media.matches);
    updateMode();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", updateMode);
      return () => media.removeEventListener("change", updateMode);
    }

    media.addListener(updateMode);
    return () => media.removeListener(updateMode);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);

      const target = e.target as HTMLElement | null;
      setHovering(!!target?.closest("a,button,input,textarea,select,[data-cursor-hover]"));
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseout", onLeave, { passive: true });
    window.addEventListener("mouseover", onEnter, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      window.removeEventListener("mouseover", onEnter);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[2147483647] hidden md:block"
      style={{ x: springX, y: springY, opacity: visible ? 1 : 0 }}
    >
      <motion.div
        animate={{
          width: hovering ? 42 : 18,
          height: hovering ? 42 : 18,
          borderColor: hovering ? "rgba(92, 224, 255, 0.95)" : "rgba(92, 224, 255, 0.7)",
          backgroundColor: hovering ? "rgba(92, 224, 255, 0.12)" : "rgba(92, 224, 255, 0.04)",
          boxShadow: hovering
            ? "0 0 28px rgba(92, 224, 255, 0.22)"
            : "0 0 16px rgba(92, 224, 255, 0.12)",
        }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        className="-translate-x-1/2 -translate-y-1/2 rounded-full border flex items-center justify-center backdrop-blur-[2px]"
      >
        <motion.div
          animate={{
            scale: hovering ? 1.15 : 1,
            opacity: hovering ? 1 : 0.85,
          }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="h-1.5 w-1.5 rounded-full bg-circuit"
        />
      </motion.div>
    </motion.div>
  );
}