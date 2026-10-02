import { format } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { StarRating } from '@/components/shared/star-rating';
import { ThumbsUp } from 'lucide-react';

export function ReviewCard({ review }: { review: any }) {
  return (
    <div className="border rounded-xl p-5 bg-card">
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={review.user?.avatar} alt={review.user?.name} />
          <AvatarFallback className="bg-amber-100 text-amber-700 font-bold text-sm">
            {review.user?.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="font-medium text-sm">{review.user?.name}</div>
              <StarRating rating={review.rating} size="sm" />
            </div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(review.createdAt), 'MMM d, yyyy')}
            </div>
          </div>
        </div>
      </div>
      {review.title && <h4 className="font-semibold mb-1">{review.title}</h4>}
      <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
      {review.helpful > 0 && (
        <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
          <ThumbsUp className="w-3.5 h-3.5" />
          {review.helpful} people found this helpful
        </div>
      )}
    </div>
  );
}
