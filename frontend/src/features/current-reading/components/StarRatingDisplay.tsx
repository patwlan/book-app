import { getStarRatingLabel, isStarRating, STAR_RATING_VALUES } from '../services/starRating';

type StarRatingDisplayProps = {
  rating: number;
  className?: string;
};

/**
 * Renders a read-only star rating with a safe fallback for unexpected values.
 */
export function StarRatingDisplay({ rating, className }: StarRatingDisplayProps) {
  const wrapperClassName = className ? `inline-flex items-center gap-1 ${className}` : 'inline-flex items-center gap-1';

  if (!isStarRating(rating)) {
    return (
      <span className={`${wrapperClassName} text-sm font-medium text-amber-800`}>
        Rating unavailable
      </span>
    );
  }

  const label = getStarRatingLabel(rating);

  return (
    <div role="img" aria-label={label} className={wrapperClassName}>
      {STAR_RATING_VALUES.map((starValue) => (
        <span
          key={starValue}
          aria-hidden="true"
          className={starValue <= rating ? 'text-lg leading-none text-amber-400' : 'text-lg leading-none text-slate-300'}
        >
          ★
        </span>
      ))}
    </div>
  );
}

