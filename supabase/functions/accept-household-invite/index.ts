// supabase/functions/accept-household-invite/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { token } = await req.json();
    if (!token) {
      return new Response(JSON.stringify({ error: "missing_token" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Verify user is authenticated
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
    const { data: { user }, error: authErr } = await authClient.auth.getUser();
    if (authErr || !user) throw new Error("Not authenticated");

    // Check invite
    const { data: invite, error: inviteErr } = await supabase
      .from('invites')
      .select('id, household_id, status, expires_at')
      .eq('token', token)
      .single();

    if (inviteErr || !invite) throw new Error("Invalid token");
    if (invite.status !== 'pending') throw new Error("Invite is no longer valid");
    if (new Date(invite.expires_at) < new Date()) {
      await supabase.from('invites').update({ status: 'expired' }).eq('id', invite.id);
      throw new Error("Invite expired");
    }

    // Insert user into household
    const { error: insertErr } = await supabase.from('household_members').insert({
      household_id: invite.household_id,
      user_id: user.id,
      role: 'member'
    });

    if (insertErr) {
      // User might already be a member
      if (insertErr.code !== '23505') throw insertErr;
    }

    // Update user row to set active household
    await supabase.from('users').update({ household_id: invite.household_id }).eq('id', user.id);

    // Mark invite as accepted
    await supabase.from('invites').update({ status: 'accepted' }).eq('id', invite.id);

    return new Response(JSON.stringify({ success: true, household_id: invite.household_id }), {
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
