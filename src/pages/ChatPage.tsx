import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
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
import { StructuredChatContent, ChatMessage } from '@/types/chat.types'; // Import ChatMessage

const ChatPage: React.FC = () => {
  const { t } = useTranslation();
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  const { user: sessionUser } = useSession();
  const navigate = useNavigate();

  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(paramProjectId);
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (paramProjectId !== currentProjectId) {
      setCurrentProjectId(paramProjectId);
      setOptimisticMessages([]); // Clear optimistic messages when project changes
    }
  }, [paramProjectId, currentProjectId]);

  useEffect(() => {
    if (currentProjectId && currentProjectId !== paramProjectId) {
      window.history.replaceState(null, '', `/chat/${currentProjectId}`);
    } else if (!currentProjectId && paramProjectId) {
      window.history.replaceState(null, '', '/chat');
    }
  }, [currentProjectId, paramProjectId]);

  const { project, loading: projectLoading } = useProject(currentProjectId);
  const { messages, loading: chatLoading } = useChat(project);
  
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const previousStatus = useRef<string | undefined>();

  useEffect(() => {
    if (project?.status === 'completed' && previousStatus.current !== 'completed') {
      setShowConfetti(true);
      showSuccess("Projeto concluído com sucesso! 🎉");
      setTimeout(() => setShowConfetti(false), 8000);
    }
    previousStatus.current = project?.status;
  }, [project?.status]);

  const isLoading = projectLoading || (currentProjectId && chatLoading);

  // Function to add an optimistic message
  const addOptimisticMessage = useCallback((message: ChatMessage) => {
    setOptimisticMessages(prev => [...prev, message]);
  }, []);

  // Function to remove an optimistic message (e.g., if API call fails)
  const removeOptimisticMessage = useCallback((id: string) => {
    setOptimisticMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  // Combine fetched messages with optimistic ones, ensuring no duplicates
  const displayedMessages = useMemo(() => {
    const combined = [...messages];
    const realMessageContents = new Set(messages.map(m => m.rawContent)); // Use rawContent for matching

    optimisticMessages.forEach(optMsg => {
      // Only add optimistic message if a real message with the same content hasn't arrived yet
      if (!realMessageContents.has(optMsg.rawContent)) {
        combined.push(optMsg);
      }
    });

    // Sort by createdAt to maintain order
    return combined.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages, optimisticMessages]);

  // Clear optimistic messages that have been replaced by real ones
  useEffect(() => {
    if (messages.length > 0 && optimisticMessages.length > 0) {
      setOptimisticMessages(prev => {
        const realMessageContents = new Set(messages.map(m => m.rawContent));
        return prev.filter(optMsg => !realMessageContents.has(optMsg.rawContent));
      });
    }
  }, [messages, optimisticMessages]);


  const isAiTyping = useMemo(() => {
    if (isLoading || !project || displayedMessages.length === 0 || project.status !== 'in_progress') {
      return false;
    }
    const lastMessage = displayedMessages[displayedMessages.length - 1];
    let isLastAiMessageProgress = false;
    if (lastMessage.author === 'ai' && typeof lastMessage.rawContent === 'string') {
      try {
        const parsedContent = JSON.parse(lastMessage.rawContent);
        isLastAiMessageProgress = parsedContent.type === 'progress';
      } catch (e) {
        // Not structured content
      }
    }
    return lastMessage.author === 'user' || (isLastAiMessageProgress && project.status === 'in_progress');
  }, [displayedMessages, isLoading, project]);

  const isChatDisabled = useMemo(() => {
    return project?.status === 'completed' || project?.status === 'error' || project?.status === 'paused';
  }, [project]);

  const lastAiMessageIsError = useMemo(() => {
    if (displayedMessages.length === 0) return false;
    const lastMessage = displayedMessages[displayedMessages.length - 1];
    if (lastMessage.author === 'ai' && typeof lastMessage.rawContent === 'string') {
      try {
        const parsedContent = JSON.parse(lastMessage.rawContent) as StructuredChatContent;
        return parsedContent.type === 'error';
      } catch (e) {
        return false;
      }
    }
    return false;
  }, [displayedMessages]);

  const errorMessage = useMemo(() => {
    if (lastAiMessageIsError) {
      const lastMessage = displayedMessages[displayedMessages.length - 1];
      try {
        const parsedContent = JSON.parse(lastMessage.rawContent as string) as StructuredChatContent;
        if (parsedContent.type === 'error' && typeof parsedContent.data === 'object' && 'message' in parsedContent.data) {
          return (parsedContent.data as { message: string }).message;
        }
      } catch (e) {
        return undefined;
      }
    }
    return undefined;
  }, [lastAiMessageIsError, displayedMessages]);

  const handleNewProjectCreated = useCallback((newProjectId: string) => {
    setCurrentProjectId(newProjectId);
  }, []);

  if (isLoading && currentProjectId) {
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
      <MessageList 
        messages={displayedMessages} 
        isAiTyping={isAiTyping} 
        currentStep={project?.current_step} 
        hasProject={!!project} 
        onNewProjectCreated={handleNewProjectCreated} 
        projectId={currentProjectId} 
        onOptimisticMessageAdd={addOptimisticMessage}
        onOptimisticMessageRemove={removeOptimisticMessage}
      />
      {lastAiMessageIsError && <ErrorDisplay message={errorMessage} />}
      {project ? (
        <ChatInput 
          project={project} 
          isDisabled={isChatDisabled} 
          onNewProjectCreated={handleNewProjectCreated} 
          onOptimisticMessageAdd={addOptimisticMessage}
          onOptimisticMessageRemove={removeOptimisticMessage}
        />
      ) : (
        <EmptyChatPrompt 
          onNewProjectCreated={handleNewProjectCreated} 
          onOptimisticMessageAdd={addOptimisticMessage}
          onOptimisticMessageRemove={removeOptimisticMessage}
        />
      )}
    </div>
  );
};

export default ChatPage;