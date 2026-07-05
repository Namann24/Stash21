import { supabase } from "@/lib/supabaseClient";
import { SAMPLE_POSTS } from "@/lib/samplePosts";
import type { Post } from "@/lib/types";
import BlogPostClient from "./BlogPostClient";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getPost(slug: string): Promise<Post | null> {
  try {
    const fetchPromise = supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .single();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 8000)
    );

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

    if (error || !data) {
      return SAMPLE_POSTS.find((p) => p.slug === slug) || null;
    }

    return data as Post;
  } catch {
    return SAMPLE_POSTS.find((p) => p.slug === slug) || null;
  }
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
  } catch {}

  return <BlogPostClient post={post} slug={slug} relatedPosts={relatedPosts} />;
}
