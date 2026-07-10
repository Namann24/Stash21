"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

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

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links = [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
    { href: "/feedback", label: "Feedback" }
  ];

  return (
    <header className="main-navbar fixed top-0 left-0 right-0 z-50 flex justify-center pt-3 px-4">
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={`nav-container ${scrolled ? "nav-scrolled" : "nav-top"}`}
      >
        {/* Animated border glow — only visible when scrolled */}
        {scrolled && <span className="nav-glow-border" />}

        {/* Inner shine line */}
        <span className="nav-shine" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0 relative z-10" data-cursor-hover>
          <motion.div
            className="relative w-9 h-9"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Image
              src="/logo.png"
              alt="Stash21 logo"
              fill
              sizes="36px"
              className="object-contain drop-shadow-[0_0_10px_rgba(201,162,75,0.35)] group-hover:drop-shadow-[0_0_20px_rgba(201,162,75,0.65)] transition-all duration-300"
              priority
              loading="eager"
            />
            {/* Logo glow ring on hover */}
            <span className="absolute inset-[-4px] rounded-full border border-copper/0 group-hover:border-copper/30 transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(201,162,75,0.25)]" />
          </motion.div>
          <span className="font-display text-xl tracking-[0.15em] metal-text">STASH21</span>
        </Link>

        {/* Desktop navigation — pill container */}
        <div className="hidden md:flex items-center gap-0.5 nav-pill-container relative z-10">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className="nav-link group relative px-5 py-2 rounded-full text-sm font-medium"
                data-cursor-hover
              >
                {/* Active pill background */}
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 nav-active-pill rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {/* Hover gradient underline for non-active */}
                {!active && (
                  <span className="absolute bottom-1 left-3 right-3 h-[2px] bg-gradient-to-r from-circuit via-brass to-violet rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                )}
                <span className={`relative z-10 transition-colors duration-300 ${
                  active
                    ? "text-ink font-semibold"
                    : "text-steel hover:text-brass-light"
                }`}>
                  {l.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Right side — theme toggle + admin */}
        <div className="hidden md:flex items-center gap-3 relative z-10">
          <ThemeToggle />
          <Link
            href="/admin"
            className="nav-admin-btn"
            data-cursor-hover
          >
            <span className="nav-admin-btn-border" />
            <span className="relative z-10">Admin</span>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-brass relative z-10"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-5 h-5" />
              </motion.span>
            ) : (
              <motion.span
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="w-5 h-5" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="nav-mobile-menu"
          >
            <div className="p-5 flex flex-col gap-1">
              {links.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      pathname === l.href
                        ? "bg-copper/15 text-brass border border-copper/20"
                        : "text-steel hover:text-brass-light hover:bg-white/5"
                    }`}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: links.length * 0.08, duration: 0.3 }}
              >
                <div className="h-px bg-gradient-to-r from-transparent via-copper/30 to-transparent my-2" />
                <div className="flex items-center justify-between px-4 py-2">
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="text-sm text-brass font-medium"
                  >
                    Admin
                  </Link>
                  <ThemeToggle />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
