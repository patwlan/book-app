import { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../shared/auth/AuthProvider';

export function renderWithProviders(ui: React.ReactElement, { userId = 'user-1', displayName = 'User One' } = {}) {
  window.localStorage.setItem(
    'book-app-current-user',
    JSON.stringify({ userId, displayName }),
  );

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper });
}

