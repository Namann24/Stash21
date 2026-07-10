"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { Check, Copy } from "lucide-react";
import "highlight.js/styles/atom-one-dark.css";

type Props = { content: string };

function CodeBlock({ children, className, ...props }: any) {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, "");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [code]);

  return (
    <div className="relative group rounded-xl overflow-hidden my-8 border border-copper/20 bg-slate-panel shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 border-b border-copper/10 bg-black/40">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] font-mono text-steel/60 hover:text-brass-light transition-colors px-2 py-1 rounded-md hover:bg-white/5"
          aria-label={copied ? "Copied" : "Copy code"}
          data-cursor-hover
        >
          {copied ? <Check className="w-3.5 h-3.5 text-circuit" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm" {...props}>{children}</pre>
    </div>
  );
}

export default function MarkdownRenderer({ content }: Props) {
  return (
    <div className="space-y-6 text-steel leading-relaxed max-w-none prose prose-invert prose-headings:font-display prose-headings:text-brass prose-a:text-brass hover:prose-a:text-brass-light prose-strong:text-brass-light prose-code:text-champagne prose-pre:bg-slate-panel prose-pre:border prose-pre:border-copper/20 prose-pre:p-0 overflow-hidden rounded-lg">
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight, rehypeSlug]}
        components={{
          h1: ({ node, ...props }) => <h1 className="font-display text-4xl md:text-5xl metal-text leading-tight mb-8" {...props} />,
          h2: ({ node, ...props }) => <h2 className="font-display text-2xl md:text-3xl text-brass mt-12 mb-6 scroll-mt-24" {...props} />,
          h3: ({ node, ...props }) => <h3 className="font-display text-xl text-brass-light mt-8 mb-4 scroll-mt-24" {...props} />,
          p: ({ node, ...props }) => <p className="mb-6 last:mb-0" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 space-y-2 mb-6" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 space-y-2 mb-6" {...props} />,
          li: ({ node, ...props }) => <li className="marker:text-copper/70" {...props} />,
          a: ({ node, ...props }) => <a className="underline decoration-copper/40 underline-offset-4 hover:decoration-brass transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt || ""}
              className="rounded-xl border border-copper/20 my-6 max-w-full h-auto"
              loading="lazy"
            />
          ),
          pre: ({ node, children, ...props }) => {
            const codeElement = children as any;
            const codeString = codeElement?.props?.children?.[0] || "";
            return <CodeBlock {...codeElement?.props}>{codeString}</CodeBlock>;
          },
          code: ({ node, inline, className, children, ...props }: any) => {
            return !inline ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <code className="bg-copper/10 text-champagne px-1.5 py-0.5 rounded font-mono text-sm border border-copper/20" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
