import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, StepResult } from '@/types/database.types';
import { ChatMessage, LlmOption } from '@/types/chat.types';
import { showError } from '@/utils/toast';
import { useSession } from '@/contexts/SessionContext';
import { useTranslation } from 'react-i18next';

const transformStepToMessages = (step: StepResult, t: (key: string) => string): ChatMessage[] => {
  const messages: ChatMessage[] = [];

  messages.push({
    id: step.id,
    author: 'ai',
    createdAt: step.created_at,
    stepResult: step,
  });

  if (step.user_selection) {
    const selection = step.user_selection as LlmOption;
    if (selection.content) {
      messages.push({
        id: `${step.id}-user`,
        author: 'user',
        createdAt: step.created_at,
        content: selection.content,
        stepResult: step,
      });
    }
  } 
  else if (step.approved) {
    messages.push({
      id: `${step.id}-user`,
      author: 'user',
      createdAt: step.created_at,
      content: t('chat.genericApproval'),
      stepResult: step,
    });
  }

  return messages;
};


export const useChat = (project: Project | null) => {
  const { t } = useTranslation();
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

      const chatMessages = data.flatMap(step => transformStepToMessages(step, t));
      
      if (chatMessages.length === 0) {
        chatMessages.push({
          id: 'welcome-message',
          author: 'ai',
          createdAt: new Date().toISOString(),
          content: t('chat.welcomeMessage', { userName: user?.full_name || '', projectName: project.project_name }),
        });
      }

      setMessages(chatMessages);
    } catch (error: any) {
      showError('toasts.projects.fetchFailed');
      console.error('Error fetching chat history:', error.message);
    } finally {
      setLoading(false);
    }
  }, [project, user, t]);

  useEffect(() => {
    fetchChatHistory();

    if (!project) return;

    const projectId = project.id;

    const handleInsert = (payload: { new: StepResult }) => {
      const newMessages = transformStepToMessages(payload.new, t);
      setMessages(currentMessages => [...currentMessages, ...newMessages]);
    };

    const handleUpdate = (payload: { new: StepResult }) => {
      const updatedStep = payload.new;
      const newMessagesForStep = transformStepToMessages(updatedStep, t);
      
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
  }, [project, fetchChatHistory, t]);

  return { messages, loading };
};