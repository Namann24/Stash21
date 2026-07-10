"use client";
import { useEffect, useRef, useState } from "react";

interface CounterProps {
  to: number;
  duration?: number;    // ms
  suffix?: string;
  prefix?: string;
  className?: string;
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export default function AnimatedCounter({
  to,
  duration = 1600,
  suffix = "",
  prefix = "",
  className = "",
}: CounterProps) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const animate = (timestamp: number) => {
            if (!startRef.current) startRef.current = timestamp;
            const elapsed = timestamp - startRef.current;
            const progress = Math.min(elapsed / duration, 1);
            setValue(Math.round(easeOutExpo(progress) * to));
            if (progress < 1) {
              rafRef.current = requestAnimationFrame(animate);
            }
          };
          rafRef.current = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [to, duration]);

  return (
    <span ref={containerRef} className={className}>
      {prefix}{value.toLocaleString()}{suffix}
    </span>
  );
}
