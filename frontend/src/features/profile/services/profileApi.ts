import { httpRequest } from '../../../shared/api/httpClient';
import type { CurrentUser } from '../../../shared/auth/AuthProvider';

export type ProfileSummary = {
  userId: string;
  displayName: string;
  booksReadCount: number;
};

export type ProfilesResponse = {
  items: ProfileSummary[];
};

export async function listProfiles(): Promise<ProfilesResponse> {
  return httpRequest<ProfilesResponse>('/api/v1/profiles');
}

export async function getOwnProfileSummary(user: CurrentUser): Promise<ProfileSummary> {
  return httpRequest<ProfileSummary>('/api/v1/profile/me', { user });
}

export async function getProfileSummary(userId: string, user?: CurrentUser): Promise<ProfileSummary> {
  return httpRequest<ProfileSummary>(`/api/v1/profiles/${encodeURIComponent(userId)}`, { user });
}

