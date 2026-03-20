import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { CurrentReadingPage } from '../pages/CurrentReadingPage';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { server } from '../../../test/msw/server';

describe('CurrentReadingPage integration', () => {
  it('refreshes the feed after a successful create mutation', async () => {
    const user = userEvent.setup();
    const items = [
      {
        postId: '2',
        bookTitle: 'The Hobbit',
        rating: 4,
        ownerUserId: 'user-3',
        ownerDisplayName: 'Reader Three',
        postedAt: '2026-03-19T08:30:00Z',
        updatedAt: '2026-03-19T08:30:00Z',
        ownedByCurrentUser: false,
      },
      {
        postId: '1',
        bookTitle: 'Initial Book',
        rating: 3,
        ownerUserId: 'user-2',
        ownerDisplayName: 'Reader Two',
        postedAt: '2026-03-19T09:00:00Z',
        updatedAt: '2026-03-19T09:00:00Z',
        ownedByCurrentUser: false,
      },
    ];

    function buildFeaturedBooks() {
      const counts = new Map<string, { bookTitle: string; readerCount: number }>();

      items.forEach((item) => {
        const normalizedTitle = item.bookTitle.trim().toLowerCase();
        const existingEntry = counts.get(normalizedTitle);
        if (existingEntry) {
          existingEntry.readerCount += 1;
          return;
        }

        counts.set(normalizedTitle, {
          bookTitle: item.bookTitle.trim(),
          readerCount: 1,
        });
      });

      return Array.from(counts.entries())
        .sort((left, right) => {
          const [, leftValue] = left;
          const [, rightValue] = right;
          if (rightValue.readerCount !== leftValue.readerCount) {
            return rightValue.readerCount - leftValue.readerCount;
          }
          return left[0].localeCompare(right[0]);
        })
        .slice(0, 3)
        .map(([_, value], index) => ({
          rank: index + 1,
          bookTitle: value.bookTitle,
          readerCount: value.readerCount,
        }));
    }

    server.use(
      http.get('http://localhost:8080/api/v1/current-reading-posts/featured', () => {
        return HttpResponse.json({ featuredBooks: buildFeaturedBooks() });
      }),
      http.get('http://localhost:8080/api/v1/current-reading-posts', () => {
        return HttpResponse.json({ items });
      }),
      http.post('http://localhost:8080/api/v1/current-reading-posts', async ({ request }) => {
        const body = (await request.json()) as { bookTitle: string; rating: number };
        items.unshift({
          postId: '3',
          bookTitle: body.bookTitle,
          rating: body.rating,
          ownerUserId: 'user-1',
          ownerDisplayName: 'User One',
          postedAt: '2026-03-19T10:00:00Z',
          updatedAt: '2026-03-19T10:00:00Z',
          ownedByCurrentUser: true,
        });
        return HttpResponse.json(items[0], { status: 201 });
      }),
    );

    renderWithProviders(<CurrentReadingPage />);

    expect(await screen.findByRole('heading', { name: /top current reads/i })).toBeInTheDocument();
    expect(await screen.findAllByText(/initial book/i)).toHaveLength(2);
    expect(await screen.findAllByText(/1 reader currently/i)).toHaveLength(2);

    await user.type(screen.getByLabelText(/book title/i), 'The Hobbit');
    await user.clear(screen.getByLabelText(/rating/i));
    await user.type(screen.getByLabelText(/rating/i), '5');
    await user.click(screen.getByRole('button', { name: /share current read/i }));

    await waitFor(() => expect(screen.getAllByText(/the hobbit/i)).toHaveLength(3));
    expect(screen.getByText(/saved your current read/i)).toBeInTheDocument();
    expect(screen.getByText(/2 readers currently/i)).toBeInTheDocument();
  });
});

