export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-32 pb-24 animate-pulse">
      <div className="h-10 w-80 bg-white/5 rounded-lg mb-10" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 card-glass rounded-xl" />
        ))}
      </div>
    </div>
  );
}
