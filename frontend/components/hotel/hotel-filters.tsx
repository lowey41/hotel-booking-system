'use client';

const AMENITY_OPTIONS = ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Parking', 'Beach Access', 'Pet Friendly', 'Room Service'];

interface HotelFiltersProps {
  filters: any;
  onUpdate: (key: string, value: string) => void;
}

export function HotelFilters({ filters, onUpdate }: HotelFiltersProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">City</label>
        <input
          value={filters.city}
          onChange={(e) => onUpdate('city', e.target.value)}
          placeholder="Any city"
          className="w-full border rounded-lg px-3 py-1.5 text-sm bg-background"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Min Price / night</label>
        <input
          type="number"
          value={filters.minPrice}
          onChange={(e) => onUpdate('minPrice', e.target.value)}
          placeholder="$0"
          className="w-full border rounded-lg px-3 py-1.5 text-sm bg-background"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Max Price / night</label>
        <input
          type="number"
          value={filters.maxPrice}
          onChange={(e) => onUpdate('maxPrice', e.target.value)}
          placeholder="Any"
          className="w-full border rounded-lg px-3 py-1.5 text-sm bg-background"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Min Stars</label>
        <select
          value={filters.rating}
          onChange={(e) => onUpdate('rating', e.target.value)}
          className="w-full border rounded-lg px-3 py-1.5 text-sm bg-background"
        >
          <option value="">Any</option>
          {[2, 3, 4, 5].map((r) => (
            <option key={r} value={r}>{'⭐'.repeat(r)} & up</option>
          ))}
        </select>
      </div>

      <div className="col-span-2">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amenities</label>
        <div className="flex flex-wrap gap-1.5">
          {AMENITY_OPTIONS.map((amenity) => {
            const selected = filters.amenities?.includes(amenity);
            return (
              <button
                key={amenity}
                onClick={() => {
                  const current = filters.amenities ? filters.amenities.split(',').filter(Boolean) : [];
                  const updated = selected
                    ? current.filter((a: string) => a !== amenity)
                    : [...current, amenity];
                  onUpdate('amenities', updated.join(','));
                }}
                className={`text-xs px-2 py-1 rounded-full border transition-all ${
                  selected
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                    : 'border-border hover:border-gray-400'
                }`}
              >
                {amenity}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
