export const MIN_STAR_RATING = 1;
export const MAX_STAR_RATING = 5;

export const STAR_RATING_VALUES = Array.from(
  { length: MAX_STAR_RATING },
  (_, index) => index + MIN_STAR_RATING,
);

/**
 * Returns whether a value can be rendered and submitted as a valid star rating.
 */
export function isStarRating(value: number): boolean {
  return Number.isInteger(value) && value >= MIN_STAR_RATING && value <= MAX_STAR_RATING;
}

/**
 * Builds the accessible label used for star-selection and star-display UI.
 */
export function getStarRatingLabel(value: number): string {
  return `${value} out of ${MAX_STAR_RATING} stars`;
}

