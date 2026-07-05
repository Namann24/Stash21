"use client";
import { motion } from "framer-motion";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { Post, Comment } from "@/lib/types";
import { supabase } from "@/lib/supabaseClient";
import { Send, ArrowLeft, Clock, Eye, List } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import Link from "next/link";
import Image from "next/image";
import TiltCard from "@/components/TiltCard";

const REACTIONS = [
  { emoji: "\u{1F44D}", label: "Like" },
  { emoji: "\u2764\uFE0F", label: "Love" },
  { emoji: "\u{1F4A1}", label: "Insightful" },
  { emoji: "\u{1F92F}", label: "Wow" }
];

export default function BlogPostClient({
  post,
  slug,
  relatedPosts = []
}: {
  post: Post | null;
  slug: string;
  relatedPosts?: Post[];
}) {
  const [currentPost, setCurrentPost] = useState<Post | null>(post);
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [views, setViews] = useState(post?.views || 0);

  const readTime = Math.max(1, Math.ceil((currentPost?.content || "").split(/\s+/).length / 200));
  const headers = (currentPost?.content || "")
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => ({
      text: line.replace("## ", ""),
      id: line.replace("## ", "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
    }));

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("slug", slug)
          .eq("published", true)
          .single();

        if (!active || error || !data) return;
        const fetchedPost = data as Post;
        setCurrentPost(fetchedPost);
        setViews(fetchedPost.views || 0);
      } catch {}
    })();

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!currentPost) return;

    (async () => {
      // Increment views
      try {
        await supabase.rpc("increment_post_view", { p_post_id: currentPost.id });
        setViews(prev => prev + 1);
      } catch {}

      try {
        const { data } = await supabase
          .from("comments")
          .select("*")
          .eq("post_id", currentPost.id)
          .eq("approved", true)
          .order("created_at", { ascending: false });
        if (data) setComments(data as Comment[]);
      } catch {}

      try {
        const { data } = await supabase
          .from("post_reactions")
          .select("emoji")
          .eq("post_id", currentPost.id);
        if (data) {
          const counts = data.reduce<Record<string, number>>((acc, reaction) => {
            acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
            return acc;
          }, {});
          setReactionCounts(counts);
        }
      } catch {
        try {
          const { data } = await supabase
            .from("reactions")
            .select("emoji,count")
            .eq("post_id", currentPost.id);
          if (data) {
            setReactionCounts(
              data.reduce<Record<string, number>>((acc, reaction) => {
                acc[reaction.emoji] = reaction.count || 0;
                return acc;
              }, {})
            );
          }
        } catch {}
      }
      
      const savedReactions = localStorage.getItem(`stash21_reactions_${currentPost.id}`);
      if (savedReactions) {
        setUserReactions(JSON.parse(savedReactions));
      }
    })();
  }, [currentPost?.id]);

  const handleReact = async (emoji: string) => {
    if (!currentPost) return;
    const hasReacted = userReactions.includes(emoji);
    if (hasReacted) return;

    const newReactions = [...userReactions, emoji];
    
    setUserReactions(newReactions);
    localStorage.setItem(`stash21_reactions_${currentPost.id}`, JSON.stringify(newReactions));

    setReactionCounts((prev) => ({ 
      ...prev, 
      [emoji]: (prev[emoji] || 0) + 1
    }));
    
    try {
      await supabase.rpc("increment_reaction", { p_post_id: currentPost.id, p_emoji: emoji });
    } catch {}
  };

  const handleSubmitComment = async () => {
    if (!currentPost || !message.trim()) return;
    setSubmitting(true);
    const newComment: Comment = {
      id: crypto.randomUUID(),
      post_id: currentPost.id,
      author_name: name.trim() || "Anonymous Maker",
      content: message.trim(),
      created_at: new Date().toISOString(),
      approved: true
    };
    setComments((prev) => [newComment, ...prev]);
    setMessage("");
    setName("");
    try {
      await supabase.from("comments").insert({
        post_id: currentPost.id,
        author_name: newComment.author_name,
        content: newComment.content
      });
    } catch {}
    setSubmitting(false);
  };

  if (!currentPost) {
    return (
      <article className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <Link
          href="/blog"
          className="flex items-center gap-2 text-steel hover:text-brass transition-colors w-fit mb-8 text-sm font-medium"
          data-cursor-hover
        >
          <ArrowLeft className="w-4 h-4" /> Back to Workbench
        </Link>
        <div className="card-glass rounded-2xl p-8">
          <p className="hud-label text-brass mb-3">Loading Post</p>
          <h1 className="font-display text-3xl text-brass-light">Syncing from Supabase...</h1>
          <p className="text-steel mt-3 text-sm">
            If this stays here, the post may be unpublished or unavailable.
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="max-w-7xl mx-auto px-6 pt-32 pb-24">
      <Link 
        href="/blog" 
        className="flex items-center gap-2 text-steel hover:text-brass transition-colors w-fit mb-8 text-sm font-medium"
        data-cursor-hover
      >
        <ArrowLeft className="w-4 h-4" /> Back to Workbench
      </Link>

      <div className="max-w-4xl mb-12">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block text-xs font-mono bg-copper/15 text-brass px-3 py-1 rounded-full border border-copper/40 mb-6"
        >
          {currentPost.category}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-4xl md:text-6xl metal-text mb-6 leading-tight text-glow"
        >
          {currentPost.title}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center gap-6 text-steel text-sm font-mono"
        >
          <span>{format(new Date(currentPost.created_at), "MMMM d, yyyy")}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-copper" /> {readTime} min read</span>
          <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-copper" /> {views} views</span>
        </motion.div>
      </div>

      {currentPost.cover_image && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl overflow-hidden mb-16 glow-border w-full h-[40vh] md:h-[60vh] relative"
        >
          <Image src={currentPost.cover_image} alt={currentPost.title} fill className="object-cover" priority />
        </motion.div>
      )}

      <div className="lg:flex gap-16 relative">
        <div className="lg:w-3/4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="w-full"
          >
            <MarkdownRenderer content={currentPost.content} />
          </motion.div>

          <div className="flex gap-2 mt-12 flex-wrap">
            {currentPost.tags?.map((tag) => (
              <span key={tag} className="text-xs font-mono text-steel border border-steel/30 rounded-full px-3 py-1 bg-black/20">
                #{tag}
              </span>
            ))}
          </div>

          <div className="section-divider my-14" />

          <ScrollReveal>
            <div className="flex flex-wrap gap-3 mb-16">
              {REACTIONS.map((r) => (
                <button
                  key={r.label}
                  onClick={() => handleReact(r.emoji)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full hover:glow-border-strong transition-all duration-300 text-sm ${
                    userReactions.includes(r.emoji) 
                      ? "bg-copper/20 border border-copper/50 shadow-[0_0_15px_rgba(184,115,51,0.2)]" 
                      : "card-glass"
                  }`}
                  data-cursor-hover
                >
                  <span>{r.emoji}</span>
                  <span className={userReactions.includes(r.emoji) ? "text-brass" : "text-steel"}>{r.label}</span>
                  {reactionCounts[r.emoji] ? <span className="text-brass font-mono">{reactionCounts[r.emoji]}</span> : null}
                </button>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <h3 className="font-display text-2xl text-brass mb-6">Discussion ({comments.length})</h3>
            <div className="card-glass rounded-2xl p-5 mb-8">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full bg-black/30 border border-copper/20 rounded-lg px-4 py-2.5 mb-3 text-sm text-brass-light placeholder:text-steel/60 focus:outline-none focus:border-copper transition-colors"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts, ask a question, or spot a bug in the code..."
                rows={4}
                className="w-full bg-black/30 border border-copper/20 rounded-lg px-4 py-2.5 mb-3 text-sm text-brass-light placeholder:text-steel/60 focus:outline-none focus:border-copper resize-none transition-colors"
              />
              <button
                onClick={handleSubmitComment}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full btn-primary text-sm disabled:opacity-50"
                data-cursor-hover
              >
                <Send className="w-3.5 h-3.5" /> Post Comment
              </button>
            </div>

            <div className="space-y-4 mb-20">
              {comments.map((c) => (
                <div key={c.id} className="card-glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-brass-light text-sm font-medium">{c.author_name}</span>
                    <span className="text-steel text-xs font-mono">{format(new Date(c.created_at), "MMM d, yyyy")}</span>
                  </div>
                  <p className="text-steel text-sm leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>

        {/* Table of Contents Sidebar */}
        <div className="hidden lg:block lg:w-1/4">
          <div className="sticky top-32 card-glass rounded-2xl p-6">
            <h4 className="flex items-center gap-2 font-display text-brass text-lg mb-4">
              <List className="w-4 h-4" /> Table of Contents
            </h4>
            <ul className="space-y-3">
              {headers.length > 0 ? headers.map((header) => (
                <li key={header.id}>
                  <a 
                    href={`#${header.id}`} 
                    className="text-steel hover:text-brass-light text-sm line-clamp-2 transition-colors"
                    data-cursor-hover
                  >
                    {header.text}
                  </a>
                </li>
              )) : (
                <li className="text-steel text-sm">No sections</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <ScrollReveal>
          <div className="mt-10 border-t border-copper/20 pt-16">
            <h3 className="font-display text-3xl text-brass mb-8">Related Projects</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((rp) => (
                <Link key={rp.id} href={`/blog/${rp.slug}`} data-cursor-hover className="block h-full">
                  <TiltCard className="hud-corners group block card-glass rounded-2xl overflow-hidden hover:glow-border-strong transition-shadow duration-300 h-full">
                    <div className="h-40 bg-metal-gradient relative overflow-hidden">
                      {rp.cover_image ? (
                        <Image src={rp.cover_image} alt={rp.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-copper/25 via-slate-panel to-maroon/20 grid-bg group-hover:scale-105 transition-transform duration-700"></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                    </div>
                    <div className="p-5">
                      <h4 className="font-display text-lg text-brass-light mb-2 group-hover:text-brass transition-colors line-clamp-2">{rp.title}</h4>
                      <p className="text-steel text-sm line-clamp-2">{rp.content.replace(/[#*_>`]/g, "").slice(0, 100)}...</p>
                    </div>
                  </TiltCard>
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}
    </article>
  );
}
