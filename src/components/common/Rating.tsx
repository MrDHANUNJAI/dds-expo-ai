import React from 'react';
import { Star } from 'lucide-react';

export interface RatingProps {
  rating: number;
  reviewCount?: number;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  rating,
  reviewCount,
  showText = true,
  size = 'sm',
  className = '',
}) => {
  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  // Clamp rating between 0 and 5
  const clampedRating = Math.max(0, Math.min(5, rating));

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5 text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSizes[size]} ${
              star <= Math.round(clampedRating)
                ? 'fill-amber-400 text-amber-500'
                : 'text-slate-300'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
      {showText && (
        <div className={`inline-flex items-center gap-1 text-slate-700 font-medium ${textSizes[size]}`}>
          <span className="font-semibold tabular-nums text-slate-900">{clampedRating.toFixed(1)}</span>
          {reviewCount !== undefined && (
            <span className="text-slate-500 font-normal">
              ({reviewCount})
            </span>
          )}
        </div>
      )}
    </div>
  );
};
