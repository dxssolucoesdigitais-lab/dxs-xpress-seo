import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '@/hooks/useProject';
import { useChat } from '@/hooks/useChat';
import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import MessageList from "@/components/chat/MessageList";
import ErrorDisplay from "@/components/chat/ErrorDisplay";
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { showSuccess } from '@/utils/toast';
import { useSession } from '@/contexts/SessionContext';
import Confetti from 'react-confetti';
import { useWindowSize } from '@uidotdev/usehooks';

const ChatPage: React.FC = () => {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const { user: sessionUser } = useSession();

  const { project, loading: projectLoading } = useProject(projectId);
  const { messages, loading: chatLoading } = useChat(project);
  
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

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {showConfetti && <Confetti width={width} height={height} />}
      {project && <ChatHeader project={project} />}
      <MessageList messages={messages} isAiTyping={isAiTyping} currentStep={project?.current_step} hasProject={!!project} />
      {project?.status === 'error' && <ErrorDisplay />}
      <ChatInput project={project} messages={messages} isDisabled={isChatDisabled} />
    </div>
  );
};

export default ChatPage;