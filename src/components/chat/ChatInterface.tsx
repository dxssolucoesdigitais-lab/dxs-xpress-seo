import React from 'react';
import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import MessageList from "@/components/chat/MessageList";
import { Project } from '@/types/database.types';
import { useChat } from '@/hooks/useChat';
import { Skeleton } from '../ui/skeleton';

interface ChatInterfaceProps {
  project: Project;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ project }) => {
  const { messages, loading } = useChat(project.id);

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f] text-gray-200 font-sans">
      <ChatHeader project={project} />
      {loading ? (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
          <Skeleton className="h-24 w-3/4" />
          <Skeleton className="h-12 w-1/2 ml-auto" />
          <Skeleton className="h-48 w-3/4" />
        </div>
      ) : (
        <MessageList messages={messages} />
      )}
      <ChatInput messages={messages} />
    </div>
  );
};

export default ChatInterface;