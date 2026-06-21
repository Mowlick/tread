import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRecentActivities, logActivity } from '../lib/api/track';

export function useActivities(userId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ['activities', userId],
    queryFn: ({ pageParam = 0 }) => fetchRecentActivities(userId!, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!userId,
    initialPageParam: 0,
  });

  const logActivityMutation = useMutation({
    mutationFn: (params: { category: string; subcategory: string; amount: number; unit: string }) => 
      logActivity({ userId: userId!, ...params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', userId] });
      queryClient.invalidateQueries({ queryKey: ['monthlyFootprint', userId] });
    },
  });

  return {
    ...query,
    logActivity: logActivityMutation.mutate,
    isLogging: logActivityMutation.isPending,
  };
}
