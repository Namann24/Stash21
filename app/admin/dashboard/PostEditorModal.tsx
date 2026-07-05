"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Eye, Image as ImageIcon, Pencil, Save, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { Post } from "@/lib/types";
import MarkdownRenderer from "@/components/MarkdownRenderer";

const CATEGORIES = ["Projects", "IoT Networking", "Hardware Builds", "Tutorials", "Microcontrollers", "Power & Circuits"];

export default function PostEditorModal({
  post,
  onClose,
  onSaved
}: {
  post: Post | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [category, setCategory] = useState(post?.category || CATEGORIES[0]);
  const [coverImage, setCoverImage] = useState(post?.cover_image || "");
  const [tags, setTags] = useState(post?.tags?.join(", ") || "");
  const [content, setContent] = useState(post?.content || "");
  const [published, setPublished] = useState(post?.published ?? true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [mode, setMode] = useState<"write" | "preview">("write");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const autoSlug = (val: string) =>
    val.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setCoverImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaveError("");
    setSaving(true);
    const payload = {
      title,
      slug: slug || autoSlug(title),
      category,
      cover_image: coverImage || null,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      content,
      published
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
        const { error } = await supabase.from("posts").insert(payload);
        if (error) throw error;
      }
      setSaving(false);
      onSaved();
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : "Supabase could not save this post. Please check the posts table policies and try again.";
      setSaveError(message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/75 p-3 backdrop-blur-sm md:p-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="mx-auto flex h-[calc(100dvh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-brass/35 bg-[linear-gradient(145deg,rgba(20,12,7,0.96),rgba(6,6,8,0.98))] shadow-[0_0_0_1px_rgba(232,206,140,0.18),0_24px_90px_rgba(0,0,0,0.65)] md:h-[calc(100dvh-2.5rem)]"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-copper/20 px-5 py-4 md:px-7">
          <div>
            <p className="hud-label text-steel">{post ? "Editing Draft" : "Publishing Bay"}</p>
            <h2 className="mt-1 font-display text-2xl text-brass">{post ? "Edit Post" : "New Post"}</h2>
          </div>
          <button onClick={onClose} className="text-steel transition-colors hover:text-brass-light" data-cursor-hover>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 md:px-7">
        <label className="text-xs text-steel mb-1.5 block">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-black/30 border border-copper/20 rounded-lg px-4 py-2.5 mb-4 text-sm text-brass-light focus:outline-none focus:border-copper"
        />

        <label className="text-xs text-steel mb-1.5 block">Slug (auto-generated if left blank)</label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder={autoSlug(title)}
          className="w-full bg-black/30 border border-copper/20 rounded-lg px-4 py-2.5 mb-4 text-sm text-brass-light placeholder:text-steel/50 focus:outline-none focus:border-copper"
        />

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-steel mb-1.5 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-black/30 border border-copper/20 rounded-lg px-4 py-2.5 text-sm text-brass-light focus:outline-none focus:border-copper"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-steel mb-1.5 block">Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full bg-black/30 border border-copper/20 rounded-lg px-4 py-2 text-sm text-brass-light file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-copper/20 file:text-brass-light hover:file:bg-copper/30 file:cursor-pointer cursor-pointer focus:outline-none focus:border-copper"
            />
            {coverImage && (
              <div className="mt-2 text-[10px] text-steel/70 truncate">
                Image selected (preview available below)
              </div>
            )}
          </div>
        </div>

        <label className="text-xs text-steel mb-1.5 block">Tags (comma separated)</label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="esp32, mqtt, sensors"
          className="w-full bg-black/30 border border-copper/20 rounded-lg px-4 py-2.5 mb-4 text-sm text-brass-light placeholder:text-steel/50 focus:outline-none focus:border-copper"
        />

        <div className="flex items-center justify-between gap-3 mb-2">
          <label className="text-xs text-steel block">Content (Markdown supported)</label>
          <div className="flex bg-black/30 border border-copper/20 rounded-full p-1">
            <button
              type="button"
              onClick={() => setMode("write")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${mode === "write" ? "bg-metal-gradient text-ink" : "text-steel"}`}
              data-cursor-hover
            >
              <Pencil className="w-3.5 h-3.5" /> Write
            </button>
            <button
              type="button"
              onClick={() => setMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${mode === "preview" ? "bg-metal-gradient text-ink" : "text-steel"}`}
              data-cursor-hover
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          <div className={`${mode === "preview" ? "hidden lg:block" : "block"}`}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={18}
              placeholder={"## Build Notes\n\nWrite your project teardown, code blocks, and lessons learned here."}
              className="w-full min-h-[430px] bg-black/30 border border-copper/20 rounded-xl px-4 py-3 text-sm text-brass-light font-mono focus:outline-none focus:border-copper resize-none"
            />
          </div>
          <div className={`${mode === "write" ? "hidden lg:block" : "block"} rounded-xl border border-copper/20 bg-black/25 p-4 min-h-[430px] overflow-y-auto`}>
            {coverImage ? (
              <div className="mb-5 overflow-hidden rounded-lg border border-copper/20">
                <img src={coverImage} alt="" className="h-44 w-full object-cover" />
              </div>
            ) : (
              <div className="mb-5 flex h-24 items-center justify-center rounded-lg border border-dashed border-copper/25 text-steel/70">
                <ImageIcon className="w-4 h-4 mr-2" /> Cover preview
              </div>
            )}
            <div className="mb-5">
              <span className="text-[10px] font-mono text-brass border border-copper/30 rounded-full px-2 py-0.5">
                {category}
              </span>
              <h3 className="font-display text-2xl text-brass-light mt-3">{title || "Untitled Post"}</h3>
              {tags && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 5).map((tag) => (
                    <span key={tag} className="text-[10px] font-mono text-steel border border-steel/30 rounded-full px-2 py-0.5">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {content.trim() ? (
              <MarkdownRenderer content={content} />
            ) : (
              <p className="text-sm text-steel/70">Start writing to see the live preview.</p>
            )}
          </div>
        </div>

        <label className="flex items-center gap-2 pb-6 text-sm text-steel">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="accent-brass" />
          Published
        </label>
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-copper/20 bg-black/45 px-5 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between md:px-7">
          <div>
            <p className="text-xs text-steel">
              {published ? "This post will be visible on the blog after Supabase confirms the save." : "Draft mode keeps this post hidden."}
            </p>
            {saveError && (
              <p className="mt-2 flex items-center gap-2 text-xs text-rose-200">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {saveError}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-full btn-outline px-5 py-2.5 text-sm"
              data-cursor-hover
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="flex items-center gap-2 rounded-full btn-primary px-6 py-2.5 text-sm disabled:opacity-50"
              data-cursor-hover
            >
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Post"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
