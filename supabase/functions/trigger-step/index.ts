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
    console.log('trigger-step: Start of main try block.');

    // --- Environment & Client Setup ---
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const windmillToken = Deno.env.get('WINDMILL_TOKEN')
    const windmillBaseUrl = Deno.env.get('WINDMILL_BASE_URL')
    const windmillMasterScriptPath = Deno.env.get('WINDMILL_MASTER_SCRIPT_PATH')
    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    
    // --- NEW GOOGLE API KEYS ---
    const googleApiKey = Deno.env.get('GOOGLE_API_KEY')
    const googleSearchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID')
    // ---------------------------

    console.log('trigger-step: Environment variables loaded.');
    console.log('trigger-step: SUPABASE_URL present:', !!supabaseUrl);
    console.log('trigger-step: SUPABASE_SERVICE_ROLE_KEY present:', !!serviceRoleKey);
    console.log('trigger-step: WINDMILL_TOKEN present:', !!windmillToken);
    console.log('trigger-step: WINDMILL_BASE_URL present:', !!windmillBaseUrl);
    console.log('trigger-step: WINDMILL_MASTER_SCRIPT_PATH present:', !!windmillMasterScriptPath);
    console.log('trigger-step: OPENROUTER_API_KEY present:', !!openrouterApiKey, 'Value (first 5 chars):', openrouterApiKey ? openrouterApiKey.substring(0, 5) : 'N/A');
    console.log('trigger-step: GOOGLE_API_KEY present:', !!googleApiKey, 'Value (first 5 chars):', googleApiKey ? googleApiKey.substring(0, 5) : 'N/A');
    console.log('trigger-step: GOOGLE_SEARCH_ENGINE_ID present:', !!googleSearchEngineId, 'Value (first 5 chars):', googleSearchEngineId ? googleSearchEngineId.substring(0, 5) : 'N/A');

    const missingEnvVars = [];
    if (!supabaseUrl) missingEnvVars.push('SUPABASE_URL');
    if (!serviceRoleKey) missingEnvVars.push('SUPABASE_SERVICE_ROLE_KEY');
    if (!windmillToken) missingEnvVars.push('WINDMILL_TOKEN');
    if (!windmillBaseUrl) missingEnvVars.push('WINDMILL_BASE_URL');
    if (!windmillMasterScriptPath) missingEnvVars.push('WINDMILL_MASTER_SCRIPT_PATH');
    if (!openrouterApiKey || openrouterApiKey.trim() === '') missingEnvVars.push('OPENROUTER_API_KEY');
    
    if (missingEnvVars.length > 0) {
      const errorMessage = `Missing critical environment variables: ${missingEnvVars.join(', ')}.`;
      console.error(`trigger-step: ${errorMessage}`);
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('trigger-step: All critical environment variables are present.');
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { projectId, userMessage, userId: userIdFromBody, fileMetadata } = await req.json();

    console.log('trigger-step: Request body parsed. projectId:', projectId, 'userMessage:', userMessage, 'userIdFromBody:', userIdFromBody);

    // --- Determine currentUserId ---
    let currentUserId: string | undefined;

    if (userIdFromBody) {
      currentUserId = userIdFromBody;
      console.log('trigger-step: User ID determined from request body:', currentUserId);
    } else {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        console.error('trigger-step: No Authorization header found.');
        return new Response(JSON.stringify({ error: 'Unauthorized: Missing Authorization header' }), {
            status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: authUser }, error: authUserError } = await supabaseAdmin.auth.getUser(token);

      if (authUserError || !authUser) {
        console.error('trigger-step: Error fetching authenticated user or user not found:', authUserError?.message);
        return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token or user not found' }), {
            status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      currentUserId = authUser.id;
      console.log('trigger-step: User ID determined from Authorization header:', currentUserId);
    }

    if (!currentUserId) {
      console.error('trigger-step: Could not determine user ID after all attempts.');
      return new Response(JSON.stringify({ error: 'Unauthorized: User ID could not be determined' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- Fetch User Data (using currentUserId) ---
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, credits_remaining, plan_type, role')
      .eq('id', currentUserId)
      .single();

    if (userError) {
      console.error('trigger-step: Error fetching user profile:', userError.message);
      throw userError;
    }
    if (!user) {
      console.error('trigger-step: User profile not found for ID:', currentUserId);
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('trigger-step: User profile fetched. Plan:', user.plan_type, 'Credits:', user.credits_remaining, 'Role:', user.role);

    // --- Project Data (only if projectId is provided) ---
    let project = null;
    if (projectId) {
      console.log('trigger-step: Fetching project data for projectId:', projectId);
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
    if (!projectId && user.role !== 'admin' && user.credits_remaining <= 0) {
      console.warn('trigger-step: Insufficient credits for new conversation for user:', user.id);
      return new Response(JSON.stringify({ error: 'Insufficient credits to start a new conversation.' }), {
        status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('trigger-step: Credit check passed.');

    // --- Determine Windmill Action ---
    let acao: string;
    if (!projectId) {
      acao = "start_new_project";
    } else if (user.role === 'admin') {
      acao = "demo_rapida";
    } else {
      acao = "continue_workflow";
    }
    console.log('trigger-step: Windmill action determined:', acao);

    // --- Insert user's message into chat_messages table (OPTIMISTIC UI) ---
    if (projectId && userMessage) {
      console.log('trigger-step: Attempting to insert user message into chat_messages.');
      const { error: insertMessageError } = await supabaseAdmin
        .from('chat_messages')
        .insert({
          project_id: projectId,
          user_id: user.id,
          author: 'user',
          content: userMessage,
          metadata: { 
            current_step: project?.current_step || 0,
            files: fileMetadata // Include file metadata in the chat message
          },
        });

      if (insertMessageError) {
        console.error('trigger-step: Error inserting user message into chat_messages:', insertMessageError);
      } else {
        console.log('trigger-step: User message inserted into chat_messages.');
      }
    }

    // --- Execute Windmill Script (without polling) ---
    try {
      const windmillExecutionUrl = `${windmillBaseUrl}/${windmillMasterScriptPath}`; 
      console.log('trigger-step: Attempting to call Windmill at constructed URL:', windmillExecutionUrl);

      const windmillArgs = {
        userMessage: userMessage,
        projectId: projectId,
        userId: user.id,
        userPlan: user.plan_type, // Renamed from planType to userPlan to match new script interface
        userRole: user.role,
        creditsRemaining: user.credits_remaining, // Added creditsRemaining
        currentStep: project?.current_step || 0,
        projectData: project,
        supabase_url: supabaseUrl,
        supabase_key: serviceRoleKey,
        openrouter_key: openrouterApiKey,
        
        // --- NEW GOOGLE ARGS ---
        googleApiKey: googleApiKey,
        googleCx: googleSearchEngineId,
        // -----------------------
        
        // --- FILE METADATA (Passed from frontend) ---
        fileMetadata: fileMetadata, 
        // --------------------------------------------
        
        acao: acao // Keeping acao for potential future use in Windmill
      };
      console.log('trigger-step: Windmill arguments being sent:', JSON.stringify(windmillArgs, null, 2));

      // Invoke Windmill and do NOT wait for its result.
      fetch(windmillExecutionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${windmillToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          args: windmillArgs
        })
      }).catch(err => console.error("trigger-step: Error triggering Windmill workflow (fire-and-forget):", err));

      console.log('trigger-step: Windmill workflow triggered (fire-and-forget).');

    } catch (windmillError: any) {
      console.error('trigger-step: Error during Windmill invocation (unexpected):', windmillError);
      return new Response(JSON.stringify({ error: `Failed to invoke Windmill: ${windmillError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('trigger-step: End of main try block, returning success response.');

    // --- Respond Immediately to the Client ---
    return new Response(JSON.stringify({ message: `Workflow triggered successfully. AI responses will appear shortly.` }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("trigger-step: Unhandled error in Edge Function:", error);
    return new Response(JSON.stringify({ error: error.message || "An unknown error occurred in the Edge Function." }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})