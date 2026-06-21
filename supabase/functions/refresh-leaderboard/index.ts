// supabase/functions/refresh-leaderboard/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method !== "POST") return new Response("ok", { status: 200 });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Using rpc to refresh the materialized view
    // Note: We need to create this RPC first in the DB! We'll add it to migrations or just use raw query if allowed.
    // For now, we assume an RPC `refresh_friend_leaderboard` exists.
    
    const { error } = await supabase.rpc('refresh_friend_leaderboard');
    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});
