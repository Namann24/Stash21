"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { ArrowLeft } from "lucide-react";

export default function AdminChrome() {
  return (
    <div className="fixed top-0 right-0 z-50 flex items-center gap-3 p-4 md:p-5">
      <Link
        href="/"
        className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-copper/15 text-xs text-steel hover:text-brass-light hover:border-copper/30 transition-all"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to site
      </Link>
      <ThemeToggle />
    </div>
  );
}
