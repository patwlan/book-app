import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CurrentUser } from '../../../shared/auth/AuthProvider';
import { deleteOwnCurrentReadingPost, updateOwnCurrentReadingPost } from '../services/currentReadingApi';
import type { CurrentReadingFormValues } from '../services/currentReadingFormSchema';
import { currentReadingQueryKeys } from '../state/currentReadingQueryKeys';

export function useMaintainCurrentReading(user: CurrentUser) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (payload: CurrentReadingFormValues) => updateOwnCurrentReadingPost(user, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: currentReadingQueryKeys.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteOwnCurrentReadingPost(user),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: currentReadingQueryKeys.all });
    },
  });

  return {
    updateMutation,
    deleteMutation,
  };
}

