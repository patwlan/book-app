import { httpRequest } from '../../../shared/api/httpClient';
import type { CurrentUser } from '../../../shared/auth/AuthProvider';
import type { CurrentReadingFormValues } from './currentReadingFormSchema';

export type CurrentReadingPost = {
  postId: string;
  bookTitle: string;
  rating: number;
  ownerUserId: string;
  ownerDisplayName: string;
  postedAt: string;
  updatedAt: string;
  ownedByCurrentUser: boolean;
};

export type CurrentReadingFeedResponse = {
  items: CurrentReadingPost[];
};

export type FeaturedCurrentRead = {
  rank: number;
  bookTitle: string;
  readerCount: number;
};

export type CurrentReadingFeaturedBooksResponse = {
  featuredBooks: FeaturedCurrentRead[];
};

export async function listCurrentReadingPosts(user: CurrentUser): Promise<CurrentReadingFeedResponse> {
  return httpRequest<CurrentReadingFeedResponse>('/api/v1/current-reading-posts', { user });
}

export async function listFeaturedCurrentReads(user: CurrentUser): Promise<CurrentReadingFeaturedBooksResponse> {
  return httpRequest<CurrentReadingFeaturedBooksResponse>('/api/v1/current-reading-posts/featured', { user });
}

export async function createOrReplaceCurrentReadingPost(
  user: CurrentUser,
  payload: CurrentReadingFormValues,
): Promise<CurrentReadingPost> {
  return httpRequest<CurrentReadingPost>('/api/v1/current-reading-posts', {
    method: 'POST',
    body: payload,
    user,
  });
}

export async function updateOwnCurrentReadingPost(
  user: CurrentUser,
  payload: CurrentReadingFormValues,
): Promise<CurrentReadingPost> {
  return httpRequest<CurrentReadingPost>('/api/v1/current-reading-posts/me', {
    method: 'PUT',
    body: payload,
    user,
  });
}

export async function deleteOwnCurrentReadingPost(user: CurrentUser): Promise<void> {
  await httpRequest<void>('/api/v1/current-reading-posts/me', {
    method: 'DELETE',
    user,
  });
}

