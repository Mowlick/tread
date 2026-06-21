import { supabase } from '../supabase';

export async function fetchFriendsLeaderboard(userId: string) {
  // First get friends list
  const { data: friends, error: friendsErr } = await supabase
    .from('friends')
    .select('friend_id, status')
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .eq('status', 'accepted');
  if (friendsErr) throw friendsErr;

  const friendIds = friends.map(f => f.friend_id === userId ? f.friend_id : f.friend_id);
  // Include self
  friendIds.push(userId);

  // Then fetch from materialized view
  const { data, error } = await supabase
    .from('friend_leaderboard_mv')
    .select('*')
    .in('user_id', friendIds)
    .order('improvement_pct', { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchHouseholdProgress(householdId: string) {
  if (!householdId) return { current: 0, baseline: 0 };
  
  // Aggregate from activities via members
  const { data: members, error: memErr } = await supabase
    .from('household_members')
    .select('user_id')
    .eq('household_id', householdId);
  if (memErr) throw memErr;

  const userIds = members.map(m => m.user_id);
  if (userIds.length === 0) return { current: 0, baseline: 0 };

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: acts, error: actErr } = await supabase
    .from('activities')
    .select('co2_kg')
    .in('user_id', userIds)
    .gte('created_at', startOfMonth.toISOString());
  if (actErr) throw actErr;

  const current = acts.reduce((sum, a) => sum + a.co2_kg, 0);

  // Baseline approximation: sum of latest baseline per member
  let baselineTotal = 0;
  for (const uid of userIds) {
    const { data: b } = await supabase
      .from('footprint_baselines')
      .select('baseline_co2_kg')
      .eq('user_id', uid)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .single();
    baselineTotal += b?.baseline_co2_kg || 0;
  }

  return { current, baseline: baselineTotal };
}

export async function fetchHouseholdMembers(householdId: string) {
  if (!householdId) return [];
  const { data: members, error } = await supabase
    .from('household_members')
    .select('user_id, role, users!inner(name, avatar_url)')
    .eq('household_id', householdId);
  if (error) throw error;
  
  return members.map(m => ({
    id: m.user_id,
    name: m.users.name,
    avatar_url: m.users.avatar_url,
    role: m.role
  }));
}
