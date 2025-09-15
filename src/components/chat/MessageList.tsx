import React from 'react';
import { ChatMessage } from '@/types/chat.types';
import { User } from 'lucide-react';

// A simple component to render different message types. This would be expanded.
const MessageRenderer: React.FC<{ message: ChatMessage }> = ({ message }) => {
  if (message.author === 'user') {
    return (
      <div className="flex items-start justify-end gap-4">
        <div className="flex-1 max-w-md p-4 rounded-2xl rounded-br-none bg-gradient-to-br from-purple-600 to-blue-600 text-white">
          <p>{message.content}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0"><User size={24} /></div>
      </div>
    );
  }

  // For now, we'll render a generic AI message card.
  // We can add logic here to check message.stepResult and render different components
  // like OptionSelector or ProgressFlow based on the step_name or llm_output structure.
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">🤖</div>
      <div className="flex-1 p-5 rounded-2xl rounded-tl-none glass-effect border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-white">XpressSEO Assistant</span>
          <span className="text-xs text-gray-400">{new Date(message.createdAt).toLocaleTimeString()}</span>
        </div>
        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-4">
          {message.content ? <p>{message.content}</p> : <p>Analyzing next step...</p>}
        </div>
      </div>
    </div>
  );
};


interface MessageListProps {
  messages: ChatMessage[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
      {messages.map((message) => (
        <MessageRenderer key={message.id} message={message} />
      ))}
    </div>
  );
};

export default MessageList;