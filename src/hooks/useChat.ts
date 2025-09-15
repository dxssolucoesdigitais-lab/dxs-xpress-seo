import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StepResult } from '@/types/database.types';
import { ChatMessage, LlmOption } from '@/types/chat.types';
import { showError } from '@/utils/toast';
import { useSession } from '@/contexts/SessionContext';

const transformStepToMessages = (step: StepResult): ChatMessage[] => {
  const messages: ChatMessage[] = [];

  // Always add the AI's message/output
  messages.push({
    id: step.id,
    author: 'ai',
    createdAt: step.created_at,
    stepResult: step,
  });

  // If the user has made a selection, add a corresponding user message
  if (step.user_selection) {
    const selection = step.user_selection as LlmOption;
    if (selection.content) {
      messages.push({
        id: `${step.id}-user`,
        author: 'user',
        createdAt: step.created_at, // Using step's timestamp as a proxy for user action time
        content: selection.content,
        stepResult: step,
      });
    }
  } 
  // If the step was approved without a specific selection, add a generic user approval message
  else if (step.approved) {
    messages.push({
      id: `${step.id}-user`,
      author: 'user',
      createdAt: step.created_at,
      content: 'Approved! Pode continuar 🚀',
      stepResult: step,
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

    const handleInsert = (payload: { new: StepResult }) => {
      const newMessages = transformStepToMessages(payload.new);
      setMessages(currentMessages => [...currentMessages, ...newMessages]);
    };

    const handleUpdate = (payload: { new: StepResult }) => {
      const updatedStep = payload.new;
      const newMessagesForStep = transformStepToMessages(updatedStep);
      
      setMessages(currentMessages => {
        // Filter out all old messages related to this step
        const otherMessages = currentMessages.filter(m => m.stepResult?.id !== updatedStep.id);
        
        // Add the new messages and re-sort to maintain chronological order
        const combined = [...otherMessages, ...newMessagesForStep];
        combined.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return combined;
      });
    };

    const channel = supabase
      .channel(`project_chat_${projectId}`)
      .on<StepResult>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'step_results', filter: `project_id=eq.${projectId}` },
        handleInsert
      )
      .on<StepResult>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'step_results', filter: `project_id=eq.${projectId}` },
        handleUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, fetchChatHistory]);

  return { messages, loading };
};