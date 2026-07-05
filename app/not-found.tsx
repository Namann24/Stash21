"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import MagneticButton from "@/components/MagneticButton";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center pt-24">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-7xl md:text-9xl metal-text mb-4"
      >
        404
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-steel mb-8 max-w-md"
      >
        This circuit doesn't complete. The page you're looking for got desoldered.
      </motion.p>
      <MagneticButton href="/" className="px-8 py-3.5 rounded-full btn-primary">
        Back to Workshop
      </MagneticButton>
    </div>
  );
}
