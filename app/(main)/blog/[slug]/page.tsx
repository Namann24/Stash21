import type { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";
import { SAMPLE_POSTS } from "@/lib/samplePosts";
import type { Post } from "@/lib/types";
import { logError } from "@/lib/errorHandler";
import BlogPostClient from "./BlogPostClient";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stash21.com";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getPost(slug: string): Promise<Post | null> {
  try {
    const fetchPromise = supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .single()
      .then((result) => result as { data: Post | null; error: unknown });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 8000)
    );

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

    if (error || !data) {
      return SAMPLE_POSTS.find((p) => p.slug === slug) || null;
    }

    return data as Post;
  } catch (err) {
    logError("BlogPostPage.getPost", err);
    return SAMPLE_POSTS.find((p) => p.slug === slug) || null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Post Not Found — Stash21",
      description: "This blog post could not be found."
    };
  }

  const ogImage = post.cover_image
    ? `${siteUrl}/api/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(post.category)}`
    : undefined;

  return {
    title: `${post.title} — Stash21`,
    description: post.excerpt || post.content.replace(/[#*_>`]/g, "").slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.replace(/[#*_>`]/g, "").slice(0, 160),
      type: "article",
      publishedTime: post.created_at,
      authors: ["Stash21 Team"],
      url: `${siteUrl}/blog/${post.slug}`,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : [],
      tags: post.tags
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || post.content.replace(/[#*_>`]/g, "").slice(0, 160),
      images: ogImage ? [ogImage] : []
    }
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  let relatedPosts: Post[] = [];
  try {
    if (post) {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("category", post.category)
        .neq("id", post.id)
        .eq("published", true)
        .limit(3);
      if (data) relatedPosts = data as Post[];
    }
  } catch (err) {
    logError("BlogPostPage.relatedPosts", err);
  }

  return <BlogPostClient post={post} slug={slug} relatedPosts={relatedPosts} />;
}
