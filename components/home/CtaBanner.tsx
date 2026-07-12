"use client";
import { motion } from "framer-motion";
import MagneticButton from "@/components/MagneticButton";
import ScrollReveal from "@/components/ScrollReveal";
import { ArrowUpRight } from "lucide-react";

export default function CtaBanner() {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-12 pb-16">
      <ScrollReveal animation="scale-in">
        <div className="hud-corners relative rounded-3xl overflow-hidden card-glass glow-border-strong px-8 py-12 md:py-16 text-center">
          <div className="aurora-bg" />
          {/* CRT scan overlay for retro feel */}
          <div className="absolute inset-0 pointer-events-none z-[5] opacity-[0.03]" style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(201,162,75,0.08) 2px, rgba(201,162,75,0.08) 4px)"
          }} />

          {/* Floating decorative gear SVGs */}
          <motion.div
            className="absolute top-6 left-6 text-copper/15 pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          >
            <svg width="40" height="40" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 10 L54 18 L62 14 L60 22 L68 22 L64 30 L72 32 L66 38 L74 44 L66 46 L70 54 L62 52 L62 60 L54 56 L50 64 L46 56 L38 60 L38 52 L30 54 L34 46 L26 44 L34 38 L28 32 L36 30 L32 22 L40 22 L38 14 L46 18 Z" />
              <circle cx="50" cy="37" r="10" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.5" />
            </svg>
          </motion.div>
          <motion.div
            className="absolute bottom-6 right-6 text-violet/15 pointer-events-none"
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <svg width="30" height="30" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 10 L54 18 L62 14 L60 22 L68 22 L64 30 L72 32 L66 38 L74 44 L66 46 L70 54 L62 52 L62 60 L54 56 L50 64 L46 56 L38 60 L38 52 L30 54 L34 46 L26 44 L34 38 L28 32 L36 30 L32 22 L40 22 L38 14 L46 18 Z" />
              <circle cx="50" cy="37" r="10" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.5" />
            </svg>
          </motion.div>

          <div className="relative z-10">
            <motion.p
              className="hud-label text-circuit mb-4 neon-flicker"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              [ JOIN.THE.WORKSHOP ]
            </motion.p>
            <motion.h2
              className="font-display text-3xl md:text-5xl gradient-pulse mb-4 max-w-3xl mx-auto leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Got a build worth sharing?
            </motion.h2>
            <motion.p
              className="text-steel max-w-lg mx-auto mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Suggest your next project idea or drop feedback on what you want documented next — the community decides what we build.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <MagneticButton href="/feedback" className="inline-flex items-center gap-2 px-9 py-4 rounded-full btn-primary text-base ripple-btn">
                Suggest a Project <ArrowUpRight className="w-4 h-4" />
              </MagneticButton>
            </motion.div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
