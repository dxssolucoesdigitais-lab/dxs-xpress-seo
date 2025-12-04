import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const windmillToken = Deno.env.get('WINDMILL_TOKEN')!
    const windmillAdminNotificationWebhookUrl = Deno.env.get('WINDMILL_WEBHOOK_URL_ADMIN_NOTIFICATION')!
    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')!

    if (!supabaseUrl || !serviceRoleKey || !windmillToken || !windmillAdminNotificationWebhookUrl || !openrouterApiKey) {
      throw new Error("Missing critical environment variables (Supabase, Windmill, OpenRouter).");
    }
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { record: newUser } = await req.json();

    if (!newUser || !newUser.id) {
      return new Response(JSON.stringify({ error: 'New user record is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- Trigger Windmill Workflow for Admin Notification ---
    const payload = {
      acao: "notify_new_user",
      userId: newUser.id,
      userEmail: newUser.email,
      userName: newUser.full_name,
      userRole: newUser.role,
      createdAt: newUser.created_at,
      supabase_url: supabaseUrl,
      supabase_key: serviceRoleKey,
      openrouter_key: openrouterApiKey,
      // serpi_api_key: Deno.env.get('SERPI_API_KEY'), // REMOVIDO
    };

    fetch(windmillAdminNotificationWebhookUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${windmillToken}`,
      },
      body: JSON.stringify(payload),
    }).catch(err => console.error("Error triggering Windmill admin notification webhook:", err));

    return new Response(JSON.stringify({ message: 'Admin notification sent to Windmill webhook successfully.' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})