import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ProfilePage } from '../pages/ProfilePage';
import { server } from '../../../test/msw/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../../shared/auth/AuthProvider';

function renderProfileRoute(path: string, { userId = 'reader-1', displayName = 'Reader One' } = {}) {
  window.localStorage.setItem('book-app-current-user', JSON.stringify({ userId, displayName }));

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/profiles/:userId" element={<ProfilePage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('ProfilePage', () => {
  it('renders another reader profile when a user id is present in the route', async () => {
    server.use(
      http.get('http://localhost:8080/api/v1/profiles/reader-22', () => {
        return HttpResponse.json({
          userId: 'reader-22',
          displayName: 'Reader Twenty-Two',
          booksReadCount: 7,
        });
      }),
    );

    renderProfileRoute('/profiles/reader-22', { userId: 'reader-1', displayName: 'Reader One' });

    expect(await screen.findByText(/reader twenty-two/i)).toBeInTheDocument();
    expect(screen.getByText(/profile summary for this reader/i)).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders a zero state for another reader profile when the count is zero', async () => {
    server.use(
      http.get('http://localhost:8080/api/v1/profiles/reader-30', () => {
        return HttpResponse.json({
          userId: 'reader-30',
          displayName: 'Reader Thirty',
          booksReadCount: 0,
        });
      }),
    );

    renderProfileRoute('/profiles/reader-30', { userId: 'reader-1', displayName: 'Reader One' });

    expect(await screen.findByText('0')).toBeInTheDocument();
    expect(screen.getByText(/no books read yet/i)).toBeInTheDocument();
  });

  it('shows a not-found state when another reader profile does not exist', async () => {
    server.use(
      http.get('http://localhost:8080/api/v1/profiles/missing-reader', () => {
        return HttpResponse.json({ detail: 'Profile not found.' }, { status: 404 });
      }),
    );

    renderProfileRoute('/profiles/missing-reader', { userId: 'reader-1', displayName: 'Reader One' });

    expect(await screen.findByText(/profile not found/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /missing-reader/i, level: 3 })).toBeInTheDocument();
  });

  it('falls back safely when the backend returns an invalid negative count', async () => {
    server.use(
      http.get('http://localhost:8080/api/v1/profiles/reader-10', () => {
        return HttpResponse.json({
          userId: 'reader-10',
          displayName: 'Reader Ten',
          booksReadCount: -2,
        });
      }),
    );

    renderProfileRoute('/profiles/reader-10', { userId: 'reader-1', displayName: 'Reader One' });

    expect(await screen.findByText(/profile summary is unavailable right now/i)).toBeInTheDocument();
    expect(screen.getByText(/reader ten/i)).toBeInTheDocument();
  });
});
