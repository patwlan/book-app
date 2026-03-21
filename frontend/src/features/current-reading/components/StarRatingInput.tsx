import { useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  getStarRatingLabel,
  isStarRating,
  MAX_STAR_RATING,
  MIN_STAR_RATING,
  STAR_RATING_VALUES,
} from '../services/starRating';

type StarRatingInputProps = {
  value: number;
  onChange: (value: number) => void;
  onBlur: () => void;
  errorMessage?: string;
  disabled?: boolean;
};

/**
 * Renders an accessible five-option star selector that keeps the form value numeric.
 */
export function StarRatingInput({ value, onChange, onBlur, errorMessage, disabled = false }: StarRatingInputProps) {
  const labelId = useId();
  const hintId = useId();
  const errorId = useId();
  const starRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  const hasValidValue = isStarRating(value);
  const selectedValue = hasValidValue ? value : 0;
  const previewValue = hoveredValue ?? selectedValue;
  const describedBy = [hintId, errorMessage ? errorId : null].filter(Boolean).join(' ') || undefined;

  function focusStar(starValue: number) {
    starRefs.current[starValue - MIN_STAR_RATING]?.focus();
  }

  function selectRating(nextValue: number, moveFocus: boolean) {
    const normalizedValue = Math.min(MAX_STAR_RATING, Math.max(MIN_STAR_RATING, nextValue));
    onChange(normalizedValue);

    if (moveFocus) {
      focusStar(normalizedValue);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentValue: number) {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        selectRating(currentValue + 1, true);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        selectRating(currentValue - 1, true);
        break;
      case 'Home':
        event.preventDefault();
        selectRating(MIN_STAR_RATING, true);
        break;
      case 'End':
        event.preventDefault();
        selectRating(MAX_STAR_RATING, true);
        break;
      default:
        break;
    }
  }

  return (
    <div className="space-y-3">
      <div id={labelId} className="block text-sm font-medium text-slate-700">
        Rating
      </div>

      <div
        role="radiogroup"
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        aria-invalid={errorMessage ? 'true' : 'false'}
        className="space-y-3"
      >
        <div
          className="inline-flex flex-wrap items-center gap-2 rounded-[24px] border border-slate-200 bg-slate-50/80 px-3 py-3"
          onMouseLeave={() => setHoveredValue(null)}
        >
          {STAR_RATING_VALUES.map((starValue) => {
            const checked = value === starValue;
            const filled = starValue <= previewValue;
            const focusable = checked || (!hasValidValue && starValue === MIN_STAR_RATING);

            return (
              <button
                key={starValue}
                ref={(element) => {
                  starRefs.current[starValue - MIN_STAR_RATING] = element;
                }}
                type="button"
                role="radio"
                aria-checked={checked}
                aria-label={getStarRatingLabel(starValue)}
                tabIndex={focusable ? 0 : -1}
                disabled={disabled}
                onBlur={onBlur}
                onClick={() => selectRating(starValue, false)}
                onKeyDown={(event) => handleKeyDown(event, starValue)}
                onMouseEnter={() => setHoveredValue(starValue)}
                onFocus={() => setHoveredValue(null)}
                className={[
                  'rounded-full p-2 text-3xl leading-none transition duration-150',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2',
                  disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                  checked ? 'bg-amber-50' : 'hover:bg-slate-100',
                  filled ? 'text-amber-400' : 'text-slate-300',
                ].join(' ')}
              >
                <span aria-hidden="true">★</span>
              </button>
            );
          })}
        </div>

        <p className="text-sm font-medium text-slate-600">
          {isStarRating(previewValue) ? `${getStarRatingLabel(previewValue)} selected` : 'Select a rating from 1 to 5.'}
        </p>
      </div>

      <p id={hintId} className="text-sm text-slate-500">
        Choose from 1 to 5 stars.
      </p>
      {errorMessage ? (
        <p id={errorId} className="text-sm text-rose-600">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}


