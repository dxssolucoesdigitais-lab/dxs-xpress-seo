import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PLANS_BRL = {
  basic: { title: "Plano Basic", price: 79, credits: 20 },
  standard: { title: "Plano Standard", price: 149, credits: 60 },
  premium: { title: "Plano Premium", price: 197, credits: 120 },
};

const SERVICES_BRL = {
  gsc_analysis: { title: "Análise GSC Avulsa", price: 49, type: 'gsc_analysis' },
};

const PLANS_USD = {
  basic: { title: "Basic Plan", price: 15, credits: 20 },
  standard: { title: "Standard Plan", price: 28, credits: 60 },
  premium: { title: "Premium Plan", price: 37, credits: 120 },
};

const SERVICES_USD = {
  gsc_analysis: { title: "Standalone GSC Analysis", price: 9, type: 'gsc_analysis' },
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

    const { serviceType = 'plan', serviceId, currency = 'BRL' } = await req.json();
    
    if (!['BRL', 'USD'].includes(currency)) {
      return new Response(JSON.stringify({ error: 'Moeda inválida' }), { status: 400, headers: corsHeaders });
    }

    let itemToPurchase;
    let itemPrice;

    if (serviceType === 'plan') {
      const plans = currency === 'BRL' ? PLANS_BRL : PLANS_USD;
      itemToPurchase = plans[serviceId];
      itemPrice = itemToPurchase?.price;
    } else if (serviceType === 'gsc_analysis') {
      const services = currency === 'BRL' ? SERVICES_BRL : SERVICES_USD;
      itemToPurchase = services[serviceId];
      itemPrice = itemToPurchase?.price;
    }

    if (!itemToPurchase || !itemPrice) {
      return new Response(JSON.stringify({ error: 'Item ou serviço inválido' }), { status: 400, headers: corsHeaders });
    }

    // Registrar intenção de pagamento
    const { data: paymentIntent, error: intentError } = await supabaseAdmin
      .from('payment_intents')
      .insert({
        user_id: user.id,
        plan_id: serviceType === 'plan' ? serviceId : null, // Define plan_id apenas se for um plano
        service_id: serviceType === 'gsc_analysis' ? serviceId : null, // Define service_id se for um serviço
        service_type: serviceType, // Nova coluna para diferenciar
        selected_currency: currency,
        amount: itemPrice,
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

      const preference = {
        items: [
          {
            title: itemToPurchase.title,
            unit_price: itemPrice,
            quantity: 1,
          },
        ],
        external_reference: JSON.stringify({
          user_id: user.id,
          service_type: serviceType,
          service_id: serviceId,
          payment_intent_id: paymentIntent.id,
        }),
        back_urls: {
          success: `${siteUrl}/payment-simulation?status=success&userId=${user.id}&serviceType=${serviceType}&serviceId=${serviceId}`,
          failure: `${siteUrl}/payment-simulation?status=failure&userId=${user.id}&serviceType=${serviceType}&serviceId=${serviceId}`,
          pending: `${siteUrl}/payment-simulation?status=pending&userId=${user.id}&serviceType=${serviceType}&serviceId=${serviceId}`,
        },
        auto_return: "approved",
        notification_url: `${supabaseUrl}/functions/v1/mercadopago-webhook`,
      };

      const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mpAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preference),
      });

      if (!mpResponse.ok) {
        const errorBody = await mpResponse.text();
        throw new Error(`Erro ao criar preferência no Mercado Pago: ${mpResponse.status} - ${errorBody}`);
      }

      const preferenceData = await mpResponse.json();

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