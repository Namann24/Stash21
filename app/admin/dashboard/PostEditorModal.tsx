"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  Eye,
  Hash,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Pencil,
  Send,
  Tag,
  X
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { Post } from "@/lib/types";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { uploadCoverImage, uploadInlineImage } from "@/lib/uploadImage";

const CATEGORIES = [
  "Projects",
  "IoT Networking",
  "Hardware Builds",
  "Tutorials",
  "Microcontrollers",
  "Power & Circuits"
];

type EditorSnapshot = {
  title: string;
  slug: string;
  category: string;
  coverImage: string;
  tags: string;
  excerpt: string;
  content: string;
};

function snapshotFromPost(post: Post | null): EditorSnapshot {
  return {
    title: post?.title || "",
    slug: post?.slug || "",
    category: post?.category || CATEGORIES[0],
    coverImage: post?.cover_image || "",
    tags: post?.tags?.join(", ") || "",
    excerpt: post?.excerpt || "",
    content: post?.content || ""
  };
}

export default function PostEditorModal({
  post,
  onClose,
  onSaved
}: {
  post: Post | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const initial = useMemo(() => snapshotFromPost(post), [post]);
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [category, setCategory] = useState(initial.category);
  const [coverImage, setCoverImage] = useState(initial.coverImage);
  const [tags, setTags] = useState(initial.tags);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [content, setContent] = useState(initial.content);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [uploadingInline, setUploadingInline] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [mounted, setMounted] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const isDirty = useMemo(() => {
    return (
      title !== initial.title ||
      slug !== initial.slug ||
      category !== initial.category ||
      coverImage !== initial.coverImage ||
      tags !== initial.tags ||
      excerpt !== initial.excerpt ||
      content !== initial.content
    );
  }, [title, slug, category, coverImage, tags, excerpt, content, initial]);

  const autoSlug = (val: string) =>
    val.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

  const requestClose = useCallback(() => {
    if (isDirty && !window.confirm("You have unsaved changes. Discard them?")) return;
    onClose();
  }, [isDirty, onClose]);

  useEffect(() => {
    setMounted(true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [requestClose]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const url = await uploadCoverImage(file);
    setUploadingCover(false);
    if (url) setCoverImage(url);
    e.target.value = "";
  };

  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingInline(true);
    const url = await uploadInlineImage(file);
    setUploadingInline(false);
    if (!url) return;

    const markdown = `![${file.name}](${url})`;
    const textarea = contentRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = content.slice(0, start);
      const after = content.slice(end);
      const newContent = before + markdown + after;
      setContent(newContent);
      requestAnimationFrame(() => {
        textarea.focus();
        const pos = start + markdown.length;
        textarea.setSelectionRange(pos, pos);
      });
    } else {
      setContent((prev) => prev + "\n" + markdown);
    }
    e.target.value = "";
  };

  const handleSave = async (isPublished: boolean) => {
    setSaveError("");
    setSaving(true);
    const payload = {
      title,
      slug: slug || autoSlug(title),
      category,
      cover_image: coverImage || null,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      excerpt: excerpt || null,
      content,
      published: isPublished
    };

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("Your admin session expired. Please sign in again.");
      }

      if (post) {
        const { error } = await supabase.from("posts").update(payload).eq("id", post.id);
        if (error) throw error;
      } else {
        const insertPayload = {
          ...payload,
          author_id: sessionData.session.user.id
        };
        const { error } = await supabase.from("posts").insert(insertPayload);
        if (error) throw error;
      }

      setSaving(false);
      setSaveSuccess(isPublished ? "Published successfully" : "Draft saved");
      setTimeout(() => {
        setSaveSuccess("");
        onSaved();
      }, 900);
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : "Could not save this post. Check database policies and try again.";
      setSaveError(message);
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-stretch justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={post ? "Edit post" : "New post"}
    >
      <motion.button
        type="button"
        aria-label="Close editor"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={requestClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.985 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="relative z-10 flex flex-col w-full h-full md:h-[calc(100vh-2rem)] md:max-w-[1320px] md:my-4 md:rounded-2xl overflow-hidden admin-editor-shell holo-card shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 z-0 bg-slate-panel/70 backdrop-blur-2xl" />
        {/* Header */}
        <header className="relative z-10 flex-none flex items-center justify-between gap-4 px-4 md:px-6 h-16 border-b border-copper/10 bg-slate-panel/40 backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={requestClose}
              className="admin-close-btn group flex items-center gap-2 pl-2 pr-4 py-2 rounded-xl border border-copper/20 bg-black/20 hover:bg-maroon/10 hover:border-maroon/30 transition-all shrink-0"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-black/30 group-hover:bg-maroon/20 transition-colors">
                <X className="w-4 h-4 text-steel group-hover:text-maroon transition-colors" />
              </span>
              <span className="hidden sm:inline text-sm font-medium text-steel group-hover:text-brass-light transition-colors">
                Close
              </span>
            </button>

            <div className="hidden sm:block h-6 w-px bg-copper/15" />

            <div className="min-w-0">
              <p className="text-sm font-medium text-brass-light truncate">
                {post ? "Edit Post" : "New Post"}
              </p>
              <p className="text-[11px] text-steel truncate">
                {isDirty ? "Unsaved changes" : post?.published ? "Published" : "Draft"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving || !title.trim()}
              className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-medium text-steel hover:text-brass-light border border-copper/15 hover:border-copper/30 hover:bg-copper/5 transition-all disabled:opacity-40"
            >
              {saving ? "Saving..." : "Save draft"}
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving || !title.trim()}
              className="inline-flex items-center gap-2 px-4 md:px-5 py-2 rounded-xl btn-primary text-sm font-medium disabled:opacity-40 shadow-[0_0_20px_rgba(201,162,75,0.15)] hover:shadow-[0_0_30px_rgba(201,162,75,0.3)] transition-all bounce-hover"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {saving ? "Saving..." : post?.published ? "Update" : "Publish"}
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Editor pane */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-none flex items-center justify-between gap-3 px-4 md:px-6 py-3 border-b border-copper/10">
              <div className="flex p-1 rounded-lg bg-black/40 border border-copper/15 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                <button
                  type="button"
                  onClick={() => setMode("write")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    mode === "write" ? "bg-copper/15 text-brass-light" : "text-steel hover:text-brass-light"
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5" /> Write
                </button>
                <button
                  type="button"
                  onClick={() => setMode("preview")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                    mode === "preview" ? "bg-copper/20 text-brass-light shadow-[0_2px_10px_rgba(201,162,75,0.15)]" : "text-steel hover:text-brass-light"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
              </div>

              <input
                ref={inlineInputRef}
                type="file"
                accept="image/*"
                onChange={handleInlineImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => inlineInputRef.current?.click()}
                disabled={uploadingInline}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-copper/20 text-xs font-medium text-steel hover:text-brass-light hover:border-copper/40 hover:bg-white/5 transition-all disabled:opacity-50 bounce-hover"
              >
                {uploadingInline ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ImageIcon className="w-3.5 h-3.5" />
                )}
                Insert image
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 hide-scrollbar">
              <div className="max-w-3xl mx-auto">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title"
                  className="w-full bg-transparent text-3xl md:text-4xl font-display text-brass-light placeholder:text-steel/35 focus:outline-none mb-6"
                />

                {mode === "write" ? (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/20 pointer-events-none rounded-b-xl z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <textarea
                      ref={contentRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your post in Markdown..."
                      className="w-full min-h-[320px] md:min-h-[420px] bg-transparent text-base text-steel font-mono focus:outline-none resize-none leading-relaxed placeholder:text-steel/25 pb-20 relative z-0"
                    />
                  </div>
                ) : (
                  <div className="min-h-[320px] pb-12 prose-admin">
                    {content.trim() ? (
                      <MarkdownRenderer content={content} />
                    ) : (
                      <p className="text-steel/40 font-mono text-sm py-16 text-center">
                        Nothing to preview yet
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile save row */}
            <div className="sm:hidden flex-none border-t border-copper/10 p-4 flex gap-2 bg-slate-panel/60">
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={saving || !title.trim()}
                className="flex-1 py-3 rounded-xl border border-copper/25 text-sm font-medium disabled:opacity-40"
              >
                Draft
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={saving || !title.trim()}
                className="flex-1 py-3 rounded-xl btn-primary text-sm disabled:opacity-40"
              >
                Publish
              </button>
            </div>
          </div>

          {/* Settings pane */}
          <aside className="lg:w-[340px] xl:w-[380px] shrink-0 border-t lg:border-t-0 lg:border-l border-copper/10 bg-black/30 flex flex-col max-h-[45vh] lg:max-h-none">
            <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar">
              {/* Cover */}
              <section>
                <p className="admin-field-label mb-3">
                  <ImageIcon className="w-3.5 h-3.5" /> Cover image
                </p>
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && coverInputRef.current?.click()}
                  onClick={() => coverInputRef.current?.click()}
                  className="relative rounded-xl overflow-hidden border border-dashed border-copper/25 bg-black/20 aspect-[16/9] flex items-center justify-center cursor-pointer group hover:border-copper/45 transition-colors"
                >
                  {coverImage ? (
                    <>
                      <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-xs font-medium text-white px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm">
                          Change image
                        </span>
                      </div>
                    </>
                  ) : uploadingCover ? (
                    <Loader2 className="w-6 h-6 text-brass animate-spin" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-steel/60">
                      <ImageIcon className="w-6 h-6" />
                      <span className="text-xs">Click to upload</span>
                    </div>
                  )}
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </section>

              {/* Metadata */}
              <section className="space-y-4">
                <p className="admin-field-label">
                  <Tag className="w-3.5 h-3.5" /> Details
                </p>

                <div>
                  <label className="admin-input-label">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="admin-input focus:ring-1 focus:ring-circuit/50 focus:border-circuit/50 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="admin-input-label">Tags</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-copper/50" />
                    <input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="hardware, esp32, diy"
                      className="admin-input !pl-9 focus:ring-1 focus:ring-circuit/50 focus:border-circuit/50 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="admin-input-label">URL slug</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-copper/50" />
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder={autoSlug(title) || "post-slug"}
                      className="admin-input !pl-9 font-mono text-xs focus:ring-1 focus:ring-circuit/50 focus:border-circuit/50 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="admin-input-label">Excerpt</label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Short summary for cards and SEO..."
                    rows={3}
                    className="admin-input resize-none focus:ring-1 focus:ring-circuit/50 focus:border-circuit/50 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]"
                  />
                </div>
              </section>
            </div>

            <div className="flex-none p-4 border-t border-copper/10">
              <AnimatePresence>
                {saveSuccess && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-xs text-circuit bg-circuit/10 border border-circuit/25 px-3 py-2 rounded-lg mb-2"
                  >
                    <Check className="w-3.5 h-3.5" /> {saveSuccess}
                  </motion.p>
                )}
                {saveError && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/25 px-3 py-2 rounded-lg"
                  >
                    <AlertCircle className="w-3.5 h-3.5" /> {saveError}
                  </motion.p>
                )}
              </AnimatePresence>
              <p className="text-[10px] text-steel/60 font-mono">
                {content.length.toLocaleString()} chars · Esc to close
              </p>
            </div>
          </aside>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
