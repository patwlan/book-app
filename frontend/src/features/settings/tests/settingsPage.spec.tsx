import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { SettingsPage } from '../pages/SettingsPage';

describe('SettingsPage', () => {
  it('loads the current owner context and persists updates', async () => {
    const user = userEvent.setup();

    renderWithProviders(<SettingsPage />, { userId: 'reader-1', displayName: 'Reader One' });

    const userIdInput = screen.getByLabelText(/user id/i);
    const displayNameInput = screen.getByLabelText(/display name/i);

    expect(userIdInput).toHaveValue('reader-1');
    expect(displayNameInput).toHaveValue('Reader One');

    await user.clear(userIdInput);
    await user.type(userIdInput, 'reader-2');
    await user.clear(displayNameInput);
    await user.type(displayNameInput, 'Reader Two');
    await user.click(screen.getByRole('button', { name: /apply owner context/i }));

    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem('book-app-current-user') ?? 'null')).toEqual({
        userId: 'reader-2',
        displayName: 'Reader Two',
      });
    });

    expect(screen.getByText(/active owner/i)).toBeInTheDocument();
    expect(screen.getByText(/reader two/i)).toBeInTheDocument();
  });
});

