import { z } from 'zod';

export const currentReadingFormSchema = z.object({
  bookTitle: z.string().trim().min(1, 'Book title is required.'),
  rating: z.coerce.number().int().min(1, 'Rating must be between 1 and 5.').max(5, 'Rating must be between 1 and 5.'),
});

export type CurrentReadingFormValues = z.infer<typeof currentReadingFormSchema>;

