export default function Loading() {
  return (
    <div className="container-site flex min-h-[40vh] items-center justify-center py-20">
      <div className="flex items-center gap-3 text-ink-muted">
        <span className="h-2 w-2 animate-pulse rounded-full bg-teal" />
        <span className="text-sm font-medium">Chargement…</span>
      </div>
    </div>
  );
}
