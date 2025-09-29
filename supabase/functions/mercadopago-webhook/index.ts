import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const PLANS: { [key: string]: { credits: number } } = {
  basic: { credits: 50 },
  standard: { credits: 100 },
  premium: { credits: 250 },
};

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const notification = await req.json();

    // Apenas processar notificações de pagamento aprovado
    if (notification.type === 'payment' && notification.action === 'payment.created') {
      const paymentId = notification.data.id;
      
      // Buscar os detalhes do pagamento no Mercado Pago para obter a `external_reference`
      const mpAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${mpAccessToken}` }
      });
      
      if (!paymentResponse.ok) {
        throw new Error(`Failed to fetch payment details from Mercado Pago: ${paymentResponse.statusText}`);
      }
      
      const paymentDetails = await paymentResponse.json();

      if (paymentDetails.status === 'approved' && paymentDetails.external_reference) {
        const { user_id, service_type, service_id, plan_id, payment_intent_id } = JSON.parse(paymentDetails.external_reference);

        // Atualizar o status do payment_intent para 'completed'
        const { error: updateIntentError } = await supabaseAdmin
          .from('payment_intents')
          .update({ status: 'completed' })
          .eq('id', payment_intent_id);

        if (updateIntentError) {
          console.error('Error updating payment intent status:', updateIntentError);
          throw updateIntentError;
        }

        if (service_type === 'plan' && plan_id) {
          const plan = PLANS[plan_id];

          if (user_id && plan) {
            const { data: currentUser, error: userError } = await supabaseAdmin
              .from('users')
              .select('credits_remaining')
              .eq('id', user_id)
              .single();

            if (userError) throw userError;

            const newCredits = (currentUser?.credits_remaining || 0) + plan.credits;
            const newExpirationDate = new Date();
            newExpirationDate.setDate(newExpirationDate.getDate() + 30);

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
          }
        } else if (service_type === 'gsc_analysis' && service_id === 'gsc_analysis') {
          // Para análise GSC, o payment_intent já foi marcado como 'completed'.
          // A lógica de acionamento da análise será feita pela função trigger-gsc-analysis
          // que verificará payment_intents com status 'completed' e service_id 'gsc_analysis'.
          console.log(`GSC Analysis purchase completed for user ${user_id}. Payment Intent ID: ${payment_intent_id}`);
        }
      }
    }

    // Responder ao Mercado Pago com 200 OK para confirmar o recebimento
    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error('Webhook Error:', error.message);
    // Mesmo em caso de erro, é importante responder com 200 para evitar que o MP reenvie a notificação
    return new Response("Error processing webhook, but acknowledging receipt.", { status: 200 });
  }
})