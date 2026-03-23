import { expect, test } from '@playwright/test';

type FeedPost = {
  postId: string;
  bookTitle: string;
  rating: number;
  ownerUserId: string;
  ownerDisplayName: string;
  postedAt: string;
  updatedAt: string;
  ownedByCurrentUser: boolean;
};

test('edits and deletes the owner post', async ({ page }) => {
  let post: FeedPost | null = {
    postId: '1',
    bookTitle: 'Dune',
    rating: 5,
    ownerUserId: 'demo-user',
    ownerDisplayName: 'Demo User',
    postedAt: '2026-03-19T10:00:00Z',
    updatedAt: '2026-03-19T10:00:00Z',
    ownedByCurrentUser: true,
  };

  await page.route('**/api/v1/current-reading-posts', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: post ? [post] : [] }),
      });
      return;
    }

    await route.fallback();
  });

  await page.route('**/api/v1/current-reading-posts/me', async (route) => {
    if (route.request().method() === 'PUT') {
      const body = route.request().postDataJSON() as { bookTitle: string; rating: number };
      post = {
        ...(post as FeedPost),
        bookTitle: body.bookTitle,
        rating: body.rating,
      };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(post) });
      return;
    }

    if (route.request().method() === 'DELETE') {
      post = null;
      await route.fulfill({ status: 204, body: '' });
      return;
    }

    await route.fallback();
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.getByRole('heading', { name: 'Edit your current read' })).toBeVisible();
  await expect(page.getByLabel('Book title')).toHaveValue('Dune');
  await page.getByLabel('Book title').fill('Project Hail Mary');
  await page.getByRole('radio', { name: '4 out of 5 stars' }).click();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Project Hail Mary')).toBeVisible();

  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('No one has shared a current read yet.')).toBeVisible();
});

