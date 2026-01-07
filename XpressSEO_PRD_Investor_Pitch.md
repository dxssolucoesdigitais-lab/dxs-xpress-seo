# Documento de Requisitos de Produto (PRD) - XpressSEO

**Data:** 2024-08-20
**Status:** Versão para Investidores
**Proprietário do Produto:** Dyad AI

---

## 1. Visão Geral do Produto (O Pitch)

O XpressSEO é um assistente operacional de SEO baseado em Inteligência Artificial, projetado para automatizar a criação de conteúdo otimizado para lojas de e-commerce e dropshipping.

**Problema:** Lojas de dropshipping e pequenos e-commerces lutam para criar conteúdo de alta qualidade e otimizado para SEO de forma rápida e escalável. A contratação de especialistas é cara e lenta.

**Solução:** O XpressSEO oferece um fluxo de trabalho conversacional (Chatbot) que, em minutos, gera títulos, meta descrições, descrições de produtos, artigos de blog e legendas para redes sociais, tudo validado por IA e pronto para publicação.

**Proposta de Valor Única (UVP):** O XpressSEO transforma o processo de SEO de um gargalo caro e demorado em uma operação de "um clique", permitindo que empreendedores globais dominem os resultados de busca com conteúdo de qualidade profissional, a uma fração do custo.

---

## 2. Metas e Objetivos (KPIs para Investidores)

| Objetivo Estratégico | Métrica Chave (KPI) | Meta (12 meses) |
| :--- | :--- | :--- |
| **Adoção e Engajamento** | Taxa de Conversão de Free para Pago | > 10% |
| **Retenção** | Churn Rate Mensal | < 5% |
| **Monetização** | Receita Média por Usuário (ARPU) | $25 USD |
| **Escalabilidade** | Número de Projetos Concluídos por Mês | 5.000 |
| **Performance** | Tempo Médio de Geração de Conteúdo (Etapa) | < 60 segundos |

---

## 3. Público-Alvo

1. **Empreendedores de Dropshipping:** Proprietários de lojas que buscam otimizar rapidamente centenas de produtos.
2. **Pequenos e Médios E-commerces:** Empresas que precisam de uma solução de SEO acessível e escalável.
3. **Agências de Marketing:** Agências que buscam ferramentas para acelerar a entrega de conteúdo para seus clientes.

---

## 4. Requisitos Funcionais Chave

### 4.1. Fluxo de Trabalho Conversacional (Core)
*   **Início Rápido:** O usuário inicia um projeto fornecendo apenas o nome do projeto e, opcionalmente, o link do produto.
*   **Coleta de Dados (Steps 1-6):** O sistema guia o usuário para coletar informações essenciais (nome, site, país, link do produto).
*   **Análise de Mercado (Step 7):** O sistema executa uma análise de mercado (usando Google Custom Search API) para identificar concorrentes, padrões de títulos e *content gaps*.
*   **Geração de Conteúdo (Steps 8-18):** Geração sequencial de 10 tipos de conteúdo (Meta Titles, Meta Descriptions, Descrições, Artigos, Legendas, etc.).
*   **Aprovação Interativa:** O usuário deve aprovar ou selecionar uma opção gerada pela IA em cada etapa para avançar.
*   **Regeneração:** Opção de "Refazer" (Comando 9) para regenerar o conteúdo de uma etapa, consumindo um crédito adicional.

### 4.2. Monetização e Gerenciamento de Créditos (Business Critical)
*   **Modelo de Créditos:** Cada ação de geração de conteúdo (exceto a análise inicial) consome 1 crédito.
*   **Planos de Assinatura:** Implementação de planos Free, Basic, Standard e Premium com diferentes volumes de créditos mensais.
*   **Checkout Integrado:** Integração com Stripe para processamento de pagamentos e gerenciamento de assinaturas (Edge Function `create-checkout-session`).
*   **Alerta de Expiração:** Alerta visual para usuários com créditos baixos ou assinatura próxima do vencimento.

### 4.3. Funcionalidades Avançadas
*   **Análise GSC (Google Search Console):** Funcionalidade paga avulsa (ou incluída em planos Premium) que permite ao usuário fazer upload de um relatório GSC para análise profunda e recomendações de otimização (Edge Function `trigger-gsc-analysis`).
*   **Tradução Multi-idioma:** Geração de conteúdo otimizado para diferentes idiomas (Português, Inglês, Espanhol, etc.) com precisão cultural.
*   **Painel de Administração:** Interface para administradores gerenciarem usuários, créditos e visualizarem feedbacks.

---

## 5. Requisitos Técnicos e Arquitetura

| Componente | Tecnologia | Requisito |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript, Tailwind CSS, Shadcn/ui | Interface responsiva e moderna. |
| **Backend/DB** | Supabase (PostgreSQL, Auth, Realtime) | Armazenamento seguro de projetos, usuários e mensagens. Uso de RLS obrigatório. |
| **Lógica de Negócio (Workflow)** | Windmill (Python) | Orquestração do fluxo de trabalho de IA, garantindo a sequência correta das etapas e a persistência do estado (`ai_state`). |
| **Gateway de IA** | OpenRouter (Llama 3.1, Claude 3.5, GPT-4o) | Uso de múltiplos modelos de IA para tarefas específicas (criativo, técnico, conciso). |
| **Integração de Pagamento** | Stripe | Edge Function (`create-checkout-session`, `stripe-webhook`) para gerenciar pagamentos e atualizar créditos. |
| **Pesquisa de Mercado** | Google Custom Search API | Utilizado no Windmill para análise de concorrentes e insights de conteúdo. |

---

## 6. Requisitos de Experiência do Usuário (UX)

*   **Simplicidade Conversacional:** A interação deve ser o mais natural possível, imitando um chat com um especialista humano.
*   **Feedback Visual:** Uso de indicadores de progresso (ProgressFlow) e mensagens otimistas para reduzir a latência percebida.
*   **Acessibilidade:** Design Dark Mode e suporte a múltiplos idiomas (i18n).
*   **Controle:** O usuário deve sentir que tem controle total sobre o conteúdo gerado através dos comandos de Aprovar/Selecionar/Refazer.

---

## 7. Requisitos de Segurança e Conformidade

*   **Autenticação:** Supabase Auth (E-mail/Senha).
*   **Segurança de Dados:** Row Level Security (RLS) ativado em todas as tabelas públicas (`users`, `projects`, `chat_messages`, `feedbacks`, `usage_history`).
*   **Segredos:** Todas as chaves de API (Groq, OpenRouter, Stripe, Windmill) devem ser armazenadas como segredos de ambiente no Supabase.
*   **Conformidade:** Política de Privacidade e Termos de Uso claros e acessíveis (páginas `/privacy` e `/terms`).

---

## 8. Próximos Passos (Roadmap de Alto Nível)

| Fase | Foco | Entregáveis Chave |
| :--- | :--- | :--- |
| **Fase 1 (MVP Atual)** | Estabilidade e Core Loop | Fluxo de 10 etapas, Monetização Stripe, Painel Admin Básico, Análise GSC. |
| **Fase 2** | Otimização e Retenção | Integração com Google Analytics/Search Console (via API), Exportação de Conteúdo em massa (CSV/HTML), Sistema de Afiliados. |
| **Fase 3** | Expansão e AI Avançada | Otimização de Imagens por IA, Geração de Vídeos Curtos para Redes Sociais, Modelos de IA customizados para nichos específicos. |