import React, { useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import MessageList from "@/components/chat/MessageList";
import ErrorDisplay from "@/components/chat/ErrorDisplay";
import EmptyChat from "@/components/chat/EmptyChat";
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
    if (projectLoading || chatLoading || !project || messages.length === 0 || project.status !== 'in_progress') {
      return false;
    }
    const lastMessage = messages[messages.length - 1];
    // The AI is "typing" if the last message was from the user, or if there's only a welcome message.
    return lastMessage.author === 'user' || (messages.length === 1 && lastMessage.id === 'welcome-message');
  }, [messages, chatLoading, project, projectLoading]);

  const isChatDisabled = useMemo(() => {
    return project?.status === 'completed' || project?.status === 'error' || project?.status === 'paused';
  }, [project]);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (projectLoading) {
    return (
      <div className="flex flex-col h-screen bg-background">
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
    return <Navigate to="/dashboard" replace />;
  }

  const renderChatContent = () => {
    if (chatLoading) {
      return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
          <Skeleton className="h-24 w-3/4" />
        </div>
      );
    }
    if (messages.length > 0) {
      return <MessageList messages={messages} isAiTyping={isAiTyping} />;
    }
    return <EmptyChat />;
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans">
      <ChatHeader project={project} />
      {renderChatContent()}
      {project.status === 'error' && <ErrorDisplay />}
      <ChatInput project={project} messages={messages} isDisabled={isChatDisabled} />
    </div>
  );
};

export default ChatInterface;