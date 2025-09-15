import React, { useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import MessageList from "@/components/chat/MessageList";
import ErrorDisplay from "@/components/chat/ErrorDisplay";
import { useProject } from '@/hooks/useProject';
import { useChat } from '@/hooks/useChat';
import { Skeleton } from '../ui/skeleton';
import { useSession } from '@/contexts/SessionContext';

const ChatInterface: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { session } = useSession();
  const { project, loading: projectLoading } = useProject(projectId);
  const { messages, loading: chatLoading } = useChat(project);

  const isAiTyping = useMemo(() => {
    if (projectLoading || chatLoading || !project || messages.length === 0 || project.status === 'completed' || project.status === 'error') {
      return false;
    }
    const lastMessage = messages[messages.length - 1];
    // AI is typing if the last message was from the user, indicating it's processing the next step
    return lastMessage.author === 'user';
  }, [messages, chatLoading, project, projectLoading]);

  const isChatDisabled = useMemo(() => {
    return project?.status === 'completed' || project?.status === 'error';
  }, [project]);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (projectLoading) {
    return (
      <div className="flex flex-col h-screen bg-[#0a0a0f]">
        <Skeleton className="h-16 w-full" />
        <div className="flex-1 p-4 md:p-6 space-y-8">
          <Skeleton className="h-24 w-3/4" />
          <Skeleton className="h-12 w-1/2 ml-auto" />
          <Skeleton className="h-48 w-3/4" />
        </div>
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (!project) {
    // Could be an invalid projectId or user doesn't have access
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f] text-gray-200 font-sans">
      <ChatHeader project={project} />
      {chatLoading ? (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
          <Skeleton className="h-24 w-3/4" />
          <Skeleton className="h-12 w-1/2 ml-auto" />
          <Skeleton className="h-48 w-3/4" />
        </div>
      ) : (
        <MessageList messages={messages} isAiTyping={isAiTyping} />
      )}
      {project.status === 'error' && <ErrorDisplay />}
      <ChatInput messages={messages} isDisabled={isChatDisabled} />
    </div>
  );
};

export default ChatInterface;