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
    // --- Environment & Client Setup ---
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    // Get webhook URLs for each plan from environment variables
    const n8nWebhookFree = Deno.env.get('N8N_WEBHOOK_URL_FREE')
    const n8nWebhookBasic = Deno.env.get('N8N_WEBHOOK_URL_BASIC')
    const n8nWebhookStandard = Deno.env.get('N8N_WEBHOOK_URL_STANDARD')
    const n8nWebhookPremium = Deno.env.get('N8N_WEBHOOK_URL_PREMIUM')

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase environment variables.");
    }
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { projectId } = await req.json();

    if (!projectId) {
      return new Response(JSON.stringify({ error: 'projectId is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- Fetch Project & User Data ---
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;
    if (!project) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, credits_remaining, plan_type')
      .eq('id', project.user_id)
      .single();

    if (userError) throw userError;
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- Validation ---
    if (project.status !== 'in_progress') {
      return new Response(JSON.stringify({ message: `Project status is '${project.status}'. No action taken.` }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (user.credits_remaining <= 0) {
      await supabaseAdmin.from('projects').update({ status: 'paused' }).eq('id', projectId);
      return new Response(JSON.stringify({ error: 'Insufficient credits.' }), {
        status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- Select Webhook based on User Plan ---
    let targetWebhookUrl;
    const userPlan = user.plan_type || 'free';

    switch (userPlan) {
      case 'free':
        targetWebhookUrl = n8nWebhookFree;
        break;
      case 'basic':
        targetWebhookUrl = n8nWebhookBasic;
        break;
      case 'standard':
        targetWebhookUrl = n8nWebhookStandard;
        break;
      case 'premium':
        targetWebhookUrl = n8nWebhookPremium;
        break;
      default:
        targetWebhookUrl = n8nWebhookFree; // Fallback to free plan
    }

    if (!targetWebhookUrl) {
      throw new Error(`n8n webhook URL for plan '${userPlan}' is not configured.`);
    }

    // --- Trigger n8n Workflow ---
    fetch(targetWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: project.id,
        userId: user.id,
        planType: userPlan,
        currentStep: project.current_step,
        projectData: project,
      }),
    }).catch(err => console.error("Error triggering n8n webhook:", err));

    // --- Respond Immediately to the Client ---
    return new Response(JSON.stringify({ message: `Workflow for step ${project.current_step} triggered successfully for plan '${userPlan}'.` }), {
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