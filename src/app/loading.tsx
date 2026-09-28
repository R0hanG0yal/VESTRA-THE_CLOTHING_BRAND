export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="skeleton h-8 w-52 rounded-full" />
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="skeleton aspect-[3/4] rounded-3xl" />
            <div className="skeleton h-3 w-1/3 rounded-full" />
            <div className="skeleton h-3 w-2/3 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
