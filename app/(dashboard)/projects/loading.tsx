export default function Loading() {
  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-muted animate-pulse rounded-md" />
          <div className="h-4 w-72 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="h-10 w-48 bg-muted animate-pulse rounded-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card/40 p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
              <div className="h-5 w-16 rounded-sm bg-muted animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
            </div>
            <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
