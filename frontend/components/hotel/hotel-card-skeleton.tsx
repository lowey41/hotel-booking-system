export function HotelCardSkeleton() {
  return (
    <div className="border rounded-xl overflow-hidden bg-card animate-pulse">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-5 skeleton rounded w-3/4" />
        <div className="h-4 skeleton rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-6 skeleton rounded-full w-16" />
          <div className="h-6 skeleton rounded-full w-16" />
          <div className="h-6 skeleton rounded-full w-16" />
        </div>
      </div>
    </div>
  );
}
