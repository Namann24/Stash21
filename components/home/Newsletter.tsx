"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import { Send, CheckCircle2, Sparkles } from "lucide-react";
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
        <ScrollReveal animation="scale-in">
          <motion.div
            className="card-glass rounded-3xl p-8 md:p-10 glow-border-strong relative overflow-hidden"
            whileHover={{ boxShadow: "0 0 0 1.5px rgba(232,206,140,0.40), 0 0 50px rgba(201,162,75,0.25), 0 0 100px rgba(184,115,51,0.12)" }}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-copper/10 to-transparent" />
            
            {/* Decorative corner gears */}
            <motion.div
              className="absolute top-3 right-3 text-copper/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>

            <div className="relative z-10">
              <motion.h2
                className="font-display text-2xl md:text-4xl text-brass mb-4"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Stay in the Loop
              </motion.h2>
              <motion.p
                className="text-steel mb-6 max-w-xl mx-auto"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Get the latest hardware teardowns, IoT tutorials, and firmware experiments delivered straight to your inbox. No spam, just pure maker fuel.
              </motion.p>

              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex items-center justify-center gap-3 text-brass-light bg-copper/10 py-4 px-6 rounded-full w-fit mx-auto border border-copper/30"
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </motion.div>
                    You&apos;re on the list!
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address..."
                      required
                      className="flex-1 border border-copper/30 rounded-full px-6 py-3.5 text-sm placeholder:text-steel/50 focus:outline-none focus:border-copper transition-colors backdrop-blur-md"
                      style={{
                        backgroundColor: "var(--input-bg)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <motion.button
                      type="submit"
                      disabled={status === "loading"}
                      className="btn-primary rounded-full px-8 py-3.5 flex items-center justify-center gap-2 font-medium shrink-0 disabled:opacity-70"
                      data-cursor-hover
                      whileHover={{ scale: 1.03, boxShadow: "0 6px 30px rgba(201,162,75,0.45)" }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {status === "loading" ? (
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          ⏳
                        </motion.span>
                      ) : (
                        <>Subscribe <Send className="w-4 h-4" /></>
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
              {status === "error" && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs mt-3"
                >
                  Something went wrong. Please try again.
                </motion.p>
              )}
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
}
