import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// Webhook URLs from environment variables (secrets)
const N8N_BRONZE_WEBHOOK_URL = Deno.env.get('N8N_BRONZE_WEBHOOK_URL')
const N8N_PRATA_WEBHOOK_URL = Deno.env.get('N8N_PRATA_WEBHOOK_URL')
const N8N_OURO_WEBHOOK_URL = Deno.env.get('N8N_OURO_WEBHOOK_URL')
const N8N_DEFAULT_WEBHOOK_URL = Deno.env.get('N8N_DEFAULT_WEBHOOK_URL') // For free/default plan

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase environment variables.");
    }
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { projectId } = await req.json();

    if (!projectId) {
      return new Response(JSON.stringify({ error: 'projectId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get project details
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('user_id, status')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;
    if (!project) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prevent workflow trigger if project is not in progress
    if (project.status !== 'in_progress') {
      return new Response(JSON.stringify({ error: `Project is not in progress. Current status: ${project.status}` }), {
        status: 409, // Conflict
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's credits and plan type
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('credits_remaining, plan_type')
      .eq('id', project.user_id)
      .single();

    if (userError) throw userError;
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if the user has enough credits
    if (user.credits_remaining <= 0) {
      return new Response(JSON.stringify({ error: 'Insufficient credits to start the next step.' }), {
        status: 402, // Payment Required
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Determine which webhook to call based on the user's plan
    let webhookUrl;
    switch (user.plan_type) {
      case 'bronze':
        webhookUrl = N8N_BRONZE_WEBHOOK_URL;
        break;
      case 'prata':
        webhookUrl = N8N_PRATA_WEBHOOK_URL;
        break;
      case 'ouro':
        webhookUrl = N8N_OURO_WEBHOOK_URL;
        break;
      default:
        webhookUrl = N8N_DEFAULT_WEBHOOK_URL; // Fallback for 'free' or null plans
    }

    if (!webhookUrl) {
      console.error(`No webhook URL configured for plan: ${user.plan_type || 'default'}`);
      throw new Error(`Workflow for plan '${user.plan_type || 'default'}' is not configured.`);
    }

    // Trigger the n8n workflow
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    });

    if (!webhookResponse.ok) {
      const errorBody = await webhookResponse.text();
      console.error(`Webhook for plan ${user.plan_type} failed for project ${projectId}. Status: ${webhookResponse.status}. Body: ${errorBody}`);
      throw new Error(`Failed to trigger workflow. n8n webhook returned status ${webhookResponse.status}.`);
    }

    console.log(`User ${project.user_id} (Plan: ${user.plan_type}) has ${user.credits_remaining} credits. Successfully triggered workflow for project: ${projectId}`);
    
    return new Response(JSON.stringify({ message: `Workflow triggered for project ${projectId} using ${user.plan_type} plan.` }), {
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