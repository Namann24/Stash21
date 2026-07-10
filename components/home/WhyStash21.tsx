"use client";
import { motion } from "framer-motion";
import { ShieldCheck, Users, Sparkles } from "lucide-react";
import TiltCard from "@/components/TiltCard";
import ScrollReveal from "@/components/ScrollReveal";

const points = [
  { icon: ShieldCheck, title: "Hands-on & Verified", desc: "Every tutorial is tested on real hardware before it's published.", accent: "circuit" },
  { icon: Users, title: "Community Driven", desc: "React, comment, and suggest the next project you want to see.", accent: "brass" },
  { icon: Sparkles, title: "No Fluff", desc: "Straight-to-the-point builds, schematics, and code — nothing else.", accent: "violet" }
];

const accentMap: Record<string, string> = {
  circuit: "text-circuit border-circuit/40",
  brass: "text-brass border-copper/40",
  violet: "text-violet border-violet/40"
};

export default function WhyStash21() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 relative">
      <ScrollReveal>
        <p className="hud-label text-circuit text-center mb-3">[ WHY.STASH21 ]</p>
        <h2 className="font-display text-3xl md:text-5xl metal-text text-center mb-10 mx-auto block w-fit">
          The Stash21 Difference
        </h2>
      </ScrollReveal>
      <div className="grid md:grid-cols-3 gap-8">
        {points.map((p, i) => (
          <ScrollReveal key={p.title} delay={i * 150}>
            <TiltCard className="hud-corners text-center px-6 card-glass scan-card border-flow rounded-2xl py-8 hover:glow-border-strong transition-shadow duration-300 h-full">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className={`w-16 h-16 mx-auto mb-6 rounded-full border-2 flex items-center justify-center shadow-lg bg-black/30 sonar-ping ${accentMap[p.accent]}`}
              >
                <p.icon className="w-8 h-8" />
              </motion.div>
              <h3 className="font-display text-xl text-brass mb-3">{p.title}</h3>
              <p className="text-steel text-sm leading-relaxed">{p.desc}</p>
            </TiltCard>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
