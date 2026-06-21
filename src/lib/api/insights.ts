import { supabase } from '../supabase';

export async function fetchCategoryBreakdown(userId: string, monthStr?: string) {
  const { data, error } = await supabase.rpc('get_category_breakdown', { 
    p_user_id: userId,
    p_month: monthStr // Optional, defaults to current month in RPC
  });
  if (error) throw error;
  return data;
}

export async function fetchMonthlyTrend(userId: string, monthsBack = 6) {
  const { data, error } = await supabase.rpc('get_monthly_trend', {
    p_user_id: userId,
    p_months_back: monthsBack
  });
  if (error) throw error;
  return data;
}
