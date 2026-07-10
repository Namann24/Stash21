"use client";
import { useEffect, useRef, useState } from "react";

interface TypewriterTextProps {
  texts: string[];
  speed?: number;       // ms per character
  pauseMs?: number;     // ms to pause at end of word
  className?: string;
  cursor?: boolean;
}

export default function TypewriterText({
  texts,
  speed = 60,
  pauseMs = 1800,
  className = "",
  cursor = true,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pausing" | "erasing">("typing");
  const charIndex = useRef(0);

  useEffect(() => {
    const current = texts[textIndex];

    if (phase === "typing") {
      if (charIndex.current >= current.length) {
        setPhase("pausing");
        return;
      }
      const t = setTimeout(() => {
        charIndex.current++;
        setDisplayed(current.slice(0, charIndex.current));
      }, speed + Math.random() * 25);
      return () => clearTimeout(t);
    }

    if (phase === "pausing") {
      const t = setTimeout(() => setPhase("erasing"), pauseMs);
      return () => clearTimeout(t);
    }

    if (phase === "erasing") {
      if (charIndex.current === 0) {
        setTextIndex((i) => (i + 1) % texts.length);
        setPhase("typing");
        return;
      }
      const t = setTimeout(() => {
        charIndex.current--;
        setDisplayed(current.slice(0, charIndex.current));
      }, speed * 0.45);
      return () => clearTimeout(t);
    }
  }, [displayed, phase, textIndex, texts, speed, pauseMs]);

  return (
    <span className={`${className} ${cursor ? "typewriter-cursor" : ""}`}>
      {displayed}
    </span>
  );
}
