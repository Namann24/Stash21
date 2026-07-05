"use client";
import { useEffect, useRef } from "react";

export default function AmbientGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0.5, y: 0.5 });
  const current = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    const handleMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    };
    window.addEventListener("mousemove", handleMove);

    let raf: number;
    const animate = () => {
      current.current.x += (pos.current.x - current.current.x) * 0.04;
      current.current.y += (pos.current.y - current.current.y) * 0.04;
      if (ref.current) {
        ref.current.style.background = `radial-gradient(600px circle at ${current.current.x * 100}% ${current.current.y * 100}%, rgba(201,162,75,0.06), transparent 60%)`;
      }
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} className="fixed inset-0 -z-10 pointer-events-none transition-opacity duration-500" />;
}
