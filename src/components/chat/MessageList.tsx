import React from 'react';
import { ChatMessage } from '@/types/chat.types';
import { User } from 'lucide-react';
import OptionSelector from './OptionSelector';
import ProgressFlow from './ProgressFlow';
import TypingIndicator from './TypingIndicator';

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

  const { stepResult } = message;

  // Render OptionSelector if the step has options and isn't approved yet
  if (stepResult && !stepResult.approved) {
    const isOptionList = Array.isArray(stepResult.llm_output) && stepResult.llm_output.length > 0 && typeof stepResult.llm_output[0] === 'object' && 'content' in stepResult.llm_output[0];
    if (isOptionList) {
      return <OptionSelector stepResult={stepResult} />;
    }
  }
  
  // Render ProgressFlow for specific step names
  if (stepResult && stepResult.step_name === 'Workflow Progress') {
    return <ProgressFlow stepResult={stepResult} />;
  }

  // Fallback to a generic AI message card
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">🤖</div>
      <div className="flex-1 p-5 rounded-2xl rounded-tl-none glass-effect border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-white">XpressSEO Assistant</span>
          <span className="text-xs text-gray-400">{new Date(message.createdAt).toLocaleTimeString()}</span>
        </div>
        <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-4">
          {message.content ? <p>{message.content}</p> : <p>Analisando a próxima etapa...</p>}
        </div>
      </div>
    </div>
  );
};

interface MessageListProps {
  messages: ChatMessage[];
  isAiTyping: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isAiTyping }) => {
  const messagesEndRef = React.useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
      {messages.map((message) => (
        <MessageRenderer key={message.id} message={message} />
      ))}
      {isAiTyping && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;