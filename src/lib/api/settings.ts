import { supabase } from '../supabase';

export async function fetchIntegrations(userId: string) {
  const { data, error } = await supabase
    .from('integrations')
    .select('provider, connected')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
}

export async function updateIntegration(userId: string, provider: string, connected: boolean) {
  const { error } = await supabase
    .from('integrations')
    .upsert({ user_id: userId, provider, connected }, { onConflict: 'user_id,provider' });
  if (error) throw error;
}

export async function fetchNotificationPrefs(userId: string) {
  const { data, error } = await supabase
    .from('notification_prefs')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateNotificationPrefs(userId: string, prefs: any) {
  const { error } = await supabase
    .from('notification_prefs')
    .upsert({ user_id: userId, ...prefs }, { onConflict: 'user_id' });
  if (error) throw error;
}

export async function exportUserData() {
  const { data, error } = await supabase.functions.invoke('export-user-data');
  if (error) throw error;
  return data as { success: boolean; url: string; error?: string };
}

export async function deleteAccount() {
  const { data, error } = await supabase.functions.invoke('delete-account');
  if (error) throw error;
  return data;
}
