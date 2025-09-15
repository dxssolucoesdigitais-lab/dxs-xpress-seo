import React from 'react';
import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import MessageList from "@/components/chat/MessageList";
import { Project } from '@/types/database.types';

interface ChatInterfaceProps {
  project: Project;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ project }) => {
  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f] text-gray-200 font-sans">
      <ChatHeader />
      <MessageList />
      <ChatInput />
    </div>
  );
};

export default ChatInterface;