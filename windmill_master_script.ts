/**
 * ============================================================================
 * XPRESSSEO MASTER - VERSÃO COMPLETA CONSOLIDADA
 * ============================================================================
 * 
 * Sistema completo de geração de conteúdo SEO para e-commerce
 * Versão: 4.0.0 (JavaScript Edition)
 * Plano: ADMIN/MASTER (100% recursos)
 * 
 * Deploy: Windmill CE
 * Stack: TypeScript + Supabase + OpenRouter + Google Search API
 * 
 * Copyright © 2025 XpressSEO - Todos os direitos reservados
 * ============================================================================
 */

// ============================================================================
// IMPORTS - CDN para compatibilidade com Windmill Deno
// ============================================================================
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface MainArgs {
  projectId: string
  userId: string
  userMessage: string
  currentStep?: number
  supabaseUrl: string
  supabaseKey: string
  openrouterKey: string
  googleApiKey?: string
  googleCx?: string
  userPlan?: 'free' | 'standard' | 'premium' | 'admin'
  creditsRemaining?: number
}

interface StructuredResponse {
  type: 'structured_response'
  messages: Array<{
    type: 'text' | 'options' | 'error'
    data: any
  }>
  metadata?: {
    currentStep: number
    mode: 'content_generation' | 'gsc_analysis'
    creditsUsed?: number
    creditsRemaining?: number
  }
}

interface ValidationResult {
  isValid: boolean
  action: 'approve' | 'reject' | 'select' | 'invalid' | 'unknown'
  selectedOption?: number
  message?: string
}

interface SearchResult {
  position: number
  title: string
  snippet: string
  url: string
  domain: string
  type: 'ecommerce' | 'marketplace' | 'review' | 'blog' | 'informational'
}

interface MarketAnalysis {
  query: string
  country: string
  totalResults: number
  competitors: SearchResult[]
  patterns: {
    avgTitleLength: number
    commonKeywords: string[]
    emotionalTriggers: string[]
    commonCTAs: string[]
  }
  contentGaps: string[]
  opportunities: {
    difficulty: 'baixa' | 'média' | 'alta'
    estimatedVolume: string
    paidCompetition: 'baixa' | 'média' | 'alta'
    trend: 'crescente' | 'estável' | 'decrescente'
  }
  xpressScore: {
    score: number
    category: '🟢 EXCELENTE' | '🟡 BOM' | '🟠 REGULAR' | '🔴 BAIXO'
    reasoning: string
  }
}

// ============================================================================
// PROMPTS & CONTENT
// ============================================================================

const MASTER_PROMPT = {
  apresentacao: `Olá! 👋 Sou seu assistente especialista em SEO e você está no Plano MASTER.

Vou te ajudar a criar conteúdo otimizado completo para seu produto em 9 etapas:
✅ Títulos e meta tags otimizados
✅ Descrições persuasivas
✅ Artigos de blog para rankeamento e monetização
✅ Legendas para redes sociais
✅ Validação técnica completa

Podemos começar?`,

  mensagens: {
    'pt-BR': {
      pergunta_nome: 'Para personalizar seu atendimento, qual é o seu nome?',
      pergunta_site: 'Qual é o endereço do seu site?\n\nExemplo: https://www.minhaloja.com',
      pergunta_pais: 'Em qual país seu produto será vendido?\n\nExemplo: Brasil, Portugal, Estados Unidos, etc.',
      pergunta_produto: 'Por fim, qual é o link do produto que vamos otimizar?\n\nPode ser de AliExpress, Shopify, Amazon, ou qualquer outra plataforma.',
      confirmacao_nome: 'Prazer, {nome_usuario}! ✓',
      confirmacao_site: 'Site registrado ✓',
      confirmacao_pais: 'País registrado ✓',
      confirmacao_produto: 'Link recebido ✓',
      aprovado: '**COMANDO:** Digite 1 para APROVAR e continuar',
      refazer: '**COMANDO:** Digite 9 para REFAZER esta etapa',
      selecionar_opcao: '**COMANDO:** Digite o número da opção escolhida (1-5)',
      conteudo_aprovado: '✅ Conteúdo aprovado! Avançando...',
      opcao_selecionada: '✓ Opção {numero} selecionada.',
      refazendo: '🔄 Refazendo etapa...',
      iniciando_analise: '✅ Perfeito! Iniciando análise... 🚀',
      analise_mercado: '🔄 Iniciando análise de mercado via Google...\n⏳ Isso pode levar alguns segundos.'
    }
  }
}

const ETAPA_PROMPTS = {
  1: {
    titulo: 'Título H2 da Coleção',
    tipo: 'approval' as const,
    systemPrompt: `Você é um Web Designer e Redator Criativo especializado em SEO.
Crie um título H2 atrativo para a coleção do produto com uma breve descrição complementar.
Use HTML semântico (<h2> e <p>).`,
    promptTemplate: `Crie um título H2 e descrição para:
Produto: {palavra_chave_principal}
País: {pais_venda}
Site: {nome_site_usuario}

Insights do mercado:
{insights_resumo}

Formato de saída:
<h2>Título Atrativo Aqui</h2>
<p>Descrição complementar breve e persuasiva.</p>`
  },
  
  2: {
    titulo: 'Meta Title da Coleção',
    tipo: 'options' as const,
    count: 5,
    systemPrompt: `Você é um Especialista em SEO e Growth Hacker.
Crie meta titles otimizados (55-60 caracteres) focados em CTR máximo.`,
    promptTemplate: `Crie 5 meta titles para:
Produto: {palavra_chave_principal}
Padrões identificados: {padroes_titulos}
Keywords comuns: {keywords_comuns}

Diretrizes:
- 55-60 caracteres EXATO
- Incluir palavra-chave principal
- Usar gatilhos emocionais
- Aplicar padrões dos concorrentes

IMPORTANTE: Retorne APENAS JSON:
[
  {"number": 1, "content": "Meta Title 1 aqui"},
  {"number": 2, "content": "Meta Title 2 aqui"},
  {"number": 3, "content": "Meta Title 3 aqui"},
  {"number": 4, "content": "Meta Title 4 aqui"},
  {"number": 5, "content": "Meta Title 5 aqui"}
]`
  },

  3: {
    titulo: 'Meta Description da Coleção',
    tipo: 'options' as const,
    count: 5,
    systemPrompt: `Você é um Especialista em Copywriting Persuasivo.
Crie meta descriptions que convertem (155-160 caracteres).`,
    promptTemplate: `Baseado no meta title escolhido: {etapa2_escolha}

Crie 5 meta descriptions:
- 155-160 caracteres EXATO
- Tom atrativo e objetivo
- Focado em cliques
- Use CTAs identificados: {ctas_comuns}

Retorne APENAS JSON com 5 opções.`
  },

  4: {
    titulo: 'Descrição do Produto',
    tipo: 'approval' as const,
    systemPrompt: `Você é um Especialista em E-commerce e Marketing de Produto.
Crie descrição SEO otimizada (400-600 palavras) com estrutura HTML.`,
    promptTemplate: `Produto: {palavra_chave_principal}
Gaps de conteúdo identificados: {content_gaps}

Crie descrição completa com:
- H2 com palavra-chave principal
- H3 para características
- Listas de benefícios
- CTA persuasivo
- Aproveitar gaps: {content_gaps}

Use HTML semântico.`
  },

  5: {
    titulo: 'Meta Title do Produto',
    tipo: 'options' as const,
    count: 5,
    systemPrompt: `Você é um Especialista em SEM e Anúncios Pagos.
Crie meta titles de produto focados em conversão.`,
    promptTemplate: `Produto específico: {palavra_chave_principal}
Aplique padrões: {padroes_titulos}

5 meta titles (55-60 caracteres) focados em alta conversão.
Retorne APENAS JSON.`
  },

  6: {
    titulo: 'Meta Description do Produto',
    tipo: 'options' as const,
    count: 5,
    systemPrompt: `Você é um Especialista em CRO (Conversion Rate Optimization).
Otimize cada palavra para maximizar cliques.`,
    promptTemplate: `Baseado no title: {etapa5_escolha}

5 meta descriptions (155-160 caracteres) focadas em conversão.
Use gatilhos: {gatilhos_emocionais}
Retorne APENAS JSON.`
  },

  7: {
    titulo: 'Artigos de Blog SEO',
    tipo: 'approval' as const,
    systemPrompt: `Você é um SEO Content Strategist & AI Search Optimization Expert.
Crie artigo completo (1500-2500 palavras) otimizado para Google e IA.`,
    promptTemplate: `Produto: {palavra_chave_principal}
Gaps de conteúdo: {content_gaps}
País: {pais_venda}

Crie artigo SEO completo:
1. Título H1 otimizado
2. Introdução (200-300 palavras) - resposta direta
3. Seções H2 com desenvolvimento
4. FAQ (5-8 perguntas)
5. Conclusão com CTA
6. Meta title e description

Abordar gaps: {content_gaps}
Usar keywords: {keywords_comuns}

HTML semântico completo.`
  },

  8: {
    titulo: 'Legendas para Redes Sociais',
    tipo: 'approval' as const,
    systemPrompt: `Você é um Social Media Strategist & AI Search Optimization Specialist.
Crie legendas otimizadas para redes sociais e descoberta por IA.`,
    promptTemplate: `Produto: {palavra_chave_principal}
Gatilhos: {gatilhos_emocionais}

Crie 8 legendas:
- 3 curtas (80-120 caracteres) - Stories/Reels
- 3 médias (150-250 caracteres) - Feed
- 2 longas (300-500 caracteres) - Carrosséis

Para cada:
- Hook atraente
- Benefícios principais
- CTA claro
- Hashtags estratégicas (5-10)

Formato markdown com separação clara.`
  },

  9: {
    titulo: 'Validação Técnica',
    tipo: 'approval' as const,
    systemPrompt: `Você é um Especialista em SEO Técnico.
Analise e valide todo o conteúdo gerado.`,
    promptTemplate: `Analise técnica de:
Título H2: {etapa1_resultado}
Meta Titles: {etapa2_escolha}, {etapa5_escolha}
Meta Descriptions: {etapa3_escolha}, {etapa6_escolha}
Descrição: {etapa4_resultado}

Valide:
1. Densidade de palavras-chave
2. Flesch Reading Score
3. Compliance de meta tags (limites)
4. Estrutura hierárquica H1-H6
5. Efetividade de CTAs
6. Escaneabilidade

Relatório técnico completo em markdown.`
  }
}

const GLOSSARIO_TRADUCAO = {
  'relógio': {
    'en-US': 'wristwatch',
    'en-GB': 'wristwatch',
    'fr': 'montre',
    'es': 'reloj de pulsera',
    'de': 'Armbanduhr',
    'it': 'orologio da polso'
  },
  'bolsa': {
    'en-US': 'handbag',
    'en-GB': 'handbag',
    'fr': 'sac à main',
    'es': 'bolso de mano',
    'de': 'Handtasche',
    'it': 'borsa a mano'
  },
  'tênis': {
    'en-US': 'sneakers',
    'en-GB': 'trainers',
    'fr': 'baskets',
    'es': 'zapatillas deportivas',
    'de': 'Sportschuhe',
    'it': 'scarpe da ginnastica'
  }
  // Adicionar mais conforme glossário original
}

// ============================================================================
// VALIDATION ENGINE
// ============================================================================

class ValidationEngine {
  private approvalPatterns = [
    /^(sim|s|ok|aprovado|confirmo|perfeito|certo|beleza|segue|pode|vai|aceito|concordo)$/i,
    /^(yes|y|ok|approved|good|perfect|go ahead|proceed|agree|confirm)$/i,
    /^(sí|si|vale|aprobado|perfecto|adelante|confirmo|acepto)$/i,
    /^(oui|d'accord|approuvé|parfait|confirme|accepte)$/i,
    /^(ja|ok|genehmigt|perfekt|bestätigen|akzeptieren)$/i,
    /^(sì|si|ok|approvato|perfetto|confermo|accetto)$/i,
    /^1$/
  ]

  private rejectionPatterns = [
    /^(não|nao|n|refazer|mudar|alterar|negativo|reprovo|rejeito)$/i,
    /^(no|n|redo|change|modify|negative|reject)$/i,
    /^(no|rehacer|cambiar|negativo|rechazo)$/i,
    /^(non|refaire|changer|négatif|rejette)$/i,
    /^(nein|ändern|negativ|ablehnen)$/i,
    /^(no|rifare|cambiare|negativo|rifiuto)$/i,
    /^9$/
  ]

  validate(userInput: string, context: {
    currentStep: number
    etapaReal?: number
    expectedType: 'approval' | 'selection' | 'text'
    maxOptions?: number
  }): ValidationResult {
    const input = userInput.trim()

    if (!input) {
      return { isValid: false, action: 'invalid', message: 'Por favor, forneça uma resposta.' }
    }

    if (context.expectedType === 'approval') {
      return this.validateApproval(input)
    }

    if (context.expectedType === 'selection') {
      return this.validateSelection(input, context.maxOptions || 5)
    }

    if (context.expectedType === 'text') {
      return this.validateText(input, context)
    }

    return { isValid: false, action: 'unknown', message: 'Tipo de validação desconhecido.' }
  }

  private validateApproval(input: string): ValidationResult {
    for (const pattern of this.approvalPatterns) {
      if (pattern.test(input)) {
        return { isValid: true, action: 'approve' }
      }
    }

    for (const pattern of this.rejectionPatterns) {
      if (pattern.test(input)) {
        return { isValid: true, action: 'reject' }
      }
    }

    return {
      isValid: false,
      action: 'invalid',
      message: 'Responda apenas com "Sim" ou "Não" (ou 1 para aprovar, 9 para refazer).'
    }
  }

  private validateSelection(input: string, maxOptions: number): ValidationResult {
    const numberMatch = input.match(/(\d+)/)

    if (!numberMatch) {
      return {
        isValid: false,
        action: 'invalid',
        message: `Digite o número da opção escolhida (1-${maxOptions}).`
      }
    }

    const number = parseInt(numberMatch[1])

    if (number === 9) {
      return { isValid: true, action: 'reject' }
    }

    if (number < 1 || number > maxOptions) {
      return {
        isValid: false,
        action: 'invalid',
        message: `Opção inválida. Digite um número entre 1 e ${maxOptions} (ou 9 para refazer).`
      }
    }

    return { isValid: true, action: 'select', selectedOption: number }
  }

  private validateText(input: string, context: any): ValidationResult {
    if (context.currentStep === 2 && input.length < 2) {
      return { isValid: false, action: 'invalid', message: 'Por favor, forneça seu nome completo.' }
    }

    if (context.currentStep === 3 && !this.isValidURL(input)) {
      return {
        isValid: false,
        action: 'invalid',
        message: 'Por favor, forneça uma URL válida (ex: https://seusite.com).'
      }
    }

    if (context.currentStep === 4 && input.length < 3) {
      return { isValid: false, action: 'invalid', message: 'Por favor, forneça o nome do país.' }
    }

    if (context.currentStep === 5 && !this.isValidURL(input)) {
      return {
        isValid: false,
        action: 'invalid',
        message: 'Por favor, forneça um link válido do produto.'
      }
    }

    return { isValid: true, action: 'approve' }
  }

  private isValidURL(str: string): boolean {
    try {
      const url = new URL(str)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      if (!str.startsWith('http')) {
        try {
          new URL(`https://${str}`)
          return true
        } catch {
          return false
        }
      }
      return false
    }
  }

  normalizeURL(url: string): string {
    if (!url.startsWith('http')) {
      return `https://${url}`
    }
    return url
  }
}

// ============================================================================
// MEMORY MANAGER
// ============================================================================

class MemoryManager {
  private supabase: SupabaseClient
  private projectId: string
  private memory: Map<string, any>
  private isDirty: boolean = false

  constructor(supabase: SupabaseClient, projectId: string) {
    this.supabase = supabase
    this.projectId = projectId
    this.memory = new Map()
    this.initializeDefaults()
  }

  private initializeDefaults(): void {
    const defaults = {
      nome_usuario: '',
      nome_site_usuario: '',
      link_produto: '',
      pais_venda: '',
      palavra_chave_principal: '',
      dados_extraidos_do_link: {},
      insights_pesquisa: {},
      xpress_score: {},
      user_interface_language: 'pt-BR',
      apresentacao_feita: false,
      analise_aprovada: false,
      status_projeto: 'in_progress',
      current_step: 1
    }

    for (const [key, value] of Object.entries(defaults)) {
      this.memory.set(key, value)
    }

    for (let i = 1; i <= 9; i++) {
      this.memory.set(`etapa${i}_resultado`, null)
      this.memory.set(`etapa${i}_escolha`, null)
      this.memory.set(`etapa${i}_status`, 'PENDENTE')
    }
  }

  async loadProjectState(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('extracted_data, current_step, status, ai_state')
        .eq('id', this.projectId)
        .single()

      if (error) throw error

      if (data && data.extracted_data) {
        for (const [key, value] of Object.entries(data.extracted_data)) {
          this.memory.set(key, value)
        }
        console.log('✅ Estado do projeto carregado')
      }
    } catch (error) {
      console.error('❌ Erro ao carregar estado:', error)
    }
  }

  async save(): Promise<void> {
    if (!this.isDirty) {
      return
    }

    try {
      const dataToSave: Record<string, any> = {}
      for (const [key, value] of this.memory.entries()) {
        dataToSave[key] = value
      }

      const { error } = await this.supabase
        .from('projects')
        .update({
          extracted_data: dataToSave,
          current_step: this.get('current_step'),
          updated_at: new Date().toISOString()
        })
        .eq('id', this.projectId)

      if (error) throw error

      this.isDirty = false
      console.log('✅ Estado salvo com sucesso')
    } catch (error) {
      console.error('❌ Erro ao salvar estado:', error)
      throw error
    }
  }

  set(key: string, value: any): void {
    this.memory.set(key, value)
    this.isDirty = true
  }

  get(key: string): any {
    return this.memory.get(key)
  }

  has(key: string): boolean {
    return this.memory.has(key)
  }

  getAll(): Record<string, any> {
    const result: Record<string, any> = {}
    for (const [key, value] of this.memory.entries()) {
      result[key] = value
    }
    return result
  }
}

// ============================================================================
// FLOW CONTROLLER
// ============================================================================

class FlowController {
  private memory: MemoryManager
  private validation: ValidationEngine

  constructor(memory: MemoryManager, validation: ValidationEngine) {
    this.memory = memory
    this.validation = validation
  }

  async advanceStep(): Promise<number> {
    const currentStep = this.getCurrentStep()
    const nextStep = currentStep + 1

    this.memory.set('current_step', nextStep)
    await this.memory.save()

    console.log(`➡️ Avançando: Step ${currentStep} → ${nextStep}`)
    return nextStep
  }

  getCurrentStep(): number {
    return this.memory.get('current_step') || 1
  }

  getEtapaReal(step?: number): number | null {
    const currentStep = step || this.getCurrentStep()

    if (currentStep <= 7) {
      return null
    }

    // Mapeamento: Step 8 -> Etapa 1, Step 16 -> Etapa 9
    if (currentStep >= 8 && currentStep <= 16) {
      return currentStep - 7
    }

    return null
  }
}

// ============================================================================
// GOOGLE SEARCH ANALYZER
// ============================================================================

class GoogleSearchAnalyzer {
  private apiKey: string
  private searchEngineId: string
  private cache: Map<string, { data: any; timestamp: number }>
  private cacheTTL = 3600000

  constructor(apiKey: string, searchEngineId: string) {
    this.apiKey = apiKey
    this.searchEngineId = searchEngineId
    this.cache = new Map()
  }

  async analyzeMarket(productName: string, country: string = 'BR'): Promise<MarketAnalysis> {
    console.log('🔍 Iniciando análise de mercado:', { productName, country })

    const mainQuery = `${productName} comprar ${this.getCountryName(country)}`
    const results = await this.search(mainQuery, country)

    const competitors = this.extractCompetitors(results)
    const patterns = this.analyzePatterns(competitors)
    const gaps = this.identifyContentGaps(competitors, productName)
    const opportunities = this.assessOpportunities(competitors)
    const xpressScore = this.calculateXPressScore(competitors, opportunities)

    return {
      query: mainQuery,
      country,
      totalResults: parseInt(results.searchInformation?.totalResults || '0'),
      competitors,
      patterns,
      contentGaps: gaps,
      opportunities,
      xpressScore
    }
  }

  private async search(query: string, country: string): Promise<any> {
    const cacheKey = `${query}_${country}`

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      if (Date.now() - cached.timestamp < this.cacheTTL) {
        console.log('⚡ Cache hit:', cacheKey)
        return cached.data
      }
    }

    const params = new URLSearchParams({
      key: this.apiKey,
      cx: this.searchEngineId,
      q: query,
      num: '10',
      hl: this.getLanguage(country),
      gl: country.toLowerCase(),
      safe: 'active'
    })

    const url = `https://www.googleapis.com/customsearch/v1?${params}`

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Google API error: ${response.status}`)
      }

      const data = await response.json()
      this.cache.set(cacheKey, { data, timestamp: Date.now() })

      return data
    } catch (error) {
      console.error('❌ Erro na busca Google:', error)
      return this.getMockResults(query, country)
    }
  }

  private extractCompetitors(apiData: any): SearchResult[] {
    const items = apiData.items || []

    return items.slice(0, 10).map((item: any, index: number) => ({
      position: index + 1,
      title: item.title || '',
      snippet: item.snippet || '',
      url: item.link || '',
      domain: this.extractDomain(item.link || ''),
      type: this.classifyResultType(item)
    }))
  }

  private classifyResultType(item: any): SearchResult['type'] {
    const snippet = (item.snippet || '').toLowerCase()
    const url = (item.link || '').toLowerCase()

    if (snippet.includes('comprar') || snippet.includes('preço') || snippet.includes('r$')) {
      return 'ecommerce'
    }

    if (url.includes('mercadolivre') || url.includes('amazon') || url.includes('shopee')) {
      return 'marketplace'
    }

    if (snippet.includes('review') || snippet.includes('análise') || snippet.includes('avaliação')) {
      return 'review'
    }

    if (snippet.includes('como') || snippet.includes('guia') || snippet.includes('dicas')) {
      return 'blog'
    }

    return 'informational'
  }

  private analyzePatterns(competitors: SearchResult[]): MarketAnalysis['patterns'] {
    const titles = competitors.map(c => c.title)

    const avgTitleLength = Math.round(
      titles.reduce((sum, t) => sum + t.length, 0) / titles.length
    )

    const commonKeywords = this.extractCommonKeywords(titles)
    const emotionalTriggers = this.identifyEmotionalTriggers(
      titles.concat(competitors.map(c => c.snippet))
    )
    const commonCTAs = this.extractCTAs(competitors.map(c => c.snippet))

    return { avgTitleLength, commonKeywords, emotionalTriggers, commonCTAs }
  }

  private extractCommonKeywords(texts: string[]): string[] {
    const stopWords = ['de', 'da', 'do', 'para', 'com', 'em', 'a', 'o', 'e']
    const wordCount = new Map<string, number>()

    texts.forEach(text => {
      const words = text.toLowerCase()
        .replace(/[^\w\sáéíóúâêôãõç]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.includes(w))

      words.forEach(word => {
        wordCount.set(word, (wordCount.get(word) || 0) + 1)
      })
    })

    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word)
  }

  private identifyEmotionalTriggers(texts: string[]): string[] {
    const triggers = new Set<string>()
    const triggerPatterns = [
      { pattern: /melhor|top|#1|número 1/i, name: 'autoridade' },
      { pattern: /grátis|free|sem custo/i, name: 'gratuidade' },
      { pattern: /desconto|oferta|promoção/i, name: 'urgência' },
      { pattern: /exclusiv|limit|últim/i, name: 'escassez' },
      { pattern: /garanti|certificad|original/i, name: 'confiança' },
      { pattern: /rápid|express|24h/i, name: 'velocidade' }
    ]

    texts.forEach(text => {
      triggerPatterns.forEach(({ pattern, name }) => {
        if (pattern.test(text)) {
          triggers.add(name)
        }
      })
    })

    return Array.from(triggers)
  }

  private extractCTAs(snippets: string[]): string[] {
    const ctas = new Set<string>()
    const ctaPatterns = [
      /compre (agora|já)/i,
      /ver (ofertas|preços)/i,
      /confira/i,
      /aproveite/i,
      /garanta (já|agora)/i,
      /saiba mais/i
    ]

    snippets.forEach(snippet => {
      ctaPatterns.forEach(pattern => {
        const match = snippet.match(pattern)
        if (match) {
          ctas.add(match[0].toLowerCase())
        }
      })
    })

    return Array.from(ctas).slice(0, 3)
  }

  private identifyContentGaps(competitors: SearchResult[], productName: string): string[] {
    const gaps: string[] = []
    const allText = competitors.map(c => `${c.title} ${c.snippet}`).join(' ').toLowerCase()

    const gapChecks = [
      { keyword: 'como usar', gap: 'Tutorial de uso' },
      { keyword: 'review', gap: 'Reviews e avaliações' },
      { keyword: 'comparar|vs', gap: 'Comparativos' },
      { keyword: 'preço', gap: 'Informação de preço' },
      { keyword: 'garantia', gap: 'Garantias e políticas' },
      { keyword: 'frete', gap: 'Informações de entrega' }
    ]

    gapChecks.forEach(({ keyword, gap }) => {
      if (!new RegExp(keyword, 'i').test(allText)) {
        gaps.push(gap)
      }
    })

    return gaps.slice(0, 3)
  }

  private assessOpportunities(competitors: SearchResult[]): MarketAnalysis['opportunities'] {
    const ecommerceCount = competitors.filter(c => c.type === 'ecommerce').length
    const marketplaceCount = competitors.filter(c => c.type === 'marketplace').length

    let difficulty: 'baixa' | 'média' | 'alta' = 'média'
    if (marketplaceCount >= 6) difficulty = 'alta'
    else if (marketplaceCount <= 3) difficulty = 'baixa'

    let paidCompetition: 'baixa' | 'média' | 'alta' = 'média'
    if (ecommerceCount >= 7) paidCompetition = 'alta'
    else if (ecommerceCount <= 3) paidCompetition = 'baixa'

    return {
      difficulty,
      estimatedVolume: '1.000-10.000',
      paidCompetition,
      trend: 'estável'
    }
  }

  private calculateXPressScore(
    competitors: SearchResult[],
    opportunities: MarketAnalysis['opportunities']
  ): MarketAnalysis['xpressScore'] {
    let score = 50

    if (competitors.length < 5) score += 15
    if (opportunities.difficulty === 'baixa') score += 20
    if (opportunities.paidCompetition === 'baixa') score += 10

    if (competitors.filter(c => c.type === 'marketplace').length > 6) score -= 20
    if (opportunities.difficulty === 'alta') score -= 15

    score = Math.max(0, Math.min(100, score))

    let category: MarketAnalysis['xpressScore']['category']
    if (score >= 75) category = '🟢 EXCELENTE'
    else if (score >= 60) category = '🟡 BOM'
    else if (score >= 45) category = '🟠 REGULAR'
    else category = '🔴 BAIXO'

    return {
      score,
      category,
      reasoning: this.generateScoreReasoning(score, competitors, opportunities)
    }
  }

  private generateScoreReasoning(
    score: number,
    competitors: SearchResult[],
    opportunities: MarketAnalysis['opportunities']
  ): string {
    const parts: string[] = []

    if (score >= 75) {
      parts.push('Excelente oportunidade de mercado')
    } else if (score >= 60) {
      parts.push('Boa oportunidade com esforço moderado')
    } else if (score >= 45) {
      parts.push('Mercado competitivo, requer estratégia')
    } else {
      parts.push('Nicho saturado, considere outros produtos')
    }

    parts.push(`${competitors.length} concorrentes identificados`)
    parts.push(`Dificuldade: ${opportunities.difficulty}`)

    return parts.join('. ') + '.'
  }

  private extractDomain(url: string): string {
    try {
      const parsed = new URL(url)
      return parsed.hostname.replace('www.', '')
    } catch {
      return ''
    }
  }

  private getLanguage(country: string): string {
    const map: Record<string, string> = {
      'BR': 'pt', 'PT': 'pt',
      'US': 'en', 'UK': 'en',
      'ES': 'es', 'MX': 'es',
      'FR': 'fr',
      'IT': 'it',
      'DE': 'de'
    }
    return map[country.toUpperCase()] || 'pt'
  }

  private getCountryName(code: string): string {
    const map: Record<string, string> = {
      'BR': 'Brasil',
      'PT': 'Portugal',
      'US': 'Estados Unidos',
      'ES': 'Espanha',
      'FR': 'França',
      'IT': 'Itália',
      'DE': 'Alemanha'
    }
    return map[code.toUpperCase()] || code
  }

  private getMockResults(query: string, country: string): any {
    console.warn('⚠️ Usando resultados mock (Google API offline)')

    return {
      searchInformation: { totalResults: '1000000' },
      items: [
        { title: `${query} - Exemplo 1`, snippet: 'Descrição exemplo...', link: 'https://example.com/1' },
        { title: `${query} - Exemplo 2`, snippet: 'Outra descrição...', link: 'https://example.com/2' }
      ]
    }
  }
}

// ============================================================================
// OPENROUTER CLIENT
// ============================================================================

class OpenRouterClient {
  private apiKey: string
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions'
  private cache: Map<string, { response: string; timestamp: number }>
  private cacheTTL = 300000

  private models = {
    geral: 'meta-llama/llama-3.1-8b-instruct',
    criativo: 'anthropic/claude-3.5-sonnet',
    tecnico: 'openai/gpt-4o',
    traducao: 'openai/gpt-4o-mini',
    analise: 'anthropic/claude-3-opus'
  }

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.cache = new Map()
  }

  async generate(
    prompt: string,
    options: {
      model?: keyof typeof this.models
      systemPrompt?: string
      temperature?: number
      maxTokens?: number
      useCache?: boolean
    } = {}
  ): Promise<{ content: string; tokens: number; model: string }> {
    const {
      model = 'geral',
      systemPrompt,
      temperature = 0.7,
      maxTokens = 2048,
      useCache = true
    } = options

    if (useCache) {
      const cacheKey = this.getCacheKey(prompt, model, systemPrompt)
      const cached = this.cache.get(cacheKey)

      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        console.log('⚡ Cache hit OpenRouter')
        return {
          content: cached.response,
          tokens: 0,
          model: this.models[model]
        }
      }
    }

    const messages: any[] = []

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }

    messages.push({ role: 'user', content: prompt })

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://windmill.dxsdigital.com',
          'X-Title': 'XpressSEO Windmill'
        },
        body: JSON.stringify({
          model: this.models[model],
          messages,
          temperature: Math.max(0.1, Math.min(1.0, temperature)),
          max_tokens: Math.max(100, Math.min(4000, maxTokens))
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`OpenRouter error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      const content = data.choices[0].message.content
      const tokens = data.usage?.total_tokens || 0

      console.log(`✅ OpenRouter - ${tokens} tokens - Modelo: ${this.models[model]}`)

      if (useCache) {
        const cacheKey = this.getCacheKey(prompt, model, systemPrompt)
        this.cache.set(cacheKey, { response: content, timestamp: Date.now() })
      }

      return { content, tokens, model: this.models[model] }
    } catch (error) {
      console.error('❌ Erro OpenRouter:', error)
      throw error
    }
  }

  async generateOptions(
    prompt: string,
    count: number = 5,
    options?: {
      model?: keyof typeof this.models
      systemPrompt?: string
    }
  ): Promise<Array<{ number: number; content: string }>> {
    const fullPrompt = `${prompt}

IMPORTANTE: Retorne APENAS um array JSON válido com ${count} opções.
Formato EXATO:
[
  {"number": 1, "content": "opção 1 aqui"},
  {"number": 2, "content": "opção 2 aqui"}
]

NÃO inclua nenhum texto antes ou depois do JSON.
NÃO use markdown code blocks.
Apenas o array JSON puro.`

    const result = await this.generate(fullPrompt, {
      ...options,
      model: options?.model || 'criativo',
      temperature: 0.8
    })

    try {
      let cleaned = result.content.trim()
      cleaned = cleaned.replace(/```json\s*/g, '')
      cleaned = cleaned.replace(/```\s*/g, '')

      const jsonMatch = cleaned.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('Nenhum array JSON encontrado')
      }

      const parsed = JSON.parse(jsonMatch[0])

      if (!Array.isArray(parsed)) {
        throw new Error('Resposta não é um array')
      }

      const validated = parsed.map((item, index) => ({
        number: item.number || index + 1,
        content: item.content || `Opção ${index + 1}`
      }))

      return validated.slice(0, count)
    } catch (error) {
      console.error('❌ Erro ao parsear opções:', error)

      return Array.from({ length: count }, (_, i) => ({
        number: i + 1,
        content: `Opção ${i + 1} - Conteúdo gerado automaticamente`
      }))
    }
  }

  private getCacheKey(prompt: string, model: string, systemPrompt?: string): string {
    const key = `${model}:${prompt}:${systemPrompt || ''}`
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(36)
  }
}

// ============================================================================
// TRANSLATOR
// ============================================================================

class Translator {
  private glossary = GLOSSARIO_TRADUCAO

  async translate(text: string, targetLang: string): Promise<string> {
    // Verificar glossário primeiro
    for (const [ptWord, translations] of Object.entries(this.glossary)) {
      if (text.toLowerCase().includes(ptWord)) {
        const translation = translations[targetLang as keyof typeof translations]
        if (translation) {
          text = text.replace(new RegExp(ptWord, 'gi'), translation)
        }
      }
    }

    return text
  }

  getLanguageName(code: string): string {
    const names: Record<string, string> = {
      'en-US': 'English (US)',
      'en-GB': 'English (UK)',
      'fr': 'Français',
      'es': 'Español',
      'de': 'Deutsch',
      'it': 'Italiano',
      'pt-PT': 'Português (PT)'
    }
    return names[code] || code
  }
}

// ============================================================================
// HTML GENERATOR
// ============================================================================

class HTMLGenerator {
  generateProductHTML(content: string, styles: string = ''): string {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h2 { color: #2c3e50; font-size: 2rem; margin-bottom: 1rem; }
    h3 { color: #34495e; font-size: 1.5rem; margin-top: 2rem; margin-bottom: 1rem; }
    p { margin-bottom: 1rem; }
    ul { margin-left: 1.5rem; margin-bottom: 1rem; }
    li { margin-bottom: 0.5rem; }
    strong { color: #2c3e50; }
    @media (max-width: 768px) { body { padding: 10px; } h2 { font-size: 1.5rem; } h3 { font-size: 1.2rem; } }
    ${styles}
  </style>
</head>
<body>
  ${content}
</body>
</html>`
  }
}

// ============================================================================
// CONTENT GENERATION MODE
// ============================================================================

class ContentGenerationMode {
  private config: any
  private messages: Array<{ type: string; data: any }> = []

  constructor(config: any) {
    this.config = config
  }

  async execute() {
    console.log('📝 Executando modo: Geração de Conteúdo')

    const { currentStep } = this.config

    if (currentStep <= 6) {
      return await this.executeFase0()
    }

    if (currentStep === 7) {
      return await this.executeFase1()
    }

    if (currentStep >= 8 && currentStep <= 16) {
      return await this.executeFase2()
    }

    if (currentStep >= 17) {
      return await this.executeFase3()
    }

    return this.createResponse()
  }

  private async executeFase0() {
    const { currentStep, userMessage, memory, validation } = this.config
    const msg = MASTER_PROMPT.mensagens['pt-BR']

    if (currentStep === 1 && !memory.get('apresentacao_feita')) {
      this.messages.push({ type: 'text', data: MASTER_PROMPT.apresentacao })
      memory.set('apresentacao_feita', true)
      await memory.save()
      return this.createResponse()
    }

    if (currentStep === 1 && memory.get('apresentacao_feita')) {
      if (!userMessage) {
        return this.createResponse()
      }

      const validacao = validation.validate(userMessage, {
        currentStep: 1,
        expectedType: 'approval'
      })

      if (validacao.action === 'approve') {
        this.messages.push({ type: 'text', data: 'Perfeito! ✓' })
        await this.config.flowController.advanceStep()

        const msg = MASTER_PROMPT.mensagens['pt-BR']
        this.messages.push({ type: 'text', data: msg.pergunta_nome })

        return this.createResponse()
      } else {
        this.messages.push({
          type: 'text',
          data: 'Sem problemas! Quando estiver pronto, me avise e começamos. 😊'
        })
        return this.createResponse()
      }
    }

    return await this.processColeta()
  }

  private async processColeta() {
    const { currentStep, userMessage, memory, validation } = this.config
    const msg = MASTER_PROMPT.mensagens['pt-BR']

    if (!userMessage) {
      const questions: Record<number, string> = {
        2: msg.pergunta_nome,
        3: msg.pergunta_site,
        4: msg.pergunta_pais,
        5: msg.pergunta_produto,
        6: this.buildConfirmacao()
      }

      const question = questions[currentStep]
      if (question) {
        this.messages.push({ type: 'text', data: question })
      }

      return this.createResponse()
    }

    const validacao = validation.validate(userMessage, {
      currentStep,
      expectedType: 'text'
    })

    if (!validacao.isValid) {
      this.messages.push({ type: 'text', data: validacao.message || 'Resposta inválida.' })
      return this.createResponse()
    }

    switch (currentStep) {
      case 2:
        memory.set('nome_usuario', userMessage)
        this.messages.push({ type: 'text', data: msg.confirmacao_nome.replace('{nome_usuario}', userMessage) })
        await this.config.flowController.advanceStep()
        this.messages.push({ type: 'text', data: msg.pergunta_site })
        break

      case 3:
        const siteNormalizado = validation.normalizeURL(userMessage)
        memory.set('nome_site_usuario', siteNormalizado)
        this.messages.push({ type: 'text', data: msg.confirmacao_site })
        await this.config.flowController.advanceStep()
        this.messages.push({ type: 'text', data: msg.pergunta_pais })
        break

      case 4:
        memory.set('pais_venda', userMessage)
        this.messages.push({ type: 'text', data: msg.confirmacao_pais })
        await this.config.flowController.advanceStep()
        this.messages.push({ type: 'text', data: msg.pergunta_produto })
        break

      case 5:
        const produtoNormalizado = validation.normalizeURL(userMessage)
        memory.set('link_produto', produtoNormalizado)
        this.messages.push({ type: 'text', data: msg.confirmacao_produto })
        await this.config.flowController.advanceStep()

        const confirmacao = this.buildConfirmacao()
        this.messages.push({ type: 'text', data: confirmacao })
        break

      case 6:
        if (validacao.action === 'approve') {
          this.messages.push({ type: 'text', data: msg.iniciando_analise })
          await this.config.flowController.advanceStep()
          return await this.executeFase1()
        } else {
          this.messages.push({
            type: 'text',
            data: 'O que você gostaria de corrigir? (nome/site/país/produto)'
          })
        }
        break
    }

    await memory.save()
    return this.createResponse()
  }

  private buildConfirmacao(): string {
    const { memory } = this.config

    return `📋 **INFORMAÇÕES COLETADAS:**

👤 Nome: ${memory.get('nome_usuario')}
🌐 Site: ${memory.get('nome_site_usuario')}
🌍 País: ${memory.get('pais_venda')}
🔗 Produto: ${memory.get('link_produto')}

${MASTER_PROMPT.mensagens['pt-BR'].aprovado}`
  }

  private async executeFase1() {
    const { googleSearch, memory } = this.config
    const msg = MASTER_PROMPT.mensagens['pt-BR']

    console.log('📊 Executando Fase 1: Análise de Mercado')

    if (memory.get('analise_aprovada')) {
      await this.config.flowController.advanceStep()
      return await this.executeFase2()
    }

    if (!memory.get('analise_mercado')) {
      this.messages.push({ type: 'text', data: msg.analise_mercado })

      const linkProduto = memory.get('link_produto')
      const pais = memory.get('pais_venda') || 'Brasil'

      const nomeProduto = this.extractProductName(linkProduto)
      memory.set('palavra_chave_principal', nomeProduto)

      if (googleSearch) {
        const paisCodigo = this.mapCountryCode(pais)
        const analise = await googleSearch.analyzeMarket(nomeProduto, paisCodigo)

        memory.set('analise_mercado', analise)
        memory.set('xpress_score', analise.xpressScore)
        memory.set('insights_pesquisa', {
          concorrentes_principais: analise.competitors,
          padroes: analise.patterns,
          gaps: analise.contentGaps,
          oportunidades: analise.opportunities
        })
      } else {
        const analiseBasica = this.createBasicAnalysis(nomeProduto, pais)
        memory.set('analise_mercado', analiseBasica)
        memory.set('xpress_score', { score: 60, category: '🟡 BOM' })
      }

      await memory.save()
    }

    const resumo = this.buildAnalysisResume()
    this.messages.push({ type: 'text', data: resumo })

    if (this.config.userMessage) {
      const validacao = this.config.validation.validate(this.config.userMessage, {
        currentStep: 7,
        expectedType: 'approval'
      })

      if (validacao.action === 'approve') {
        memory.set('analise_aprovada', true)
        await memory.save()

        this.messages.push({
          type: 'text',
          data: '✅ Análise aprovada! Iniciando geração de conteúdo... 🚀'
        })

        await this.config.flowController.advanceStep()
        return await this.executeFase2()
      } else if (validacao.action === 'reject') {
        // Se rejeitar, volta para o step 6 para corrigir informações
        this.config.flowController.memory.set('current_step', 6)
        await this.config.flowController.memory.save()
        this.messages.push({
          type: 'text',
          data: '❌ Análise rejeitada. Por favor, corrija as informações na Etapa 6 ou digite 1 para aprovar a análise atual.'
        })
      }
    }

    return this.createResponse()
  }

  private buildAnalysisResume(): string {
    const { memory } = this.config
    const analise = memory.get('analise_mercado')
    const score = memory.get('xpress_score')
    const nomeUsuario = memory.get('nome_usuario')
    const produto = memory.get('palavra_chave_principal')
    const pais = memory.get('pais_venda')

    if (!analise || !score) {
      return '⚠️ Análise não disponível.'
    }

    return `📊 **ANÁLISE DE MERCADO CONCLUÍDA**

🎯 **Produto:** ${produto}
🌍 **País:** ${pais}

📈 **XPress Score:** ${score.score}/100 ${score.category}

🏆 **Concorrentes identificados:** ${analise.competitors?.length || 0}
💡 **Oportunidades:** ${analise.contentGaps?.join(', ') || 'N/A'}

${score.reasoning || ''}

Tudo pronto para começarmos com a Etapa 1, ${nomeUsuario}?

${MASTER_PROMPT.mensagens['pt-BR'].aprovado}`
  }

  private async executeFase2() {
    const { currentStep, memory, validation } = this.config
    const etapaReal = currentStep - 7

    console.log(`📝 Executando Etapa ${etapaReal}/9`)

    if (etapaReal > 9) {
      return await this.executeFase3()
    }

    // 1. Processar input do usuário (se houver)
    if (this.config.userMessage) {
      const validacao = validation.validate(this.config.userMessage, {
        currentStep: currentStep,
        etapaReal: etapaReal,
        expectedType: ETAPA_PROMPTS[etapaReal as keyof typeof ETAPA_PROMPTS].tipo === 'options' ? 'selection' : 'approval',
        maxOptions: ETAPA_PROMPTS[etapaReal as keyof typeof ETAPA_PROMPTS].count
      })

      if (validacao.action === 'reject') {
        memory.set(`etapa${etapaReal}_resultado`, null)
        memory.set(`etapa${etapaReal}_status`, 'PENDENTE')
        await memory.save()

        this.messages.push({ type: 'text', data: MASTER_PROMPT.mensagens['pt-BR'].refazendo })
        return await this.generateEtapaContent(etapaReal)
      }

      if (validacao.action === 'approve') {
        memory.set(`etapa${etapaReal}_escolha`, memory.get(`etapa${etapaReal}_resultado`))
        memory.set(`etapa${etapaReal}_status`, 'APROVADO')
        await memory.save()

        this.messages.push({ type: 'text', data: MASTER_PROMPT.mensagens['pt-BR'].conteudo_aprovado })
        await this.config.flowController.advanceStep()
        return await this.executeFase2()
      }

      if (validacao.action === 'select' && validacao.selectedOption) {
        const content = memory.get(`etapa${etapaReal}_resultado`)
        try {
          const opcoes = JSON.parse(content)
          const opcaoEscolhida = opcoes.find((o: any) => o.number === validacao.selectedOption)

          if (opcaoEscolhida) {
            memory.set(`etapa${etapaReal}_escolha`, opcaoEscolhida.content)
            memory.set(`etapa${etapaReal}_status`, 'APROVADO')
            await memory.save()

            this.messages.push({
              type: 'text',
              data: MASTER_PROMPT.mensagens['pt-BR'].opcao_selecionada.replace('{numero}', String(validacao.selectedOption))
            })

            await this.config.flowController.advanceStep()
            return await this.executeFase2()
          } else {
            this.messages.push({ type: 'text', data: '❌ Opção não encontrada. Digite o número correto.' })
            return await this.showEtapaResult(etapaReal, content)
          }
        } catch (e) {
          this.messages.push({ type: 'text', data: '❌ Erro ao processar seleção. Digite 9 para refazer.' })
          return this.createResponse()
        }
      }

      if (!validacao.isValid) {
        this.messages.push({ type: 'text', data: validacao.message || 'Resposta inválida.' })
        return this.createResponse()
      }
    }

    // 2. Gerar ou mostrar conteúdo
    const resultadoExistente = memory.get(`etapa${etapaReal}_resultado`)

    if (resultadoExistente) {
      return await this.showEtapaResult(etapaReal, resultadoExistente)
    } else {
      return await this.generateEtapaContent(etapaReal)
    }
  }

  private async executeFase3() {
    const { memory } = this.config
    
    // Etapa 17: Conclusão
    this.messages.push({
      type: 'text',
      data: '🎉 **PROJETO CONCLUÍDO!**\n\nTodas as 9 etapas de conteúdo foram geradas e aprovadas.'
    })

    // Gerar HTML final (Exemplo)
    const htmlContent = this.config.htmlGenerator.generateProductHTML(
      `<h1>${memory.get('etapa5_escolha') || 'Título'}</h1>
      <h2>${memory.get('etapa1_resultado') || 'H2'}</h2>
      <p>${memory.get('etapa4_resultado') || 'Descrição'}</p>`
    )

    // Salvar HTML no storage ou retornar link (aqui apenas simula)
    this.messages.push({
      type: 'text',
      data: `🔗 **Link para o HTML Otimizado:** [Baixar HTML] (simulação)`
    })

    memory.set('status_projeto', 'completed')
    await memory.save()

    return this.createResponse()
  }

  private async callContentGenerator(etapa: number): Promise<string> {
    const etapaConfig = ETAPA_PROMPTS[etapa as keyof typeof ETAPA_PROMPTS]
    if (!etapaConfig) {
      return `Conteúdo da etapa ${etapa}`
    }

    const { memory, openrouter } = this.config
    const insights = memory.get('insights_pesquisa') || {}

    // Montar contexto para o prompt
    const context = {
      palavra_chave_principal: memory.get('palavra_chave_principal') || '',
      pais_venda: memory.get('pais_venda') || '',
      nome_site_usuario: memory.get('nome_site_usuario') || '',
      nome_usuario: memory.get('nome_usuario') || '',
      etapa2_escolha: memory.get('etapa2_escolha') || '',
      etapa5_escolha: memory.get('etapa5_escolha') || '',
      etapa1_resultado: memory.get('etapa1_resultado') || '',
      etapa4_resultado: memory.get('etapa4_resultado') || '',
      
      // Insights
      padroes_titulos: insights.padroes?.commonKeywords?.join(', ') || 'N/A',
      keywords_comuns: insights.padroes?.commonKeywords?.join(', ') || 'N/A',
      gatilhos_emocionais: insights.padroes?.emotionalTriggers?.join(', ') || 'N/A',
      ctas_comuns: insights.padroes?.commonCTAs?.join(', ') || 'N/A',
      content_gaps: insights.gaps?.join(', ') || 'N/A',
      insights_resumo: JSON.stringify(insights)
    }

    // Renderizar prompt
    let prompt = etapaConfig.promptTemplate || ''

    // Substituir variáveis
    for (const [key, value] of Object.entries(context)) {
      const placeholder = `{${key}}`
      prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value))
    }

    // Gerar conteúdo
    if (etapaConfig.tipo === 'options') {
      const opcoes = await openrouter.generateOptions(
        prompt,
        etapaConfig.count || 5,
        {
          model: 'criativo',
          systemPrompt: etapaConfig.systemPrompt
        }
      )
      return JSON.stringify(opcoes)
    } else {
      const result = await openrouter.generate(prompt, {
        model: 'criativo',
        systemPrompt: etapaConfig.systemPrompt,
        maxTokens: 2500
      })
      return result.content
    }
  }

  private extractProductName(url: string): string {
    try {
      const parsed = new URL(url)
      const path = parsed.pathname
      const parts = path.split('/').filter(p => p.length > 0)
      const lastPart = parts[parts.length - 1]
      return lastPart.replace(/[-_]/g, ' ').replace(/\.(html|htm|php)$/i, '')
    } catch {
      return 'produto'
    }
  }

  private mapCountryCode(country: string): string {
    const map: Record<string, string> = {
      'brasil': 'BR', 'brazil': 'BR',
      'portugal': 'PT',
      'estados unidos': 'US', 'eua': 'US',
      'espanha': 'ES', 'spain': 'ES',
      'frança': 'FR', 'france': 'FR',
      'italia': 'IT', 'itália': 'IT',
      'alemanha': 'DE', 'germany': 'DE'
    }

    const normalized = country.toLowerCase()
    return map[normalized] || 'BR'
  }

  private createBasicAnalysis(product: string, country: string) {
    return {
      query: `${product} comprar ${country}`,
      country,
      totalResults: 1000000,
      competitors: [],
      patterns: {
        avgTitleLength: 60,
        commonKeywords: ['comprar', 'preço', 'melhor'],
        emotionalTriggers: ['urgência', 'confiança'],
        commonCTAs: ['compre agora', 'ver ofertas']
      },
      contentGaps: ['Tutorial de uso', 'Comparativos'],
      opportunities: {
        difficulty: 'média' as const,
        estimatedVolume: '1.000-10.000',
        paidCompetition: 'média' as const,
        trend: 'estável' as const
      },
      xpressScore: {
        score: 60,
        category: '🟡 BOM' as const,
        reasoning: 'Análise básica realizada (Google API não disponível).'
      }
    }
  }

  private createResponse() {
    return {
      type: 'structured_response' as const,
      messages: this.messages,
      metadata: {
        currentStep: this.config.flowController.getCurrentStep(),
        mode: 'content_generation' as const
      }
    }
  }
}

// ============================================================================
// GSC ANALYSIS MODE
// ============================================================================

class GSCAnalysisMode {
  private config: any
  private messages: Array<{ type: string; data: any }> = []

  constructor(config: any) {
    this.config = config
  }

  async execute() {
    console.log('📊 Executando modo: Análise GSC')

    this.messages.push({
      type: 'text',
      data: '📊 **MODO ANÁLISE GSC**\n\nEste modo será implementado em breve para analisar relatórios do Google Search Console.'
    })

    return {
      type: 'structured_response' as const,
      messages: this.messages,
      metadata: {
        currentStep: this.config.memory.get('current_step'),
        mode: 'gsc_analysis' as const
      }
    }
  }
}

// ============================================================================
// MAIN CLASS
// ============================================================================

class XpressSEOMaster {
  private supabase: SupabaseClient
  private validation: ValidationEngine
  private memory: MemoryManager
  private flowController: FlowController
  private googleSearch?: GoogleSearchAnalyzer
  private openrouter: OpenRouterClient
  private translator: Translator
  private htmlGenerator: HTMLGenerator

  private projectId: string
  private userId: string
  private userMessage: string
  private currentStep: number
  private userPlan: string

  constructor(args: MainArgs) {
    this.validateArgs(args)

    this.projectId = args.projectId
    this.userId = args.userId
    this.userMessage = args.userMessage || ''
    this.currentStep = args.currentStep || 1
    this.userPlan = args.userPlan || 'admin'

    this.supabase = createClient(args.supabaseUrl, args.supabaseKey)

    this.validation = new ValidationEngine()
    this.memory = new MemoryManager(this.supabase, this.projectId)
    this.flowController = new FlowController(this.memory, this.validation)
    this.openrouter = new OpenRouterClient(args.openrouterKey)
    this.translator = new Translator()
    this.htmlGenerator = new HTMLGenerator()

    if (args.googleApiKey && args.googleCx) {
      this.googleSearch = new GoogleSearchAnalyzer(args.googleApiKey, args.googleCx)
    }

    console.log('✅ XpressSEO Master inicializado:', {
      projectId: this.projectId,
      step: this.currentStep,
      plan: this.userPlan,
      hasGoogle: !!this.googleSearch
    })
  }

  private validateArgs(args: MainArgs): void {
    const required = ['projectId', 'userId', 'supabaseUrl', 'supabaseKey', 'openrouterKey']
    const missing = required.filter(key => !args[key as keyof MainArgs])

    if (missing.length > 0) {
      throw new Error(`Argumentos obrigatórios faltando: ${missing.join(', ')}`)
    }
  }

  async execute(): Promise<StructuredResponse> {
    try {
      console.log('🚀 Executando XpressSEO Master...')

      await this.memory.loadProjectState()

      // Atualizar currentStep da memória se disponível
      const memoryStep = this.memory.get('current_step')
      if (memoryStep && memoryStep !== this.currentStep) {
        this.currentStep = memoryStep
      } else {
        // Se o currentStep veio do frontend (0 ou 1) e a memória tem um valor maior, use a memória.
        // Se a memória não tem valor, use o valor inicial (1).
        this.currentStep = memoryStep || this.currentStep
      }
      this.memory.set('current_step', this.currentStep)


      const mode = await this.detectMode()

      console.log('📊 Modo detectado:', mode)

      if (mode === 'gsc_analysis') {
        return await this.executeGSCMode()
      } else {
        return await this.executeContentMode()
      }
    } catch (error) {
      console.error('❌ Erro fatal:', error)
      return this.errorResponse(error)
    }
  }

  private async detectMode(): Promise<'content_generation' | 'gsc_analysis'> {
    // Prioriza o modo GSC se o projeto foi criado especificamente para isso
    if (this.memory.get('status_projeto') === 'gsc_analysis_pending') {
      return 'gsc_analysis'
    }

    const mentionsGSC = /google search console|gsc|relat[oó]rio/i.test(this.userMessage)

    if (mentionsGSC) {
      return 'gsc_analysis'
    }

    return 'content_generation'
  }

  private async executeContentMode(): Promise<StructuredResponse> {
    const mode = new ContentGenerationMode({
      supabase: this.supabase,
      validation: this.validation,
      memory: this.memory,
      flowController: this.flowController,
      googleSearch: this.googleSearch,
      openrouter: this.openrouter,
      translator: this.translator,
      htmlGenerator: this.htmlGenerator,
      projectId: this.projectId,
      userId: this.userId,
      currentStep: this.currentStep,
      userMessage: this.userMessage,
      userPlan: this.userPlan
    })

    return await mode.execute()
  }

  private async executeGSCMode(): Promise<StructuredResponse> {
    const mode = new GSCAnalysisMode({
      supabase: this.supabase,
      memory: this.memory,
      openrouter: this.openrouter,
      projectId: this.projectId,
      userId: this.userId,
      currentStep: this.currentStep
    })

    return await mode.execute()
  }

  private errorResponse(error: any): StructuredResponse {
    return {
      type: 'structured_response',
      messages: [{
        type: 'error',
        data: {
          message: error.message || 'Erro desconhecido',
          code: error.code || 'UNKNOWN_ERROR'
        }
      }],
      metadata: {
        currentStep: this.currentStep,
        mode: 'content_generation'
      }
    }
  }
}

// ============================================================================
// WINDMILL MAIN EXPORT
// ============================================================================

export async function main(args: MainArgs): Promise<StructuredResponse> {
  console.log('=' .repeat(80))
  console.log('🚀 XPRESSSEO MASTER - WINDMILL FUNCTION')
  console.log('=' .repeat(80))
  console.log('📦 Args recebidos:', Object.keys(args))
  console.log('📊 Project ID:', args.projectId)
  console.log('👤 User ID:', args.userId)
  console.log('📝 Message:', args.userMessage?.substring(0, 50) || '(vazio)')
  console.log('🔢 Current Step:', args.currentStep)
  console.log('🎫 User Plan:', args.userPlan)

  try {
    const sistema = new XpressSEOMaster(args)
    const resultado = await sistema.execute()

    console.log('✅ Execução concluída com sucesso')
    console.log('📤 Mensagens retornadas:', resultado.messages?.length || 0)
    console.log('=' .repeat(80))

    return resultado
  } catch (error) {
    console.error('❌ Erro fatal na main function:', error)

    return {
      type: 'structured_response',
      messages: [{
        type: 'error',
        data: {
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          stack: error instanceof Error ? error.stack : undefined
        }
      }],
      metadata: {
        currentStep: args.currentStep || 1,
        mode: 'content_generation'
      }
    }
  }
}