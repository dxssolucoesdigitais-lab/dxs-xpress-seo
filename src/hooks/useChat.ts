import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
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
        createdAt: step.created_at, // Using step's creation time for sorting
        content: selection.content,
        stepResult: step,
      });
    }
  } else if (step.approved) {
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
  const queryClient = useQueryClient();
  const projectId = project?.id;

  const fetchChatHistory = async () => {
    if (!projectId) return [];

    const { data, error } = await supabase
      .from('step_results')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      showError('toasts.projects.fetchFailed');
      console.error('Error fetching chat history:', error.message);
      throw error;
    }

    const chatMessages = data.flatMap(step => transformStepToMessages(step, t));
    
    if (chatMessages.length === 0 && project) {
      chatMessages.push({
        id: 'welcome-message',
        author: 'ai',
        createdAt: new Date().toISOString(),
        content: t('chat.welcomeMessage', { userName: user?.full_name || '', projectName: project.project_name }),
      });
    }
    
    return chatMessages;
  };

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ['chatHistory', projectId],
    queryFn: fetchChatHistory,
    enabled: !!projectId,
  });

  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`project_chat_${projectId}`)
      .on<StepResult>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'step_results', filter: `project_id=eq.${projectId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chatHistory', projectId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  return { messages, loading: isLoading };
};