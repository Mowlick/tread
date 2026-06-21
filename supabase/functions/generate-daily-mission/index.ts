// supabase/functions/generate-daily-mission/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MISSIONS = [
  { category: 'transport', text: 'Walk or bike instead of driving today', xp: 35 },
  { category: 'energy',    text: 'Turn off lights in empty rooms', xp: 20 },
  { category: 'food',      text: 'Have one plant-based meal today', xp: 40 },
  { category: 'shopping',  text: 'Avoid single-use plastics today', xp: 25 },
  { category: 'waste',     text: 'Properly sort recycling and compost', xp: 20 },
];

serve(async (req) => {
  // Can be triggered by cron or manual fetch
  if (req.method !== "POST") return new Response("ok", { status: 200 });

  try {
    // If triggered by client, they can pass user_id. If cron, we run for all users.
    const body = await req.json().catch(() => ({}));
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const today = new Date().toISOString().split('T')[0];

    // Build query to find users needing a mission
    let usersQuery = supabase.from('users').select('id');
    if (body.user_id) {
      usersQuery = usersQuery.eq('id', body.user_id);
    }
    const { data: users, error: usersErr } = await usersQuery;
    if (usersErr) throw usersErr;

    const missionsToInsert = [];

    for (const u of users || []) {
      // Check if mission already exists for today
      const { data: existing } = await supabase
        .from('daily_missions')
        .select('id')
        .eq('user_id', u.id)
        .eq('date', today)
        .single();
        
      if (!existing) {
        // Just pick a random mission for now (can be optimized later)
        const m = MISSIONS[Math.floor(Math.random() * MISSIONS.length)];
        missionsToInsert.push({
          user_id: u.id,
          date: today,
          category: m.category,
          action_text: m.text,
          xp_reward: m.xp,
          completed: false
        });
      }
    }

    if (missionsToInsert.length > 0) {
      const { error } = await supabase.from('daily_missions').insert(missionsToInsert);
      if (error) throw error;
    }

    return new Response(JSON.stringify({ success: true, count: missionsToInsert.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});
