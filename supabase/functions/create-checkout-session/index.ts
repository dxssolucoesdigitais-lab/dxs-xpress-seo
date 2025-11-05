import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import Stripe from 'npm:stripe@16.5.0'; // Importar a biblioteca Stripe

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PLANS_BRL = {
  free: { title: "Plano Grátis", price: 0, credits: 3 }, // Free plan for reference, no actual checkout
  basic: { title: "Plano Basic", price: 7900, credits: 20 }, // Preço em centavos
  standard: { title: "Plano Standard", price: 14900, credits: 60 },
  premium: { title: "Plano Premium", price: 19700, credits: 120 },
};

const SERVICES_BRL = {
  gsc_analysis: { title: "Análise GSC Avulsa", price: 4900, type: 'gsc_analysis' }, // Preço em centavos
};

const PLANS_USD = {
  free: { title: "Free Plan", price: 0, credits: 3 }, // Free plan for reference, no actual checkout
  basic: { title: "Basic Plan", price: 1500, credits: 20 }, // Preço em centavos
  standard: { title: "Standard Plan", price: 2800, credits: 60 },
  premium: { title: "Premium Plan", price: 3700, credits: 120 },
};

const SERVICES_USD = {
  gsc_analysis: { title: "Standalone GSC Analysis", price: 900, type: 'gsc_analysis' }, // Preço em centavos
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:8080'
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')! // Nova variável de ambiente

    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY não configurada.");
    }
    
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
    let itemTitle;

    if (serviceType === 'plan') {
      const plans = currency === 'BRL' ? PLANS_BRL : PLANS_USD;
      itemToPurchase = plans[serviceId];
      itemPrice = itemToPurchase?.price;
      itemTitle = itemToPurchase?.title;
    } else if (serviceType === 'gsc_analysis') {
      const services = currency === 'BRL' ? SERVICES_BRL : SERVICES_USD;
      itemToPurchase = services[serviceId];
      itemPrice = itemToPurchase?.price;
      itemTitle = itemToPurchase?.title;
    }

    if (!itemToPurchase || itemPrice === undefined || itemTitle === undefined) {
      return new Response(JSON.stringify({ error: 'Item ou serviço inválido' }), { status: 400, headers: corsHeaders });
    }

    // Registrar intenção de pagamento
    const { data: paymentIntent, error: intentError } = await supabaseAdmin
      .from('payment_intents')
      .insert({
        user_id: user.id,
        plan_id: serviceType === 'plan' ? serviceId : null,
        service_id: serviceType === 'gsc_analysis' ? serviceId : null,
        service_type: serviceType,
        selected_currency: currency,
        amount: itemPrice / 100, // Armazenar em formato de moeda (ex: 79.00)
        status: 'pending'
      })
      .select()
      .single();

    if (intentError) throw intentError;

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
      typescript: true,
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // Pode adicionar 'pix' ou outros se configurado na Stripe
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(), // 'brl' ou 'usd'
            product_data: {
              name: itemTitle,
            },
            unit_amount: itemPrice, // Preço em centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/profile?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/profile?payment=cancelled`,
      metadata: {
        user_id: user.id,
        payment_intent_id: paymentIntent.id,
        service_type: serviceType,
        service_id: serviceId,
        plan_id: serviceType === 'plan' ? serviceId : null,
      },
      customer_email: user.email, // Pré-preenche o email do cliente
    });

    return new Response(JSON.stringify({ 
      checkoutUrl: checkoutSession.url,
      paymentIntentId: paymentIntent.id 
    }), { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error("Erro na Edge Function create-checkout-session:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})