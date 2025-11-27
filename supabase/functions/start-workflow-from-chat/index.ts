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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    // Agora recebemos projectName e productLink explicitamente
    const { projectName, productLink } = await req.json();
    if (!projectName) {
      return new Response(JSON.stringify({ error: 'Project name is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check user credits
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('credits_remaining, role')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;
    
    // Only check credits if the user is NOT an admin
    if (userData.role !== 'admin' && userData.credits_remaining <= 0) {
      return new Response(JSON.stringify({ error: 'Insufficient credits.' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create a new project with the provided name
    const { data: newProject, error: createError } = await supabaseAdmin
      .from('projects')
      .insert({
        user_id: user.id,
        project_name: projectName, // Usa o nome do projeto fornecido
        product_link: productLink || '', // Usa o link do produto fornecido ou vazio
        target_country: 'Brazil', // Default
        target_audience: 'General', // Default
      })
      .select()
      .single();

    if (createError) throw createError;

    // Deduct credit for starting a new project (only if not admin)
    if (userData.role !== 'admin') {
      const { error: decrementError } = await supabaseAdmin.rpc('decrement_user_credits', {
        p_user_id: user.id,
        p_credits: 1,
      });
      if (decrementError) throw decrementError;
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