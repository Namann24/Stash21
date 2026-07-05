export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 animate-pulse">
      <div className="h-4 w-40 bg-white/5 rounded mb-3" />
      <div className="h-12 w-72 bg-white/5 rounded-lg mb-4" />
      <div className="h-4 w-96 bg-white/5 rounded mb-14" />
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="h-96 card-glass rounded-2xl" />
        <div className="h-96 card-glass rounded-2xl" />
      </div>
    </div>
  );
}
