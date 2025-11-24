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
import Confetti from 'react-react-confetti'; // Corrigido o import
import { useWindowSize } from '@uidotdev/usehooks';
import { StructuredChatContent, ChatMessage } from '@/types/chat.types';
import EmptyChatPrompt from '@/components/chat/EmptyChatPrompt';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus } from 'lucide-react';

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
      setOptimisticMessages([]); // Limpa mensagens otimistas quando o projeto muda
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

  // Função para adicionar uma mensagem otimista
  const addOptimisticMessage = useCallback((message: ChatMessage) => {
    setOptimisticMessages(prev => [...prev, message]);
  }, []);

  // Função para remover uma mensagem otimista (ex: se a chamada da API falhar)
  const removeOptimisticMessage = useCallback((id: string) => {
    setOptimisticMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  // Combina mensagens buscadas com as otimistas, garantindo que não haja duplicatas
  const displayedMessages = useMemo(() => {
    const combined = [...messages];
    const realMessageContents = new Set(messages.map(m => m.rawContent)); // Usa rawContent para correspondência

    optimisticMessages.forEach(optMsg => {
      // Adiciona a mensagem otimista apenas se uma mensagem real com o mesmo conteúdo ainda não chegou
      if (!realMessageContents.has(optMsg.rawContent)) {
        combined.push(optMsg);
      }
    });

    // Ordena por createdAt para manter a ordem
    const sortedMessages = combined.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    console.log("[DEBUG-MESSAGELIST] Final displayed messages order:", sortedMessages.map(m => ({ id: m.id, author: m.author, createdAt: m.createdAt, content: (typeof m.content === 'string' ? m.content.substring(0, 30) : 'Structured') + '...' })));
    return sortedMessages;
  }, [messages, optimisticMessages]);

  // Limpa mensagens otimistas que foram substituídas por mensagens reais
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
        // Não é conteúdo estruturado
      }
    }
    return lastMessage.author === 'user' || (isLastAiMessageProgress && project.status === 'in_progress');
  }, [displayedMessages, isLoading, project]);

  const isChatInputDisabled = useMemo(() => {
    return project?.status === 'completed' || project?.status === 'error' || project?.status === 'paused' || isAiTyping;
  }, [project, isAiTyping]);

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
    navigate(`/chat/${newProjectId}`); // Navega para a página de chat do novo projeto
  }, [navigate]);

  const showNewConversationButton = useMemo(() => {
    return project && (project.status === 'completed' || project.status === 'error');
  }, [project]);

  const handleStartNewConversationFromExisting = () => {
    navigate('/chat'); // Isso limpará paramProjectId e acionará EmptyChatPrompt
  };

  if (projectLoading) {
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
      
      {currentProjectId && project ? (
        <>
          <ChatHeader project={project} />
          <MessageList 
            messages={displayedMessages} 
            isAiTyping={isAiTyping} 
            currentStep={project.current_step} 
            projectId={currentProjectId} 
          />
          {lastAiMessageIsError && <ErrorDisplay message={errorMessage} />}
          {showNewConversationButton ? (
            <div className="p-4 bg-background border-t border-border flex justify-center">
              <Button
                size="lg"
                onClick={handleStartNewConversationFromExisting}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all duration-300 hover:shadow-[0_0_15px_rgba(56,189,248,0.6)] hover:-translate-y-px"
              >
                <MessageSquarePlus className="mr-2 h-5 w-5" />
                {t('emptyChat.startButton')}
              </Button>
            </div>
          ) : (
            <ChatInput 
              project={project} 
              isDisabled={isChatInputDisabled} 
              onOptimisticMessageAdd={addOptimisticMessage}
              onOptimisticMessageRemove={removeOptimisticMessage}
            />
          )}
        </>
      ) : (
        <EmptyChatPrompt 
          onNewProjectCreated={handleNewProjectCreated} 
        />
      )}
    </div>
  );
};

export default ChatPage;