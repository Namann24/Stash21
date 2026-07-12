"use client";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

const ITEMS = [
  "ESP32", "RP2040", "LoRa", "MQTT", "KiCad", "STM32", "FreeRTOS", "Zigbee",
  "I2C", "SPI", "Matter", "Raspberry Pi"
];

export default function TechMarquee() {
  const items = [...ITEMS, ...ITEMS];
  const trackRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="marquee-wrapper relative overflow-hidden py-6 border-y border-copper/15 bg-black/20 crt-overlay"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Fade masks on edges — theme-aware via CSS classes */}
      <div className="marquee-fade-left absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-ink to-transparent pointer-events-none" />
      <div className="marquee-fade-right absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-ink to-transparent pointer-events-none" />
      <div
        ref={trackRef}
        className="marquee-track"
        style={{
          animationPlayState: hovered ? "paused" : "running",
        }}
      >
        {items.map((item, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-3 px-8 shrink-0 group cursor-default"
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-brass chip-glow group-hover:bg-circuit transition-all duration-300"
              whileHover={{
                boxShadow: "0 0 12px rgba(77,216,232,0.5)",
                scale: 1.3,
              }}
            />
            <span className="font-mono text-sm tracking-[0.2em] text-steel uppercase whitespace-nowrap group-hover:text-brass-light transition-colors duration-300">{item}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
