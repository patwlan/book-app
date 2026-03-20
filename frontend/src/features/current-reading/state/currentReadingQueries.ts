import { useQuery } from '@tanstack/react-query';
import type { CurrentUser } from '../../../shared/auth/AuthProvider';
import { listCurrentReadingPosts, listFeaturedCurrentReads } from '../services/currentReadingApi';
import { currentReadingQueryKeys } from './currentReadingQueryKeys';

export function useFeaturedCurrentReadsQuery(user: CurrentUser) {
  return useQuery({
    queryKey: currentReadingQueryKeys.featured(),
    queryFn: () => listFeaturedCurrentReads(user),
  });
}

export function useCurrentReadingFeedQuery(user: CurrentUser) {
  return useQuery({
    queryKey: currentReadingQueryKeys.feed(user.userId),
    queryFn: () => listCurrentReadingPosts(user),
  });
}

