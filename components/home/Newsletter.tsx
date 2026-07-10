"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import { Send, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const { error } = await supabase.from("subscribers").insert({ email });
      if (error && error.code !== "23505") throw error; // ignore duplicate email error
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-metal-gradient opacity-20" />
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <ScrollReveal>
          <div className="card-glass rounded-3xl p-8 md:p-10 glow-border-strong relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-copper/10 to-transparent" />
            <div className="relative z-10">
              <h2 className="font-display text-2xl md:text-4xl text-brass mb-4">Stay in the Loop</h2>
              <p className="text-steel mb-6 max-w-xl mx-auto">
                Get the latest hardware teardowns, IoT tutorials, and firmware experiments delivered straight to your inbox. No spam, just pure maker fuel.
              </p>

              {status === "success" ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-3 text-brass-light bg-copper/10 py-4 px-6 rounded-full w-fit mx-auto border border-copper/30"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  You&apos;re on the list!
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    required
                    className="flex-1 bg-black/40 border border-copper/30 rounded-full px-6 py-3.5 text-sm text-brass-light placeholder:text-steel/50 focus:outline-none focus:border-copper transition-colors backdrop-blur-md"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="btn-primary rounded-full px-8 py-3.5 flex items-center justify-center gap-2 font-medium shrink-0 disabled:opacity-70"
                    data-cursor-hover
                  >
                    {status === "loading" ? "Subscribing..." : (
                      <>Subscribe <Send className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              )}
              {status === "error" && (
                <p className="text-red-400 text-xs mt-3">Something went wrong. Please try again.</p>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
