import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CurrentReadingFeed } from '../components/CurrentReadingFeed';
import { renderWithProviders } from '../../../test/renderWithProviders';

describe('CurrentReadingFeed', () => {
  it('renders an empty state when no items exist', () => {
    renderWithProviders(<CurrentReadingFeed items={[]} onEdit={() => undefined} onDelete={() => undefined} />);

    expect(screen.getByText(/no one has shared a current read yet/i)).toBeInTheDocument();
  });

  it('renders feed items with title, user context, and rating', () => {
    renderWithProviders(
      <CurrentReadingFeed
        items={[
          {
            postId: '1',
            bookTitle: 'The Left Hand of Darkness',
            rating: 4,
            ownerUserId: 'user-2',
            ownerDisplayName: 'Ai Reader',
            postedAt: '2026-03-19T10:00:00Z',
            updatedAt: '2026-03-19T10:00:00Z',
            ownedByCurrentUser: false,
          },
        ]}
        onEdit={() => undefined}
        onDelete={() => undefined}
      />,
    );

    expect(screen.getByText(/the left hand of darkness/i)).toBeInTheDocument();
    expect(screen.getByText(/ai reader/i)).toBeInTheDocument();
    expect(screen.getByText(/4\/5/i)).toBeInTheDocument();
  });
});

