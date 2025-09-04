export function EventCardSkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
      <div className="h-48 bg-white/10 animate-pulse"></div>
      <div className="p-6">
        <div className="h-6 w-3/4 bg-white/10 rounded animate-pulse mb-4"></div>
        <div className="h-4 w-1/2 bg-white/10 rounded animate-pulse mb-6"></div>
        <div className="space-y-4">
          <div className="h-4 bg-white/10 rounded animate-pulse"></div>
          <div className="h-4 bg-white/10 rounded animate-pulse"></div>
          <div className="h-4 w-5/6 bg-white/10 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
