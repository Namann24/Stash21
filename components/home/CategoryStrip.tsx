"use client";
import { Cpu, Wifi, Zap, Wrench, BookOpen, Rocket } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import TiltCard from "@/components/TiltCard";

const categories = [
  { icon: Cpu, label: "Microcontrollers", desc: "ESP32, Arduino, RPi", code: "01" },
  { icon: Wifi, label: "IoT Networking", desc: "MQTT, WiFi, LoRa", code: "02" },
  { icon: Zap, label: "Power & Circuits", desc: "PCB, batteries, PSU", code: "03" },
  { icon: Wrench, label: "Hardware Builds", desc: "Enclosures, sensors", code: "04" },
  { icon: BookOpen, label: "Tutorials", desc: "Step-by-step guides", code: "05" },
  { icon: Rocket, label: "Projects", desc: "Full builds & demos", code: "06" }
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function CategoryStrip() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 section-glow">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="hud-label text-circuit text-center mb-3"
      >
        [ ARCHIVE.INDEX ]
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-display text-3xl md:text-5xl metal-text text-center mb-14 mx-auto block w-fit"
      >
        Explore by Category
      </motion.h2>
      <motion.div
        className="grid grid-cols-2 md:grid-cols-6 gap-5"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {categories.map((c) => (
          <motion.div
            key={c.label}
            variants={cardVariants}
            whileHover={{ y: -6, rotateX: 2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <TiltCard className="h-full">
              <div className="hud-corners scan-card holo-card card-glass rounded-2xl p-5 h-full flex flex-col items-center gap-3 hover:glow-border-strong transition-shadow duration-300 cursor-pointer group" data-cursor-hover>
                <span className="absolute top-2.5 right-3 font-mono text-[9px] text-steel/50 tracking-widest">{c.code}</span>
                <motion.div
                  className="w-12 h-12 rounded-full bg-metal-gradient flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: 12, scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <c.icon className="w-6 h-6 text-ink" />
                </motion.div>
                <span className="text-sm text-brass-light font-medium text-center">{c.label}</span>
                <span className="text-[10px] text-steel text-center">{c.desc}</span>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
