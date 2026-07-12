"use client";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";

const WORDS = ["We", "solder.", "We", "debug.", "We", "document", "everything", "—", "so", "you", "don't", "have", "to", "start", "from", "zero."];

function RevealWord({ word, progress, start, end }: { word: string; progress: MotionValue<number>; start: number; end: number }) {
  const opacity = useTransform(progress, [start, end], [0.12, 1]);
  const y = useTransform(progress, [start, end], [8, 0]);
  const scale = useTransform(progress, [start, end], [0.97, 1]);

  return (
    <motion.span style={{ opacity, y, scale }} className="text-brass-light inline-block">
      {word}
    </motion.span>
  );
}

export default function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.35"] });

  return (
    <section ref={ref} className="max-w-5xl mx-auto px-6 py-32 relative">
      {/* Decorative circuit trace that draws on scroll */}
      <motion.div
        className="absolute top-16 left-1/2 -translate-x-1/2 w-px h-16"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "top" }}
      >
        <div className="w-full h-full bg-gradient-to-b from-copper/40 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-circuit shadow-[0_0_10px_rgba(77,216,232,0.5)]" />
      </motion.div>

      <p className="hud-label text-violet text-center mb-8">[ MANIFESTO ]</p>
      <p className="font-display text-3xl md:text-6xl leading-[1.25] text-center flex flex-wrap justify-center gap-x-3 gap-y-2">
        {WORDS.map((word, i) => (
          <RevealWord
            key={i}
            word={word}
            progress={scrollYProgress}
            start={i / WORDS.length}
            end={(i + 1) / WORDS.length}
          />
        ))}
      </p>
    </section>
  );
}
