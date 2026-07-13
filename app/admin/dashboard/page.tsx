"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { logError } from "@/lib/errorHandler";
import type { Post, Feedback, Subscriber, Comment } from "@/lib/types";
import { getDashboardData, approveComment as actionApproveComment, deleteComment as actionDeleteComment, deletePost as actionDeletePost } from "../actions";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import {
  CheckCircle2,
  ArrowLeft,
  Menu,
  Edit3,
  Eye,
  FileText,
  Loader2,
  Mail,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  ThumbsUp,
  Trash2,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";
import PostEditorModal from "./PostEditorModal";
import AdminSidebar, { type AdminSection } from "@/components/admin/AdminSidebar";

type AdminPost = Post & { commentsCount?: number; reactions?: number };
type CommentWithPost = Comment & { posts?: { title: string } };
type DeletePrompt = {
  kind: "post" | "comment";
  id: string;
  title: string;
  message: string;
};

const shortNumber = (value: number) =>
  new Intl.NumberFormat("en", { notation: value >= 10000 ? "compact" : "standard" }).format(value);

const SECTION_TITLES: Record<AdminSection, { title: string; subtitle: string }> = {
  overview: {
    title: "Dashboard",
    subtitle: "Overview of your blog performance and recent activity."
  },
  posts: {
    title: "Posts",
    subtitle: "Create, edit, and manage published content."
  },
  comments: {
    title: "Comments",
    subtitle: "Review and moderate reader comments."
  },
  feedback: {
    title: "Feedback",
    subtitle: "Community suggestions and feature requests."
  },
  subscribers: {
    title: "Subscribers",
    subtitle: "Newsletter subscribers and audience growth."
  }
};

export default function AdminDashboard() {
  const [section, setSection] = useState<AdminSection>("overview");
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [comments, setComments] = useState<CommentWithPost[]>([]);
  const [checking, setChecking] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [postSearch, setPostSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [deletePrompt, setDeletePrompt] = useState<DeletePrompt | null>(null);
  const router = useRouter();

  const requireCurrentAccessToken = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      setAccessToken(null);
      router.replace("/admin");
      router.refresh();
      return null;
    }

    setAccessToken(data.session.access_token);
    return data.session.access_token;
  }, [router]);

  const loadData = useCallback(async (tokenOverride?: string) => {
    const token = tokenOverride ?? (await requireCurrentAccessToken());
    if (!token) return;

    setRefreshing(true);
    try {
      const data = await getDashboardData(token);
      setPosts(data.posts as AdminPost[]);
      setFeedback(data.feedback);
      setSubscribers(data.subscribers);
      setComments(data.comments as CommentWithPost[]);
    } catch (err) {
      logError("AdminDashboard.loadData", err);
      const message = err instanceof Error ? err.message : "";
      if (message.toLowerCase().includes("session") || message.toLowerCase().includes("allowed")) {
        setAccessToken(null);
        await supabase.auth.signOut();
        router.replace("/admin");
        router.refresh();
      }
    } finally {
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setRefreshing(false);
    }
  }, [requireCurrentAccessToken, router]);

  useEffect(() => {
    let active = true;

    (async () => {
      setChecking(true);
      const token = await requireCurrentAccessToken();
      if (!active) return;

      if (token) {
        await loadData(token);
      }

      if (active) setChecking(false);
    })();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAccessToken(null);
        router.replace("/admin");
        router.refresh();
        return;
      }

      setAccessToken(session.access_token);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [loadData, requireCurrentAccessToken, router]);

  useEffect(() => {
    if (!deletePrompt) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDeletePrompt(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deletePrompt]);

  const handleApproveComment = async (id: string) => {
    const token = await requireCurrentAccessToken();
    if (!token) return;

    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, approved: true } : c)));
    try {
      await actionApproveComment(token, id);
    } catch (err) {
      logError("AdminDashboard.approveComment", err);
    }
  };

  const handleDeleteComment = (id: string) => {
    setDeletePrompt({
      kind: "comment",
      id,
      title: "Delete Comment?",
      message: "This comment will be removed from the dashboard and cannot be restored."
    });
  };

  const confirmDeletePrompt = async () => {
    if (!deletePrompt) return;
    const prompt = deletePrompt;
    setDeletePrompt(null);

    if (prompt.kind === "comment") {
      const token = await requireCurrentAccessToken();
      if (!token) return;

      setComments((prev) => prev.filter((c) => c.id !== prompt.id));
      try {
        await actionDeleteComment(token, prompt.id);
      } catch (err) {
        logError("AdminDashboard.deleteComment", err);
      }
      return;
    }

    const token = await requireCurrentAccessToken();
    if (!token) return;

    setPosts((prev) => prev.filter((p) => p.id !== prompt.id));
    try {
      await actionDeletePost(token, prompt.id);
    } catch (err) {
      logError("AdminDashboard.deletePost", err);
    }
  };

  const handleLogout = async () => {
    setAccessToken(null);
    await supabase.auth.signOut();
    router.replace("/admin");
    router.refresh();
  };

  const handleDeletePost = (post: Post) => {
    setDeletePrompt({
      kind: "post",
      id: post.id,
      title: "Delete Post Permanently?",
      message: `"${post.title}" will be removed from your posts. This action cannot be undone.`
    });
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
    drafts: posts.filter((post) => !post.published).length,
    pendingComments: comments.filter((c) => !c.approved).length
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

  const meta = SECTION_TITLES[section];

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-brass animate-spin" />
          <p className="text-sm text-steel">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <AdminSidebar
        active={section}
        onNavigate={(s) => {
          setSection(s);
          setIsMobileMenuOpen(false);
        }}
        onLogout={handleLogout}
        badges={{
          comments: stats.pendingComments,
          feedback: stats.feedback
        }}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-3 sm:px-4 md:px-8 py-3 md:py-4 border-b border-copper/10 bg-white/80 dark:bg-slate-panel/70 backdrop-blur-xl">
          <div className="flex items-center gap-2 sm:gap-3 min-h-0 relative">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl text-stone-600 dark:text-steel hover:text-brass-dark dark:hover:text-brass-light hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Subtle glow behind title */}
            <div className="absolute -inset-4 bg-brass/10 blur-xl rounded-full opacity-50 pointer-events-none" />
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl text-brass-dark dark:text-brass-light truncate relative z-10">{meta.title}</h1>
            <p className="text-sm text-stone-600 dark:text-steel truncate hidden md:block relative z-10">{meta.subtitle}</p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 shrink-0">
            <div className="hidden xl:flex items-center gap-3 pr-4 border-r border-copper/10">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-copper/15 text-xs text-stone-600 dark:text-steel hover:text-brass-dark dark:hover:text-brass-light hover:border-copper/30 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to site
              </Link>
            </div>
            <ThemeToggle compact />
            <button
              type="button"
              onClick={handleNewPost}
              className="inline-flex items-center justify-center gap-2 h-9 sm:h-auto px-3 sm:px-4 sm:py-2 rounded-xl btn-primary text-sm font-medium shadow-[0_0_20px_rgba(201,162,75,0.12)] hover:shadow-[0_0_30px_rgba(201,162,75,0.25)] transition-all"
              aria-label="New post"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New post</span>
            </button>
            <button
              type="button"
              onClick={() => loadData()}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 h-9 sm:h-auto px-3 md:px-4 sm:py-2 rounded-xl border border-copper/15 text-xs text-stone-600 dark:text-steel hover:text-brass-dark dark:hover:text-brass-light hover:border-copper/40 hover:bg-black/5 dark:hover:bg-black/20 transition-all disabled:opacity-50"
              aria-label="Refresh dashboard"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden lg:inline">{lastUpdated ? `Updated ${lastUpdated}` : "Refresh"}</span>
            </button>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="lg:hidden sticky top-[61px] z-20 flex gap-1 overflow-x-auto px-3 py-2 border-b border-copper/10 bg-white/80 dark:bg-slate-panel/80 backdrop-blur-xl hide-scrollbar">
          {(["overview", "posts", "comments", "feedback", "subscribers"] as AdminSection[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap capitalize transition-all shrink-0 ${
                section === id ? "bg-copper/15 text-brass-dark dark:text-brass-light border border-copper/25" : "text-stone-600 dark:text-steel"
              }`}
            >
              {id}
            </button>
          ))}
        </div>

        <main className="flex-1 p-3 sm:p-4 md:p-8 pb-24 lg:pb-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {section === "overview" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Total views", value: stats.views, icon: Eye, accent: "text-circuit" },
                      { label: "Posts", value: stats.posts, icon: FileText, accent: "text-brass" },
                      { label: "Comments", value: stats.comments, icon: MessageSquare, accent: "text-violet" },
                      { label: "Subscribers", value: stats.subscribers, icon: Users, accent: "text-copper" }
                    ].map((card, i) => (
                      <motion.div 
                        key={card.label} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="admin-stat-card scan-card holo-card hover:-translate-y-1 transition-transform duration-300"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <card.icon className={`w-5 h-5 ${card.accent}`} />
                          <TrendingUp className="w-3.5 h-3.5 text-steel/40" />
                        </div>
                        <p className="text-2xl md:text-3xl font-display text-brass-light drop-shadow-[0_0_8px_rgba(201,162,75,0.2)]">{shortNumber(card.value)}</p>
                        <p className="text-xs text-steel mt-1">{card.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="admin-panel holo-card overflow-hidden">
                      <div className="flex items-center justify-between mb-5 relative z-10">
                        <h2 className="text-sm font-semibold text-brass-light">Recent posts</h2>
                        <button type="button" onClick={() => setSection("posts")} className="text-xs text-circuit hover:underline">
                          View all
                        </button>
                      </div>
                      {posts.length === 0 ? (
                        <p className="text-sm text-steel py-8 text-center">No posts yet</p>
                      ) : (
                        <div className="space-y-2 stagger-children relative z-10">
                          {posts.slice(0, 5).map((post) => (
                            <button
                              key={post.id}
                              type="button"
                              onClick={() => handleEditPost(post)}
                              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-black/20 border border-transparent hover:border-copper/15 transition-all text-left group card-tilt-glow"
                            >
                              <div className="w-10 h-10 rounded-lg bg-copper/10 border border-copper/15 flex items-center justify-center shrink-0 overflow-hidden group-hover:border-copper/30 transition-colors">
                                {post.cover_image ? (
                                  <img src={post.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                  <FileText className="w-4 h-4 text-brass/60" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-brass-light truncate group-hover:text-brass transition-colors">{post.title}</p>
                                <p className="text-[11px] text-steel">{post.published ? "Published" : "Draft"} · {shortNumber(post.views || 0)} views</p>
                              </div>
                              <Edit3 className="w-3.5 h-3.5 text-circuit opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="admin-panel scan-card border-flow overflow-hidden">
                      <div className="flex items-center justify-between mb-5 relative z-10">
                        <h2 className="text-sm font-semibold text-brass-light">Quick stats</h2>
                      </div>
                      <div className="grid grid-cols-2 gap-3 relative z-10">
                        {[
                          { label: "Drafts", value: stats.drafts },
                          { label: "Reactions", value: stats.reactions },
                          { label: "Pending comments", value: stats.pendingComments },
                          { label: "Feedback", value: stats.feedback }
                        ].map((item) => (
                          <div key={item.label} className="rounded-xl border border-copper/10 bg-black/10 p-4">
                            <p className="text-xl font-display text-brass-light">{shortNumber(item.value)}</p>
                            <p className="text-[11px] text-steel mt-1">{item.label}</p>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleNewPost}
                        className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl btn-primary text-sm font-medium relative z-10 shadow-[0_0_15px_rgba(201,162,75,0.1)] hover:shadow-[0_0_25px_rgba(201,162,75,0.25)] transition-all bounce-hover"
                      >
                        <Plus className="w-4 h-4" /> Create new post
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {section === "posts" && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-steel/50" />
                      <input
                        value={postSearch}
                        onChange={(e) => setPostSearch(e.target.value)}
                        placeholder="Search posts..."
                        className="admin-input pl-10 w-full"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as "all" | "published" | "draft")}
                      className="admin-input sm:w-40"
                    >
                      <option value="all">All status</option>
                      <option value="published">Published</option>
                      <option value="draft">Drafts</option>
                    </select>
                  </div>

                  {filteredPosts.length === 0 ? (
                    <div className="admin-empty">
                      <FileText className="w-12 h-12 text-steel/30 mb-3" />
                      <p className="text-brass-light font-medium">No posts found</p>
                      <p className="text-sm text-steel mt-1">Try different filters or create a new post.</p>
                      <button type="button" onClick={handleNewPost} className="mt-4 px-5 py-2.5 rounded-xl btn-primary text-sm">
                        New post
                      </button>
                    </div>
                  ) : (
                    <div className="admin-panel overflow-hidden p-0 holo-card">
                      <div className="overflow-x-auto relative z-10">
                        <table className="admin-table w-full">
                          <thead>
                            <tr>
                              <th>Post</th>
                              <th className="hidden md:table-cell">Status</th>
                              <th className="hidden sm:table-cell">Views</th>
                              <th className="hidden lg:table-cell">Engagement</th>
                              <th className="text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPosts.map((post) => (
                              <tr key={post.id} className="group">
                                <td>
                                  <div className="flex items-center gap-3 min-w-[200px]">
                                    <div className="w-11 h-11 rounded-lg bg-copper/10 border border-copper/15 overflow-hidden shrink-0">
                                      {post.cover_image ? (
                                        <img src={post.cover_image} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <FileText className="w-4 h-4 text-brass/50" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-brass-light truncate max-w-[280px]">{post.title}</p>
                                      <p className="text-[11px] text-steel">{post.category}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="hidden md:table-cell">
                                  <span className={`admin-badge ${post.published ? "admin-badge-live" : "admin-badge-draft"}`}>
                                    {post.published ? "Published" : "Draft"}
                                  </span>
                                </td>
                                <td className="hidden sm:table-cell">
                                  <span className="text-sm text-steel font-mono">{shortNumber(post.views || 0)}</span>
                                </td>
                                <td className="hidden lg:table-cell">
                                  <div className="flex items-center gap-4 text-xs text-steel">
                                    <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{shortNumber(post.reactions || 0)}</span>
                                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{shortNumber(post.commentsCount || 0)}</span>
                                  </div>
                                </td>
                                <td>
                                  <div className="flex items-center justify-end gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleEditPost(post)}
                                        className="admin-icon-btn bounce-hover"
                                        aria-label="Edit post"
                                      >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeletePost(post)}
                                        className="admin-icon-btn admin-icon-btn-danger bounce-hover"
                                        aria-label="Delete post"
                                      >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {section === "feedback" && (
                <div className="space-y-4">
                  {feedback.length === 0 ? (
                    <div className="admin-empty">
                      <Zap className="w-12 h-12 text-steel/30 mb-3" />
                      <p className="text-brass-light font-medium">No feedback yet</p>
                      <p className="text-sm text-steel mt-1">Community feedback will appear here.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {feedback.map((f, i) => (
                        <motion.div
                          key={f.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="admin-panel holo-card hover:-translate-y-1 transition-transform"
                        >
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-3">
                              <span className="admin-badge admin-badge-live">{f.category}</span>
                              <span className="text-[11px] font-mono text-steel">{f.votes} votes</span>
                            </div>
                            <p className="text-sm text-brass-light leading-relaxed line-clamp-4 mb-4">{f.message}</p>
                            <div className="pt-3 border-t border-copper/10 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-copper/10 flex items-center justify-center">
                                <Mail className="w-3.5 h-3.5 text-steel" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-brass-light">{f.name || "Anonymous"}</p>
                                {f.email && <p className="text-[10px] font-mono text-steel">{f.email}</p>}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {section === "comments" && (
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="admin-empty">
                      <MessageSquare className="w-12 h-12 text-steel/30 mb-3" />
                      <p className="text-brass-light font-medium">No comments</p>
                      <p className="text-sm text-steel mt-1">Reader comments will show up here.</p>
                    </div>
                  ) : (
                    comments.map((comment, i) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`admin-panel holo-card hover:border-copper/30 transition-all ${!comment.approved ? "ring-1 ring-circuit/30 shadow-[0_0_15px_rgba(77,216,232,0.15)]" : ""}`}
                      >
                        <div className="relative z-10">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-brass-light text-sm">{comment.author_name}</p>
                              <span className="text-[10px] text-steel">{new Date(comment.created_at).toLocaleDateString()}</span>
                            </div>
                            {comment.posts?.title && (
                              <p className="text-xs text-steel">On: {comment.posts.title}</p>
                            )}
                          </div>
                          <span className={`admin-badge ${comment.approved ? "admin-badge-draft" : "admin-badge-pending"}`}>
                            {comment.approved ? "Approved" : "Pending review"}
                          </span>
                        </div>
                        <p className="text-sm text-steel leading-relaxed bg-black/10 rounded-xl p-4 mb-4">{comment.content}</p>
                        <div className="flex justify-end gap-2">
                          {!comment.approved && (
                            <button
                              type="button"
                              onClick={() => handleApproveComment(comment.id)}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-circuit border border-circuit/30 hover:bg-circuit/10 hover:shadow-[0_0_15px_rgba(77,216,232,0.2)] transition-all bounce-hover"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Approve
                            </button>
                          )}
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-maroon border border-maroon/30 hover:bg-maroon/10 hover:shadow-[0_0_15px_rgba(235,87,87,0.2)] transition-all bounce-hover"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {section === "subscribers" && (
                <div className="space-y-4">
                  {subscribers.length === 0 ? (
                    <div className="admin-empty">
                      <Users className="w-12 h-12 text-steel/30 mb-3" />
                      <p className="text-brass-light font-medium">No subscribers</p>
                      <p className="text-sm text-steel mt-1">Newsletter signups will appear here.</p>
                    </div>
                  ) : (
                    <div className="admin-panel overflow-hidden p-0">
                      <div className="overflow-x-auto">
                        <table className="admin-table w-full">
                          <thead>
                            <tr>
                              <th>Email</th>
                              <th className="hidden sm:table-cell">Joined</th>
                              <th className="text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {subscribers.map((subscriber) => (
                              <tr key={subscriber.id}>
                                <td>
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-copper/10 flex items-center justify-center">
                                      <Mail className="w-4 h-4 text-brass/70" />
                                    </div>
                                    <span className="text-sm text-brass-light">{subscriber.email}</span>
                                  </div>
                                </td>
                                <td className="hidden sm:table-cell text-sm text-steel">
                                  {new Date(subscriber.created_at).toLocaleDateString()}
                                </td>
                                <td className="text-right">
                                  <span className="admin-badge admin-badge-live">Active</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {editorOpen && (
        <PostEditorModal
          post={editingPost}
          accessToken={accessToken}
          onClose={() => setEditorOpen(false)}
          onSaved={() => {
            setEditorOpen(false);
            loadData();
          }}
        />
      )}

      <AnimatePresence>
        {deletePrompt && (
          <motion.div
            className="fixed inset-0 z-[10020] flex items-center justify-center bg-black/30 dark:bg-black/65 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeletePrompt(null)}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="dashboard-delete-title"
              aria-describedby="dashboard-delete-description"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="w-full max-w-md rounded-2xl border border-maroon/25 bg-white/95 dark:bg-slate-panel/95 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.4)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-maroon/25 bg-maroon/10 text-maroon">
                  <Trash2 className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <p className="admin-field-label text-stone-600 dark:text-steel mb-2">System Prompt</p>
                  <h3 id="dashboard-delete-title" className="font-display text-xl text-brass-dark dark:text-brass-light">
                    {deletePrompt.title}
                  </h3>
                  <p id="dashboard-delete-description" className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-steel">
                    {deletePrompt.message}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeletePrompt(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 dark:text-steel border border-copper/20 hover:border-copper/35 hover:text-brass-dark dark:hover:text-brass-light transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeletePrompt}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-maroon hover:bg-maroon/90 transition-all"
                >
                  Delete {deletePrompt.kind}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="lg:hidden fixed left-0 right-0 bottom-0 z-30 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 bg-gradient-to-t from-white via-white/95 to-white/0 dark:from-slate-panel dark:via-slate-panel/95 dark:to-slate-panel/0 pointer-events-none">
        <button
          type="button"
          onClick={handleNewPost}
          className="pointer-events-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl btn-primary text-sm font-medium shadow-[0_10px_32px_rgba(0,0,0,0.28)]"
        >
          <Plus className="w-4 h-4" /> Create new post
        </button>
      </div>
    </div>
  );
}
