"use client";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock } from "lucide-react";
import type { Post } from "@/lib/types";
import ScrollReveal from "@/components/ScrollReveal";
import TiltCard from "@/components/TiltCard";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export default function FeaturedPosts({ posts }: { posts: Post[] }) {
  if (!posts || posts.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-3xl md:text-5xl metal-text mb-4 inline-block">Latest Builds</h2>
        <p className="text-steel mt-8">No posts yet — check back soon, the workbench is warming up.</p>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 section-glow">
      <ScrollReveal>
        <div className="flex items-center justify-between mb-14 flex-wrap gap-4">
          <div>
            <p className="hud-label text-circuit mb-3">[ FRESH.OFF.THE.BENCH ]</p>
            <h2 className="font-display text-3xl md:text-5xl metal-text inline-block">Latest Builds</h2>
          </div>
          <motion.div whileHover={{ x: 3 }} transition={{ duration: 0.2 }}>
            <Link href="/blog" className="text-brass text-sm hover:underline flex items-center gap-1 group" data-cursor-hover>
              View all <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </ScrollReveal>
      <motion.div
        className="grid md:grid-cols-3 gap-7"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {posts.map((post) => (
          <motion.div
            key={post.id}
            variants={cardVariants}
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Link href={`/blog/${post.slug}`} data-cursor-hover>
              <TiltCard className="hud-corners group block card-glass scan-card holo-card rounded-2xl overflow-hidden hover:glow-border-strong transition-shadow duration-300">
                <div className="h-48 bg-metal-gradient relative overflow-hidden">
                  {post.cover_image ? (
                    <Image src={post.cover_image} alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-copper/25 via-slate-panel to-maroon/20 grid-bg group-hover:scale-105 transition-transform duration-700">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display text-5xl metal-text opacity-30">21</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                  <motion.span
                    className="absolute top-3 left-3 text-xs font-mono bg-ink/70 text-brass px-3 py-1 rounded-full border border-copper/40 backdrop-blur-sm"
                    initial={{ opacity: 0, scale: 0.8, y: -5 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
                  >
                    {post.category}
                  </motion.span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-lg text-brass-light mb-2 group-hover:text-brass transition-colors">{post.title}</h3>
                  <p className="text-steel text-sm line-clamp-2 mb-3">{post.excerpt || post.content.replace(/[#*_>`]/g, "").slice(0, 120)}...</p>
                  <div className="flex items-center gap-1 text-xs text-steel">
                    <Clock className="w-3 h-3" /> {Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200))} min read
                  </div>
                </div>
              </TiltCard>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
