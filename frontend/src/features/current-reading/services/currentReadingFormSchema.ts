import { z } from 'zod';
import { MAX_STAR_RATING, MIN_STAR_RATING } from './starRating';

export const currentReadingFormSchema = z.object({
  bookTitle: z.string().trim().min(1, 'Book title is required.'),
  rating: z.coerce
    .number()
    .int()
    .min(MIN_STAR_RATING, 'Rating must be between 1 and 5.')
    .max(MAX_STAR_RATING, 'Rating must be between 1 and 5.'),
});

export type CurrentReadingFormValues = z.infer<typeof currentReadingFormSchema>;

