import { useQuery } from '@tanstack/react-query';
import type { CurrentUser } from '../../../shared/auth/AuthProvider';
import { getOwnProfileSummary, getProfileSummary, listProfiles } from '../services/profileApi';
import { profileQueryKeys } from './profileQueryKeys';

export function useProfilesQuery() {
  return useQuery({
    queryKey: profileQueryKeys.list(),
    queryFn: () => listProfiles(),
  });
}

export function useProfileSummaryQuery(user: CurrentUser, targetUserId?: string) {
  const resolvedUserId = !targetUserId || targetUserId === user.userId ? user.userId : targetUserId;
  const isOwnProfile = resolvedUserId === user.userId;

  return useQuery({
    queryKey: isOwnProfile ? profileQueryKeys.ownSummary(user.userId) : profileQueryKeys.summary(resolvedUserId),
    queryFn: () => (isOwnProfile ? getOwnProfileSummary(user) : getProfileSummary(resolvedUserId, user)),
  });
}

