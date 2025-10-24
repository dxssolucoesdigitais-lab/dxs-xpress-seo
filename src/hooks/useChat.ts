import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, ChatMessageRow } from '@/types/database.types';
import { ChatMessage, StructuredChatContent } from '@/types/chat.types';
import { showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';

export const useChat = (project: Project | null) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const projectId = project?.id;

  const fetchChatMessages = async (): Promise<ChatMessage[]> => {
    if (!projectId) return [];

    const { data: chatMessagesData, error: chatError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('project_id', projectId)
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
      let content: React.ReactNode = msg.content;
      let rawContent: string = msg.content; // Always store the original string content here

      // Try to parse content as JSON for structured messages
      try {
        const parsed = JSON.parse(msg.content);
        if (parsed && typeof parsed === 'object' && 'type' in parsed && 'data' in parsed) {
          // If it's structured, store the raw JSON string and let MessageRenderer handle rendering
          // For now, content can be null, as MessageRenderer will use rawContent
          content = null; 
        }
      } catch (e) {
        // Not a JSON string, treat as plain text, rawContent is already msg.content
      }

      return {
        id: msg.id,
        author: msg.author as 'user' | 'ai',
        createdAt: msg.created_at,
        content: content,
        rawContent: rawContent, // This will now always be the string content
      };
    });
    
    return processedMessages;
  };

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ['chatHistory', projectId],
    queryFn: fetchChatMessages,
    enabled: !!projectId,
  });

  useEffect(() => {
    if (!projectId) return;

    const chatMessageChannel = supabase
      .channel(`project_chat_messages_${projectId}`)
      .on<ChatMessageRow>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages', filter: `project_id=eq.${projectId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chatHistory', projectId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatMessageChannel);
    };
  }, [projectId, queryClient]);

  return { messages, loading: isLoading };
};