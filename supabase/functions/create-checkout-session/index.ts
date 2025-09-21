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

    // 1. Obter usuário a partir do cabeçalho de autorização
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt)
    
    if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // 2. Obter planId do corpo da requisição
    const { planId } = await req.json();
    if (!planId) {
      return new Response(JSON.stringify({ error: 'planId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. SIMULAR a criação de uma sessão de checkout com um provedor de pagamento
    // Em um cenário real, você usaria o SDK do Stripe/MercadoPago aqui para criar uma sessão,
    // passando o userId e planId como metadados.
    console.log(`Simulating checkout session creation for user ${user.id} and plan ${planId}`);

    // Para esta simulação, criamos uma URL de placeholder.
    const siteUrl = Deno.env.get('SITE_URL') || 'https://pppnieeztijtvwencdng.supabase.co';
    const checkoutUrl = `${siteUrl}/payment-simulation?status=success&userId=${user.id}&planId=${planId}`;
    
    console.log(`Generated simulated checkout URL: ${checkoutUrl}`);

    // 4. Retornar a URL de checkout para o cliente
    return new Response(JSON.stringify({ checkoutUrl }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-checkout-session:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})