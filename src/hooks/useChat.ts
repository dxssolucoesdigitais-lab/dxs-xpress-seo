import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StepResult } from '@/types/database.types';
import { ChatMessage } from '@/types/chat.types';
import { showError } from '@/utils/toast';
import { useSession } from '@/contexts/SessionContext';

// This is a placeholder function to transform step results into displayable messages.
// In a real app, this would be much more sophisticated.
const transformStepToMessages = (step: StepResult): ChatMessage[] => {
  const messages: ChatMessage[] = [];

  // Add the AI's message/output
  messages.push({
    id: step.id,
    author: 'ai',
    createdAt: step.created_at,
    stepResult: step,
  });

  // If the user has made a selection or approved, add a user message
  if (step.approved || step.user_selection) {
    let userContent = 'Approved! Pode continuar 🚀';
    if (step.user_selection) {
      // This is a simplification. We'd need to format the selection nicely.
      const selection = step.user_selection as { number?: number; content?: string };
      userContent = `I choose option ${selection.number || ''}: "${selection.content || '...'}"`;
    }
    messages.push({
      id: `${step.id}-user`,
      author: 'user',
      createdAt: step.created_at, // We'd likely want a separate timestamp for user action
      content: userContent,
    });
  }

  return messages;
};


export const useChat = (projectId: string | null) => {
  const { session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChatHistory = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('step_results')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const chatMessages = data.flatMap(transformStepToMessages);
      
      if (chatMessages.length === 0) {
        // Add a welcome message if there's no history
        chatMessages.push({
          id: 'welcome-message',
          author: 'ai',
          createdAt: new Date().toISOString(),
          content: `Olá ${session?.user?.email || ''}! 👋 Vou te ajudar a criar conteúdo SEO incrível para sua loja.`,
        });
      }

      setMessages(chatMessages);
    } catch (error: any) {
      showError('Failed to fetch chat history.');
      console.error('Error fetching chat history:', error.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, session]);

  useEffect(() => {
    fetchChatHistory();

    if (!projectId) return;

    const channel = supabase
      .channel(`project_chat_${projectId}`)
      .on<StepResult>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'step_results', filter: `project_id=eq.${projectId}` },
        (payload) => {
          const newMessages = transformStepToMessages(payload.new);
          setMessages(currentMessages => [...currentMessages, ...newMessages]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, fetchChatHistory]);

  return { messages, loading };
};