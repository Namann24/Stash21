import Hero from "@/components/hero/Hero";
import CategoryStrip from "@/components/home/CategoryStrip";
import ModuleStrip from "@/components/hero/ModuleStrip";
import Manifesto from "@/components/home/Manifesto";
import FeaturedPosts from "@/components/home/FeaturedPosts";
import WhyStash21 from "@/components/home/WhyStash21";
import TechMarquee from "@/components/TechMarquee";
import CtaBanner from "@/components/home/CtaBanner";
import Newsletter from "@/components/home/Newsletter";
import { supabase } from "@/lib/supabaseClient";
import { SAMPLE_POSTS } from "@/lib/samplePosts";
import type { Post } from "@/lib/types";

export const revalidate = 60;

async function getFeaturedPosts(): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(3);
    if (error || !data || data.length === 0) return SAMPLE_POSTS.slice(0, 3);
    return data as Post[];
  } catch {
    return SAMPLE_POSTS.slice(0, 3);
  }
}

export default async function HomePage() {
  const posts = await getFeaturedPosts();
  return (
    <>
      <Hero />
      <ModuleStrip />
      <TechMarquee />
      <CategoryStrip />
      <Manifesto />
      <FeaturedPosts posts={posts} />
      <WhyStash21 />
      <Newsletter />
      <CtaBanner />
    </>
  );
}
