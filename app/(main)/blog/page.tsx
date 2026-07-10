import { supabase } from "@/lib/supabaseClient";
import { SAMPLE_POSTS } from "@/lib/samplePosts";
import type { Post } from "@/lib/types";
import { logError } from "@/lib/errorHandler";
import BlogListClient from "./BlogListClient";

export const dynamic = "force-dynamic";

async function getPosts(): Promise<Post[]> {
  try {
    const fetchPromise = supabase
      .from("posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .then((result) => result as { data: Post[] | null; error: unknown });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 8000)
    );

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
    
    if (error || !data || data.length === 0) return SAMPLE_POSTS;
    return data as Post[];
  } catch (err) {
    logError("BlogPage.getPosts", err);
    return SAMPLE_POSTS;
  }
}

export default async function BlogPage() {
  const posts = await getPosts();
  return <BlogListClient posts={posts} />;
}
