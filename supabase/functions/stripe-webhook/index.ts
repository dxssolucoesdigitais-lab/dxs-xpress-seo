import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import Stripe from 'npm:stripe@16.5.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PLANS_CREDITS: { [key: string]: { credits: number } } = {
  basic: { credits: 20 },
  standard: { credits: 60 },
  premium: { credits: 120 },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')! // Nova variável de ambiente

    if (!stripeSecretKey || !stripeWebhookSecret) {
      throw new Error("STRIPE_SECRET_KEY ou STRIPE_WEBHOOK_SECRET não configuradas.");
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
      typescript: true,
    });

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(JSON.stringify({ error: 'No Stripe signature header' }), { status: 400, headers: corsHeaders });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }), { status: 400, headers: corsHeaders });
    }

    console.log(`Stripe Webhook Event Received: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { user_id, payment_intent_id, service_type, service_id, plan_id } = session.metadata || {};

      if (!user_id || !payment_intent_id || !service_type || !service_id) {
        console.error('Missing metadata in checkout session:', session.metadata);
        return new Response(JSON.stringify({ error: 'Missing metadata in checkout session' }), { status: 400, headers: corsHeaders });
      }

      // 1. Atualizar o status do payment_intent para 'completed'
      const { error: updateIntentError } = await supabaseAdmin
        .from('payment_intents')
        .update({ status: 'completed', payment_method: session.payment_method_details?.type || 'card' })
        .eq('id', payment_intent_id);

      if (updateIntentError) {
        console.error('Error updating payment intent status:', updateIntentError);
        throw updateIntentError;
      }

      // 2. Atualizar o usuário (plano/créditos)
      if (service_type === 'plan' && plan_id) {
        const plan = PLANS_CREDITS[plan_id];

        if (user_id && plan) {
          const { data: currentUser, error: userError } = await supabaseAdmin
            .from('users')
            .select('credits_remaining')
            .eq('id', user_id)
            .single();

          if (userError) throw userError;

          const newCredits = (currentUser?.credits_remaining || 0) + plan.credits;
          const newExpirationDate = new Date();
          newExpirationDate.setDate(newExpirationDate.getDate() + 30); // 30 dias de validade

          const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({
              plan_type: plan_id,
              credits_remaining: newCredits,
              subscription_expires_at: newExpirationDate.toISOString(),
            })
            .eq('id', user_id);

          if (updateError) {
            console.error('Error updating user subscription:', updateError);
            throw updateError;
          }
          console.log(`User ${user_id} updated to plan ${plan_id} with ${newCredits} credits.`);
        }
      } else if (service_type === 'gsc_analysis' && service_id === 'gsc_analysis') {
        // Para análise GSC, o payment_intent já foi marcado como 'completed'.
        // A lógica de acionamento da análise será feita pela função trigger-gsc-analysis
        // que verificará payment_intents com status 'completed' e service_id 'gsc_analysis'.
        console.log(`GSC Analysis purchase completed for user ${user_id}. Payment Intent ID: ${payment_intent_id}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Stripe Webhook Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
})