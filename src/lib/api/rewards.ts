import { supabase } from '../supabase';

export async function fetchXpBalance(userId: string) {
  const { data, error } = await supabase
    .from('xp_transactions')
    .select('amount')
    .eq('user_id', userId);
  if (error) throw error;
  return data.reduce((sum, t) => sum + t.amount, 0);
}

export async function fetchRewardsCatalog() {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('active', true);
  if (error) throw error;
  return data;
}

export async function redeemReward(userId: string, rewardId: string) {
  const { data, error } = await supabase.rpc('redeem_reward', {
    p_user_id: userId,
    p_reward_id: rewardId
  });
  if (error) throw error;
  
  // rpc returns a jsonb object like { error: '...'} or { success: true }
  if (data && (data as any).error) {
    throw new Error((data as any).error);
  }
  return data;
}
