import { supabase } from '../supabase';

export async function fetchMessages(userId: string, limit = 30) {
  const { data, error } = await supabase
    .from('sol_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data.reverse(); // Return chronological
}

export async function sendMessage(userId: string, message: string, context?: string) {
  const { data, error } = await supabase.functions.invoke('sol-chat', {
    body: { user_id: userId, message, context }
  });
  if (error) throw error;
  return data as { reply: string; error?: string; message?: string };
}

// For optimistic updates
export async function insertUserMessage(userId: string, content: string) {
  const { data, error } = await supabase.from('sol_messages').insert({
    user_id: userId,
    role: 'user',
    content
  }).select().single();
  if (error) throw error;
  return data;
}
