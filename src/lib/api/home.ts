import { supabase } from '../supabase';
import { Database } from '../../types/database';

type GoalRow = Database['public']['Tables']['goals']['Row'];
type MissionRow = Database['public']['Tables']['daily_missions']['Row'];
type WeeklyReviewRow = Database['public']['Tables']['weekly_reviews']['Row'];

export async function fetchMonthlyFootprint(userId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const startOfLastMonth = new Date(startOfMonth);
  startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

  // Current month
  const { data: current, error: err1 } = await supabase
    .from('activities')
    .select('co2_kg')
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString());
  
  if (err1) throw err1;

  // Last month
  const { data: last, error: err2 } = await supabase
    .from('activities')
    .select('co2_kg')
    .eq('user_id', userId)
    .gte('created_at', startOfLastMonth.toISOString())
    .lt('created_at', startOfMonth.toISOString());

  if (err2) throw err2;

  const currentTotal = current.reduce((sum, a) => sum + a.co2_kg, 0);
  const lastTotal = last.reduce((sum, a) => sum + a.co2_kg, 0);

  // If last month has no data, fallback to baseline
  let prevTotal = lastTotal;
  if (prevTotal === 0) {
    const { data: baseline } = await supabase
      .from('footprint_baselines')
      .select('baseline_co2_kg')
      .eq('user_id', userId)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .single();
    prevTotal = baseline?.baseline_co2_kg ?? 0;
  }

  const trendPct = prevTotal > 0 ? ((prevTotal - currentTotal) / prevTotal) * 100 : 0;

  return {
    currentTotal,
    prevTotal,
    trendPct
  };
}

export async function fetchStreak(userId: string) {
  const { data, error } = await supabase.rpc('get_current_streak', { p_user_id: userId });
  if (error) throw error;
  return data;
}

export async function fetchTodayMission(userId: string): Promise<MissionRow | null> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('daily_missions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // ignore not found
  
  // If no mission exists, hit the edge function to generate one
  if (!data) {
    await supabase.functions.invoke('generate-daily-mission', {
      body: { user_id: userId }
    });
    // fetch again
    const { data: newData, error: newErr } = await supabase
      .from('daily_missions')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();
    if (newErr) throw newErr;
    return newData;
  }
  return data;
}

export async function fetchActiveGoal(userId: string): Promise<GoalRow | null> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function fetchWeeklyReview(userId: string): Promise<WeeklyReviewRow | null> {
  const { data, error } = await supabase
    .from('weekly_reviews')
    .select('*')
    .eq('user_id', userId)
    .order('week_start', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function completeMission(userId: string, date: string) {
  const { error } = await supabase.rpc('complete_daily_mission', { p_user_id: userId, p_date: date });
  if (error) throw error;
}
