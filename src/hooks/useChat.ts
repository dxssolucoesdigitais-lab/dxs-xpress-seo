import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, ChatMessageRow } from '@/types/database.types';
import { ChatMessage, StructuredChatContent } from '@/types/chat.types';
import { showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';

export const useChat = (project: Project | null) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const projectId = project?.id;

  // Use a ref to store the current projectId to avoid stale closures in the subscription callback
  const projectIdRef = useRef(projectId);
  useEffect(() => {
    projectIdRef.current = projectId;
  }, [projectId]);

  const fetchChatMessages = async (): Promise<ChatMessage[]> => {
    if (!projectIdRef.current) return [];

    console.log(`[DEBUG-CHAT] Fetching chat messages for project: ${projectIdRef.current}`);

    const { data: chatMessagesData, error: chatError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('project_id', projectIdRef.current)
      .order('created_at', { ascending: true });

    if (chatError) {
      showError('toasts.chat.fetchMessagesFailed');
      console.error('Error fetching chat messages:', chatError.message);
      throw chatError;
    }

    // Adiciona uma etapa de desduplicação baseada no ID da mensagem
    const uniqueMessages = new Map<string, ChatMessageRow>();
    chatMessagesData.forEach(msg => uniqueMessages.set(msg.id, msg));
    
    const processedMessages = Array.from(uniqueMessages.values()).map(msg => {
      let content: React.ReactNode = msg.content; // Começa com o conteúdo bruto da DB
      let rawContent: string = msg.content; // Sempre armazena o conteúdo original da string aqui

      // Tenta analisar o conteúdo como JSON para mensagens estruturadas
      try {
        const parsed = JSON.parse(msg.content);
        if (parsed && typeof parsed === 'object' && 'type' in parsed && 'data' in parsed) {
          rawContent = msg.content; // Mantém a string JSON original em rawContent

          // Se for do tipo 'text', extrai o texto real para renderização
          if (parsed.type === 'text' && typeof parsed.data === 'string') {
            content = parsed.data; // Este é o texto real a ser exibido
          } else {
            // Para 'options', 'progress' ou outros tipos estruturados,
            // define content como null para que MessageRenderer use os componentes específicos.
            content = null;
          }
        }
      } catch (e) {
        // Não é conteúdo estruturado, `content` permanece `msg.content` (a string simples)
        // `rawContent` também permanece `msg.content`
      }

      console.log(`[DEBUG-CHAT] Processed fetched message: ID=${msg.id}, Author=${msg.author}, CreatedAt=${msg.created_at}, Content=${msg.content ? (typeof msg.content === 'string' ? msg.content.substring(0, Math.min(msg.content.length, 50)) : 'Structured') : 'null'}...`);

      return {
        id: msg.id,
        author: msg.author as 'user' | 'ai',
        createdAt: msg.created_at,
        content: content,
        rawContent: rawContent,
      };
    });

    // Adiciona uma segunda passagem para deduplicar mensagens AI consecutivas com conteúdo idêntico
    const finalMessages: ChatMessage[] = [];
    for (let i = 0; i < processedMessages.length; i++) {
      const current = processedMessages[i];
      if (current.author === 'ai' && i > 0) {
        const previous = finalMessages[finalMessages.length - 1];
        // Se a mensagem AI atual for idêntica à mensagem AI anterior, pule-a
        if (previous && previous.author === 'ai' && previous.rawContent === current.rawContent) {
          continue;
        }
      }
      finalMessages.push(current);
    }
    
    return finalMessages;
  };

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ['chatHistory', projectId],
    queryFn: fetchChatMessages,
    enabled: !!projectId,
  });

  useEffect(() => {
    if (!projectId) {
      console.log('[DEBUG-CHAT] No projectId, skipping Realtime subscription setup.');
      return;
    }

    console.log(`[DEBUG-CHAT] Setting up Realtime subscription for project: ${projectId}`);

    const chatMessageChannel = supabase
      .channel(`project_chat_messages_${projectId}`)
      .on<ChatMessageRow>(
        'postgres_changes',
        { 
          event: 'INSERT', // Focando apenas em eventos de INSERT para novas mensagens
          schema: 'public', 
          table: 'chat_messages', 
          filter: `project_id=eq.${projectId}` 
        },
        (payload) => {
          console.log(`[DEBUG-CHAT] Realtime INSERT event detected for project ${projectId}. Payload:`, payload);
          queryClient.invalidateQueries({ queryKey: ['chatHistory', projectId] });
        }
      )
      .subscribe((status) => {
        console.log(`[DEBUG-CHAT] Realtime channel status for project ${projectId}: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log(`[DEBUG-CHAT] Successfully subscribed to Realtime channel for project ${projectId}.`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`[DEBUG-CHAT] Realtime channel error for project ${projectId}.`);
        }
      });

    return () => {
      console.log(`[DEBUG-CHAT] Unsubscribing from chat messages channel for project ${projectId}.`);
      supabase.removeChannel(chatMessageChannel);
    };
  }, [projectId, queryClient]);

  return { messages, loading: isLoading };
};