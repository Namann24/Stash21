import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="main-footer relative border-t border-copper/15 mt-20">
      {/* Decorative circuit trace */}
      <div className="absolute top-0 left-0 right-0 h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brass/40 to-transparent" />
        <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 rotate-45 bg-circuit shadow-[0_0_10px_rgba(77,216,232,0.6)]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-4 group">
            <div className="relative w-8 h-8">
              <Image src="/logo.png" alt="Stash21 logo" fill sizes="32px" className="object-contain group-hover:drop-shadow-[0_0_14px_rgba(201,162,75,0.45)] transition-all duration-300" />
            </div>
            <span className="font-display text-lg tracking-[0.15em] metal-text">STASH21</span>
          </div>
          <p className="text-steel text-sm max-w-xs leading-relaxed">
            A workshop for IoT tinkerers and hardware hackers. Build. Break. Document.
          </p>
        </div>
        <div>
          <h4 className="text-brass font-display text-sm mb-4 tracking-widest">NAVIGATE</h4>
          <div className="flex flex-col gap-2 text-sm stagger-children">
            <Link href="/" className="text-steel hover:text-brass-light transition-colors w-fit gradient-underline">Home</Link>
            <Link href="/blog" className="text-steel hover:text-brass-light transition-colors w-fit gradient-underline">Blog</Link>
            <Link href="/feedback" className="text-steel hover:text-brass-light transition-colors w-fit gradient-underline">Feedback</Link>
            <Link href="/admin" className="text-steel hover:text-brass-light transition-colors w-fit gradient-underline">Admin</Link>
          </div>
        </div>
        <div>
          <h4 className="text-brass font-display text-sm mb-4 tracking-widest">FOLLOW</h4>
          <div className="flex gap-3">
            <a href="#" className="w-9 h-9 rounded-full border border-copper/30 flex items-center justify-center text-steel hover:text-brass hover:border-copper hover:shadow-[0_0_16px_rgba(201,162,75,0.25)] transition-all duration-300 bounce-hover" data-cursor-hover>
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-full border border-copper/30 flex items-center justify-center text-steel hover:text-brass hover:border-copper hover:shadow-[0_0_16px_rgba(201,162,75,0.25)] transition-all duration-300 bounce-hover" data-cursor-hover>
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-full border border-copper/30 flex items-center justify-center text-steel hover:text-brass hover:border-copper hover:shadow-[0_0_16px_rgba(201,162,75,0.25)] transition-all duration-300 bounce-hover" data-cursor-hover>
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 py-5 text-center text-xs text-steel/70 font-mono">
        © 2026 STASH21 — BUILT WITH SOLDER, COFFEE, AND NEXT.JS
      </div>
    </footer>
  );
}
