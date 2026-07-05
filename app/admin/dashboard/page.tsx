"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import type { Post, Feedback, Subscriber } from "@/lib/types";
import { LogOut, Plus, Trash2, Edit3, MessageSquare, Eye, ThumbsUp, Mail, FileText, RefreshCw, Search, Radio, Clock3 } from "lucide-react";
import PostEditorModal from "./PostEditorModal";
import { SAMPLE_POSTS } from "@/lib/samplePosts";

type AdminTab = "posts" | "feedback" | "subscribers";
type AdminPost = Post & {
  commentsCount?: number;
  reactions?: number;
};

const shortNumber = (value: number) =>
  new Intl.NumberFormat("en", { notation: value >= 10000 ? "compact" : "standard" }).format(value);

export default function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>("posts");
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [checking, setChecking] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [postSearch, setPostSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleBeforeUnload = () => supabase.auth.signOut();
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/admin");
        return;
      }
      setChecking(false);
      loadData();
    })();
    
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [router]);

  const loadData = async () => {
    setRefreshing(true);
    let finalPosts: AdminPost[] = [...SAMPLE_POSTS];
    try {
      const { data: postData } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      if (postData && postData.length > 0) {
        finalPosts = postData as AdminPost[];
      }
    } catch {}

    finalPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const postIds = finalPosts.map((post) => post.id);

    if (postIds.length > 0) {
      try {
        const { data: commentRows } = await supabase
          .from("comments")
          .select("post_id")
          .in("post_id", postIds);
        if (commentRows) {
          const commentCounts = commentRows.reduce<Record<string, number>>((acc, row) => {
            acc[row.post_id] = (acc[row.post_id] || 0) + 1;
            return acc;
          }, {});
          finalPosts = finalPosts.map((post) => ({
            ...post,
            commentsCount: commentCounts[post.id] || post.commentsCount || 0
          }));
        }
      } catch {}

      try {
        const { data: reactionRows } = await supabase
          .from("post_reactions")
          .select("post_id")
          .in("post_id", postIds);
        if (reactionRows) {
          const reactionCounts = reactionRows.reduce<Record<string, number>>((acc, row) => {
            acc[row.post_id] = (acc[row.post_id] || 0) + 1;
            return acc;
          }, {});
          finalPosts = finalPosts.map((post) => ({
            ...post,
            reactions: reactionCounts[post.id] || 0
          }));
        }
      } catch {
        try {
          const { data: reactionRows } = await supabase
            .from("reactions")
            .select("post_id,count")
            .in("post_id", postIds);
          if (reactionRows) {
            const reactionCounts = reactionRows.reduce<Record<string, number>>((acc, row) => {
              acc[row.post_id] = (acc[row.post_id] || 0) + (row.count || 0);
              return acc;
            }, {});
            finalPosts = finalPosts.map((post) => ({
              ...post,
              reactions: reactionCounts[post.id] || post.reactions || 0
            }));
          }
        } catch {}
      }
    }

    setPosts(finalPosts);

    try {
      const { data: fbData } = await supabase.from("feedback").select("*").order("created_at", { ascending: false });
      const localFeedback = JSON.parse(localStorage.getItem("stash21_feedback") || "[]");
      
      if (fbData && fbData.length > 0) {
        // Merge or just use supabase
        setFeedback(fbData as Feedback[]);
      } else if (localFeedback.length > 0) {
        setFeedback(localFeedback);
      } else {
        setFeedback([]);
      }
    } catch {
      const localFeedback = JSON.parse(localStorage.getItem("stash21_feedback") || "[]");
      setFeedback(localFeedback);
    }

    try {
      const { data: subscriberData } = await supabase
        .from("subscribers")
        .select("*")
        .order("created_at", { ascending: false });
      setSubscribers((subscriberData || []) as Subscriber[]);
    } catch {
      setSubscribers([]);
    }

    setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin");
  };

  const handleDeletePost = async (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    const localPosts = JSON.parse(localStorage.getItem("stash21_posts") || "[]");
    const updatedLocal = localPosts.filter((p: any) => p.id !== id);
    localStorage.setItem("stash21_posts", JSON.stringify(updatedLocal));
    try {
      await supabase.from("posts").delete().eq("id", id);
    } catch {}
  };

  const handleNewPost = () => {
    setEditingPost(null);
    setEditorOpen(true);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setEditorOpen(true);
  };

  const stats = {
    posts: posts.length,
    views: posts.reduce((sum, post) => sum + (post.views || 0), 0),
    subscribers: subscribers.length,
    feedback: feedback.length,
    reactions: posts.reduce((sum, post) => sum + (post.reactions || 0), 0),
    comments: posts.reduce((sum, post) => sum + (post.commentsCount || 0), 0),
    drafts: posts.filter((post) => !post.published).length
  };

  const filteredPosts = posts.filter((post) => {
    const query = postSearch.toLowerCase();
    const matchesSearch =
      post.title.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query) ||
      post.tags?.some((tag) => tag.toLowerCase().includes(query));
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && post.published) ||
      (statusFilter === "draft" && !post.published);
    return matchesSearch && matchesStatus;
  });

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-steel">Verifying access...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pt-32 pb-24">
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="font-mono text-brass text-xs tracking-[0.35em] mb-2">// CONTROL ROOM</p>
          <h1 className="font-display text-3xl md:text-4xl metal-text">Admin Dashboard</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full btn-outline text-sm"
          data-cursor-hover
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Posts", value: stats.posts, icon: FileText, hint: `${stats.drafts} drafts` },
          { label: "Global Views", value: stats.views, icon: Eye, hint: `${stats.comments} comments` },
          { label: "Subscribers", value: stats.subscribers, icon: Mail, hint: "Newsletter list" },
          { label: "Feedback", value: stats.feedback, icon: MessageSquare, hint: `${stats.reactions} reactions` }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="card-glass rounded-xl p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="hud-label text-steel mb-2">{item.label}</p>
                  <p className="font-display text-3xl metal-text">{shortNumber(item.value)}</p>
                  <p className="text-xs text-steel/70 mt-1">{item.hint}</p>
                </div>
                <div className="w-11 h-11 rounded-full border border-copper/30 bg-black/20 flex items-center justify-center text-brass">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div className="flex gap-2 bg-black/20 w-fit rounded-full p-1 border border-white/5">
          {[
            { id: "posts", label: "Posts" },
            { id: "feedback", label: "Feedback" },
            { id: "subscribers", label: "Subscribers" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as AdminTab)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${tab === item.id ? "bg-metal-gradient text-ink" : "text-steel"}`}
              data-cursor-hover
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          onClick={loadData}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-full btn-outline text-xs disabled:opacity-60"
          data-cursor-hover
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {lastUpdated ? `Synced ${lastUpdated}` : "Refresh"}
        </button>
      </div>

      {tab === "posts" && (
        <div>
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <button
              onClick={handleNewPost}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full btn-primary text-sm"
              data-cursor-hover
            >
              <Plus className="w-4 h-4" /> New Post
            </button>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-copper/60" />
                <input
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                  placeholder="Search posts..."
                  className="w-56 bg-black/30 border border-copper/20 rounded-full pl-9 pr-4 py-2 text-sm text-brass-light placeholder:text-steel/50 focus:outline-none focus:border-copper"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "published" | "draft")}
                className="bg-black/30 border border-copper/20 rounded-full px-4 py-2 text-sm text-brass-light focus:outline-none focus:border-copper"
              >
                <option value="all">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            {filteredPosts.length === 0 && <p className="text-steel text-sm">No posts match the current view.</p>}
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-glass rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${post.published ? "text-brass border-copper/40" : "text-steel border-steel/30"}`}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                    <span className="text-[10px] font-mono text-steel">{post.category}</span>
                  </div>
                  <h3 className="text-brass-light font-medium">{post.title}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-steel/70">
                      <Eye className="w-3.5 h-3.5" />
                      <span className="text-xs font-mono">{post.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-steel/70">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span className="text-xs font-mono">{post.reactions || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-steel/70">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="text-xs font-mono">{post.commentsCount || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditPost(post)} className="w-9 h-9 rounded-full border border-copper/30 flex items-center justify-center text-brass hover:bg-copper/10" data-cursor-hover>
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeletePost(post.id)} className="w-9 h-9 rounded-full border border-maroon/40 flex items-center justify-center text-maroon hover:bg-maroon/10" data-cursor-hover>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {tab === "feedback" && (
        <div>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {feedback.slice(0, 3).map((f) => (
              <div key={f.id} className="card-glass rounded-xl p-4">
                <p className="hud-label text-brass mb-2">{f.category}</p>
                <p className="text-sm text-steel line-clamp-2">{f.message}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
          {feedback.length === 0 && <p className="text-steel text-sm">No feedback submitted yet.</p>}
          {feedback.map((f) => (
            <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-brass" />
                <span className="text-[10px] font-mono text-brass border border-copper/30 rounded-full px-2 py-0.5">{f.category}</span>
                <span className="text-[10px] font-mono text-steel">{f.votes} votes</span>
              </div>
              <p className="text-steel text-sm leading-relaxed">{f.message}</p>
              {(f.name || f.email) && (
                <p className="text-steel/60 text-xs mt-2">
                  {f.name || "Anonymous"} {f.email ? `· ${f.email}` : ""}
                </p>
              )}
            </motion.div>
          ))}
          </div>
        </div>
      )}

      {tab === "subscribers" && (
        <div className="space-y-3">
          {subscribers.length === 0 && (
            <div className="card-glass rounded-xl p-5 text-steel text-sm">
              No newsletter subscribers yet.
            </div>
          )}
          {subscribers.map((subscriber) => (
            <motion.div key={subscriber.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-glass rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full border border-copper/30 bg-black/20 flex items-center justify-center text-brass shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-brass-light text-sm truncate">{subscriber.email}</p>
                  <p className="text-steel/70 text-xs font-mono flex items-center gap-1.5 mt-1">
                    <Clock3 className="w-3 h-3" />
                    {new Date(subscriber.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-circuit">
                <Radio className="w-3.5 h-3.5" /> Active
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {editorOpen && (
        <PostEditorModal
          post={editingPost}
          onClose={() => setEditorOpen(false)}
          onSaved={() => {
            setEditorOpen(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
