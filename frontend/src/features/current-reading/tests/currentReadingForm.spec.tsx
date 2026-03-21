import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CurrentReadingForm } from '../components/CurrentReadingForm';
import { renderWithProviders } from '../../../test/renderWithProviders';

describe('CurrentReadingForm', () => {
  it('shows the default selected rating and supports keyboard updates', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <CurrentReadingForm
        mode="create"
        submitLabel="Share current read"
        onSubmit={vi.fn()}
      />,
    );

    const ratingGroup = screen.getByRole('radiogroup', { name: /rating/i });
    const oneStar = within(ratingGroup).getByRole('radio', { name: /1 out of 5 stars/i });
    const twoStars = within(ratingGroup).getByRole('radio', { name: /2 out of 5 stars/i });

    expect(oneStar).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText(/1 out of 5 stars selected/i)).toBeInTheDocument();

    oneStar.focus();
    await user.keyboard('{ArrowRight}');

    expect(twoStars).toHaveFocus();
    expect(twoStars).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText(/2 out of 5 stars selected/i)).toBeInTheDocument();
  });

  it('preselects the saved rating in edit mode', () => {
    renderWithProviders(
      <CurrentReadingForm
        mode="edit"
        submitLabel="Save changes"
        initialValues={{ bookTitle: 'Dune', rating: 4 }}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('radio', { name: /4 out of 5 stars/i })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText(/4 out of 5 stars selected/i)).toBeInTheDocument();
  });

  it('shows validation messages for blank title and out-of-range rating', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CurrentReadingForm
        mode="edit"
        submitLabel="Save changes"
        initialValues={{ bookTitle: '', rating: 7 }}
        onSubmit={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /save changes/i }));

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
    await user.click(screen.getByRole('radio', { name: /5 out of 5 stars/i }));
    await user.click(screen.getByRole('button', { name: /share current read/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ bookTitle: 'Dune', rating: 5 }));
    expect(screen.getByText(/saved successfully/i)).toBeInTheDocument();
    expect(screen.getByText(/1 out of 5 stars selected/i)).toBeInTheDocument();
  });
});

