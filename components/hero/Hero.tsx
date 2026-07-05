"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Zap, Radio } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";

const ArduinoScene = dynamic(() => import("./ArduinoScene"), { ssr: false });

export default function Hero() {
  const scrollProgress = useRef(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      scrollProgress.current = v;
    });
    return () => unsub();
  }, [scrollYProgress]);

  const contentOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);

  return (
    <section ref={sectionRef} className="relative h-[220vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center grid-bg">
        <div className="absolute inset-0">
          {mounted && <ArduinoScene scrollProgress={scrollProgress} />}
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-transparent to-ink pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-ink/40 pointer-events-none" />

        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="relative z-10 max-w-7xl mx-auto px-6 w-full grid md:grid-cols-2 gap-10 items-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-flex items-center gap-2 mb-6 pl-1.5 pr-3.5 py-1.5 rounded-full border border-circuit/30 bg-circuit/5"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-circuit opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-circuit" />
              </span>
              <span className="font-mono text-circuit tracking-[0.25em] text-[11px]">BUILD. BREAK. DOCUMENT.</span>
            </motion.div>

            <h1 className="font-display text-6xl md:text-8xl leading-[0.95] metal-text mb-2 text-glow">
              Stash21
            </h1>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px w-10 bg-circuit/60" />
              <span className="font-mono text-xs text-circuit tracking-[0.3em]">v2.6.0 // ONLINE</span>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-steel text-lg max-w-md mb-9 leading-relaxed"
            >
              A workshop for IoT tinkerers and hardware hackers. Explore deep-dive tutorials,
              real project teardown, and a community that ships circuits — not just code.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <MagneticButton href="/blog" className="px-8 py-3.5 rounded-full btn-primary inline-block">
                Read the Blog
              </MagneticButton>
              <MagneticButton href="/feedback" className="px-8 py-3.5 rounded-full btn-outline inline-block">
                Suggest a Project
              </MagneticButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex gap-8 mt-12"
            >
              {[["50+", "Tutorials"], ["12k", "Makers"], ["24/7", "Community"]].map(([num, label]) => (
                <div key={label}>
                  <p className="font-display text-2xl md:text-3xl metal-text">{num}</p>
                  <p className="text-xs text-steel tracking-wide">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="hidden md:flex justify-end"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-copper/25 bg-black/20 backdrop-blur-sm">
              <Radio className="w-3.5 h-3.5 text-circuit" />
              <span className="font-mono text-[11px] text-steel tracking-widest">SCROLL TO EXPLODE THE BOARD</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-brass flex flex-col items-center gap-1 z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          <span className="text-xs font-mono tracking-widest">SCROLL</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </div>
    </section>
  );
}
