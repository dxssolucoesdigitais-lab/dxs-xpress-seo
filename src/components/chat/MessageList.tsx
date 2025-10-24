import React from 'react';
import { ChatMessage, StructuredChatContent, LlmOption, WorkflowProgress } from '@/types/chat.types';
import { User } from 'lucide-react';
import OptionSelector from './OptionSelector';
import ProgressFlow from './ProgressFlow';
import TypingIndicator from './TypingIndicator';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/contexts/SessionContext';
import EmptyChatPrompt from './EmptyChatPrompt';

const MessageRenderer: React.FC<{ message: ChatMessage; projectId: string | undefined }> = ({ message, projectId }) => {
  const { t } = useTranslation();

  if (message.author === 'user') {
    return (
      <div className="flex items-start justify-end gap-4">
        <div className="flex-1 max-w-md p-4 rounded-2xl rounded-br-none bg-gradient-to-br from-purple-600 to-blue-600 text-white">
          <p>{message.content}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0"><User size={24} /></div>
      </div>
    );
  }

  // Try to parse rawContent as structured JSON
  let structuredContent: StructuredChatContent | undefined;
  if (typeof message.rawContent === 'string') {
    try {
      const parsed = JSON.parse(message.rawContent);
      if (parsed && typeof parsed === 'object' && 'type' in parsed && 'data' in parsed) {
        structuredContent = parsed as StructuredChatContent;
      }
    } catch (e) {
      // Not a JSON string, treat as plain text
    }
  }

  if (structuredContent?.type === 'options' && Array.isArray(structuredContent.data)) {
    return <OptionSelector options={structuredContent.data as LlmOption[]} />;
  }

  if (structuredContent?.type === 'progress' && typeof structuredContent.data === 'object') {
    return <ProgressFlow progress={structuredContent.data as WorkflowProgress} />;
  }

  // Default rendering for plain text or unparsed content
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">🤖</div>
      <div className="flex-1 p-5 rounded-2xl rounded-tl-none glass-effect border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-foreground">{t('chatHeader.assistantName')}</span>
          <span className="text-xs text-muted-foreground">{new Date(message.createdAt).toLocaleTimeString()}</span>
        </div>
        <div className="prose prose-invert prose-sm max-w-none text-muted-foreground space-y-4">
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
  hasProject: boolean;
  onNewProjectCreated: (projectId: string) => void;
  projectId: string | undefined; // Adicionar projectId aqui
}

const MessageList: React.FC<MessageListProps> = ({ messages, isAiTyping, currentStep, hasProject, onNewProjectCreated, projectId }) => {
  const messagesEndRef = React.useRef<null | HTMLDivElement>(null);
  const { t } = useTranslation();
  const { user: sessionUser } = useSession();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping]);

  if (!hasProject && messages.length === 0) {
    return <EmptyChatPrompt onNewProjectCreated={onNewProjectCreated} />;
  }

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