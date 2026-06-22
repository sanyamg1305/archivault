export default function Loading() {
  return (
    <div className="p-8 space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded-md" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-4">
            <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-2 w-full bg-muted animate-pulse rounded-full" />
            <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
