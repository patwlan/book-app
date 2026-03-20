export const currentReadingQueryKeys = {
  all: ['current-reading'] as const,
  featured: () => [...currentReadingQueryKeys.all, 'featured'] as const,
  feed: (userId: string) => [...currentReadingQueryKeys.all, 'feed', userId] as const,
};

