export function HotelDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[50vh] skeleton" />
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        <div className="flex-1 space-y-4">
          <div className="h-8 skeleton rounded w-1/2" />
          <div className="h-6 skeleton rounded w-1/3" />
          <div className="h-4 skeleton rounded w-full" />
          <div className="h-4 skeleton rounded w-4/5" />
          <div className="h-4 skeleton rounded w-3/4" />
        </div>
        <div className="w-96 h-80 skeleton rounded-2xl hidden lg:block" />
      </div>
    </div>
  );
}
