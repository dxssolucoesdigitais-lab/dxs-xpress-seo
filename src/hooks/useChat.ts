import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, StepResult } from '@/types/database.types';
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


export const useChat = (project: Project | null) => {
  const { user } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChatHistory = useCallback(async () => {
    if (!project) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('step_results')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const chatMessages = data.flatMap(transformStepToMessages);
      
      if (chatMessages.length === 0) {
        // Add a dynamic welcome message
        chatMessages.push({
          id: 'welcome-message',
          author: 'ai',
          createdAt: new Date().toISOString(),
          content: `Olá ${user?.full_name || ''}! 👋 Comecei a trabalhar no seu projeto "${project.project_name}". Vou analisar seu produto e público-alvo, e volto em breve com o primeiro passo.`,
        });
      }

      setMessages(chatMessages);
    } catch (error: any) {
      showError('Failed to fetch chat history.');
      console.error('Error fetching chat history:', error.message);
    } finally {
      setLoading(false);
    }
  }, [project, user]);

  useEffect(() => {
    fetchChatHistory();

    if (!project) return;

    const projectId = project.id;

    const handleInsert = (payload: { new: StepResult }) => {
      const newMessages = transformStepToMessages(payload.new);
      setMessages(currentMessages => [...currentMessages, ...newMessages]);
    };

    const handleUpdate = (payload: { new: StepResult }) => {
      const updatedStep = payload.new;
      const newMessagesForStep = transformStepToMessages(updatedStep);
      
      setMessages(currentMessages => {
        const otherMessages = currentMessages.filter(m => m.stepResult?.id !== updatedStep.id);
        const combined = [...otherMessages, ...newMessagesForStep];
        combined.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return combined;
      });
    };

    const handleDelete = (payload: { old: { id: string } }) => {
      const deletedStepId = payload.old.id;
      setMessages(currentMessages => 
        currentMessages.filter(m => !m.id.startsWith(deletedStepId))
      );
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
      .on<{ id: string }>(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'step_results', filter: `project_id=eq.${projectId}` },
        handleDelete
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [project, fetchChatHistory]);

  return { messages, loading };
};