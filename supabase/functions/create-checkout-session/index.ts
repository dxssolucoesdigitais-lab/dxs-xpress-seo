import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PLANS_BRL = {
  basic: { title: "Plano Basic", price: 79, credits: 50 },
  standard: { title: "Plano Standard", price: 149, credits: 100 },
  premium: { title: "Plano Premium", price: 197, credits: 250 },
};

const PLANS_USD = {
  basic: { title: "Basic Plan", price: 14, credits: 50 },
  standard: { title: "Standard Plan", price: 27, credits: 100 },
  premium: { title: "Premium Plan", price: 34, credits: 250 },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:8080'
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const authHeader = req.headers.get('Authorization')!
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const { planId, currency = 'BRL' } = await req.json();
    
    if (!['BRL', 'USD'].includes(currency)) {
      return new Response(JSON.stringify({ error: 'Moeda inválida' }), { status: 400, headers: corsHeaders });
    }

    const plans = currency === 'BRL' ? PLANS_BRL : PLANS_USD;
    const plan = plans[planId];
    
    if (!plan) {
      return new Response(JSON.stringify({ error: 'Plano inválido' }), { status: 400, headers: corsHeaders });
    }

    // Registrar intenção de pagamento
    const { data: paymentIntent, error: intentError } = await supabaseAdmin
      .from('payment_intents')
      .insert({
        user_id: user.id,
        plan_id: planId,
        selected_currency: currency,
        amount: plan.price,
        status: 'pending'
      })
      .select()
      .single();

    if (intentError) throw intentError;

    // Fluxo para BRL (Mercado Pago)
    if (currency === 'BRL') {
      const mpAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
      if (!mpAccessToken) {
        throw new Error("Mercado Pago Access Token não configurado.");
      }

      // ... código existente do Mercado Pago ...
      // (manter a lógica atual de criação de preferência)

      return new Response(JSON.stringify({ 
        checkoutUrl: preferenceData.init_point,
        paymentIntentId: paymentIntent.id 
      }), { status: 200, headers: corsHeaders });

    } else {
      // Fluxo para USD (Pagamento Manual)
      // Buscar informações bancárias/configurações
      const bankDetails = {
        bankName: Deno.env.get('BANK_NAME') || 'Banco X',
        accountNumber: Deno.env.get('BANK_ACCOUNT') || '0000000-1',
        swiftCode: Deno.env.get('SWIFT_CODE') || 'ABCDEFG',
        beneficiary: Deno.env.get('BENEFICIARY_NAME') || 'Sua Empresa LTDA',
        instructions: 'Envie o comprovante para payments@empresa.com'
      };

      // Aqui você implementaria o envio de email com os dados bancários
      // Usando seu serviço de email preferido (Resend, SendGrid, etc.)

      return new Response(JSON.stringify({
        paymentMethod: 'bank_transfer',
        bankDetails,
        paymentIntentId: paymentIntent.id,
        message: 'Você será redirecionado para as instruções de transferência bancária'
      }), { status: 200, headers: corsHeaders });
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})