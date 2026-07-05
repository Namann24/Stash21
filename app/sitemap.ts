import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabaseClient";
import { SAMPLE_POSTS } from "@/lib/samplePosts";
import type { Post } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stash21.com";
  let posts: Post[] = SAMPLE_POSTS;

  try {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("published", true)
      .order("updated_at", { ascending: false });

    if (data && data.length > 0) posts = data as Post[];
  } catch {}

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${siteUrl}/feedback`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6
    },
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.8
    }))
  ];
}
