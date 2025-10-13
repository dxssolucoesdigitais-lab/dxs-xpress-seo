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
    // User needs to set this environment variable in Supabase project settings
    const n8nAdminWebhook = Deno.env.get('N8N_WEBHOOK_URL_ADMIN') || 'http://192.168.0.216:5678/webhook/master-@001-xpress-seo'

    if (!supabaseUrl || !serviceRoleKey || !n8nAdminWebhook) {
      throw new Error("Missing Supabase environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, N8N_WEBHOOK_URL_ADMIN).");
    }
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // This function is triggered by a database event, so it receives the new user record directly.
    const { record: newUser } = await req.json();

    if (!newUser || !newUser.id) {
      return new Response(JSON.stringify({ error: 'New user record is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Trigger n8n webhook for admin notification
    fetch(n8nAdminWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: newUser.id,
        userEmail: newUser.email,
        userName: newUser.full_name,
        userRole: newUser.role,
        createdAt: newUser.created_at,
        // Add any other relevant user data
      }),
    }).catch(err => console.error("Error triggering n8n admin webhook:", err));

    return new Response(JSON.stringify({ message: 'Admin notification sent to n8n webhook successfully.' }), {
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