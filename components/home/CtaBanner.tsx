"use client";
import MagneticButton from "@/components/MagneticButton";
import ScrollReveal from "@/components/ScrollReveal";
import { ArrowUpRight } from "lucide-react";

export default function CtaBanner() {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-12 pb-16">
      <ScrollReveal>
        <div className="hud-corners relative rounded-3xl overflow-hidden card-glass glow-border-strong px-8 py-12 md:py-16 text-center">
          <div className="aurora-bg" />
          {/* CRT scan overlay for retro feel */}
          <div className="absolute inset-0 pointer-events-none z-[5] opacity-[0.03]" style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(201,162,75,0.08) 2px, rgba(201,162,75,0.08) 4px)"
          }} />
          <div className="relative z-10">
            <p className="hud-label text-circuit mb-4 neon-flicker">[ JOIN.THE.WORKSHOP ]</p>
            <h2 className="font-display text-3xl md:text-5xl gradient-pulse mb-4 max-w-3xl mx-auto leading-tight">
              Got a build worth sharing?
            </h2>
            <p className="text-steel max-w-lg mx-auto mb-6">
              Suggest your next project idea or drop feedback on what you want documented next — the community decides what we build.
            </p>
            <MagneticButton href="/feedback" className="inline-flex items-center gap-2 px-9 py-4 rounded-full btn-primary text-base ripple-btn">
              Suggest a Project <ArrowUpRight className="w-4 h-4" />
            </MagneticButton>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
