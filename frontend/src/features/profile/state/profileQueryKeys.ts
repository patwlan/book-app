export const profileQueryKeys = {
  all: ['profile'] as const,
  list: () => [...profileQueryKeys.all, 'list'] as const,
  summary: (userId: string) => [...profileQueryKeys.all, 'summary', userId] as const,
  ownSummary: (userId: string) => profileQueryKeys.summary(userId),
};
