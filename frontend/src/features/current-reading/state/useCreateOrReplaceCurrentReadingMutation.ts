import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CurrentUser } from '../../../shared/auth/AuthProvider';
import { createOrReplaceCurrentReadingPost } from '../services/currentReadingApi';
import type { CurrentReadingFormValues } from '../services/currentReadingFormSchema';
import { currentReadingQueryKeys } from './currentReadingQueryKeys';

export function useCreateOrReplaceCurrentReadingMutation(user: CurrentUser) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CurrentReadingFormValues) => createOrReplaceCurrentReadingPost(user, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: currentReadingQueryKeys.all });
    },
  });
}

