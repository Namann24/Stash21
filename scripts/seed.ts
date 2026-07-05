import { createClient } from "@supabase/supabase-js";
import { SAMPLE_POSTS } from "../lib/samplePosts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function seed() {
  console.log("Seeding posts into Supabase...");
  let successCount = 0;
  for (const post of SAMPLE_POSTS) {
    const { error } = await supabase.from("posts").upsert({
      title: post.title,
      slug: post.slug,
      content: post.content,
      cover_image: post.cover_image,
      category: post.category,
      tags: post.tags,
      published: post.published,
      created_at: post.created_at,
      updated_at: post.updated_at,
    }, { onConflict: 'slug' });
    if (error) {
      console.error("Error inserting post:", post.title, error.message);
    } else {
      console.log("Inserted post:", post.title);
      successCount++;
    }
  }
  console.log(`Done seeding. ${successCount}/${SAMPLE_POSTS.length} successful.`);
}

seed();
