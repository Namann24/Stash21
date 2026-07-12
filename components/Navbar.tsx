"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const navVariants = {
  hidden: { y: -30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

const mobileMenuVariants = {
  closed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
  open: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const mobileLinkVariants = {
  closed: { opacity: 0, x: -24, filter: "blur(4px)" },
  open: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 16);
  });

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
        variants={navVariants}
        initial="hidden"
        animate="visible"
        className={`nav-container ${scrolled ? "nav-scrolled" : "nav-top"}`}
      >
        {/* Animated border glow — only visible when scrolled */}
        <AnimatePresence>
          {scrolled && (
            <motion.span
              className="nav-glow-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </AnimatePresence>

        {/* Inner shine line */}
        <span className="nav-shine" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0 relative z-10" data-cursor-hover>
          <motion.div
            className="relative w-9 h-9"
            whileHover={{ scale: 1.12, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
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
            <motion.span
              className="absolute inset-[-4px] rounded-full border border-copper/0"
              whileHover={{
                borderColor: "rgba(201,162,75,0.35)",
                boxShadow: "0 0 24px rgba(201,162,75,0.30)",
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
          <motion.span
            className="font-display text-xl tracking-[0.15em] metal-text"
            whileHover={{ letterSpacing: "0.2em" }}
            transition={{ duration: 0.3 }}
          >
            STASH21
          </motion.span>
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
                  <motion.span
                    className="absolute bottom-1 left-3 right-3 h-[2px] bg-gradient-to-r from-circuit via-brass to-violet rounded-full origin-left"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
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
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/admin"
              className="nav-admin-btn"
              data-cursor-hover
            >
              <span className="nav-admin-btn-border" />
              <span className="relative z-10">Admin</span>
            </Link>
          </motion.div>
        </div>

        {/* Mobile hamburger */}
        <motion.button
          className="md:hidden text-brass relative z-10"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <X className="w-5 h-5" />
              </motion.span>
            ) : (
              <motion.span
                key="menu"
                initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Menu className="w-5 h-5" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="nav-mobile-menu"
          >
            <div className="p-5 flex flex-col gap-1">
              {links.map((l) => (
                <motion.div key={l.href} variants={mobileLinkVariants}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      pathname === l.href
                        ? "bg-copper/15 text-brass border border-copper/20"
                        : "text-steel hover:text-brass-light hover:bg-white/5"
                    }`}
                  >
                    <motion.span whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                      {l.label}
                    </motion.span>
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={mobileLinkVariants}>
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
