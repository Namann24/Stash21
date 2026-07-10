"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  LockKeyhole,
  LogIn,
  Mail,
  MessageSquare,
  ShieldCheck,
  Users
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const FEATURES = [
  { icon: FileText, label: "Publish posts", desc: "Write, draft, and publish blog content" },
  { icon: MessageSquare, label: "Moderate comments", desc: "Review and approve reader feedback" },
  { icon: Users, label: "Track audience", desc: "Subscribers, views, and engagement" }
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!active) return;

        if (error) {
          setError("Could not verify your session.");
          setCheckingSession(false);
          return;
        }

        if (data.session) {
          router.replace("/admin/dashboard");
          return;
        }

        setCheckingSession(false);
      } catch {
        if (!active) return;
        setError("Unable to connect to authentication.");
        setCheckingSession(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSignIn(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        const signInError =
          (result as { error?: { message?: string } | null }).error ?? null;

        if (signInError) {
          setError(signInError.message ?? "Invalid email or password.");
          return;
        }

        router.replace("/admin/dashboard");
        router.refresh();
      } catch {
        setError("Unable to reach authentication service.");
      }
    });
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="admin-panel flex items-center gap-3 px-8 py-6">
          <Loader2 className="h-5 w-5 animate-spin text-brass" />
          <span className="text-sm text-steel">Checking session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative z-10">
      {/* Brand panel */}
      <aside className="hidden lg:flex flex-col w-[420px] xl:w-[480px] shrink-0 border-r border-copper/10 bg-slate-panel/40 backdrop-blur-md p-10 xl:p-12 relative overflow-hidden">
        {/* Subtle decorative circuit in brand panel */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[url('/circuit-pattern.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay rotate-45 transform translate-x-1/3 -translate-y-1/3" />
        
        <Link href="/" className="flex items-center gap-3 mb-12 relative z-10">
          <div className="relative w-10 h-10">
            <Image src="/logo.png" alt="Stash21" fill sizes="40px" className="object-contain" />
          </div>
          <div>
            <p className="font-display text-sm tracking-[0.12em] text-brass-light">STASH21</p>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-steel">Admin Console</p>
          </div>
        </Link>

        <div className="flex-1">
          <h1 className="font-display text-3xl xl:text-4xl text-brass-light leading-tight mb-4 gradient-pulse">
            Manage your blog from one place
          </h1>
          <p className="text-sm text-steel leading-relaxed mb-10">
            Secure access to publishing, moderation, and analytics for your Stash21 workshop.
          </p>

          <div className="space-y-4">
            {FEATURES.map((feature, i) => (
              <motion.div 
                key={feature.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
                className="flex items-start gap-4 p-4 rounded-xl border border-copper/10 bg-black/10 hover:bg-copper/5 hover:border-copper/20 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-copper/10 border border-copper/15 flex items-center justify-center shrink-0 group-hover:shadow-[0_0_15px_rgba(201,162,75,0.2)] transition-shadow">
                  <feature.icon className="w-4 h-4 text-brass group-hover:text-brass-light transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brass-light">{feature.label}</p>
                  <p className="text-xs text-steel mt-0.5">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-steel/70 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-circuit" />
          Protected by Supabase Auth
        </div>
      </aside>

      {/* Sign in */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 relative">
        <div className="absolute top-6 right-6 flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-copper/15 text-xs text-steel hover:text-brass-light hover:border-copper/30 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to site
          </Link>
          <ThemeToggle />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="relative w-9 h-9">
              <Image src="/logo.png" alt="Stash21" fill sizes="36px" className="object-contain" />
            </div>
            <p className="font-display text-sm tracking-[0.12em] text-brass-light">STASH21 Admin</p>
          </div>

          <div className="admin-panel scan-card holo-card p-8 md:p-10 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
            <div className="mb-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-circuit/30 bg-circuit/5 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-circuit animate-pulse shadow-[0_0_5px_rgba(77,216,232,0.8)]" />
                <p className="text-[10px] font-mono text-circuit uppercase tracking-widest">Admin Access</p>
              </div>
              <h2 className="font-display text-2xl text-brass-light tracking-wide">Welcome back</h2>
              <p className="text-sm text-steel mt-2">Enter your admin credentials to continue.</p>
            </div>
            
            <form onSubmit={handleSignIn} className="space-y-6 relative z-10">
              <div>
                <label htmlFor="admin-email" className="admin-input-label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-copper/50" />
                  <input
                    id="admin-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    placeholder="admin@stash21.com"
                    className="admin-input !pl-10 focus:ring-1 focus:ring-circuit/50 focus:border-circuit/50 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-password" className="admin-input-label">Password</label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-copper/50" />
                  <input
                    id="admin-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Your password"
                    className="admin-input !pl-10 pr-10 focus:ring-1 focus:ring-circuit/50 focus:border-circuit/50 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-circuit transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error ? (
                <div className="flex items-start gap-3 rounded-xl border border-maroon/35 bg-maroon/10 px-4 py-3 text-sm text-rose-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              ) : (
                <p className="text-xs text-steel/70 leading-relaxed">
                  Use the Supabase admin account linked to your Stash21 project.
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="group flex w-full items-center justify-center gap-2 rounded-xl btn-primary py-3.5 text-sm font-medium disabled:opacity-60 bounce-hover shadow-[0_0_20px_rgba(201,162,75,0.15)] hover:shadow-[0_0_30px_rgba(201,162,75,0.3)] transition-all mt-8"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Sign in to dashboard
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-steel mt-6">
            <Link href="/" className="hover:text-brass-light transition-colors">
              Return to Stash21 homepage
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
