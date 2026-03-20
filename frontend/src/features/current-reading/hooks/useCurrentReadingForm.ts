import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CurrentReadingFormValues, currentReadingFormSchema } from '../services/currentReadingFormSchema';

export function useCurrentReadingForm(initialValues?: Partial<CurrentReadingFormValues>) {
  const form = useForm<CurrentReadingFormValues>({
    resolver: zodResolver(currentReadingFormSchema),
    defaultValues: {
      bookTitle: initialValues?.bookTitle ?? '',
      rating: initialValues?.rating ?? 1,
    },
  });

  useEffect(() => {
    form.reset({
      bookTitle: initialValues?.bookTitle ?? '',
      rating: initialValues?.rating ?? 1,
    });
  }, [form, initialValues?.bookTitle, initialValues?.rating]);

  return form;
}

