// supabase/functions/generate-weekly-review/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method !== "POST") return new Response("ok", { status: 200 });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const today = new Date();
    // Week start (Monday)
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const { data: users, error: usersErr } = await supabase.from('users').select('id, name');
    if (usersErr) throw usersErr;

    const reviewsToInsert = [];

    for (const u of users || []) {
      // Very basic logic for now. We can add actual weekly logic using activities table later.
      reviewsToInsert.push({
        user_id: u.id,
        week_start: weekStartStr,
        summary_text: `You had a solid week, ${u.name}. Keep stacking those small wins!`,
        key_metric: '↑2% vs last week'
      });
    }

    if (reviewsToInsert.length > 0) {
      const { error } = await supabase.from('weekly_reviews').upsert(reviewsToInsert, { onConflict: 'user_id, week_start' });
      if (error) throw error;
    }

    return new Response(JSON.stringify({ success: true, count: reviewsToInsert.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});
