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

    // Get user from Authorization header and check if they are an admin
    const authHeader = req.headers.get('Authorization')!
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
    
    const { data: adminCheck, error: roleError } = await supabaseAdmin.rpc('get_my_role');
    if (roleError || adminCheck !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Admins only' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { feedbackContent } = await req.json();
    if (!feedbackContent) {
      return new Response(JSON.stringify({ error: 'feedbackContent is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Simulated AI response generation
    const reply = `Olá,
  
Obrigado pelo seu feedback sobre: "${feedbackContent.substring(0, 50)}...".
  
Agradecemos muito por você dedicar um tempo para compartilhar suas ideias. Sua opinião é fundamental para nos ajudar a melhorar o XpressSEO para todos.
  
Nossa equipe irá analisar sua sugestão com atenção.
  
Atenciosamente,
Equipe XpressSEO`;

    return new Response(JSON.stringify({ reply }), {
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