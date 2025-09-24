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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase environment variables.");
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

    const { prompt } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check user credits
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('credits_remaining')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;
    if (userData.credits_remaining <= 0) {
      return new Response(JSON.stringify({ error: 'Insufficient credits.' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create a new project with a simpler name
    const projectName = `Análise de ${prompt.substring(0, 40)}...`;
    const { data: newProject, error: createError } = await supabaseAdmin
      .from('projects')
      .insert({
        user_id: user.id,
        product_link: prompt,
        project_name: projectName,
      })
      .select()
      .single();

    if (createError) throw createError;

    // Trigger the first step of the workflow
    const { error: triggerError } = await supabaseAdmin.functions.invoke('trigger-step', {
      body: { projectId: newProject.id },
    });

    if (triggerError) {
        console.error(`Failed to trigger workflow for project ${newProject.id}`, triggerError);
    }

    return new Response(JSON.stringify(newProject), {
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