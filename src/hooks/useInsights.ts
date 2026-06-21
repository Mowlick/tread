import { useQuery } from '@tanstack/react-query';
import { fetchCategoryBreakdown, fetchMonthlyTrend } from '../lib/api/insights';

export function useInsights(userId: string | undefined) {
  const breakdownQuery = useQuery({
    queryKey: ['categoryBreakdown', userId],
    queryFn: () => fetchCategoryBreakdown(userId!),
    enabled: !!userId,
  });

  const trendQuery = useQuery({
    queryKey: ['monthlyTrend', userId],
    queryFn: () => fetchMonthlyTrend(userId!),
    enabled: !!userId,
  });

  return {
    breakdown: breakdownQuery.data,
    trend: trendQuery.data,
    isLoading: breakdownQuery.isLoading || trendQuery.isLoading,
  };
}
