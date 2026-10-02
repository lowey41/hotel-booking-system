// components/shared/star-rating.tsx
'use client';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showEmpty?: boolean;
}

export function StarRating({ rating, size = 'md', showEmpty = true }: StarRatingProps) {
  const sizes = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' };
  const cls = sizes[size];
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${cls} transition-colors ${
            star <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : showEmpty ? 'fill-muted text-muted-foreground/30' : 'hidden'
          }`}
        />
      ))}
    </div>
  );
}
