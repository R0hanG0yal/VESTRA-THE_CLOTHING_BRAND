export default function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center px-4">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
      <p className="font-mono text-xs uppercase tracking-wider text-foreground/60">
        Loading...
      </p>
    </div>
  );
}
