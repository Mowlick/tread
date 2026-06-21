import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchXpBalance, fetchRewardsCatalog, redeemReward } from '../lib/api/rewards';

export function useRewards(userId: string | undefined) {
  const queryClient = useQueryClient();

  const balanceQuery = useQuery({
    queryKey: ['xpBalance', userId],
    queryFn: () => fetchXpBalance(userId!),
    enabled: !!userId,
  });

  const catalogQuery = useQuery({
    queryKey: ['rewardsCatalog'],
    queryFn: () => fetchRewardsCatalog(),
  });

  const redeemMutation = useMutation({
    mutationFn: (rewardId: string) => redeemReward(userId!, rewardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xpBalance', userId] });
    },
  });

  return {
    balance: balanceQuery.data || 0,
    catalog: catalogQuery.data || [],
    redeem: redeemMutation.mutateAsync,
    isRedeeming: redeemMutation.isPending,
    isLoading: balanceQuery.isLoading || catalogQuery.isLoading,
  };
}
