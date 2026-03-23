import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppShell } from '../../../shared/layout/AppShell';

function renderAppAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppShell>
        <Routes>
          <Route path="/" element={<h2>Current reading feed</h2>} />
          <Route path="/settings" element={<h2>Settings</h2>} />
        </Routes>
      </AppShell>
    </MemoryRouter>,
  );
}

describe('Settings navigation', () => {
  it('shows settings as active and navigates back to the current reading feed', async () => {

    const user = userEvent.setup();

    renderAppAt('/settings');

    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('aria-current', 'page');

    await user.click(screen.getByRole('link', { name: /current reading/i }));

    expect(await screen.findByRole('heading', { name: /current reading feed/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /current reading/i })).toHaveAttribute('aria-current', 'page');
  });
});

