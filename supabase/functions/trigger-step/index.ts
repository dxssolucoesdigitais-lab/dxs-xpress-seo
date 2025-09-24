import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// MOCK AI RESPONSES - Simula as chamadas de LLM para teste
const generateMockContent = (stepNumber: number, project: any) => {
  const { project_name, extracted_data } = project;
  const collectionName = extracted_data?.collection_name || "Sua Coleção";
  const productName = extracted_data?.product_name || "Seu Produto";

  switch (stepNumber) {
    case 1:
      return `<h2>${collectionName}: Performance e Estilo para Sua Rotina</h2><p>Descubra nossa coleção exclusiva, desenvolvida para quem busca máximo desempenho e conforto. Combine tecnologia avançada com design moderno.</p>`;
    case 2:
      return [
        { number: 1, content: `${collectionName} Incrível e Educativa | ${project_name}` },
        { number: 2, content: `Jogos Educativos para Crianças - ${collectionName}` },
        { number: 3, content: `${collectionName}: Jogos Educativos e Interativos` },
        { number: 4, content: `Jogos Divertidos e Educativos para a Família | ${collectionName}` },
        { number: 5, content: `Melhores Brinquedos Educativos para Crianças e Família` },
      ];
    case 3:
      return `Descubra a coleção ${collectionName}! Jogos educativos e divertidos para crianças e toda a família. Estimule o aprendizado e a criatividade com nossos brinquedos interativos. Compre agora!`;
    // Adicionar mais casos para as outras etapas conforme necessário
    default:
      return { message: `Conteúdo simulado para a etapa ${stepNumber}` };
  }
};

const STEP_CONFIG: { [key: number]: { name: string; plan: string[] } } = {
  1: { name: "Título H2 da Coleção", plan: ['free', 'basic', 'standard', 'premium'] },
  2: { name: "Meta Title da Coleção", plan: ['free', 'basic', 'standard', 'premium'] },
  3: { name: "Meta Description da Coleção", plan: ['free', 'basic', 'standard', 'premium'] },
  4: { name: "Descrição do Produto", plan: ['free', 'basic', 'standard', 'premium'] },
  5: { name: "Meta Title do Produto", plan: ['free', 'basic', 'standard', 'premium'] },
  6: { name: "Meta Description do Produto", plan: ['free', 'basic', 'standard', 'premium'] },
  7: { name: "Artigo de Blog Complementar", plan: ['free', 'standard', 'premium'] },
  8: { name: "Legendas para Redes Sociais/Ads", plan: ['free', 'premium'] },
  9: { name: "Validação Técnica Especializada", plan: ['free', 'standard', 'premium'] },
};

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
    const { projectId } = await req.json();

    if (!projectId) {
      return new Response(JSON.stringify({ error: 'projectId is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Fetch Project and User data
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;
    if (!project) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('credits_remaining, plan_type')
      .eq('id', project.user_id)
      .single();

    if (userError) throw userError;
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Validate conditions
    if (project.status !== 'in_progress') {
      return new Response(JSON.stringify({ message: `Project status is '${project.status}'. No action taken.` }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (user.credits_remaining <= 0) {
      await supabaseAdmin.from('projects').update({ status: 'paused' }).eq('id', projectId);
      return new Response(JSON.stringify({ error: 'Insufficient credits.' }), {
        status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Execute the correct step
    const currentStepNumber = project.current_step;
    const stepInfo = STEP_CONFIG[currentStepNumber];

    if (!stepInfo) {
      // No more steps, complete the project
      await supabaseAdmin.from('projects').update({ status: 'completed' }).eq('id', projectId);
      return new Response(JSON.stringify({ message: 'Project completed successfully.' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // TODO: Implement plan-based logic here. For now, we assume premium.

    // Simulate LLM call
    const llmOutput = generateMockContent(currentStepNumber, project);

    // 4. Save the result
    const { error: insertError } = await supabaseAdmin
      .from('step_results')
      .insert({
        project_id: projectId,
        step_number: currentStepNumber,
        step_name: stepInfo.name,
        llm_output: llmOutput,
      });

    if (insertError) throw insertError;

    // Note: Credit deduction is handled by a database trigger on `step_results` insert.

    return new Response(JSON.stringify({ message: `Step ${currentStepNumber} executed successfully.` }), {
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