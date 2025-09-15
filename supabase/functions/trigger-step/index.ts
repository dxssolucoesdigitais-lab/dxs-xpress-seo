import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

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

    // Get user_id from the project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;
    if (!project) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the user's current credit balance
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('credits_remaining')
      .eq('id', project.user_id)
      .single();

    if (userError) throw userError;
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if the user has enough credits to proceed
    if (user.credits_remaining <= 0) {
      // 402 Payment Required: The user has insufficient credits
      return new Response(JSON.stringify({ error: 'Insufficient credits to start the next step.' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`User ${project.user_id} has ${user.credits_remaining} credits. Triggering workflow for project: ${projectId}`);
    
    // The n8n workflow is responsible for the core logic. This function
    // simply acts as a secure trigger.
    // In a real application, you would now trigger your n8n webhook or other backend service.

    return new Response(JSON.stringify({ message: `Workflow triggered for project ${projectId}` }), {
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