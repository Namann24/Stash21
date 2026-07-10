export default function Loading() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block w-[260px] shrink-0 border-r border-copper/10 bg-slate-panel/40 animate-pulse" />
      <div className="flex-1 p-8 space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-copper/10 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 admin-stat-card bg-copper/5 border-copper/10" />
          ))}
        </div>
        <div className="h-64 admin-panel bg-copper/5 border-copper/10" />
      </div>
    </div>
  );
}
