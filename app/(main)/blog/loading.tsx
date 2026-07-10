import { GridSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
      <div className="h-10 w-64 bg-white/5 rounded-lg mb-3 animate-pulse" />
      <div className="h-4 w-96 bg-white/5 rounded mb-14 animate-pulse" />
      <GridSkeleton count={6} />
    </div>
  );
}
