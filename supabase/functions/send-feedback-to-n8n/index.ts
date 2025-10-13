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
    const n8nFeedbackWebhook = Deno.env.get('N8N_WEBHOOK_URL_FEEDBACK') || 'http://192.168.0.216:5678/webhook/feedback-@000-xpress-seo'

    if (!supabaseUrl || !serviceRoleKey || !n8nFeedbackWebhook) {
      throw new Error("Missing Supabase environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, N8N_WEBHOOK_URL_FEEDBACK).");
    }
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization')!
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const { feedbackContent, feedbackId } = await req.json();
    if (!feedbackContent || !feedbackId) {
      return new Response(JSON.stringify({ error: 'feedbackContent and feedbackId are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch user details to include in the webhook payload
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;

    // Trigger n8n webhook
    fetch(n8nFeedbackWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feedbackId: feedbackId,
        userId: user.id,
        userName: userData?.full_name,
        userEmail: userData?.email,
        content: feedbackContent,
        timestamp: new Date().toISOString(),
      }),
    }).catch(err => console.error("Error triggering n8n feedback webhook:", err));

    return new Response(JSON.stringify({ message: 'Feedback sent to n8n webhook successfully.' }), {
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