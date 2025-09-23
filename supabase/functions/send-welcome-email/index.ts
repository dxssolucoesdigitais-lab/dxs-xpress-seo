import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// A URL da API do seu servidor MCP
const MCP_API_URL = 'https://api.your-mcp-server.com/v1/send-email';
// A chave de API, armazenada de forma segura como um segredo no Supabase
const MCP_API_KEY = Deno.env.get('MCP_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Os dados do novo usuário seriam passados pelo gatilho do banco de dados
    const { record: newUser } = await req.json();

    if (!MCP_API_KEY) {
      throw new Error("MCP_API_KEY is not configured in Supabase secrets.");
    }

    const response = await fetch(MCP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MCP_API_KEY}` // Ou qualquer outro método de autenticação que seu servidor use
      },
      body: JSON.stringify({
        to: newUser.email,
        from: "welcome@xpressseo.com",
        subject: "Bem-vindo ao XpressSEO!",
        body: `Olá ${newUser.raw_user_meta_data?.full_name || 'usuário'}, estamos felizes em ter você conosco!`
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`MCP Server responded with ${response.status}: ${errorBody}`);
    }

    const responseData = await response.json();

    return new Response(JSON.stringify({ success: true, mcpResponse: responseData }), {
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