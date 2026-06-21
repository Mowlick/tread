import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMonthlyFootprint, fetchStreak, fetchTodayMission, fetchActiveGoal, fetchWeeklyReview, completeMission } from '../lib/api/home';

export function useHomeData(userId: string | undefined) {
  const queryClient = useQueryClient();

  const monthlyFootprintQuery = useQuery({
    queryKey: ['monthlyFootprint', userId],
    queryFn: () => fetchMonthlyFootprint(userId!),
    enabled: !!userId,
  });

  const streakQuery = useQuery({
    queryKey: ['streak', userId],
    queryFn: () => fetchStreak(userId!),
    enabled: !!userId,
  });

  const missionQuery = useQuery({
    queryKey: ['todayMission', userId],
    queryFn: () => fetchTodayMission(userId!),
    enabled: !!userId,
  });

  const goalQuery = useQuery({
    queryKey: ['activeGoal', userId],
    queryFn: () => fetchActiveGoal(userId!),
    enabled: !!userId,
  });

  const weeklyReviewQuery = useQuery({
    queryKey: ['weeklyReview', userId],
    queryFn: () => fetchWeeklyReview(userId!),
    enabled: !!userId,
  });

  const completeMissionMutation = useMutation({
    mutationFn: (date: string) => completeMission(userId!, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayMission', userId] });
      queryClient.invalidateQueries({ queryKey: ['streak', userId] });
    },
  });

  return {
    monthlyFootprint: monthlyFootprintQuery.data,
    streak: streakQuery.data,
    todayMission: missionQuery.data,
    activeGoal: goalQuery.data,
    weeklyReview: weeklyReviewQuery.data,
    completeMission: completeMissionMutation.mutate,
    isLoading: monthlyFootprintQuery.isLoading || streakQuery.isLoading || missionQuery.isLoading || goalQuery.isLoading,
  };
}
