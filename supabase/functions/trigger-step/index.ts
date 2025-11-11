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

  console.log('trigger-step: Function started.');

  try {
    // --- Environment & Client Setup ---
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const windmillToken = Deno.env.get('WINDMILL_TOKEN')
    const windmillWorkspaceAdminDemo = Deno.env.get('WINDMILL_WORKSPACE_ADMIN_DEMO')
    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY') // Nova variável para OpenRouter

    // Get webhook URLs for each plan from environment variables (n8n still in standby)
    const n8nWebhookFree = Deno.env.get('N8N_WEBHOOK_URL_FREE')
    const n8nWebhookBasic = Deno.env.get('N8N_WEBHOOK_URL_BASIC')
    const n8nWebhookStandard = Deno.env.get('N8N_WEBHOOK_URL_STANDARD')
    const n8nWebhookPremium = Deno.env.get('N8N_WEBHOOK_URL_PREMIUM')

    console.log('trigger-step: Environment variables loaded.');
    console.log('trigger-step: WINDMILL_TOKEN present:', !!windmillToken);
    console.log('trigger-step: WINDMILL_WORKSPACE_ADMIN_DEMO present:', !!windmillWorkspaceAdminDemo);
    console.log('trigger-step: OPENROUTER_API_KEY present:', !!openrouterApiKey);
    console.log('trigger-step: N8N_WEBHOOK_URL_FREE present:', !!n8nWebhookFree);
    console.log('trigger-step: N8N_WEBHOOK_URL_BASIC present:', !!n8nWebhookBasic);
    console.log('trigger-step: N8N_WEBHOOK_URL_STANDARD present:', !!n8nWebhookStandard);
    console.log('trigger-step: N8N_WEBHOOK_URL_PREMIUM present:', !!n8nWebhookPremium);


    if (!supabaseUrl || !serviceRoleKey || !windmillToken || !windmillWorkspaceAdminDemo || !openrouterApiKey) {
      console.error('trigger-step: Missing critical environment variables (Supabase, Windmill, OpenRouter).');
      throw new Error("Missing critical environment variables (Supabase, Windmill, OpenRouter).");
    }
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { projectId, userMessage } = await req.json(); // Recebe userMessage opcionalmente

    console.log('trigger-step: Request body parsed. projectId:', projectId, 'userMessage:', userMessage);

    // --- Fetch User Data (always needed for credit/role check) ---
    const authHeader = req.headers.get('Authorization')!
    console.log('trigger-step: Auth header present:', !!authHeader);
    const { data: { user: authUser }, error: authUserError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (authUserError) {
      console.error('trigger-step: Error fetching authenticated user:', authUserError.message);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!authUser) {
        console.error('trigger-step: No authenticated user found.');
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
    console.log('trigger-step: Authenticated user ID:', authUser.id);

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, credits_remaining, plan_type, role')
      .eq('id', authUser.id)
      .single();

    if (userError) {
      console.error('trigger-step: Error fetching user profile:', userError.message);
      throw userError;
    }
    if (!user) {
      console.error('trigger-step: User profile not found for ID:', authUser.id);
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('trigger-step: User profile fetched. Plan:', user.plan_type, 'Credits:', user.credits_remaining, 'Role:', user.role);

    // --- Project Data (only if projectId is provided) ---
    let project = null;
    if (projectId) {
      const { data: projectData, error: projectError } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error('trigger-step: Error fetching project:', projectError.message);
        throw projectError;
      }
      if (!projectData) {
        console.error('trigger-step: Project not found for ID:', projectId);
        return new Response(JSON.stringify({ error: 'Project not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      project = projectData;
      console.log('trigger-step: Project data fetched. Status:', project.status, 'Current Step:', project.current_step);
    } else {
      console.log('trigger-step: No projectId provided, initiating new conversation flow.');
    }

    // --- Credit Gatekeeper Logic: Only for NEW projects/conversations ---
    // If projectId is null, it means a new conversation is being initiated.
    if (!projectId && user.role !== 'admin' && user.credits_remaining <= 0) {
      console.warn('trigger-step: Insufficient credits for new conversation for user:', user.id);
      return new Response(JSON.stringify({ error: 'Insufficient credits to start a new conversation.' }), {
        status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('trigger-step: Credit check passed.');

    // --- Insert user's message into chat_messages table (OPTIMISTIC UI) ---
    // This ensures the user's message appears immediately in the UI via real-time subscription.
    if (projectId && userMessage) {
      console.log('trigger-step: Attempting to insert user message into chat_messages.');
      const { error: insertMessageError } = await supabaseAdmin
        .from('chat_messages')
        .insert({
          project_id: projectId,
          user_id: user.id,
          author: 'user',
          content: userMessage,
          metadata: { current_step: project?.current_step || 0 }, // Adiciona o current_step ao metadata
        });

      if (insertMessageError) {
        console.error('trigger-step: Error inserting user message into chat_messages:', insertMessageError);
        // Don't throw, try to proceed with n8n call if message insertion failed
      } else {
        console.log('trigger-step: User message inserted into chat_messages.');
      }
    }


    // --- Select Webhook based on User Role (Admin Override) or Plan ---
    let targetWebhookUrl;
    let targetWebhookHeaders = { 'Content-Type': 'application/json' };
    let payloadBody: any = {
      projectId: projectId,
      userId: user.id,
      planType: user.plan_type,
      userRole: user.role,
      currentStep: project?.current_step || 0, // Pass current step if project exists
      projectData: project, // Pass full project data if exists
      userMessage: userMessage || null, // Inclui a mensagem do usuário no payload
    };

    if (user.role === 'admin') {
      // Use Windmill for admin
      targetWebhookUrl = `https://${windmillWorkspaceAdminDemo}.windmill.dev/api/w/u/admin/demo/master_admin_demo`;
      targetWebhookHeaders['Authorization'] = `Bearer ${windmillToken}`;
      payloadBody = {
        ...payloadBody,
        acao: "demo_rapida", // Ação específica para o script Windmill
        supabase_url: supabaseUrl,
        supabase_key: serviceRoleKey, // Passa a service_role_key como supabase_key
        openrouter_key: openrouterApiKey,
      };
      console.log('trigger-step: User is admin, using Windmill webhook:', targetWebhookUrl);
    } else {
      // Keep n8n for other plans for now
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
      console.log('trigger-step: User plan:', userPlan, 'using n8n webhook:', targetWebhookUrl);

      if (!targetWebhookUrl) {
        console.error(`trigger-step: n8n webhook URL for plan '${userPlan}' is not configured.`);
        throw new Error(`n8n webhook URL for plan '${userPlan}' is not configured.`);
      }
    }

    // --- Trigger Workflow ---
    console.log('trigger-step: Attempting to call webhook:', targetWebhookUrl);
    const response = await fetch(targetWebhookUrl, {
      method: 'POST',
      headers: targetWebhookHeaders,
      body: JSON.stringify(payloadBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`trigger-step: Failed to trigger workflow. Status: ${response.status}, Body: ${errorBody}`);
      throw new Error(`Failed to trigger workflow: ${response.status} - ${errorBody}`);
    }
    console.log('trigger-step: Workflow triggered successfully.');

    // --- Respond Immediately to the Client ---
    return new Response(JSON.stringify({ message: `Workflow triggered successfully for plan '${user.plan_type}' (role: ${user.role}).` }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("trigger-step: Unhandled error in Edge Function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})