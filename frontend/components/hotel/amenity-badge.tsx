import { Check } from 'lucide-react';

export function AmenityBadge({ amenity, icon }: { amenity: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
        {icon || <Check className="w-4 h-4 text-amber-600" />}
      </div>
      <span className="text-sm font-medium">{amenity}</span>
    </div>
  );
}
