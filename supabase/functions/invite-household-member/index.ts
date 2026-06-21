// supabase/functions/invite-household-member/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Extremely simple random token generator for invites
function generateToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { household_id, email } = await req.json();
    if (!household_id || !email) {
      return new Response(JSON.stringify({ error: "missing_params" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Verify user is owner/member via auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, // service role for db bypassing RLS since we verify manually
    );
    
    // Auth client to get user
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Check membership
    const { data: member } = await supabase
      .from('household_members')
      .select('role')
      .eq('household_id', household_id)
      .eq('user_id', user.id)
      .single();

    if (!member) throw new Error("Not a member of this household");

    const token = generateToken();

    // Insert invite
    const { error } = await supabase.from('invites').insert({
      household_id,
      email,
      token,
      status: 'pending'
    });

    if (error) throw error;

    // TODO: Actually send email via Resend or similar
    console.log(`Sending invite email to ${email} with token ${token}`);

    return new Response(JSON.stringify({ success: true, token }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("error:", e);
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" }
    });
  }
});
