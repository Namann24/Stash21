"use client";

import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  LogIn,
  Mail,
  Radio,
  ShieldCheck
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const accessNotes = [
  "Publishing console",
  "Subscriber intelligence",
  "Feedback triage"
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
      <div className="min-h-screen flex items-center justify-center px-6 pt-24">
        <div className="w-full max-w-md rounded-2xl border border-copper/20 bg-black/45 backdrop-blur-xl px-8 py-10 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-center gap-3 text-brass-light">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Checking access...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 pt-28 pb-16">
      <div className="mx-auto grid w-full max-w-6xl items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-2xl border border-copper/20 bg-[linear-gradient(145deg,rgba(184,115,51,0.12),rgba(8,8,10,0.78))] p-7 md:p-9"
        >
          <div className="absolute inset-0 grid-bg opacity-60" />
          <div className="relative">
            <div className="mb-8 flex w-fit items-center gap-2 rounded-full border border-circuit/35 bg-circuit/10 px-3 py-1.5 text-xs font-mono uppercase tracking-[0.22em] text-circuit">
              <Radio className="h-3.5 w-3.5" />
              Control Room Online
            </div>

            <h1 className="font-display text-4xl leading-tight metal-text md:text-6xl">
              Stash21 Admin
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-steel md:text-base">
              Manage the workshop from one secure console: publish builds,
              review community requests, and watch the signal from readers.
            </p>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {accessNotes.map((note) => (
                <div key={note} className="rounded-xl border border-copper/20 bg-black/25 p-4">
                  <ShieldCheck className="mb-4 h-4 w-4 text-brass" />
                  <p className="text-xs font-medium text-brass-light">{note}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3 text-xs text-steel">
              <span className="inline-flex items-center gap-2 rounded-full border border-copper/20 bg-black/25 px-3 py-2">
                <LockKeyhole className="h-3.5 w-3.5 text-brass" />
                Supabase Auth
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-copper/20 bg-black/25 px-3 py-2">
                <KeyRound className="h-3.5 w-3.5 text-brass" />
                Admin role required
              </span>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-2xl border border-copper/25 bg-[linear-gradient(180deg,rgba(18,10,6,0.9),rgba(8,8,10,0.96))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.48)] md:p-8"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brass/70 to-transparent" />
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <p className="hud-label text-brass">Authorized Access</p>
              <h2 className="mt-2 font-display text-3xl text-brass-light">Sign In</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-copper/30 bg-metal-gradient shadow-[0_0_35px_rgba(212,167,98,0.22)]">
              <LockKeyhole className="h-5 w-5 text-ink" />
            </div>
          </div>

          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-steel/90">
                Email
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-copper/25 bg-black/35 px-4 py-3.5 focus-within:border-copper/70 focus-within:shadow-[0_0_0_1px_rgba(212,167,98,0.24)]">
                <Mail className="h-4 w-4 text-copper/75" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="admin@stash21.com"
                  className="w-full bg-transparent text-sm text-brass-light placeholder:text-steel/45 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-steel/90">
                Password
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-copper/25 bg-black/35 px-4 py-3.5 focus-within:border-copper/70 focus-within:shadow-[0_0_0_1px_rgba(212,167,98,0.24)]">
                <LockKeyhole className="h-4 w-4 text-copper/75" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full bg-transparent text-sm text-brass-light placeholder:text-steel/45 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="text-steel transition-colors hover:text-brass"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  data-cursor-hover
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="flex items-start gap-3 rounded-xl border border-maroon/35 bg-maroon/12 px-4 py-3 text-sm text-rose-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-copper/15 bg-black/20 px-4 py-3 text-xs leading-5 text-steel">
                Use the Supabase admin account tied to your Stash21 project.
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              data-cursor-hover
              className="group flex w-full items-center justify-center gap-2 rounded-full btn-primary py-3.5 text-sm font-medium disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Enter Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </motion.section>
      </div>
    </div>
  );
}
