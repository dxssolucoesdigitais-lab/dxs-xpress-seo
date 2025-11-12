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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const windmillToken = Deno.env.get('WINDMILL_TOKEN')!
    // ATUALIZE ESTA URL COM A URL REAL DO SEU SCRIPT WINDMILL
    const windmillMasterScriptUrl = Deno.env.get('WINDMILL_MASTER_SCRIPT_URL')! // Nova variável de ambiente para a URL do script master
    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')! // Nova variável para OpenRouter

    if (!supabaseUrl || !serviceRoleKey || !windmillToken || !windmillMasterScriptUrl || !openrouterApiKey) {
      throw new Error("Missing critical environment variables (Supabase, Windmill, OpenRouter).");
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

    const { projectId } = await req.json();
    if (!projectId) {
      return new Response(JSON.stringify({ error: 'projectId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Verificar se o usuário tem um payment_intent 'completed' e 'gsc_analysis' não utilizado
    const { data: paymentIntent, error: paymentError } = await supabaseAdmin
      .from('payment_intents')
      .select('*')
      .eq('user_id', user.id)
      .eq('service_type', 'gsc_analysis')
      .eq('service_id', 'gsc_analysis')
      .eq('status', 'completed')
      .is('project_id', null) // Verifica se ainda não foi associado a um projeto
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (paymentError || !paymentIntent) {
      return new Response(JSON.stringify({ error: 'Nenhuma análise GSC paga e não utilizada encontrada.' }), {
        status: 402, // 402 Payment Required
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Marcar o payment_intent como 'used' (associando ao projeto)
    const { error: updateIntentError } = await supabaseAdmin
      .from('payment_intents')
      .update({ project_id: projectId, status: 'used' }) // Marcar como 'used' e associar ao projeto
      .eq('id', paymentIntent.id);

    if (updateIntentError) throw updateIntentError;

    // --- Trigger Windmill Workflow for GSC Analysis ---
    // Usando a URL do script master para análise GSC
    const windmillGSCAnalysisWebhookUrl = windmillMasterScriptUrl;
    
    const payload = {
      acao: "start_gsc_analysis", // Ação específica para o script Windmill
      projectId: projectId,
      userId: user.id,
      paymentIntentId: paymentIntent.id,
      supabase_url: supabaseUrl,
      supabase_key: serviceRoleKey,
      openrouter_key: openrouterApiKey,
      serpi_api_key: Deno.env.get('SERPI_API_KEY'), // Passa a chave SerpiAPI
    };

    fetch(windmillGSCAnalysisWebhookUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${windmillToken}`,
      },
      body: JSON.stringify(payload),
    }).catch(err => console.error("Error triggering Windmill GSC analysis webhook:", err));

    return new Response(JSON.stringify({ message: 'Análise GSC acionada com sucesso via Windmill!' }), {
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