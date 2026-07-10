"use client";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/lib/types";
import { logError } from "@/lib/errorHandler";
import TiltCard from "@/components/TiltCard";
import ScrollReveal from "@/components/ScrollReveal";
import InfiniteScroll from "@/components/InfiniteScroll";
import { Filter, Search, Loader2 } from "lucide-react";

export default function BlogListClient({ posts: initialPosts }: { posts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(false);

  const categories = ["All", ...Array.from(new Set(initialPosts.map((p) => p.category)))];

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;

    try {
      const params = new URLSearchParams({ page: String(nextPage) });
      if (filter !== "All") params.set("category", filter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/posts?${params}`);
      const json = await res.json();

      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        return [...prev, ...json.posts.filter((p: Post) => !existingIds.has(p.id))];
      });
      setPage(nextPage);
      setHasMore(json.hasMore ?? json.posts.length > 0);
    } catch (err) {
      logError("BlogListClient.loadMore", err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, filter, searchQuery]);

  const filteredPosts = posts.filter((p) => {
    const matchesFilter = filter === "All" || p.category === filter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchLower);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-4xl md:text-6xl metal-text mb-3 text-glow"
      >
        The Workbench
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-steel mb-14 max-w-2xl"
      >
        Tutorials, builds, and hardware experiments from the Stash21 team. React and comment on
        anything that sparks your curiosity.
      </motion.p>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-2 text-brass">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => {
              setFilter(c);
              setPage(1);
              setPosts(initialPosts);
              setHasMore(true);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filter === c
                ? "bg-metal-gradient text-ink border-transparent"
                : "border-copper/25 text-steel hover:text-brass-light"
            }`}
            data-cursor-hover
          >
            {c}
          </button>
        ))}
        </div>
        
        <div className="relative w-full md:w-64 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-copper/50" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
              setPosts(initialPosts);
              setHasMore(true);
            }}
            placeholder="Search projects..."
            className="w-full bg-black/30 border border-copper/20 rounded-full pl-10 pr-4 py-2 text-sm text-brass-light placeholder:text-steel/50 focus:outline-none focus:border-copper transition-colors"
          />
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <p className="text-steel">No posts found for this category.</p>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-7">
            {filteredPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.5 }}
                whileHover={{ y: -8 }}
              >
                <Link href={`/blog/${post.slug}`} data-cursor-hover>
                  <TiltCard className="hud-corners group block card-glass rounded-2xl overflow-hidden hover:glow-border-strong transition-shadow duration-300 h-full">
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
                      <span className="absolute top-3 left-3 text-xs font-mono bg-ink/70 text-brass px-3 py-1 rounded-full border border-copper/40 backdrop-blur-sm">
                        {post.category}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-lg text-brass-light mb-2 group-hover:text-brass transition-colors">{post.title}</h3>
                      <p className="text-steel text-sm line-clamp-2">{post.excerpt || post.content.replace(/[#*_>`]/g, "").slice(0, 120)}...</p>
                      <div className="flex gap-2 mt-4 flex-wrap">
                        {post.tags?.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] font-mono text-steel border border-steel/30 rounded-full px-2 py-0.5">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </TiltCard>
                </Link>
              </motion.div>
            ))}
          </div>
          <InfiniteScroll onLoadMore={loadMore} loading={loading} hasMore={hasMore} />
        </>
      )}
    </div>
  );
}
