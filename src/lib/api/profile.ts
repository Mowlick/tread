import { supabase } from '../supabase';

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchProfileStats(userId: string) {
  const { data, error } = await supabase.rpc('get_profile_stats', { p_user_id: userId });
  if (error) throw error;
  return data?.[0] || { co2_saved_kg: 0, current_streak: 0, lifetime_xp: 0 };
}

export async function fetchUserBadges(userId: string) {
  // Get all badges
  const { data: allBadges, error: err1 } = await supabase.from('badges').select('*');
  if (err1) throw err1;

  // Get earned badges
  const { data: earned, error: err2 } = await supabase
    .from('user_badges')
    .select('badge_id, earned_at')
    .eq('user_id', userId);
  if (err2) throw err2;

  const earnedIds = new Set(earned.map(e => e.badge_id));
  
  return allBadges.map(b => ({
    ...b,
    earned: earnedIds.has(b.id),
    earned_at: earned.find(e => e.badge_id === b.id)?.earned_at
  }));
}
