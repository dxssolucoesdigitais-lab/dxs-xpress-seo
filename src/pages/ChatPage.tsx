import React, { useState, useMemo, useEffect, useRef } from 'react';
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
import { Send, Loader2, Paperclip } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { showError, showSuccess } from '@/utils/toast';
import { Project } from '@/types/database.types';
import { useSession } from '@/contexts/SessionContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Confetti from 'react-confetti';
import { useWindowSize } from '@uidotdev/usehooks';

const ChatPage: React.FC = () => {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user: sessionUser } = useSession();

  const { project, loading: projectLoading } = useProject(projectId);
  const { messages, loading: chatLoading } = useChat(project);
  
  const [prompt, setPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const previousStatus = useRef<string | undefined>();

  useEffect(() => {
    if (project?.status === 'completed' && previousStatus.current !== 'completed') {
      setShowConfetti(true);
      showSuccess("Projeto concluído com sucesso! 🎉");
      setTimeout(() => setShowConfetti(false), 8000); // Confetti por 8 segundos
    }
    previousStatus.current = project?.status;
  }, [project?.status]);


  const userPlan = sessionUser?.plan_type || 'free';
  const isFreeTrial = userPlan === 'free';
  const canUploadFile = userPlan === 'premium' || isFreeTrial;
  const canAnalyzeLink = true;

  const handleAnalyzeClick = (type: 'upload' | 'link') => {
    if (type === 'upload') {
      if (!canUploadFile) {
        showError('toasts.plans.premiumFeatureRequired');
        return;
      }
      alert(t('chatInput.uploadFile') + ' - Funcionalidade em breve!');
    } else if (type === 'link') {
      if (!canAnalyzeLink) return;
      alert(t('chatInput.analyzeLink') + ' - Funcionalidade em breve!');
    }
  };

  const handleStartNewWorkflow = async (e: React.FormEvent) => {
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

  const isLoading = projectLoading || (projectId && chatLoading);

  const isAiTyping = useMemo(() => {
    if (isLoading || !project || messages.length === 0 || project.status !== 'in_progress') {
      return false;
    }
    const lastMessage = messages[messages.length - 1];
    // AI is typing if the last message is from the user (meaning AI is yet to respond)
    // or if the last message is a workflow progress message and the project is still in progress.
    return lastMessage.author === 'user' || (lastMessage.stepResult?.step_name === 'Workflow Progress' && project.status === 'in_progress');
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

  // Render initial input for starting a new project
  if (!project) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <EmptyChat userName={sessionUser?.full_name} />
        </div>
        <div className="p-4 bg-[#0a0a0f] border-t border-white/10">
          <form onSubmit={handleStartNewWorkflow} className="relative">
            <Input
              className="w-full bg-transparent border-border rounded-2xl p-4 pl-12 pr-14 text-foreground placeholder:text-muted-foreground resize-none focus:ring-2 focus:ring-cyan-400 focus:outline-none glass-effect"
              placeholder={t('chatInput.placeholder')}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isSending}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
                  <Paperclip size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => handleAnalyzeClick('upload')} className="cursor-pointer">
                  {t('chatInput.uploadFile')}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleAnalyzeClick('link')} className="cursor-pointer">
                  {t('chatInput.analyzeLink')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button type="submit" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-cyan-500 text-black hover:bg-cyan-400 transition-all duration-300 hover:shadow-[0_0_15px_rgba(56,189,248,0.6)] hover:-translate-y-px" disabled={isSending || !prompt.trim()}>
              {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Render ChatInput (with only buttons) for existing projects
  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {showConfetti && <Confetti width={width} height={height} />}
      <ChatHeader project={project} />
      <MessageList messages={messages} isAiTyping={isAiTyping} currentStep={project.current_step} />
      {project.status === 'error' && <ErrorDisplay />}
      <ChatInput project={project} messages={messages} isDisabled={isChatDisabled} />
    </div>
  );
};

export default ChatPage;