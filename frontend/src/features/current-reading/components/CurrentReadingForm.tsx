import { useState } from 'react';
import { Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useCurrentReadingForm } from '../hooks/useCurrentReadingForm';
import type { CurrentReadingFormValues } from '../services/currentReadingFormSchema';
import { StarRatingInput } from './StarRatingInput';

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
    <form className="panel-surface space-y-6 p-6 sm:p-8" noValidate onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="space-y-3">
        <p className="section-kicker">Your update</p>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            {mode === 'edit' ? 'Edit your current read' : 'Share your current read'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Add the book you are currently reading and leave a quick rating for everyone else.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor="bookTitle" className="mb-2 block text-sm font-medium text-slate-700">
            Book title
          </label>
          <input
            id="bookTitle"
            type="text"
            {...form.register('bookTitle')}
            className="input-field"
            placeholder="The Left Hand of Darkness"
          />
          {form.formState.errors.bookTitle ? (
            <p className="mt-2 text-sm text-rose-600">{form.formState.errors.bookTitle.message}</p>
          ) : null}
        </div>

        <Controller
          control={form.control}
          name="rating"
          render={({ field, fieldState }) => (
            <StarRatingInput
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              errorMessage={fieldState.error?.message}
              disabled={form.formState.isSubmitting}
            />
          )}
        />
      </div>

      {statusMessage ? (
        <div className="rounded-[22px] border border-emerald-100 bg-emerald-50/90 p-4 text-sm font-medium text-emerald-700">
          {statusMessage}
        </div>
      ) : null}
      {errorMessage ? (
        <div className="rounded-[22px] border border-rose-100 bg-rose-50/90 p-4 text-sm font-medium text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="primary-button"
        >
          {form.formState.isSubmitting ? 'Saving…' : submitLabel}
        </button>
        {mode === 'edit' && onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="secondary-button"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

