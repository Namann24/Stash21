"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Send, Filter, ThumbsUp, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { Feedback } from "@/lib/types";
import { logError } from "@/lib/errorHandler";
import ScrollReveal from "@/components/ScrollReveal";
import TiltCard from "@/components/TiltCard";

const CATEGORIES = ["Site Feedback", "Tutorial Request", "Hardware Project", "Bug Report", "Other"];
const FILTERS = ["All", "Tutorial Requests", "Hardware Projects", "Site Feedback"];

export default function FeedbackClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Site Feedback");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [board, setBoard] = useState<Feedback[]>([]);
  const [filter, setFilter] = useState("All");
  const [userVotes, setUserVotes] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.from("feedback").select("*").order("votes", { ascending: false });
        if (cancelled) return;
        const localData = JSON.parse(localStorage.getItem("stash21_feedback") || "[]");
        if (data && data.length > 0) {
          setBoard(data as Feedback[]);
        } else if (localData.length > 0) {
          setBoard(localData);
        }
      } catch (err) {
        logError("FeedbackClient.loadBoard", err);
        if (cancelled) return;
        const localData = JSON.parse(localStorage.getItem("stash21_feedback") || "[]");
        if (localData.length > 0) {
          setBoard(localData);
        }
      }
      
      const savedVotes = localStorage.getItem("stash21_votes");
      if (savedVotes) setUserVotes(JSON.parse(savedVotes));
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    const entry: Feedback = {
      id: crypto.randomUUID(),
      name: name.trim() || null,
      email: email.trim() || null,
      category,
      topic: null,
      message: message.trim(),
      created_at: new Date().toISOString(),
      votes: 0
    };
    const newBoard = [entry, ...board];
    setBoard(newBoard);
    localStorage.setItem("stash21_feedback", JSON.stringify(newBoard));
    setMessage("");
    setName("");
    setEmail("");
    setSubmitted(true);
    const timer = setTimeout(() => setSubmitted(false), 2500);
    try {
      await supabase.from("feedback").insert({
        name: entry.name,
        email: entry.email,
        category: entry.category,
        message: entry.message
      });
    } catch (err) {
      logError("FeedbackClient.submit", err);
    }
    setSubmitting(false);
    return () => clearTimeout(timer);
  };

  const handleVote = async (id: string) => {
    const hasVoted = userVotes.includes(id);
    const newVotes = hasVoted ? userVotes.filter((v) => v !== id) : [...userVotes, id];
    
    setUserVotes(newVotes);
    localStorage.setItem("stash21_votes", JSON.stringify(newVotes));

    const newBoard = board.map((f) => (f.id === id ? { ...f, votes: Math.max(0, f.votes + (hasVoted ? -1 : 1)) } : f));
    setBoard(newBoard);
    localStorage.setItem("stash21_feedback", JSON.stringify(newBoard));
    try {
      if (!hasVoted) {
        await supabase.rpc("increment_feedback_vote", { p_feedback_id: id });
      }
    } catch (err) {
      logError("FeedbackClient.vote", err);
    }
  };

  const filtered = board.filter((f) => {
    if (filter === "All") return true;
    if (filter === "Tutorial Requests") return f.category === "Tutorial Request";
    if (filter === "Hardware Projects") return f.category === "Hardware Project";
    if (filter === "Site Feedback") return f.category === "Site Feedback";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-mono text-brass text-xs tracking-[0.35em] mb-3"
      >
        &gt; COMMUNITY.TERMINAL
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-4xl md:text-6xl metal-text mb-4 text-glow"
      >
        Got an Idea?
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-steel mb-14 max-w-2xl"
      >
        Tell us what you&apos;d like to see next, or vote on what the community already suggested.
      </motion.p>

      <div className="grid lg:grid-cols-2 gap-8">
        <ScrollReveal>
          <div className="card-glass rounded-2xl p-7 glow-border">
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-xs text-steel mb-1.5 block">Name (optional)</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/30 border border-copper/20 rounded-lg px-4 py-2.5 text-sm text-brass-light focus:outline-none focus:border-copper"
                />
              </div>
              <div>
                <label className="text-xs text-steel mb-1.5 block">Email (optional)</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/30 border border-copper/20 rounded-lg px-4 py-2.5 text-sm text-brass-light focus:outline-none focus:border-copper"
                />
              </div>
            </div>

            <label className="text-xs text-steel mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2 mb-5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    category === c
                      ? "bg-metal-gradient text-ink border-transparent"
                      : "border-copper/25 text-steel hover:text-brass-light"
                  }`}
                  data-cursor-hover
                >
                  {c}
                </button>
              ))}
            </div>

            <label className="text-xs text-steel mb-1.5 block">Your Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="I'd love to see a tutorial on..."
              rows={6}
              className="w-full bg-black/30 border border-copper/20 rounded-lg px-4 py-3 mb-5 text-sm text-brass-light placeholder:text-steel/60 focus:outline-none focus:border-copper resize-none"
            />

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-full btn-primary text-sm disabled:opacity-50"
              data-cursor-hover
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} {submitted ? "Sent!" : submitting ? "Sending..." : "Send Message"}
            </button>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="card-glass rounded-2xl p-7">
            <div className="flex items-center gap-2 mb-5">
              <Filter className="w-4 h-4 text-brass" />
              <h3 className="font-display text-lg text-brass">Community Board</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    filter === f
                      ? "bg-metal-gradient text-ink border-transparent"
                      : "border-copper/25 text-steel hover:text-brass-light"
                  }`}
                  data-cursor-hover
                >
                  {f}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="text-steel text-sm">No submissions in this category yet.</p>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {filtered.map((f) => (
                  <TiltCard key={f.id} className="card-glass rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-brass border border-copper/30 rounded-full px-2 py-0.5">
                          {f.category}
                        </span>
                        <p className="text-steel text-sm mt-2 leading-relaxed">{f.message}</p>
                        {f.name && <p className="text-steel/60 text-xs mt-1.5">— {f.name}</p>}
                      </div>
                      <button
                        onClick={() => handleVote(f.id)}
                        className={`flex flex-col items-center gap-0.5 shrink-0 transition-colors ${
                          userVotes.includes(f.id) ? "text-brass-light drop-shadow-[0_0_8px_rgba(184,115,51,0.5)]" : "text-steel hover:text-brass"
                        }`}
                        data-cursor-hover
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-xs font-mono">{f.votes}</span>
                      </button>
                    </div>
                  </TiltCard>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
