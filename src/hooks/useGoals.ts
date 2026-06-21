import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchActiveGoal, setGoal, fetchTopImprovingCategories, fetchActiveChallengesCount } from '../lib/api/goals';

export function useGoals(userId: string | undefined) {
  const queryClient = useQueryClient();

  const activeGoalQuery = useQuery({
    queryKey: ['activeGoal', userId],
    queryFn: () => fetchActiveGoal(userId!),
    enabled: !!userId,
  });

  const improvingCategoriesQuery = useQuery({
    queryKey: ['improvingCategories', userId],
    queryFn: () => fetchTopImprovingCategories(userId!),
    enabled: !!userId,
  });

  const activeChallengesCountQuery = useQuery({
    queryKey: ['activeChallengesCount'],
    queryFn: () => fetchActiveChallengesCount(),
  });

  const setGoalMutation = useMutation({
    mutationFn: (params: { targetPct: number; durationDays: number }) => 
      setGoal(userId!, params.targetPct, params.durationDays),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeGoal', userId] });
    },
  });

  return {
    activeGoal: activeGoalQuery.data,
    improvingCategories: improvingCategoriesQuery.data,
    activeChallengesCount: activeChallengesCountQuery.data,
    setGoal: setGoalMutation.mutate,
    isSettingGoal: setGoalMutation.isPending,
    isLoading: activeGoalQuery.isLoading || improvingCategoriesQuery.isLoading,
  };
}
