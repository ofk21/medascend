export default function Loading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-64 rounded-lg bg-bg-soft" />
      <div className="h-14 rounded-2xl bg-bg-soft" />
      <div className="h-96 rounded-2xl bg-bg-soft" />
    </div>
  );
}
