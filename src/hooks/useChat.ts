import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, StepResult, ChatMessageRow } from '@/types/database.types';
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

    const { data: stepResults, error: stepError } = await supabase
      .from('step_results')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (stepError) {
      showError('toasts.projects.fetchFailed');
      console.error('Error fetching step results:', stepError.message);
      throw stepError;
    }

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

    const stepMessages = stepResults.flatMap(step => transformStepToMessages(step, t));
    const freeFormMessages: ChatMessage[] = chatMessagesData.map(msg => ({
      id: msg.id,
      author: msg.author as 'user' | 'ai',
      createdAt: msg.created_at,
      content: msg.content,
    }));
    
    const allMessages = [...stepMessages, ...freeFormMessages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    return allMessages;
  };

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ['chatHistory', projectId],
    queryFn: fetchChatHistory,
    enabled: !!projectId,
  });

  useEffect(() => {
    if (!projectId) return;

    const stepChannel = supabase
      .channel(`project_chat_steps_${projectId}`)
      .on<StepResult>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'step_results', filter: `project_id=eq.${projectId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chatHistory', projectId] });
        }
      )
      .subscribe();

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
      supabase.removeChannel(stepChannel);
      supabase.removeChannel(chatMessageChannel);
    };
  }, [projectId, queryClient]);

  return { messages, loading: isLoading };
};