import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// NOTA: Para a tradução real funcionar, você precisa de uma chave de API de um serviço como o DeepL.
// 1. Obtenha sua chave de API em https://www.deepl.com/pro-api
// 2. Adicione-a como um segredo no seu projeto Supabase:
//    - Vá para Project -> Edge Functions -> Manage Secrets
//    - Adicione um novo segredo chamado DEEPL_API_KEY com o valor da sua chave.
const DEEPL_API_KEY = Deno.env.get('DEEPL_API_KEY');
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { text } = await req.json();
    if (!text) {
      return new Response(JSON.stringify({ error: 'O parâmetro "text" é obrigatório' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Se a chave da API não estiver configurada, retornamos um texto de simulação.
    if (!DEEPL_API_KEY) {
      console.warn("DEEPL_API_KEY não está configurado. Usando tradução simulada.");
      const simulatedTranslation = `(Translated) ${text}`;
      return new Response(JSON.stringify({ translation: simulatedTranslation }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Lógica de tradução real usando a API do DeepL
    const response = await fetch(DEEPL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [text],
        target_lang: 'EN-US', // Traduzir para Inglês Americano
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Erro na API do DeepL: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    const translation = data.translations[0].text;

    return new Response(JSON.stringify({ translation }), {
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