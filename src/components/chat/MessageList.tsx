import React from 'react';
import { ChatMessage } from '@/types/chat.types';
import MessageRenderer from './MessageRenderer'; // Importar o MessageRenderer

interface MessageListProps {
  messages: ChatMessage[];
  isAiTyping: boolean;
  currentStep?: number;
  projectId: string | undefined; 
}

const MessageList: React.FC<MessageListProps> = ({ messages, isAiTyping, currentStep, projectId }) => {
  const messagesEndRef = React.useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-8"> {/* Ajustado padding e espaçamento */}
      {messages.map((message) => (
        <MessageRenderer key={message.id} message={message} projectId={projectId} />
      ))}
      {isAiTyping && <TypingIndicator currentStep={currentStep} />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;