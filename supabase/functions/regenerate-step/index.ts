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
    const { stepResultId } = await req.json();

    if (!stepResultId) {
      return new Response(JSON.stringify({ error: 'stepResultId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get project_id from the step result
    const { data: step, error: stepError } = await supabaseAdmin
      .from('step_results')
      .select('project_id')
      .eq('id', stepResultId)
      .single();

    if (stepError) throw stepError;
    if (!step) {
      return new Response(JSON.stringify({ error: 'Step result not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user_id from the project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('user_id')
      .eq('id', step.project_id)
      .single();

    if (projectError) throw projectError;
    if (!project) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check user's credit balance
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

    if (user.credits_remaining <= 0) {
      return new Response(JSON.stringify({ error: 'Insufficient credits to regenerate.' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete the old step result. The workflow will be re-triggered by the user
    // approving the previous step again, which will create a new step result
    // and correctly deduct a credit via the database trigger.
    const { error: deleteError } = await supabaseAdmin
      .from('step_results')
      .delete()
      .eq('id', stepResultId);

    if (deleteError) throw deleteError;

    return new Response(JSON.stringify({ message: `Step ${stepResultId} deleted. Ready to regenerate.` }), {
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