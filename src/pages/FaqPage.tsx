import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const faqData = [
  {
    category: 'Geral',
    questions: [
      {
        q: 'O que é o XpressSEO?',
        a: 'O XpressSEO é uma plataforma de Software como Serviço (SaaS) que utiliza múltiplos agentes de Inteligência Artificial para automatizar e otimizar a criação de conteúdo para SEO, especialmente focado em lojas de dropshipping.',
      },
      {
        q: 'Como o XpressSEO funciona?',
        a: 'Você inicia uma nova "conversa" fornecendo o link de um produto. Nossa IA então inicia um fluxo de trabalho passo a passo, gerando títulos, descrições, artigos de blog e mais. A cada passo, você aprova o conteúdo para garantir controle total sobre o resultado final e avançar no processo.',
      },
    ],
  },
  {
    category: 'Uso e Créditos',
    questions: [
      {
        q: 'O que é um "crédito"?',
        a: 'Um crédito é consumido a cada vez que a IA executa uma tarefa para gerar um novo conteúdo para você, como a geração de opções de títulos e descrições. A análise inicial do produto não consome crédito.',
      },
      {
        q: 'O que acontece quando meus créditos acabam?',
        a: 'Quando seus créditos chegam a zero, o fluxo de trabalho de IA é pausado. Você não poderá aprovar etapas até adquirir mais créditos. Para isso, basta clicar em "Fazer Upgrade" e escolher um de nossos planos.',
      },
      {
        q: 'Os créditos expiram?',
        a: 'Seus créditos estão atrelados à sua assinatura mensal. Eles são renovados a cada ciclo de pagamento e não são cumulativos.',
      },
    ],
  },
  {
    category: 'Funcionalidades',
    questions: [
      {
        q: 'Posso usar o conteúdo gerado em qualquer plataforma?',
        a: 'Sim! O conteúdo é seu. Você pode copiar e colar em sua loja Shopify, WooCommerce, ou qualquer outra plataforma de e-commerce.',
      },
      {
        q: 'O XpressSEO funciona para outros idiomas?',
        a: 'Sim. Nossa IA é capaz de gerar e otimizar conteúdo para diferentes países e idiomas. A funcionalidade de tradução está disponível em nossos planos para ajudar na expansão internacional da sua loja.',
      },
    ],
  },
];

const FaqPage = () => {
  return (
    <div className="container max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <Link to="/chat" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para o Chat
      </Link>
      <h1 className="text-3xl font-bold mb-2">Perguntas Frequentes (FAQ)</h1>
      <p className="text-muted-foreground mb-8">Encontre respostas para as dúvidas mais comuns sobre o XpressSEO.</p>

      <div className="space-y-8">
        {faqData.map((categoryItem) => (
          <div key={categoryItem.category}>
            <h2 className="text-2xl font-semibold mb-4 border-b border-border pb-2">{categoryItem.category}</h2>
            <Accordion type="single" collapsible className="w-full">
              {categoryItem.questions.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                  <AccordionContent className="prose prose-invert dark:prose-invert prose-sm max-w-none text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaqPage;