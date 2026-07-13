"use server";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Post, Feedback, Subscriber, Comment } from "@/lib/types";

let supabaseAdminClient: SupabaseClient<any> | null = null;
let supabaseAuthClient: SupabaseClient<any> | null = null;

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function getSupabaseAdmin() {
  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient<any>(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }

  return supabaseAdminClient;
}

function getSupabaseAuth() {
  if (!supabaseAuthClient) {
    supabaseAuthClient = createClient<any>(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }

  return supabaseAuthClient;
}

async function assertAdminSession(accessToken: string) {
  if (!accessToken) {
    throw new Error("Admin session required.");
  }

  const { data, error } = await getSupabaseAuth().auth.getUser(accessToken);
  const user = data.user;

  if (error || !user) {
    throw new Error("Admin session expired. Please sign in again.");
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails?.length && (!user.email || !adminEmails.includes(user.email.toLowerCase()))) {
    throw new Error("This account is not allowed to access the admin dashboard.");
  }

  return user;
}

export type AdminPost = Post & { commentsCount?: number; reactions?: number };
export type CommentWithPost = Comment & { posts?: { title: string } };

export async function getDashboardData(accessToken: string) {
  await assertAdminSession(accessToken);
  const supabaseAdmin = getSupabaseAdmin();

  const data = {
    posts: [] as AdminPost[],
    feedback: [] as Feedback[],
    subscribers: [] as Subscriber[],
    comments: [] as CommentWithPost[],
  };

  // Fetch posts
  const { data: postData, error: postError } = await supabaseAdmin
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (!postError && postData) {
    data.posts = postData as AdminPost[];
    const postIds = data.posts.map(p => p.id);

    if (postIds.length > 0) {
      // Comments count
      const { data: commentRows } = await supabaseAdmin.from("comments").select("post_id").in("post_id", postIds);
      const commentCounts = (commentRows || []).reduce<Record<string, number>>((acc, row) => {
        acc[row.post_id] = (acc[row.post_id] || 0) + 1;
        return acc;
      }, {});

      // Post reactions
      const { data: reactionRows } = await supabaseAdmin.from("post_reactions").select("post_id").in("post_id", postIds);
      const reactionCounts = (reactionRows || []).reduce<Record<string, number>>((acc, row) => {
        acc[row.post_id] = (acc[row.post_id] || 0) + 1;
        return acc;
      }, {});
      
      // Fallback old reactions
      const { data: oldReactionRows } = await supabaseAdmin.from("reactions").select("post_id,count").in("post_id", postIds);
      if (oldReactionRows) {
        oldReactionRows.forEach(row => {
          reactionCounts[row.post_id] = (reactionCounts[row.post_id] || 0) + (row.count || 0);
        });
      }

      data.posts = data.posts.map(post => ({
        ...post,
        commentsCount: commentCounts[post.id] || 0,
        reactions: reactionCounts[post.id] || 0,
      }));
    }
  }

  // Fetch Feedback
  const { data: fbData } = await supabaseAdmin.from("feedback").select("*").order("created_at", { ascending: false });
  if (fbData) data.feedback = fbData as Feedback[];

  // Fetch Subscribers
  const { data: subData } = await supabaseAdmin.from("subscribers").select("*").order("created_at", { ascending: false });
  if (subData) data.subscribers = subData as Subscriber[];

  // Fetch all comments with post title
  const { data: commentData } = await supabaseAdmin.from("comments").select("*, posts(title)").order("created_at", { ascending: false });
  if (commentData) data.comments = commentData as unknown as CommentWithPost[];

  return data;
}

export async function approveComment(accessToken: string, commentId: string) {
  await assertAdminSession(accessToken);
  const supabaseAdmin = getSupabaseAdmin();

  const { error } = await supabaseAdmin.rpc("approve_comment", { p_comment_id: commentId });
  if (error) throw new Error(error.message);
  return true;
}

export async function deleteComment(accessToken: string, commentId: string) {
  await assertAdminSession(accessToken);
  const supabaseAdmin = getSupabaseAdmin();

  const { error } = await supabaseAdmin.from("comments").delete().eq("id", commentId);
  if (error) throw new Error(error.message);
  return true;
}

export async function deletePost(accessToken: string, postId: string) {
  await assertAdminSession(accessToken);
  const supabaseAdmin = getSupabaseAdmin();

  const { error } = await supabaseAdmin.from("posts").delete().eq("id", postId);
  if (error) throw new Error(error.message);
  return true;
}

export async function upsertPost(accessToken: string, postData: any, isUpdate: boolean) {
  await assertAdminSession(accessToken);
  const supabaseAdmin = getSupabaseAdmin();

  if (isUpdate) {
    const { error } = await supabaseAdmin.from("posts").update(postData).eq("id", postData.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseAdmin.from("posts").insert(postData);
    if (error) throw new Error(error.message);
  }
  return true;
}
