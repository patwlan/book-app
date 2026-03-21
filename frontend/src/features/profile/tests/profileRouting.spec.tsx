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
          <Route path="/profiles" element={<h2>Profiles</h2>} />
          <Route path="/profiles/:userId" element={<h2>Profile detail</h2>} />
        </Routes>
      </AppShell>
    </MemoryRouter>,
  );
}

describe('Profile navigation', () => {
  it('shows profiles as active and navigates to settings', async () => {
    const user = userEvent.setup();

    renderAppAt('/profiles');

    expect(screen.getByRole('link', { name: /profiles/i })).toHaveAttribute('aria-current', 'page');

    await user.click(screen.getByRole('link', { name: /settings/i }));

    expect(await screen.findByRole('heading', { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('aria-current', 'page');
  });

  it('keeps profiles active on a nested profile detail route', () => {
    renderAppAt('/profiles/reader-2');

    expect(screen.getByRole('link', { name: /profiles/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading', { name: /profile detail/i })).toBeInTheDocument();
  });
});
