export default function Loading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-64 rounded-lg bg-bg-soft" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-bg-soft" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-72 rounded-2xl bg-bg-soft" />
        <div className="h-72 rounded-2xl bg-bg-soft" />
      </div>
    </div>
  );
}
