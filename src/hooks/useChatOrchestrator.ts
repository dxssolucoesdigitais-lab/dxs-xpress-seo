import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/database.types';
import { useSession } from '@/contexts/SessionContext';
import { useChat } from './useChat';
import { showError } from '@/utils/toast';

export const useChatOrchestrator = () => {
  const { session } = useSession();
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const { messages, loading: chatLoading } = useChat(activeProject);

  useEffect(() => {
    const findInitialProject = async () => {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', session.user.id)
          .in('status', ['in_progress', 'paused', 'error'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setActiveProject(data);
        }
      } catch (error: any) {
        showError('toasts.projects.fetchFailed');
        console.error('Error fetching initial project:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    findInitialProject();
  }, [session]);

  const sendMessage = async (prompt: string) => {
    if (!prompt.trim()) return;
    setIsSending(true);

    try {
      const { data: newProject, error } = await supabase.functions.invoke('start-workflow-from-chat', {
        body: { prompt },
      });

      if (error) {
        if (error.context && error.context.response.status === 402) {
          showError("toasts.chat.outOfCredits");
        } else {
          throw error;
        }
      } else {
        setActiveProject(newProject);
      }
    } catch (error: any) {
      showError('toasts.chat.startWorkflowFailed');
      console.error('Error starting workflow:', error.message);
    } finally {
      setIsSending(false);
    }
  };

  return {
    project: activeProject,
    messages,
    isLoading: isLoading || (!!activeProject && chatLoading),
    isSending,
    sendMessage,
  };
};