import { useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useCurrentReadingForm } from '../hooks/useCurrentReadingForm';
import type { CurrentReadingFormValues } from '../services/currentReadingFormSchema';

type CurrentReadingFormProps = {
  mode: 'create' | 'edit';
  submitLabel: string;
  successMessage?: string;
  initialValues?: Partial<CurrentReadingFormValues>;
  onSubmit: (values: CurrentReadingFormValues) => Promise<void>;
  onCancel?: () => void;
};

export function CurrentReadingForm({
  mode,
  submitLabel,
  successMessage,
  initialValues,
  onSubmit,
  onCancel,
}: CurrentReadingFormProps) {
  const form = useCurrentReadingForm(initialValues);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit: SubmitHandler<CurrentReadingFormValues> = async (values) => {
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      await onSubmit(values);
      setStatusMessage(successMessage ?? 'Saved successfully');
      if (mode === 'create') {
        form.reset({ bookTitle: '', rating: 1 });
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Request failed.');
    }
  };

  return (
    <form className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm" noValidate onSubmit={form.handleSubmit(handleSubmit)}>
      <div>
        <label htmlFor="bookTitle" className="mb-2 block text-sm font-medium text-slate-700">
          Book title
        </label>
        <input
          id="bookTitle"
          type="text"
          {...form.register('bookTitle')}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none"
          placeholder="The Left Hand of Darkness"
        />
        {form.formState.errors.bookTitle ? (
          <p className="mt-2 text-sm text-rose-600">{form.formState.errors.bookTitle.message}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="rating" className="mb-2 block text-sm font-medium text-slate-700">
          Rating
        </label>
        <input
          id="rating"
          type="number"
          min={1}
          max={5}
          {...form.register('rating', { valueAsNumber: true })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none"
        />
        {form.formState.errors.rating ? (
          <p className="mt-2 text-sm text-rose-600">{form.formState.errors.rating.message}</p>
        ) : null}
      </div>

      {statusMessage ? <p className="text-sm font-medium text-emerald-600">{statusMessage}</p> : null}
      {errorMessage ? <p className="text-sm font-medium text-rose-600">{errorMessage}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {form.formState.isSubmitting ? 'Saving…' : submitLabel}
        </button>
        {mode === 'edit' && onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

