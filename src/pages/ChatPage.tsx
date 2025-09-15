import React, { useState, useMemo } from 'react';
import { useChatOrchestrator } from '@/hooks/useChatOrchestrator';
import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import MessageList from "@/components/chat/MessageList";
import ErrorDisplay from "@/components/chat/ErrorDisplay";
import EmptyChat from "@/components/chat/EmptyChat";
import { Skeleton } from '@/components/ui/skeleton';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const ChatPage: React.FC = () => {
  const { t } = useTranslation();
  const { project, messages, isLoading, isSending, sendMessage } = useChatOrchestrator();
  const [prompt, setPrompt] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      sendMessage(prompt);
      setPrompt('');
    }
  };

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

  if (isLoading && !project) {
    return (
      <div className="flex flex-col h-full">
        <Skeleton className="h-16 w-full" />
        <div className="flex-1 p-4 md:p-6 space-y-8">
          <Skeleton className="h-24 w-3/á" />
        </div>
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <EmptyChat />
        </div>
        <div className="p-4 bg-[#0a0a0f] border-t border-white/10">
          <form onSubmit={handleSendMessage} className="relative">
            <Input
              className="w-full bg-transparent border border-white/20 rounded-2xl p-4 pr-14 text-white placeholder-gray-500 resize-none focus:ring-2 focus:ring-cyan-400 focus:outline-none glass-effect"
              placeholder={t('chat.startPlaceholder')}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isSending}
            />
            <Button type="submit" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-cyan-500 text-black hover:bg-cyan-400 transition-all" disabled={isSending || !prompt.trim()}>
              <Send size={16} />
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