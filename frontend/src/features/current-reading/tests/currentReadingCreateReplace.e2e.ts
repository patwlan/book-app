import { expect, test } from '@playwright/test';

test('creates and replaces the current read', async ({ page }) => {
  let feed = {
    items: [] as Array<Record<string, unknown>>,
  };

  await page.route('**/api/v1/current-reading-posts', async (route) => {
    const request = route.request();

    if (request.method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(feed) });
      return;
    }

    if (request.method() === 'POST') {
      const body = request.postDataJSON() as { bookTitle: string; rating: number };
      feed = {
        items: [
          {
            postId: '1',
            bookTitle: body.bookTitle,
            rating: body.rating,
            ownerUserId: 'demo-user',
            ownerDisplayName: 'Demo User',
            postedAt: '2026-03-19T10:00:00Z',
            updatedAt: '2026-03-19T10:00:00Z',
            ownedByCurrentUser: true,
          },
        ],
      };
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(feed.items[0]) });
    }
  });

  await page.goto('/');
  await page.getByLabel('Book title').fill('Dune');
  await page.getByRole('radio', { name: '5 out of 5 stars' }).click();
  await page.getByRole('button', { name: 'Share current read' }).click();

  await expect(page.getByText('Dune')).toBeVisible();

  await page.getByLabel('Book title').fill('Hyperion');
  await page.getByRole('radio', { name: '4 out of 5 stars' }).click();
  await page.getByRole('button', { name: 'Share current read' }).click();

  await expect(page.getByText('Hyperion')).toBeVisible();
});

