import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '@/hooks/useProject';
import { useChat } from '@/hooks/useChat';
import { supabase } from '@/integrations/supabase/client';
import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import MessageList from "@/components/chat/MessageList";
import ErrorDisplay from "@/components/chat/ErrorDisplay";
import EmptyChat from "@/components/chat/EmptyChat";
import { Skeleton } from '@/components/ui/skeleton';
import { Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { showError } from '@/utils/toast';
import { Project } from '@/types/database.types';
import { useSession } from '@/contexts/SessionContext';

const ChatPage: React.FC = () => {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user: sessionUser } = useSession();

  const { project, loading: projectLoading } = useProject(projectId);
  const { messages, loading: chatLoading } = useChat(project);
  
  const [prompt, setPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isSending) return;
    
    setIsSending(true);
    try {
      const { data: newProject, error } = await supabase.functions.invoke<Project>('start-workflow-from-chat', {
        body: { prompt },
      });

      if (error) {
        if (error.context && error.context.response.status === 402) {
          showError("toasts.chat.outOfCredits");
        } else {
          throw error;
        }
      } else if (newProject) {
        navigate(`/chat/${newProject.id}`);
      }
    } catch (error: any) {
      showError('toasts.chat.startWorkflowFailed');
      console.error('Error starting workflow:', error.message);
    } finally {
      setIsSending(false);
      setPrompt('');
    }
  };

  const isLoading = projectLoading || (!!project && chatLoading);

  const isAiTyping = useMemo(() => {
    if (isLoading || !project || messages.length === 0 || project.status !== 'in_progress') {
      return false;
    }
    const lastMessage = messages[messages.length - 1];
    return lastMessage.author === 'user' || (messages.length === 1 && lastMessage.id === 'welcome-message');
  }, [messages, isLoading, project]);

  const isChatDisabled = useMemo(() => {
    return project?.status === 'completed' || project?.status === 'error' || project?.status === 'paused';
  }, [project]);

  if (isLoading && projectId) {
    return (
      <div className="flex flex-col h-full">
        <Skeleton className="h-16 w-full" />
        <div className="flex-1 p-4 md:p-6 space-y-8">
          <Skeleton className="h-24 w-3/4" />
          <Skeleton className="h-20 w-1/2 ml-auto" />
          <Skeleton className="h-32 w-3/4" />
        </div>
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <EmptyChat userName={sessionUser?.full_name} />
        </div>
        <div className="p-4 bg-[#0a0a0f] border-t border-white/10">
          <form onSubmit={handleSendMessage} className="relative">
            <Input
              className="w-full bg-transparent border border-white/20 rounded-2xl p-4 pr-14 text-white placeholder-gray-500 resize-none focus:ring-2 focus:ring-cyan-400 focus:outline-none glass-effect"
              placeholder={t('chat.startPrompt')}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isSending}
            />
            <Button type="submit" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-cyan-500 text-black hover:bg-cyan-400 transition-all" disabled={isSending || !prompt.trim()}>
              {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <ChatHeader project={project} />
      <MessageList messages={messages} isAiTyping={isAiTyping} />
      {project.status === 'error' && <ErrorDisplay />}
      <ChatInput project={project} messages={messages} isDisabled={isChatDisabled} />
    </div>
  );
};

export default ChatPage;