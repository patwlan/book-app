import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CurrentReadingForm } from '../components/CurrentReadingForm';
import { renderWithProviders } from '../../../test/renderWithProviders';

describe('CurrentReadingForm', () => {
  it('shows validation messages for blank title and out-of-range rating', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CurrentReadingForm
        mode="create"
        submitLabel="Share current read"
        onSubmit={vi.fn()}
      />,
    );

    await user.clear(screen.getByLabelText(/rating/i));
    await user.type(screen.getByLabelText(/rating/i), '7');
    await user.click(screen.getByRole('button', { name: /share current read/i }));

    expect(await screen.findByText(/book title is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/rating must be between 1 and 5/i)).toBeInTheDocument();
  });

  it('submits trimmed values and shows success text provided by the caller', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <CurrentReadingForm
        mode="create"
        submitLabel="Share current read"
        successMessage="Saved successfully"
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText(/book title/i), '  Dune  ');
    await user.clear(screen.getByLabelText(/rating/i));
    await user.type(screen.getByLabelText(/rating/i), '5');
    await user.click(screen.getByRole('button', { name: /share current read/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ bookTitle: 'Dune', rating: 5 }));
    expect(screen.getByText(/saved successfully/i)).toBeInTheDocument();
  });
});

