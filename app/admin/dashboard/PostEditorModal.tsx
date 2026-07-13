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
  List,
  ListOrdered,
  Loader2,
  Pencil,
  Send,
  Tag,
  X,
  Bold,
  Italic,
  Code,
  Type,
  LayoutTemplate,
  FilePlus,
  ArrowLeft
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { Post } from "@/lib/types";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { uploadCoverImage, uploadInlineImage } from "@/lib/uploadImage";
import { upsertPost } from "../actions";

const CATEGORIES = [
  "Projects",
  "IoT Networking",
  "Hardware Builds",
  "Tutorials",
  "Microcontrollers",
  "Power & Circuits"
];

const POST_TEMPLATES = [
  {
    title: "Project Build",
    description: "A complete hardware build log with parts, wiring, firmware, and lessons learned.",
    content: `## Introduction
Write a brief introduction about the project. What problem does it solve, and why did you build it?

## Hardware Required
- Component 1
- Component 2
- Component 3

## Schematic / Wiring
Describe the wiring or embed an image of the schematic.
![Schematic Placeholder](https://via.placeholder.com/800x400?text=Schematic)

## The Code
Explain the core logic of the firmware or software.

\`\`\`cpp
void setup() {
  // Initialization code here
}

void loop() {
  // Main logic here
}
\`\`\`

## Build Process
1. Step one
2. Step two
3. Step three

## Conclusion
Wrap up the post. What are the next steps or future improvements?
`
  },
  {
    title: "Tutorial",
    description: "A step-by-step guide for readers who want to reproduce the result.",
    content: `## What You'll Build
Explain the finished outcome and who this tutorial is for.

## Prerequisites
- Tool or account needed
- Hardware or software version
- Basic concept to know

## Step 1: Setup
Describe the initial setup.

## Step 2: Build
Walk through the main implementation.

## Step 3: Test
Show how to confirm everything works.

## Troubleshooting
- Common issue: fix or explanation
- Common issue: fix or explanation

## Next Steps
Suggest improvements, variations, or related experiments.
`
  },
  {
    title: "Protocol Comparison",
    description: "A structured comparison for choices like MQTT vs LoRa or ESP32 vs Arduino.",
    content: `## The Decision
Set up the choice readers are trying to make.

## Quick Verdict
Summarize the best option for most people in one or two paragraphs.

## Comparison Table
| Criteria | Option A | Option B |
| --- | --- | --- |
| Range | TBD | TBD |
| Power draw | TBD | TBD |
| Complexity | TBD | TBD |
| Cost | TBD | TBD |

## Where Option A Wins
- Reason 1
- Reason 2

## Where Option B Wins
- Reason 1
- Reason 2

## Recommendation
Explain which one you would choose and why.
`
  },
  {
    title: "Debugging Notes",
    description: "A repair diary for bugs, broken circuits, flaky sensors, and hard-won fixes.",
    content: `## Symptom
Describe what went wrong and how it showed up.

## Setup
- Board:
- Sensor/module:
- Power source:
- Firmware/library version:

## What I Tried
1. First test and result
2. Second test and result
3. Third test and result

## Root Cause
Explain the actual cause once found.

## Fix
\`\`\`cpp
// Add the final working snippet here
\`\`\`

## Takeaways
- Lesson 1
- Lesson 2
- Lesson 3
`
  }
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

type ListMode = "bullet" | "ordered";
type PendingInlineImage = {
  url: string;
  alt: string;
  start: number | null;
  end: number | null;
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
  accessToken,
  onClose,
  onSaved
}: {
  post: Post | null;
  accessToken: string | null;
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
  const [activeListMode, setActiveListMode] = useState<ListMode | null>(null);
  const [uploadingInline, setUploadingInline] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [setupMode, setSetupMode] = useState(!post);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [pendingInlineImage, setPendingInlineImage] = useState<PendingInlineImage | null>(null);
  const [captionText, setCaptionText] = useState("");
  const [showDiscardPrompt, setShowDiscardPrompt] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const focusSelection = (start: number, end = start) => {
    requestAnimationFrame(() => {
      contentRef.current?.focus();
      contentRef.current?.setSelectionRange(start, end);
    });
  };

  const replaceSelection = (replacement: string, selectStart?: number, selectEnd?: number) => {
    if (!contentRef.current) return;
    const start = contentRef.current.selectionStart;
    const end = contentRef.current.selectionEnd;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    focusSelection(start + (selectStart ?? replacement.length), start + (selectEnd ?? replacement.length));
  };

  const insertFormat = (prefix: string, suffix: string = "") => {
    if (!contentRef.current) return;
    const start = contentRef.current.selectionStart;
    const end = contentRef.current.selectionEnd;
    const selected = content.substring(start, end);
    replaceSelection(`${prefix}${selected}${suffix}`, prefix.length, prefix.length + selected.length);
  };

  const currentLineAt = (cursor: number) => {
    const lineStart = content.lastIndexOf("\n", Math.max(0, cursor - 1)) + 1;
    const nextBreak = content.indexOf("\n", cursor);
    const lineEnd = nextBreak === -1 ? content.length : nextBreak;
    return {
      lineStart,
      lineEnd,
      line: content.slice(lineStart, lineEnd)
    };
  };

  const stripListMarker = (line: string) => line.replace(/^(\s*)(?:[-*+]\s+|\d+\.\s+)/, "$1");

  const toggleListMode = (listMode: ListMode) => {
    const textarea = contentRef.current;
    if (!textarea) {
      setActiveListMode((prev) => (prev === listMode ? null : listMode));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);

    if (activeListMode === listMode) {
      const { lineStart, lineEnd, line } = currentLineAt(start);
      setActiveListMode(null);

      if (/^\s*(?:[-*+]\s*|\d+\.\s*)$/.test(line)) {
        const nextContent = content.slice(0, lineStart) + content.slice(lineEnd);
        setContent(nextContent);
        focusSelection(lineStart);
      } else {
        focusSelection(start, end);
      }
      return;
    }

    setActiveListMode(listMode);

    if (selected) {
      const listText = selected
        .split("\n")
        .map((line, index) => {
          const marker = listMode === "bullet" ? "- " : `${index + 1}. `;
          return `${marker}${stripListMarker(line)}`;
        })
        .join("\n");
      replaceSelection(listText);
      return;
    }

    const { lineStart, lineEnd, line } = currentLineAt(start);
    const marker = listMode === "bullet" ? "- " : "1. ";

    if (/^\s*$/.test(line)) {
      const indentation = line.match(/^\s*/)?.[0] || "";
      const nextLine = `${indentation}${marker}`;
      const nextContent = content.slice(0, lineStart) + nextLine + content.slice(lineEnd);
      setContent(nextContent);
      focusSelection(lineStart + nextLine.length);
      return;
    }

    if (/^\s*(?:[-*+]\s+|\d+\.\s+)/.test(line)) {
      focusSelection(start, end);
      return;
    }

    const insert = `${start > 0 && content[start - 1] !== "\n" ? "\n" : ""}${marker}`;
    replaceSelection(insert);
  };

  const insertCodeBlock = () => {
    if (!contentRef.current) return;
    const start = contentRef.current.selectionStart;
    const end = contentRef.current.selectionEnd;
    const selected = content.slice(start, end) || "// code";
    replaceSelection(`\`\`\`cpp\n${selected}\n\`\`\``, 7, 7 + selected.length);
  };

  const insertCaptionedImage = () => {
    const selected = contentRef.current
      ? content.slice(contentRef.current.selectionStart, contentRef.current.selectionEnd).trim()
      : "";
    const altText = selected || "Image description";
    const markdown = `![${altText}](image-url "Image caption")`;
    replaceSelection(markdown, markdown.indexOf("image-url"), markdown.indexOf("image-url") + "image-url".length);
  };

  const insertInlineImageMarkdown = (pendingImage: PendingInlineImage, caption = "") => {
    const safeCaption = caption.trim().replace(/"/g, "'");
    const markdown = safeCaption
      ? `![${pendingImage.alt}](${pendingImage.url} "${safeCaption}")`
      : `![${pendingImage.alt}](${pendingImage.url})`;

    if (pendingImage.start !== null && pendingImage.end !== null) {
      setContent((prev) => prev.slice(0, pendingImage.start!) + markdown + prev.slice(pendingImage.end!));
      focusSelection(pendingImage.start + markdown.length);
    } else {
      setContent((prev) => `${prev}${prev.endsWith("\n") || !prev ? "" : "\n"}${markdown}`);
    }
  };

  const closeCaptionDialog = (shouldInsertWithoutCaption = false) => {
    if (pendingInlineImage && shouldInsertWithoutCaption) {
      insertInlineImageMarkdown(pendingInlineImage);
    }

    setPendingInlineImage(null);
    setCaptionText("");
  };

  const confirmCaptionDialog = () => {
    if (!pendingInlineImage) return;
    insertInlineImageMarkdown(pendingInlineImage, captionText);
    setPendingInlineImage(null);
    setCaptionText("");
  };

  const applyTemplate = (templateContent: string) => {
    setContent(templateContent);
    setSetupMode(false);
    setShowTemplatePicker(false);
    setMode("write");
  };

  const handleContentKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
      event.preventDefault();
      insertFormat("**", "**");
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "i") {
      event.preventDefault();
      insertFormat("*", "*");
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      insertFormat("[", "](url)");
      return;
    }

    if (event.key !== "Enter" || !activeListMode || !contentRef.current) return;

    event.preventDefault();
    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const { lineStart } = currentLineAt(start);
    const lineBeforeCaret = content.slice(lineStart, start);
    const indentation = lineBeforeCaret.match(/^\s*/)?.[0] || "";
    const previousNumber = lineBeforeCaret.match(/^\s*(\d+)\.\s/)?.[1];
    const marker =
      activeListMode === "bullet"
        ? "- "
        : `${previousNumber ? Number(previousNumber) + 1 : 1}. `;
    const insert = `\n${indentation}${marker}`;
    const nextContent = content.slice(0, start) + insert + content.slice(end);
    setContent(nextContent);
    focusSelection(start + insert.length);
  };

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
    if (isDirty) {
      setShowDiscardPrompt(true);
      return;
    }

    onClose();
  }, [isDirty, onClose]);

  useEffect(() => {
    setMounted(true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showDiscardPrompt) {
        setShowDiscardPrompt(false);
        return;
      }

      if (event.key === "Escape" && pendingInlineImage) {
        setPendingInlineImage(null);
        setCaptionText("");
        return;
      }

      if (event.key === "Escape") requestClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [pendingInlineImage, requestClose, showDiscardPrompt]);

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
    const insertionStart = contentRef.current?.selectionStart ?? null;
    const insertionEnd = contentRef.current?.selectionEnd ?? null;
    setUploadingInline(true);
    const url = await uploadInlineImage(file);
    setUploadingInline(false);
    e.target.value = "";
    if (!url) return;
    const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
    setCaptionText("");
    setPendingInlineImage({ url, alt, start: insertionStart, end: insertionEnd });
  };

  const handleSave = async (isPublished: boolean) => {
    setSaveError("");

    if (!accessToken) {
      setSaveError("Admin session expired. Please sign in again.");
      return;
    }

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
      if (post) {
        await upsertPost(accessToken, { ...payload, id: post.id }, true);
      } else {
        await upsertPost(accessToken, payload, false);
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
        className="absolute inset-0 bg-black/20 dark:bg-black/70 backdrop-blur-md"
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
        {setupMode && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/95 dark:bg-slate-panel/95 backdrop-blur-xl">
            {!showTemplatePicker ? (
              <div className="max-w-md w-full p-8 text-center">
                <h2 className="text-2xl font-display text-brass-dark dark:text-brass-light mb-2">Create New Post</h2>
                <p className="text-stone-500 dark:text-steel mb-8">How would you like to start?</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSetupMode(false)}
                    className="flex flex-col items-center gap-3 p-6 rounded-xl border border-copper/20 hover:border-copper/40 bg-black/5 dark:bg-black/20 hover:bg-black/10 dark:hover:bg-black/40 transition-all group"
                  >
                    <FilePlus className="w-8 h-8 text-stone-400 dark:text-steel/70 group-hover:text-brass-dark dark:group-hover:text-brass-light transition-colors" />
                    <span className="font-medium text-stone-600 dark:text-steel group-hover:text-brass-dark dark:group-hover:text-brass-light">Blank Post</span>
                  </button>
                  <button
                    onClick={() => setShowTemplatePicker(true)}
                    className="flex flex-col items-center gap-3 p-6 rounded-xl border border-copper/20 hover:border-copper/40 bg-black/5 dark:bg-black/20 hover:bg-black/10 dark:hover:bg-black/40 transition-all group"
                  >
                    <LayoutTemplate className="w-8 h-8 text-stone-400 dark:text-steel/70 group-hover:text-brass-dark dark:group-hover:text-brass-light transition-colors" />
                    <span className="font-medium text-stone-600 dark:text-steel group-hover:text-brass-dark dark:group-hover:text-brass-light">Use Template</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-4xl p-6 md:p-8">
                <button
                  type="button"
                  onClick={() => setShowTemplatePicker(false)}
                  className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-stone-500 dark:text-steel hover:text-brass-dark dark:hover:text-brass-light transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Start options
                </button>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-display text-brass-dark dark:text-brass-light mb-2">Choose a Template</h2>
                  <p className="text-sm text-stone-500 dark:text-steel">Start with a structure, then make it yours.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {POST_TEMPLATES.map((template) => (
                    <button
                      key={template.title}
                      type="button"
                      onClick={() => applyTemplate(template.content)}
                      className="group text-left rounded-xl border border-copper/20 bg-black/5 dark:bg-black/20 p-5 hover:border-copper/45 hover:bg-black/10 dark:hover:bg-black/40 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-copper/20 bg-white/60 dark:bg-black/25 text-copper group-hover:text-brass-dark dark:group-hover:text-brass-light transition-colors">
                          <LayoutTemplate className="w-5 h-5" />
                        </span>
                        <span>
                          <span className="block font-medium text-brass-dark dark:text-brass-light">{template.title}</span>
                          <span className="mt-1 block text-sm leading-relaxed text-stone-500 dark:text-steel">{template.description}</span>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {showDiscardPrompt && (
            <motion.div
              className="absolute inset-0 z-[80] flex items-center justify-center bg-black/25 dark:bg-black/60 backdrop-blur-sm px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDiscardPrompt(false)}
            >
              <motion.div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="discard-post-title"
                aria-describedby="discard-post-description"
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ type: "spring", damping: 26, stiffness: 320 }}
                className="w-full max-w-md rounded-2xl border border-maroon/25 bg-white/95 dark:bg-slate-panel/95 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-maroon/25 bg-maroon/10 text-maroon">
                    <AlertCircle className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="admin-field-label text-stone-600 dark:text-steel mb-2">System Prompt</p>
                    <h3 id="discard-post-title" className="font-display text-xl text-brass-dark dark:text-brass-light">
                      Discard Unsaved Changes?
                    </h3>
                    <p id="discard-post-description" className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-steel">
                      This post has changes that have not been saved. Closing now will permanently discard them.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDiscardPrompt(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 dark:text-steel border border-copper/20 hover:border-copper/35 hover:text-brass-dark dark:hover:text-brass-light transition-all"
                  >
                    Keep editing
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-maroon hover:bg-maroon/90 transition-all"
                  >
                    Discard changes
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {pendingInlineImage && (
            <motion.div
              className="absolute inset-0 z-[70] flex items-center justify-center bg-black/25 dark:bg-black/55 backdrop-blur-sm px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => closeCaptionDialog(false)}
            >
              <motion.form
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ type: "spring", damping: 26, stiffness: 320 }}
                className="w-full max-w-lg rounded-2xl border border-copper/25 bg-white/95 dark:bg-slate-panel/95 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
                onClick={(e) => e.stopPropagation()}
                onSubmit={(e) => {
                  e.preventDefault();
                  confirmCaptionDialog();
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="admin-field-label text-stone-600 dark:text-steel mb-2">
                      <ImageIcon className="w-3.5 h-3.5" /> Inline image
                    </p>
                    <h3 className="font-display text-xl text-brass-dark dark:text-brass-light">Add Image Caption</h3>
                    <p className="mt-1 text-sm text-stone-500 dark:text-steel">
                      Optional caption shown below the image in preview and published posts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => closeCaptionDialog(false)}
                    className="shrink-0 rounded-lg p-2 text-stone-500 dark:text-steel hover:text-maroon hover:bg-maroon/10 transition-colors"
                    aria-label="Cancel image insertion"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-4 overflow-hidden rounded-xl border border-copper/20 bg-black/5 dark:bg-black/25">
                  <img src={pendingInlineImage.url} alt={pendingInlineImage.alt} className="h-40 w-full object-cover" />
                </div>

                <label className="admin-input-label">Caption</label>
                <textarea
                  value={captionText}
                  onChange={(e) => setCaptionText(e.target.value)}
                  placeholder="Example: Prototype wiring on the first bench test"
                  rows={3}
                  autoFocus
                  className="admin-input resize-none focus:ring-1 focus:ring-circuit/50 focus:border-circuit/50 transition-all"
                />

                <div className="mt-5 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => closeCaptionDialog(true)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 dark:text-steel border border-copper/20 hover:border-copper/35 hover:text-brass-dark dark:hover:text-brass-light transition-all"
                  >
                    Insert without caption
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl btn-primary text-sm font-medium">
                    Add caption
                  </button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="absolute inset-0 z-0 bg-white/90 dark:bg-slate-panel/70 backdrop-blur-2xl" />
        {/* Header */}
        <header className="relative z-10 flex-none flex items-center justify-between gap-4 px-4 md:px-6 h-16 border-b border-copper/20 dark:border-copper/10 bg-white/40 dark:bg-slate-panel/40 backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={requestClose}
              className="admin-close-btn group flex items-center gap-2 pl-2 pr-4 py-2 rounded-xl border border-copper/20 bg-black/5 dark:bg-black/20 hover:bg-maroon/10 hover:border-maroon/30 transition-all shrink-0"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-black/5 dark:bg-black/30 group-hover:bg-maroon/20 transition-colors">
                <X className="w-4 h-4 text-stone-600 dark:text-steel group-hover:text-maroon transition-colors" />
              </span>
              <span className="hidden sm:inline text-sm font-medium text-stone-600 dark:text-steel group-hover:text-brass-dark dark:group-hover:text-brass-light transition-colors">
                Close
              </span>
            </button>

            <div className="hidden sm:block h-6 w-px bg-copper/15" />

            <div className="min-w-0">
              <p className="text-sm font-medium text-brass-dark dark:text-brass-light truncate">
                {post ? "Edit Post" : "New Post"}
              </p>
              <p className="text-[11px] text-stone-600 dark:text-steel truncate">
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
        <div className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden min-h-0">
          {/* Editor pane */}
          <div className="shrink-0 lg:flex-1 flex flex-col min-h-[560px] lg:min-h-0">
            <div className="flex-none flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 md:px-6 py-3 border-b border-copper/10">
              <div className="w-full sm:w-auto flex items-center gap-2 min-w-0 overflow-x-auto hide-scrollbar">
                <div className="flex shrink-0 p-1 rounded-lg bg-black/40 border border-copper/15 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
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
                
                {mode === "write" && (
                  <div className="flex shrink-0 items-center gap-1 border-l border-copper/20 pl-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!contentRef.current) return;
                        toggleListMode("bullet");
                      }}
                      className={`p-1.5 rounded-md transition-all ${
                        activeListMode === "bullet"
                          ? "text-brass-light bg-copper/15"
                          : "text-stone-600 dark:text-steel hover:text-brass-dark dark:hover:text-brass-light hover:bg-black/5 dark:hover:bg-white/5"
                      }`}
                      title="Bullet List"
                      aria-pressed={activeListMode === "bullet"}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!contentRef.current) return;
                        toggleListMode("ordered");
                      }}
                      className={`p-1.5 rounded-md transition-all ${
                        activeListMode === "ordered"
                          ? "text-brass-light bg-copper/15"
                          : "text-stone-600 dark:text-steel hover:text-brass-dark dark:hover:text-brass-light hover:bg-black/5 dark:hover:bg-white/5"
                      }`}
                      title="Numbered List"
                      aria-pressed={activeListMode === "ordered"}
                    >
                      <ListOrdered className="w-4 h-4" />
                    </button>

                    <div className="w-px h-4 bg-copper/20 mx-1" />

                    <button type="button" onClick={() => insertFormat('**', '**')} className="p-1.5 rounded-md text-stone-600 dark:text-steel hover:text-brass-dark dark:hover:text-brass-light hover:bg-black/5 dark:hover:bg-white/5 transition-all" title="Bold">
                      <Bold className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => insertFormat('*', '*')} className="p-1.5 rounded-md text-stone-600 dark:text-steel hover:text-brass-dark dark:hover:text-brass-light hover:bg-black/5 dark:hover:bg-white/5 transition-all" title="Italic">
                      <Italic className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={insertCodeBlock} className="p-1.5 rounded-md text-stone-600 dark:text-steel hover:text-brass-dark dark:hover:text-brass-light hover:bg-black/5 dark:hover:bg-white/5 transition-all" title="Code block">
                      <Code className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => insertFormat('[', '](url)')} className="p-1.5 rounded-md text-stone-600 dark:text-steel hover:text-brass-dark dark:hover:text-brass-light hover:bg-black/5 dark:hover:bg-white/5 transition-all" title="Link">
                      <LinkIcon className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={insertCaptionedImage} className="p-1.5 rounded-md text-stone-600 dark:text-steel hover:text-brass-dark dark:hover:text-brass-light hover:bg-black/5 dark:hover:bg-white/5 transition-all" title="Image with Caption">
                      <Type className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 sm:justify-end">
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-copper/20 text-xs font-medium text-stone-600 dark:text-steel hover:text-brass-dark dark:hover:text-brass-light hover:border-copper/40 hover:bg-black/5 dark:hover:bg-white/5 transition-all disabled:opacity-50 whitespace-nowrap"
                >
                  {uploadingInline ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5" />
                  )}
                  Insert image
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-visible lg:overflow-y-auto px-4 md:px-8 py-5 md:py-8 hide-scrollbar">
              <div className="max-w-3xl mx-auto">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title"
                  className="w-full bg-transparent text-3xl md:text-4xl font-display text-brass-dark dark:text-brass-light placeholder:text-stone-400 dark:placeholder:text-steel/35 focus:outline-none mb-6"
                />

                {mode === "write" ? (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-white/90 dark:to-black/20 pointer-events-none rounded-b-xl z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <textarea
                      ref={contentRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onKeyDown={handleContentKeyDown}
                      placeholder="Write your post in Markdown..."
                      className="w-full min-h-[260px] md:min-h-[420px] bg-transparent text-base text-stone-800 dark:text-steel font-mono focus:outline-none resize-none leading-relaxed placeholder:text-stone-400 dark:placeholder:text-steel/25 pb-20 relative z-0"
                    />
                  </div>
                ) : (
                  <div className="min-h-[320px] pb-12 prose-admin text-stone-800 dark:text-steel">
                    {content.trim() ? (
                      <MarkdownRenderer content={content} />
                    ) : (
                      <p className="text-stone-400 dark:text-steel/40 font-mono text-sm py-16 text-center">
                        Nothing to preview yet
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile save row */}
            <div className="sm:hidden flex-none border-t border-copper/10 p-4 flex gap-2 bg-white/60 dark:bg-slate-panel/60">
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
          <aside className="lg:w-[340px] xl:w-[380px] shrink-0 border-t lg:border-t-0 lg:border-l border-copper/20 dark:border-copper/10 bg-black/5 dark:bg-black/30 flex flex-col max-h-none">
            <div className="flex-1 overflow-visible lg:overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 hide-scrollbar">
              {/* Cover */}
              <section>
                <p className="admin-field-label mb-3 text-stone-600 dark:text-steel">
                  <ImageIcon className="w-3.5 h-3.5" /> Cover image
                </p>
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && coverInputRef.current?.click()}
                  onClick={() => coverInputRef.current?.click()}
                  className="relative rounded-xl overflow-hidden border border-dashed border-copper/40 dark:border-copper/25 bg-black/5 dark:bg-black/20 aspect-[16/9] flex items-center justify-center cursor-pointer group hover:border-copper/60 dark:hover:border-copper/45 transition-colors"
                >
                  {coverImage ? (
                    <>
                      <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-xs font-medium text-white px-3 py-1.5 rounded-full bg-black/40 dark:bg-white/15 backdrop-blur-sm">
                          Change image
                        </span>
                      </div>
                    </>
                  ) : uploadingCover ? (
                    <Loader2 className="w-6 h-6 text-brass animate-spin" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-stone-500 dark:text-steel/60">
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
                <p className="admin-field-label text-stone-600 dark:text-steel">
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

            <div className="flex-none p-4 border-t border-copper/20 dark:border-copper/10">
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
                    className="flex items-center gap-2 text-xs text-rose-500 dark:text-rose-300 bg-rose-500/10 border border-rose-500/25 px-3 py-2 rounded-lg"
                  >
                    <AlertCircle className="w-3.5 h-3.5" /> {saveError}
                  </motion.p>
                )}
              </AnimatePresence>
              <p className="text-[10px] text-stone-500 dark:text-steel/60 font-mono">
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
