// supabase/functions/export-user-data/index.ts
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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
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

    // Fetch all user data concurrently
    const [
      { data: profile },
      { data: activities },
      { data: goals },
      { data: solMessages },
      { data: xpTransactions },
      { data: redemptions },
    ] = await Promise.all([
      supabase.from("users").select("*").eq("id", userId).single(),
      supabase.from("activities").select("*").eq("user_id", userId),
      supabase.from("goals").select("*").eq("user_id", userId),
      supabase.from("sol_messages").select("*").eq("user_id", userId),
      supabase.from("xp_transactions").select("*").eq("user_id", userId),
      supabase.from("redemptions").select("*").eq("user_id", userId),
    ]);

    const exportData = {
      profile,
      activities: activities || [],
      goals: goals || [],
      solMessages: solMessages || [],
      xpTransactions: xpTransactions || [],
      redemptions: redemptions || [],
      exported_at: new Date().toISOString()
    };

    const jsonStr = JSON.stringify(exportData, null, 2);
    const fileName = `exports/${userId}_${Date.now()}.json`;

    // Ensure bucket exists in Supabase: 'user-exports' (private)
    const { error: uploadErr } = await supabase.storage
      .from('user-exports')
      .upload(fileName, jsonStr, { contentType: 'application/json' });

    if (uploadErr) {
      console.error("Upload error. Bucket may not exist.", uploadErr);
      // Fallback: just return JSON directly if storage isn't set up
      return new Response(jsonStr, {
        headers: { 
          ...CORS, 
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="tread_export.json"`
        },
      });
    }

    const { data: signedUrlData, error: signErr } = await supabase.storage
      .from('user-exports')
      .createSignedUrl(fileName, 3600); // 1 hour

    if (signErr) throw signErr;

    return new Response(JSON.stringify({ success: true, url: signedUrlData.signedUrl }), {
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
