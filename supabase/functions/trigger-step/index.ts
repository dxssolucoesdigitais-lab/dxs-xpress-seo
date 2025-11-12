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
    console.log('trigger-step: Start of try block.');

    // --- Environment & Client Setup ---
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const windmillToken = Deno.env.get('WINDMILL_TOKEN')
    const windmillMasterScriptPath = Deno.env.get('WINDMILL_MASTER_SCRIPT_URL')
    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    const serpiApiKey = Deno.env.get('SERPI_API_KEY')

    console.log('trigger-step: Environment variables loaded.');
    console.log('trigger-step: SUPABASE_URL present:', !!supabaseUrl);
    console.log('trigger-step: SUPABASE_SERVICE_ROLE_KEY present:', !!serviceRoleKey);
    console.log('trigger-step: WINDMILL_TOKEN present:', !!windmillToken);
    console.log('trigger-step: WINDMILL_MASTER_SCRIPT_PATH present:', !!windmillMasterScriptPath);
    console.log('trigger-step: OPENROUTER_API_KEY present:', !!openrouterApiKey);
    console.log('trigger-step: SERPI_API_KEY present:', !!serpiApiKey);

    const missingEnvVars = [];
    if (!supabaseUrl) missingEnvVars.push('SUPABASE_URL');
    if (!serviceRoleKey) missingEnvVars.push('SUPABASE_SERVICE_ROLE_KEY');
    if (!windmillToken) missingEnvVars.push('WINDMILL_TOKEN');
    if (!windmillMasterScriptPath) missingEnvVars.push('WINDMILL_MASTER_SCRIPT_URL');
    if (!openrouterApiKey) missingEnvVars.push('OPENROUTER_API_KEY');
    if (!serpiApiKey) missingEnvVars.push('SERPI_API_KEY');

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
    const { projectId, userMessage, userId: userIdFromBody } = await req.json();

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
          metadata: { current_step: project?.current_step || 0 },
        });

      if (insertMessageError) {
        console.error('trigger-step: Error inserting user message into chat_messages:', insertMessageError);
      } else {
        console.log('trigger-step: User message inserted into chat_messages.');
      }
    }

    let aiMessageContent: string; // This will be the content for chat_messages.content

    // --- Execute Windmill Script and Poll for Result ---
    try {
      console.log('trigger-step: WINDMILL_MASTER_SCRIPT_URL value from env:', windmillMasterScriptPath); // NOVO LOG
      const windmillExecutionUrl = `https://app.windmill.dev/api/w/${windmillMasterScriptPath}/jobs/run`;
      console.log('trigger-step: Attempting to call Windmill at constructed URL:', windmillExecutionUrl); // Log mais explícito
      const executionResponse = await fetch(windmillExecutionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${windmillToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          args: {
            userMessage: userMessage,
            projectId: projectId,
            userId: user.id,
            planType: user.plan_type,
            userRole: user.role,
            currentStep: project?.current_step || 0,
            projectData: project,
            supabase_url: supabaseUrl,
            supabase_key: serviceRoleKey,
            openrouter_key: openrouterApiKey,
            serpi_api_key: serpiApiKey,
            acao: acao
          }
        })
      });

      const executionText = await executionResponse.text();
      console.log('trigger-step: Windmill execution response status:', executionResponse.status);
      console.log('trigger-step: Windmill execution response body (first 200 chars):', executionText.substring(0, Math.min(executionText.length, 200)));

      if (!executionResponse.ok) {
        console.error('trigger-step: Windmill Execution Error:', executionResponse.status, executionText);
        aiMessageContent = JSON.stringify({
          type: 'error',
          data: {
            title: 'Erro na Execução do Windmill',
            message: `Falha ao iniciar o workflow no Windmill (Status ${executionResponse.status}). Detalhes: ${executionText.substring(0, 200)}...`
          }
        });
      } else {
        let executionId;
        try {
          const executionData = JSON.parse(executionText);
          executionId = executionData.id || executionData;
        } catch (parseError: any) {
          executionId = executionText.trim();
          console.warn('trigger-step: Could not parse Windmill execution response as JSON, using raw text as ID:', executionId, 'Error:', parseError.message);
        }

        console.log('trigger-step: Windmill Execution ID:', executionId);

        const maxAttempts = 15;
        const delayMs = 1500;
        let pollingSuccess = false;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
          
          console.log(`trigger-step: Polling attempt ${attempt + 1} for Windmill job ${executionId}`);
          const resultResponse = await fetch(`https://app.windmill.dev/api/w/jobs/${executionId}/result`, {
            headers: {
              'Authorization': `Bearer ${windmillToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (resultResponse.ok) {
            const resultText = await resultResponse.text();
            console.log(`trigger-step: Attempt ${attempt + 1} result (first 200 chars):`, resultText.substring(0, Math.min(resultText.length, 200)));
            
            try {
              const resultData = JSON.parse(resultText);
              
              // CRITICAL CHECK: Process structured response from Windmill
              if (resultData && (resultData.completed || resultData.type === 'structured_response' || resultData.result)) {
                let finalResponseContent: string;
                
                if (resultData.type === 'structured_response' && resultData.messages) {
                  finalResponseContent = JSON.stringify({
                    type: 'text',
                    data: resultData.messages.map((msg: any) => msg.data || msg.content).join('\n\n')
                  });
                } else if (resultData.result) {
                  const windmillResult = typeof resultData.result === 'string' 
                    ? JSON.parse(resultData.result) 
                    : resultData.result;
                  
                  if (windmillResult.type === 'structured_response' && windmillResult.messages) {
                    finalResponseContent = JSON.stringify({
                      type: 'text',
                      data: windmillResult.messages.map((msg: any) => msg.data || msg.content).join('\n\n')
                    });
                  } else if (windmillResult.type && windmillResult.data) {
                    finalResponseContent = JSON.stringify(windmillResult);
                  } else {
                    finalResponseContent = JSON.stringify({ type: 'text', data: JSON.stringify(windmillResult) });
                  }
                } else if (resultData.type && resultData.data) {
                   finalResponseContent = JSON.stringify(resultData);
                }
                else {
                  finalResponseContent = JSON.stringify({ type: 'text', data: JSON.stringify(resultData) });
                }
                
                aiMessageContent = finalResponseContent;
                pollingSuccess = true;
                break; // Exit polling loop
              }
            } catch (parseError: any) {
              console.log(`trigger-step: Attempt ${attempt + 1}: Parsing error, continuing polling...`, parseError.message);
              // Continues polling
            }
          } else {
            console.log(`trigger-step: Attempt ${attempt + 1}: Result not ready, status: ${resultResponse.status}`);
          }
        }

        if (!pollingSuccess) {
          aiMessageContent = JSON.stringify({
            type: 'error',
            data: {
              title: 'Erro no Fluxo de Trabalho',
              message: `Timeout aguardando resposta do Windmill para execução ${executionId}.`
            }
          });
        }
      }
    } catch (windmillError: any) {
      console.error('trigger-step: Error during Windmill interaction:', windmillError);
      aiMessageContent = JSON.stringify({
        type: 'error',
        data: {
          title: 'Erro Interno da IA',
          message: `Ocorreu um erro ao interagir com o sistema de IA: ${windmillError.message.substring(0, 200)}...`
        }
      });
    }

    // Insert AI's response (or error message) into chat_messages table
    if (projectId) {
      console.log('trigger-step: Attempting to insert AI message into chat_messages.');
      const { error: insertAiMessageError } = await supabaseAdmin
        .from('chat_messages')
        .insert({
          project_id: projectId,
          user_id: user.id,
          author: 'ai',
          content: aiMessageContent,
          metadata: { current_step: project?.current_step || 0 },
        });

      if (insertAiMessageError) {
        console.error('trigger-step: Error inserting AI message into chat_messages:', insertAiMessageError);
      } else {
        console.log('trigger-step: AI message inserted into chat_messages.');
      }
    }
    console.log('trigger-step: End of try block, before final response.');

    // --- Respond Immediately to the Client ---
    // Always return 200 OK if the Edge Function itself didn't crash,
    // even if Windmill returned an error or non-JSON. The actual error
    // will be in the chat message content.
    return new Response(JSON.stringify({ message: `Workflow triggered successfully, response processed.`, aiResponseContent: aiMessageContent }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("trigger-step: Unhandled error in Edge Function:", error);
    return new Response(JSON.stringify({ error: error.message || "An unknown error occurred in the Edge Function." }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})