import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { MercadoPagoConfig, Preference } from 'https://esm.sh/mercadopago@2.0.9';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PLANS_BRL: { [key: string]: { title: string; price: number; credits: number } } = {
  basic: { title: "Plano Basic", price: 79, credits: 50 },
  standard: { title: "Plano Standard", price: 149, credits: 100 },
  premium: { title: "Plano Premium", price: 197, credits: 250 },
};

// Placeholder for international prices
const PLANS_USD: { [key: string]: { title: string; price: number; credits: number } } = {
  basic: { title: "Basic Plan", price: 14, credits: 50 },
  standard: { title: "Standard Plan", price: 27, credits: 100 },
  premium: { title: "Premium Plan", price: 34, credits: 250 },
};

const SOUTH_AMERICAN_COUNTRIES = [
  'AR', 'BO', 'BR', 'CL', 'CO', 'EC', 'GY', 'PY', 'PE', 'SR', 'UY', 'VE'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // --- Environment Variables ---
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:8080'
    
    // --- User and Country Detection ---
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const authHeader = req.headers.get('Authorization')!
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const country = req.headers.get('x-vercel-ip-country') || 'BR'; // Vercel provides this header
    const { planId } = await req.json();

    // --- South America Payment Logic (Mercado Pago) ---
    if (SOUTH_AMERICAN_COUNTRIES.includes(country)) {
      const mpAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
      if (!mpAccessToken) throw new Error("Mercado Pago Access Token not configured.");

      const plan = PLANS_BRL[planId];
      if (!plan) return new Response(JSON.stringify({ error: 'Invalid plan' }), { status: 400, headers: corsHeaders });

      const client = new MercadoPagoConfig({ accessToken: mpAccessToken });
      const preference = new Preference(client);
      const notificationUrl = `${supabaseUrl}/functions/v1/mercadopago-webhook`;

      const preferenceData = await preference.create({
        body: {
          items: [{ id: planId, title: plan.title, quantity: 1, unit_price: plan.price, currency_id: 'BRL' }],
          payer: { email: user.email },
          back_urls: { success: `${siteUrl}/profile`, failure: `${siteUrl}/profile`, pending: `${siteUrl}/profile` },
          auto_return: 'approved',
          notification_url: notificationUrl,
          external_reference: JSON.stringify({ user_id: user.id, plan_id: planId }),
        },
      });

      return new Response(JSON.stringify({ checkoutUrl: preferenceData.init_point }), { status: 200, headers: corsHeaders });
    } 
    // --- Rest of the World Payment Logic (Stripe - Placeholder) ---
    else {
      // TODO: Implement Stripe checkout session creation here
      // const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
      // if (!stripeSecretKey) throw new Error("Stripe Secret Key not configured.");
      // const plan = PLANS_USD[planId];
      // ... Stripe logic ...
      
      console.warn(`International payment attempt from ${country}. Stripe integration is pending.`);
      return new Response(JSON.stringify({ error: 'International payments not yet supported.' }), { status: 501, headers: corsHeaders });
    }

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
})