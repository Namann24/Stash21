"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Zap,
  X
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export type AdminSection = "overview" | "posts" | "comments" | "feedback" | "subscribers";

const NAV_ITEMS: { id: AdminSection; label: string; icon: typeof FileText; badge?: number }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "posts", label: "Posts", icon: FileText },
  { id: "comments", label: "Comments", icon: MessageSquare },
  { id: "feedback", label: "Feedback", icon: Zap },
  { id: "subscribers", label: "Subscribers", icon: Mail }
];

export default function AdminSidebar({
  active,
  onNavigate,
  onLogout,
  badges = {},
  isMobileOpen = false,
  onCloseMobile
}: {
  active: AdminSection;
  onNavigate: (section: AdminSection) => void;
  onLogout: () => void;
  badges?: Partial<Record<AdminSection, number>>;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}) {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`admin-sidebar fixed inset-y-0 left-0 z-50 lg:static lg:flex flex-col w-[260px] shrink-0 border-r border-copper/10 bg-slate-panel/90 lg:bg-slate-panel/40 backdrop-blur-xl transition-transform duration-300 ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center justify-between p-6 border-b border-copper/10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9">
            <Image
              src="/logo-clean.png"
              alt="Stash21"
              fill
              sizes="36px"
              className="object-contain"
            />
          </div>
          <div>
            <p className="font-display text-sm tracking-[0.12em] text-brass-light">STASH21</p>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-steel">Admin Console</p>
          </div>
        </Link>
        {onCloseMobile && (
          <button onClick={onCloseMobile} className="lg:hidden p-2 text-steel hover:text-brass transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="lg:hidden grid grid-cols-[1fr_auto] gap-2 p-4 border-b border-copper/10">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-copper/15 text-xs text-stone-600 dark:text-steel hover:text-brass-dark dark:hover:text-brass-light hover:border-copper/30 transition-all"
          onClick={onCloseMobile}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to site
        </Link>
        <ThemeToggle compact />
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          const count = badges[item.id];

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`admin-nav-item relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group overflow-hidden ${
                isActive
                  ? "bg-copper/10 text-brass-light border border-copper/25 shadow-[inset_0_1px_0_rgba(232,206,140,0.1),0_0_20px_rgba(201,162,75,0.05)]"
                  : "text-steel hover:text-brass-light hover:bg-black/20 border border-transparent"
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] opacity-5 mix-blend-overlay pointer-events-none" />
              )}
              <Icon className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isActive ? "text-brass drop-shadow-[0_0_8px_rgba(201,162,75,0.5)]" : "group-hover:scale-110"}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {typeof count === "number" && count > 0 && (
                <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-circuit/15 border border-circuit/30 text-[10px] font-mono text-circuit flex items-center justify-center">
                  {count > 99 ? "99+" : count}
                </span>
              )}
              {isActive && (
                <motion.span
                  layoutId="adminNavIndicator"
                  className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-brass rounded-full shadow-[0_0_10px_rgba(201,162,75,0.8)]"
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-copper/10">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-steel hover:text-maroon hover:bg-maroon/10 border border-transparent hover:border-maroon/20 transition-all group"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Sign out
        </button>
      </div>
    </aside>
    </>
  );
}
