import { supabase } from "@/lib/supabaseClient";
import { SAMPLE_POSTS } from "@/lib/samplePosts";
import type { Post } from "@/lib/types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stash21.com";

function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function buildRss(posts: Post[]): string {
  const items = posts.map((post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      <description>${escapeXml(post.content.replace(/[#*_>`]/g, "").slice(0, 300))}</description>
      <category>${escapeXml(post.category)}</category>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
    </item>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Stash21 — IoT & Hardware Blog</title>
    <link>${siteUrl}</link>
    <description>Tutorials, builds, and hardware experiments from the Stash21 team.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;
}

export async function GET() {
  let posts: Post[] = [];

  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      posts = data as Post[];
    } else {
      posts = SAMPLE_POSTS as Post[];
    }
    if (error) posts = SAMPLE_POSTS as Post[];
  } catch {
    posts = SAMPLE_POSTS as Post[];
  }

  const rss = buildRss(posts);

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate"
    }
  });
}
