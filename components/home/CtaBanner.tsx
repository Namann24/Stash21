"use client";
import MagneticButton from "@/components/MagneticButton";
import ScrollReveal from "@/components/ScrollReveal";
import { ArrowUpRight } from "lucide-react";

export default function CtaBanner() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-28">
      <ScrollReveal>
        <div className="hud-corners relative rounded-3xl overflow-hidden card-glass glow-border-strong px-8 py-16 md:py-24 text-center">
          <div className="aurora-bg" />
          <div className="relative z-10">
            <p className="hud-label text-circuit mb-4">[ JOIN.THE.WORKSHOP ]</p>
            <h2 className="font-display text-4xl md:text-6xl metal-text mb-6 max-w-3xl mx-auto leading-tight">
              Got a build worth sharing?
            </h2>
            <p className="text-steel max-w-lg mx-auto mb-10">
              Suggest your next project idea or drop feedback on what you want documented next — the community decides what we build.
            </p>
            <MagneticButton href="/feedback" className="inline-flex items-center gap-2 px-9 py-4 rounded-full btn-primary text-base">
              Suggest a Project <ArrowUpRight className="w-4 h-4" />
            </MagneticButton>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
