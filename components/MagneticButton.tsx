"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function MagneticButton({
  href,
  children,
  className = "",
  strength = 0.35
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    setPos({ x, y });
  };

  const reset = () => setPos({ x: 0, y: 0 });

  return (
    <motion.div
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 150, damping: 12, mass: 0.4 }}
      className="inline-block"
    >
      <Link href={href} ref={ref} onMouseMove={handleMove} onMouseLeave={reset} className={className} data-cursor-hover>
        {children}
      </Link>
    </motion.div>
  );
}
