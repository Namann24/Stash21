export function CardSkeleton() {
  return (
    <div className="card-glass rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-white/5" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-white/5 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-full" />
        <div className="h-3 bg-white/5 rounded w-2/3" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-3 gap-7">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
