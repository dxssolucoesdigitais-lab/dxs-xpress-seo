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
    // User needs to set this environment variable in Supabase project settings
    const n8nWebhookGSCStandalone = Deno.env.get('N8N_WEBHOOK_URL_GSC_ANALYSIS_STANDALONE') || 'http://192.168.0.216:5678/webhook/gsc-analysis-standalone'

    if (!supabaseUrl || !serviceRoleKey || !n8nWebhookGSCStandalone) {
      throw new Error("Missing Supabase environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, N8N_WEBHOOK_URL_GSC_ANALYSIS_STANDALONE).");
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

    // 3. Acionar o webhook do n8n para iniciar a análise GSC
    fetch(n8nWebhookGSCStandalone, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: projectId,
        userId: user.id,
        paymentIntentId: paymentIntent.id,
        // Outros dados relevantes para o n8n
      }),
    }).catch(err => console.error("Error triggering n8n GSC webhook:", err));

    return new Response(JSON.stringify({ message: 'Análise GSC acionada com sucesso!' }), {
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