"use client";

export default function VendorsError({ error }: { error: Error }) {
  return (
    <div className="p-6 space-y-2">
      <h2 className="text-lg font-semibold text-destructive">Failed to load vendors</h2>
      <pre className="text-xs bg-muted p-4 rounded overflow-auto">{error.message}</pre>
    </div>
  );
}
