"use client";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";

const WORDS = ["We", "solder.", "We", "debug.", "We", "document", "everything", "—", "so", "you", "don't", "have", "to", "start", "from", "zero."];

function RevealWord({ word, progress, start, end }: { word: string; progress: MotionValue<number>; start: number; end: number }) {
  const opacity = useTransform(progress, [start, end], [0.15, 1]);
  return (
    <motion.span style={{ opacity }} className="text-brass-light">
      {word}
    </motion.span>
  );
}

export default function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.35"] });

  return (
    <section ref={ref} className="max-w-5xl mx-auto px-6 py-32">
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
