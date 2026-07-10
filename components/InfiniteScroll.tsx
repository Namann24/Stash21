"use client";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

type Props = {
  onLoadMore: () => void;
  loading: boolean;
  hasMore: boolean;
};

export default function InfiniteScroll({ onLoadMore, loading, hasMore }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || loading) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onLoadMore, loading, hasMore]);

  if (!hasMore) return null;

  return (
    <div ref={ref} className="flex justify-center py-12">
      {loading && <Loader2 className="w-6 h-6 text-brass animate-spin" />}
    </div>
  );
}
