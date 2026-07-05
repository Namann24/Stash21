export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-6 pt-32 pb-24 animate-pulse">
      <div className="h-6 w-32 bg-white/5 rounded-full mb-6" />
      <div className="h-12 w-full bg-white/5 rounded-lg mb-3" />
      <div className="h-12 w-2/3 bg-white/5 rounded-lg mb-8" />
      <div className="h-4 w-40 bg-white/5 rounded mb-10" />
      <div className="h-64 w-full bg-white/5 rounded-2xl mb-10" />
      <div className="space-y-3">
        <div className="h-4 bg-white/5 rounded w-full" />
        <div className="h-4 bg-white/5 rounded w-full" />
        <div className="h-4 bg-white/5 rounded w-5/6" />
      </div>
    </div>
  );
}
