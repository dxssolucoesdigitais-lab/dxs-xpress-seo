# Guia do Fluxo de Trabalho n8n para XpressSEO

Este documento descreve o fluxo de trabalho completo a ser implementado no n8n para alimentar a lógica de IA do XpressSEO.

## Visão Geral

O fluxo é acionado por um webhook vindo da aplicação Supabase e é dividido em etapas sequenciais. A cada etapa, o n8n executa uma tarefa de IA, posta o resultado de volta no banco de dados Supabase e aguarda o próximo acionamento (após a aprovação do usuário).

**Entrada do Webhook:**
O webhook inicial receberá um JSON com a seguinte estrutura:
```json
{
  "projectId": "uuid-do-projeto",
  "userId": "uuid-do-usuario",
  "planType": "basic" | "standard" | "premium",
  "currentStep": 1,
  "projectData": { ...dados completos do projeto... }
}
```

**Saída de cada Etapa:**
Cada etapa deve terminar com um nó "Supabase" que insere um novo registro na tabela `step_results`.

---

## Estrutura do Fluxo no n8n

### Nó 1: Webhook Trigger
- Recebe a chamada da função `trigger-step` do Supabase.

### Nó 2: Switch (Roteador de Etapas)
- Usa o valor de `currentStep` da entrada do webhook para direcionar o fluxo para a etapa correta.

---

## Detalhamento das Etapas

### Etapa 1: Análise Inicial
- **Acionador:** `currentStep == 1`
- **Ações:**
  1.  **Scraping:** Faz o scraping da `product_link` fornecida nos dados do projeto.
  2.  **Extração de Dados (LLM):** Envia o conteúdo do scraping para um LLM (Groq) com um prompt para extrair informações-chave do produto (nome, características, benefícios, preço, etc.).
  3.  **Atualização do Projeto:** Atualiza a tabela `projects` no Supabase, preenchendo a coluna `extracted_data` com o JSON retornado pelo LLM.
  4.  **Inserir Resultado:** Insere um registro em `step_results` com:
      - `step_number`: 1
      - `step_name`: "Análise Inicial"
      - `llm_output`: Um JSON simples confirmando a conclusão, ex: `{"status": "completed", "summary": "Dados extraídos com sucesso."}`
      - `approved`: `true` (Esta etapa é automática e não precisa de aprovação).
- **Finalização:** Após inserir o resultado, o fluxo do n8n chama a função `increment_project_step` e `trigger-step` no Supabase para iniciar a próxima etapa automaticamente.

### Etapa 2: Geração de Títulos
- **Acionador:** `currentStep == 2`
- **Ações:**
  1.  Usa os `extracted_data` e `target_audience` do projeto.
  2.  Chama um LLM para gerar 3 opções de títulos otimizados para SEO.
  3.  **Inserir Resultado:** Insere em `step_results`:
      - `step_number`: 2
      - `step_name`: "Geração de Títulos"
      - `llm_output`: `[{"number": 1, "content": "Título A"}, {"number": 2, "content": "Título B"}, ...]`
      - `approved`: `false`

### Etapa 3: Geração de Descrições de Categoria
- **Acionador:** `currentStep == 3`
- **Ações:**
  1.  Usa o título selecionado pelo usuário (precisa buscar o `user_selection` da etapa anterior).
  2.  Chama um LLM para gerar 3 opções de descrição de categoria.
  3.  **Inserir Resultado:** Insere em `step_results` com `step_number`: 3, `step_name`: "Geração de Descrições de Categoria", e o `llm_output` com as opções.

### Etapa 4: Geração de Descrição de Produto
- **Acionador:** `currentStep == 4`
- **Ações:**
  1.  Similar à Etapa 3, mas para a descrição detalhada do produto.
  2.  **Inserir Resultado:** Insere em `step_results` com `step_number`: 4.

### Etapa 5: Geração de Meta Title e Meta Description
- **Acionador:** `currentStep == 5`
- **Ações:**
  1.  Gera 3 opções combinadas de Meta Title e Meta Description.
  2.  **Inserir Resultado:** Insere em `step_results` com `step_number`: 5.

### Etapa 6: Geração de Artigo de Blog
- **Acionador:** `currentStep == 6`
- **Ações:**
  1.  Usa todo o conteúdo aprovado até agora para gerar um artigo de blog completo.
  2.  **Inserir Resultado:** Insere em `step_results` com `step_number`: 6. O `llm_output` será uma string com o artigo formatado em Markdown.

### Etapa 7: Geração de Legendas para Redes Sociais
- **Acionador:** `currentStep == 7`
- **Ações:**
  1.  Cria 3-5 legendas curtas e impactantes para redes sociais.
  2.  **Inserir Resultado:** Insere em `step_results` com `step_number`: 7. O `llm_output` será um JSON com as legendas.

### Etapa 8: Validação Técnica
- **Acionador:** `currentStep == 8`
- **Ações:**
  1.  Chama um LLM para fazer uma revisão final de todo o conteúdo, verificando a consistência e as boas práticas de SEO.
  2.  **Inserir Resultado:** Insere em `step_results` com `step_number`: 8 e o resultado da validação.

### Etapa 9: Conclusão
- **Acionador:** `currentStep == 9`
- **Ações:**
  1.  Monta um relatório final com todo o conteúdo gerado.
  2.  **Atualiza Projeto:** Muda o `status` do projeto na tabela `projects` para `"completed"`.
  3.  **Inserir Resultado:** Insere um registro final em `step_results` com `step_number`: 9, `step_name`: "Projeto Concluído", e o relatório no `llm_output`.

---

## Atualizações de Progresso (Opcional)

Entre as etapas principais, você pode inserir um nó para postar uma atualização de progresso na interface.

- **Ação:** Insere um registro em `step_results` com:
  - `step_name`: `"Workflow Progress"`
  - `llm_output`: Um JSON no formato:
    ```json
    {
      "completed": ["Análise Inicial", "Pesquisa de Palavras-chave"],
      "in_progress": "Geração de Títulos",
      "upcoming": ["Descrições de Categoria", "Descrição de Produto"]
    }
    ```
  - `approved`: `true`