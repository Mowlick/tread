import { supabase } from '../supabase';

export async function logActivity(params: {
  userId: string;
  category: string;
  subcategory: string;
  amount: number;
  unit: string;
}) {
  const { data, error } = await supabase.rpc('log_activity', {
    p_user_id: params.userId,
    p_category: params.category,
    p_subcategory: params.subcategory,
    p_amount: params.amount,
    p_unit: params.unit,
  });
  if (error) throw error;
  return data;
}

export async function fetchRecentActivities(userId: string, pageParam = 0) {
  const PAGE_SIZE = 20;
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);
    
  if (error) throw error;
  return {
    data,
    nextPage: data.length === PAGE_SIZE ? pageParam + 1 : undefined,
  };
}
