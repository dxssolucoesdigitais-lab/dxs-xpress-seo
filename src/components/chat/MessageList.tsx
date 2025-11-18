import React from 'react';
import { ChatMessage, StructuredChatContent, LlmOption, WorkflowProgress } from '@/types/chat.types';
import { User } from 'lucide-react';
import OptionSelector from './OptionSelector';
import ProgressFlow from './ProgressFlow';
import TypingIndicator from './TypingIndicator';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/contexts/SessionContext';
import { cn } from '@/lib/utils';

const MessageRenderer: React.FC<{ message: ChatMessage; projectId: string | undefined }> = ({ message, projectId }) => {
  const { t } = useTranslation();

  if (message.author === 'user') {
    return (
      <div className="flex items-start justify-end gap-4">
        <div className="flex-1 max-w-xl p-4 rounded-2xl rounded-br-none bg-gradient-to-br from-purple-600 to-blue-600 text-white overflow-hidden break-all">
          <p>{message.content}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0"><User size={24} /></div>
      </div>
    );
  }

  let structuredContent: StructuredChatContent | undefined;
  if (typeof message.rawContent === 'string') {
    try {
      const parsed = JSON.parse(message.rawContent);
      if (parsed && typeof parsed === 'object' && 'type' in parsed) {
        structuredContent = parsed as StructuredChatContent;
      }
    } catch (e) {
      // Not a JSON string, treat as plain text
    }
  }

  // Handle specific structured types first
  if (structuredContent?.type === 'options' && Array.isArray(structuredContent.data)) {
    return <OptionSelector options={structuredContent.data as LlmOption[]} />;
  }

  if (structuredContent?.type === 'progress' && typeof structuredContent.data === 'object') {
    return <ProgressFlow progress={structuredContent.data as WorkflowProgress} />;
  }

  // Handle the 'structured_response' type from Windmill
  if (structuredContent?.type === 'structured_response' && Array.isArray(structuredContent.messages)) {
    return (
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">
          <img src="/logo.svg" alt="XpressSEO Assistant Logo" className="w-full h-full object-contain p-1" />
        </div>
        <div className="flex-1 max-w-xl p-5 rounded-2xl rounded-tl-none glass-effect border border-border overflow-hidden break-all">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-foreground">{t('chatHeader.assistantName')}</span>
            <span className="text-xs text-muted-foreground">{new Date(message.createdAt).toLocaleTimeString()}</span>
          </div>
          <div className={cn("prose prose-invert prose-sm text-muted-foreground space-y-4", "whitespace-pre-wrap", "break-all")}>
            {structuredContent.messages.map((msgItem: any, index: number) => {
              if (msgItem.type === 'text' && typeof msgItem.data === 'string') {
                return <p key={index}>{msgItem.data}</p>;
              }
              // Add handling for other message types within structured_response if needed
              return null;
            })}
          </div>
        </div>
      </div>
    );
  }

  // Default rendering for plain text or unparsed content (if structuredContent is undefined or not handled above)
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">
        <img src="/logo.svg" alt="XpressSEO Assistant Logo" className="w-full h-full object-contain p-1" />
      </div>
      <div className="flex-1 max-w-xl p-5 rounded-2xl rounded-tl-none glass-effect border border-border overflow-hidden break-all">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-foreground">{t('chatHeader.assistantName')}</span>
          <span className="text-xs text-muted-foreground">{new Date(message.createdAt).toLocaleTimeString()}</span>
        </div>
        <div className={cn("prose prose-invert prose-sm text-muted-foreground space-y-4", "whitespace-pre-wrap", "break-all")}>
          {message.content ? <p>{message.content}</p> : <p>{t('chat.analyzingNextStep')}</p>}
        </div>
      </div>
    </div>
  );
};

interface MessageListProps {
  messages: ChatMessage[];
  isAiTyping: boolean;
  currentStep?: number;
  projectId: string | undefined; 
}

const MessageList: React.FC<MessageListProps> = ({ messages, isAiTyping, currentStep, projectId }) => {
  const messagesEndRef = React.useRef<null | HTMLDivElement>(null);
  const { t } = useTranslation();
  const { user: sessionUser } = useSession();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
      {messages.map((message) => (
        <MessageRenderer key={message.id} message={message} projectId={projectId} />
      ))}
      {isAiTyping && <TypingIndicator currentStep={currentStep} />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;