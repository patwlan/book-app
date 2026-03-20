import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { CurrentReadingPage } from '../pages/CurrentReadingPage';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { server } from '../../../test/msw/server';

describe('CurrentReading hero integration', () => {
  it('keeps the main page usable when the featured-books request fails', async () => {
    server.use(
      http.get('http://localhost:8080/api/v1/current-reading-posts/featured', () => {
        return HttpResponse.json({ detail: 'Hero unavailable.' }, { status: 500 });
      }),
      http.get('http://localhost:8080/api/v1/current-reading-posts', () => {
        return HttpResponse.json({
          items: [
            {
              postId: '1',
              bookTitle: 'Project Hail Mary',
              rating: 5,
              ownerUserId: 'user-2',
              ownerDisplayName: 'Reader Two',
              postedAt: '2026-03-19T09:00:00Z',
              updatedAt: '2026-03-19T09:00:00Z',
              ownedByCurrentUser: false,
            },
          ],
        });
      }),
    );

    renderWithProviders(<CurrentReadingPage />);

    expect(await screen.findByText(/featured books are unavailable right now/i)).toBeInTheDocument();
    expect(await screen.findByText(/project hail mary/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /current reading feed/i })).toBeInTheDocument();
  });
});

