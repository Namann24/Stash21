import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-copper/15 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="relative w-8 h-8">
              <Image src="/logo.png" alt="Stash21 logo" fill sizes="32px" className="object-contain" />
            </div>
            <span className="font-display text-lg tracking-[0.15em] metal-text">STASH21</span>
          </div>
          <p className="text-steel text-sm max-w-xs leading-relaxed">
            A workshop for IoT tinkerers and hardware hackers. Build. Break. Document.
          </p>
        </div>
        <div>
          <h4 className="text-brass font-display text-sm mb-4 tracking-widest">NAVIGATE</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/" className="text-steel hover:text-brass-light transition-colors w-fit">Home</Link>
            <Link href="/blog" className="text-steel hover:text-brass-light transition-colors w-fit">Blog</Link>
            <Link href="/feedback" className="text-steel hover:text-brass-light transition-colors w-fit">Feedback</Link>
            <Link href="/admin" className="text-steel hover:text-brass-light transition-colors w-fit">Admin</Link>
          </div>
        </div>
        <div>
          <h4 className="text-brass font-display text-sm mb-4 tracking-widest">FOLLOW</h4>
          <div className="flex gap-3">
            <a href="#" className="w-9 h-9 rounded-full border border-copper/30 flex items-center justify-center text-steel hover:text-brass hover:border-copper transition-all" data-cursor-hover>
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-full border border-copper/30 flex items-center justify-center text-steel hover:text-brass hover:border-copper transition-all" data-cursor-hover>
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-full border border-copper/30 flex items-center justify-center text-steel hover:text-brass hover:border-copper transition-all" data-cursor-hover>
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
