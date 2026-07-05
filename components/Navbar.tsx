"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
    { href: "/feedback", label: "Feedback" }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-3 px-4">
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full max-w-6xl flex items-center justify-between px-5 py-2.5 rounded-2xl transition-all duration-500 ${
          scrolled
            ? "bg-slate-panel/80 backdrop-blur-xl border border-copper/25 shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
            : "bg-transparent border border-transparent"
        }`}
      >
        <Link href="/" className="flex items-center gap-2.5 group shrink-0" data-cursor-hover>
          <div className="relative w-9 h-9">
            <Image src="/logo.png" alt="Stash21 logo" fill sizes="36px" className="object-contain drop-shadow-[0_0_10px_rgba(201,162,75,0.35)] group-hover:drop-shadow-[0_0_16px_rgba(201,162,75,0.55)] transition-all duration-300" priority />
          </div>
          <span className="font-display text-xl tracking-[0.15em] metal-text">STASH21</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-black/20 rounded-full p-1 border border-white/5">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href} className="relative px-4 py-1.5 rounded-full text-sm font-medium" data-cursor-hover>
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-metal-gradient rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className={`relative z-10 transition-colors ${active ? "text-ink" : "text-steel hover:text-brass-light"}`}>
                  {l.label}
                </span>
              </Link>
            );
          })}
        </div>

        <Link
          href="/admin"
          className="hidden md:inline-flex px-4 py-1.5 rounded-full border border-copper/40 text-brass text-sm font-medium hover:bg-copper/15 hover:border-copper transition-all duration-300"
          data-cursor-hover
        >
          Admin
        </Link>

        <button className="md:hidden text-brass" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden absolute top-[64px] left-4 right-4 bg-slate-panel/95 backdrop-blur-xl border border-copper/25 rounded-2xl overflow-hidden shadow-xl"
          >
            <div className="p-4 flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm ${pathname === l.href ? "bg-copper/15 text-brass" : "text-steel"}`}
                >
                  {l.label}
                </Link>
              ))}
              <Link href="/admin" onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-xl text-sm text-brass border-t border-white/5 mt-1 pt-3">
                Admin
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
