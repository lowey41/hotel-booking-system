'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Grid3X3, List, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HotelCard } from '@/components/hotel/hotel-card';
import { HotelCardSkeleton } from '@/components/hotel/hotel-card-skeleton';
import { HotelFilters } from '@/components/hotel/hotel-filters';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useHotels } from '@/hooks/use-hotels';

export default function HotelsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    amenities: searchParams.get('amenities') || '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 12,
  });

  const { data, isLoading } = useHotels(filters);

  const updateFilter = (key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', city: '', minPrice: '', maxPrice: '', rating: '', amenities: '', sortBy: 'createdAt', sortOrder: 'desc', page: 1, limit: 12 });
  };

  const activeFiltersCount = [filters.city, filters.minPrice, filters.maxPrice, filters.rating, filters.amenities].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Search Header */}
      <div className="bg-card border-b sticky top-16 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 max-w-lg border rounded-lg px-3 py-1.5 bg-background">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search destination, hotel name..."
              className="border-0 shadow-none focus-visible:ring-0 h-7 p-0"
            />
            {filters.search && (
              <button onClick={() => updateFilter('search', '')} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-amber-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              <X className="w-4 h-4 mr-1" /> Clear
            </Button>
          )}

          <div className="hidden md:flex items-center gap-1 ml-auto">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}>
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')}>
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <HotelFilters filters={filters} onUpdate={updateFilter} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {isLoading ? 'Searching...' : (
              <span>
                <strong className="text-foreground">{data?.pagination?.total || 0}</strong> hotels found
                {filters.search && <> for <strong className="text-foreground">"{filters.search}"</strong></>}
              </span>
            )}
          </p>
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
            }}
            className="border rounded-md px-3 py-1.5 text-sm bg-background"
          >
            <option value="createdAt-desc">Newest first</option>
            <option value="starRating-desc">Highest rated</option>
            <option value="starRating-asc">Lowest rated</option>
          </select>
        </div>

        {/* Hotel Grid */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
          {isLoading
            ? Array(12).fill(0).map((_, i) => <HotelCardSkeleton key={i} />)
            : data?.hotels?.length === 0
            ? (
              <div className="col-span-full text-center py-20">
                <div className="text-6xl mb-4">🏨</div>
                <h3 className="text-xl font-semibold mb-2">No hotels found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
                <Button onClick={clearFilters}>Clear all filters</Button>
              </div>
            )
            : data?.hotels?.map((hotel, i) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <HotelCard hotel={hotel} layout={viewMode} />
              </motion.div>
            ))
          }
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <Button
              variant="outline"
              disabled={filters.page === 1}
              onClick={() => updateFilter('page', filters.page - 1)}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={filters.page === p ? 'default' : 'outline'}
                onClick={() => updateFilter('page', p)}
                className={filters.page === p ? 'bg-amber-500 text-black hover:bg-amber-600' : ''}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              disabled={filters.page >= data.pagination.pages}
              onClick={() => updateFilter('page', filters.page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
