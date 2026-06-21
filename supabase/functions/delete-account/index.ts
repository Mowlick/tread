// supabase/functions/delete-account/index.ts
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// @ts-ignore
serve(async (req: any) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      // @ts-ignore
      Deno.env.get("SUPABASE_URL")!,
      // @ts-ignore
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, // service role needed to delete auth user
    );
    
    const authClient = createClient(
      // @ts-ignore
      Deno.env.get("SUPABASE_URL")!,
      // @ts-ignore
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const userId = user.id;

    // Hard-delete personal content
    await supabase.from("activities").delete().eq("user_id", userId);
    await supabase.from("sol_messages").delete().eq("user_id", userId);
    await supabase.from("assessment_responses").delete().eq("user_id", userId);

    // The rest (users, footprint_baselines, goals) should cascade delete when auth user is deleted
    // But we anonymize ledger data before cascading deletes it if we want to keep it.
    // For this implementation, we will just delete the auth user, which cascades to public.users and everything referencing it via ON DELETE CASCADE.
    
    // Delete user from auth schema
    const { error: deleteErr } = await supabase.auth.admin.deleteUser(userId);
    if (deleteErr) throw deleteErr;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("error:", e);
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" }
    });
  }
});
