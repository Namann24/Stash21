import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { SAMPLE_POSTS } from "@/lib/samplePosts";
import type { Post } from "@/lib/types";

const PAGE_SIZE = 6;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  try {
    let query = supabase
      .from("posts")
      .select("*", { count: "exact" })
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (category && category !== "All") {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    const { data, error, count } = await query.range(from, to);

    if (error || !data) {
      return NextResponse.json({ posts: paginateFallback(page, category, search), total: 0, page, pageSize: PAGE_SIZE });
    }

    return NextResponse.json({
      posts: data as Post[],
      total: count || 0,
      page,
      pageSize: PAGE_SIZE,
      hasMore: count ? to < count - 1 : data.length === PAGE_SIZE
    });
  } catch {
    return NextResponse.json({ posts: paginateFallback(page, category, search), total: 0, page, pageSize: PAGE_SIZE });
  }
}

function paginateFallback(page: number, category: string, search: string): Post[] {
  let filtered = SAMPLE_POSTS as Post[];

  if (category && category !== "All") {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((p) => p.title.toLowerCase().includes(q));
  }

  const from = (page - 1) * PAGE_SIZE;
  return filtered.slice(from, from + PAGE_SIZE);
}
