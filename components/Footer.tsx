"use client";
import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Youtube } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const socialVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

export default function Footer() {
  return (
    <footer className="main-footer relative border-t border-copper/15 mt-20">
      {/* Decorative circuit trace */}
      <div className="absolute top-0 left-0 right-0 h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brass/40 to-transparent" />
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 rotate-45 bg-circuit shadow-[0_0_10px_rgba(77,216,232,0.6)]"
          animate={{ boxShadow: ["0 0 10px rgba(77,216,232,0.6)", "0 0 20px rgba(77,216,232,0.8)", "0 0 10px rgba(77,216,232,0.6)"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-10">
        <ScrollReveal animation="fade-left">
          <div>
            <div className="flex items-center gap-2.5 mb-4 group">
              <motion.div
                className="relative w-8 h-8"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Image src="/logo.png" alt="Stash21 logo" fill sizes="32px" className="object-contain group-hover:drop-shadow-[0_0_14px_rgba(201,162,75,0.45)] transition-all duration-300" />
              </motion.div>
              <span className="font-display text-lg tracking-[0.15em] metal-text">STASH21</span>
            </div>
            <p className="text-steel text-sm max-w-xs leading-relaxed">
              A workshop for IoT tinkerers and hardware hackers. Build. Break. Document.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={100}>
          <div>
            <h4 className="text-brass font-display text-sm mb-4 tracking-widest">NAVIGATE</h4>
            <motion.div
              className="flex flex-col gap-2 text-sm"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { href: "/", label: "Home" },
                { href: "/blog", label: "Blog" },
                { href: "/feedback", label: "Feedback" },
                { href: "/admin", label: "Admin" },
              ].map((link) => (
                <motion.div key={link.href} variants={itemVariants}>
                  <Link href={link.href} className="text-steel hover:text-brass-light transition-colors w-fit gradient-underline">{link.label}</Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </ScrollReveal>
        <ScrollReveal animation="fade-right" delay={200}>
          <div>
            <h4 className="text-brass font-display text-sm mb-4 tracking-widest">FOLLOW</h4>
            <motion.div
              className="flex gap-3"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[Github, Twitter, Youtube].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  variants={socialVariants}
                  whileHover={{ y: -3, scale: 1.1, boxShadow: "0 0 20px rgba(201,162,75,0.30)" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-full border border-copper/30 flex items-center justify-center text-steel hover:text-brass hover:border-copper transition-all duration-300"
                  data-cursor-hover
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
      <div className="border-t border-white/5 py-5 text-center text-xs text-steel/70 font-mono">
        © 2026 STASH21 — BUILT WITH SOLDER, COFFEE, AND NEXT.JS
      </div>
    </footer>
  );
}
