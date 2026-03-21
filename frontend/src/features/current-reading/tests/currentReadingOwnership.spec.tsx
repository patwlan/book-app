import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CurrentReadingCard } from '../components/CurrentReadingCard';
import { renderWithProviders } from '../../../test/renderWithProviders';

const baseItem = {
  postId: '1',
  bookTitle: 'Project Hail Mary',
  rating: 5,
  ownerUserId: 'user-1',
  ownerDisplayName: 'User One',
  postedAt: '2026-03-19T10:00:00Z',
  updatedAt: '2026-03-19T10:00:00Z',
};

describe('CurrentReading ownership controls', () => {
  it('shows edit and delete actions for the owner', () => {
    renderWithProviders(
      <CurrentReadingCard item={{ ...baseItem, ownedByCurrentUser: true }} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /user one/i })).toHaveAttribute('href', '/profiles/user-1');
  });

  it('hides owner actions for non-owners', () => {
    renderWithProviders(
      <CurrentReadingCard
        item={{ ...baseItem, ownerUserId: 'user-2', ownerDisplayName: 'Another Reader', ownedByCurrentUser: false }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /another reader/i })).toHaveAttribute('href', '/profiles/user-2');
  });
});

