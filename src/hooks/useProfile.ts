import { useQuery } from '@tanstack/react-query';
import { fetchProfile, fetchProfileStats, fetchUserBadges } from '../lib/api/profile';

export function useProfile(userId: string | undefined) {
  const profileQuery = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  });

  const statsQuery = useQuery({
    queryKey: ['profileStats', userId],
    queryFn: () => fetchProfileStats(userId!),
    enabled: !!userId,
  });

  const badgesQuery = useQuery({
    queryKey: ['userBadges', userId],
    queryFn: () => fetchUserBadges(userId!),
    enabled: !!userId,
  });

  return {
    profile: profileQuery.data,
    stats: statsQuery.data,
    badges: badgesQuery.data,
    isLoading: profileQuery.isLoading || statsQuery.isLoading || badgesQuery.isLoading,
  };
}
