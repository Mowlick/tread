import { supabase } from '../supabase';

export async function fetchActiveGoal(userId: string) {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function setGoal(userId: string, targetPct: number, durationDays: number) {
  const { data, error } = await supabase.rpc('set_goal', {
    p_user_id: userId,
    p_target_pct: targetPct,
    p_duration_days: durationDays
  });
  if (error) throw error;
  return data;
}

export async function fetchTopImprovingCategories(userId: string, limit = 3) {
  const { data, error } = await supabase.rpc('get_top_improving_categories', {
    p_user_id: userId,
    p_limit: limit
  });
  if (error) throw error;
  return data;
}

export async function fetchActiveChallengesCount() {
  const { count, error } = await supabase
    .from('challenges')
    .select('id', { count: 'exact', head: true })
    .gte('ends_at', new Date().toISOString())
    .lte('starts_at', new Date().toISOString())
    .or('featured.eq.true'); // public is implicit via featured for now
  if (error) throw error;
  return count ?? 0;
}
