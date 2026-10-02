'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Star, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlist } from '@/hooks/use-wishlist';
import { StarRating } from '@/components/shared/star-rating';

interface HotelCardProps {
  hotel: any;
  layout?: 'grid' | 'list';
}

export function HotelCard({ hotel, layout = 'grid' }: HotelCardProps) {
  const router = useRouter();
  const { isInWishlist, toggleWishlist } = useWishlist(hotel.id);
  const [imageLoaded, setImageLoaded] = useState(false);

  const averageRating = hotel.reviews?.length
    ? hotel.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / hotel.reviews.length
    : hotel.averageRating;

  if (layout === 'list') {
    return (
      <div
        onClick={() => router.push(`/hotels/${hotel.id}`)}
        className="flex gap-4 border rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer bg-card group"
      >
        <div className="relative w-48 shrink-0">
          {hotel.images?.[0] ? (
            <img src={hotel.images[0]} alt={hotel.name} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-36 bg-muted flex items-center justify-center">🏨</div>
          )}
        </div>
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg group-hover:text-amber-600 transition-colors">{hotel.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="w-3.5 h-3.5" /> {hotel.city}, {hotel.country}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-amber-600">${hotel.startingPrice || hotel.rooms?.[0]?.price || '—'}</div>
              <div className="text-xs text-muted-foreground">per night</div>
            </div>
          </div>
          {averageRating && (
            <div className="flex items-center gap-1.5 mt-2">
              <StarRating rating={averageRating} size="sm" />
              <span className="text-sm text-muted-foreground">({hotel._count?.reviews || 0})</span>
            </div>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {hotel.amenities?.slice(0, 4).map((a: string) => (
              <span key={a} className="text-xs bg-muted px-2 py-0.5 rounded-full">{a}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => router.push(`/hotels/${hotel.id}`)}
      className="border rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer bg-card group"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {hotel.images?.[0] ? (
          <img
            src={hotel.images[0]}
            alt={hotel.name}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🏨</div>
        )}
        {!imageLoaded && hotel.images?.[0] && <div className="absolute inset-0 skeleton" />}

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(); }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 dark:bg-black/80 flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
        >
          <Heart className={`w-4 h-4 transition-colors ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>

        {/* Star rating badge */}
        <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
          {'⭐'.repeat(hotel.starRating)}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate group-hover:text-amber-600 transition-colors">{hotel.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{hotel.city}, {hotel.country}</span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="font-bold text-amber-600">${hotel.startingPrice || hotel.rooms?.[0]?.price || '—'}</div>
            <div className="text-xs text-muted-foreground">/ night</div>
          </div>
        </div>

        {averageRating && (
          <div className="flex items-center gap-1.5 mt-2">
            <StarRating rating={averageRating} size="sm" />
            <span className="text-xs text-muted-foreground font-medium">{averageRating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({hotel._count?.reviews || 0})</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1 mt-3">
          {hotel.amenities?.slice(0, 3).map((a: string) => (
            <span key={a} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{a}</span>
          ))}
          {hotel.amenities?.length > 3 && (
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">+{hotel.amenities.length - 3}</span>
          )}
        </div>
      </div>
    </div>
  );
}
