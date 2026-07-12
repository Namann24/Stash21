"use client";
import { motion, type Variants } from "framer-motion";
import { Wifi, Cpu, Battery, Radio } from "lucide-react";
import TiltCard from "@/components/TiltCard";
import ScrollReveal from "@/components/ScrollReveal";

const MODULES = [
  { icon: Wifi, title: "WiFi & LoRa", desc: "Long-range and local mesh connectivity.", accent: "circuit" },
  { icon: Cpu, title: "Edge Compute", desc: "On-device inference, ESP32-S3 & RP2040.", accent: "brass" },
  { icon: Battery, title: "Power Systems", desc: "Solar, LiPo, and PoE that just last.", accent: "copper" },
  { icon: Radio, title: "Sensor Fusion", desc: "IMU, environmental, and RF pipelines.", accent: "violet" }
];

const accentGlow: Record<string, string> = {
  circuit: "group-hover:shadow-[0_0_20px_rgba(77,216,232,0.35)]",
  brass:   "group-hover:shadow-[0_0_20px_rgba(201,162,75,0.35)]",
  copper:  "group-hover:shadow-[0_0_20px_rgba(184,115,51,0.35)]",
  violet:  "group-hover:shadow-[0_0_20px_rgba(139,111,232,0.35)]"
};

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export default function ModuleStrip() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 relative z-10">
      <ScrollReveal>
        <p className="font-mono text-brass text-xs tracking-[0.35em] text-center mb-3">{">"} WHAT WE WORK WITH</p>
      </ScrollReveal>
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-5"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {MODULES.map((m) => (
          <motion.div
            key={m.title}
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <TiltCard className="card-glass scan-card holo-card rounded-2xl p-5 h-full hover:glow-border-strong transition-all duration-300 group">
              <motion.div
                className={`w-10 h-10 rounded-full bg-metal-gradient flex items-center justify-center mb-3 transition-shadow duration-300 ${accentGlow[m.accent]}`}
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <m.icon className="w-5 h-5 text-ink" />
              </motion.div>
              <h4 className="font-display text-sm text-brass-light mb-1.5 leading-tight">{m.title}</h4>
              <p className="text-xs text-steel leading-relaxed">{m.desc}</p>
            </TiltCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Decorative circuit trace connecting cards */}
      <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-px pointer-events-none -z-[1]">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-copper/20 to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        />
      </div>
    </section>
  );
}
