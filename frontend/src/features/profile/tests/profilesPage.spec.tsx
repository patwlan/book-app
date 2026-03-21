import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { ProfilesPage } from '../pages/ProfilesPage';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { server } from '../../../test/msw/server';

describe('ProfilesPage', () => {
  it('renders all known reader summaries', async () => {
    server.use(
      http.get('http://localhost:8080/api/v1/profiles', () => {
        return HttpResponse.json({
          items: [
            { userId: 'reader-1', displayName: 'Ada Reader', booksReadCount: 5 },
            { userId: 'reader-2', displayName: 'Ben Reader', booksReadCount: 2 },
          ],
        });
      }),
    );

    renderWithProviders(<ProfilesPage />);

    expect(await screen.findByRole('heading', { name: /profiles/i })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /ada reader/i })).toHaveAttribute('href', '/profiles/reader-1');
    expect(await screen.findByRole('link', { name: /ben reader/i })).toHaveAttribute('href', '/profiles/reader-2');
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders an empty state when no reader summaries exist', async () => {
    server.use(
      http.get('http://localhost:8080/api/v1/profiles', () => {
        return HttpResponse.json({ items: [] });
      }),
    );

    renderWithProviders(<ProfilesPage />);

    expect(await screen.findByText(/no reader summaries yet/i)).toBeInTheDocument();
  });

  it('renders a non-blocking fallback when the profiles request fails', async () => {
    server.use(
      http.get('http://localhost:8080/api/v1/profiles', () => {
        return HttpResponse.json({ detail: 'Profiles unavailable.' }, { status: 500 });
      }),
    );

    renderWithProviders(<ProfilesPage />);

    expect(await screen.findByText(/profiles are unavailable right now/i)).toBeInTheDocument();
  });
});
