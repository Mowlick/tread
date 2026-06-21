import { useQuery } from '@tanstack/react-query';
import { fetchFriendsLeaderboard, fetchHouseholdProgress, fetchHouseholdMembers } from '../lib/api/community';

export function useCommunity(userId: string | undefined, householdId: string | undefined) {
  const leaderboardQuery = useQuery({
    queryKey: ['friendsLeaderboard', userId],
    queryFn: () => fetchFriendsLeaderboard(userId!),
    enabled: !!userId,
  });

  const householdProgressQuery = useQuery({
    queryKey: ['householdProgress', householdId],
    queryFn: () => fetchHouseholdProgress(householdId!),
    enabled: !!householdId,
  });

  const householdMembersQuery = useQuery({
    queryKey: ['householdMembers', householdId],
    queryFn: () => fetchHouseholdMembers(householdId!),
    enabled: !!householdId,
  });

  return {
    leaderboard: leaderboardQuery.data || [],
    householdProgress: householdProgressQuery.data,
    householdMembers: householdMembersQuery.data || [],
    isLoading: leaderboardQuery.isLoading || householdProgressQuery.isLoading || householdMembersQuery.isLoading,
  };
}
