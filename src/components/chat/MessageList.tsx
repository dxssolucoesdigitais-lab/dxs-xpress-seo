import React from 'react';
import { ChatMessage } from '@/types/chat.types';
import { User } from 'lucide-react';
import OptionSelector from './OptionSelector';
import ProgressFlow from './ProgressFlow';
import TypingIndicator from './TypingIndicator';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/contexts/SessionContext'; // Importar useSession para obter o nome do usuário

const MessageRenderer: React.FC<{ message: ChatMessage }> = ({ message }) => {
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

  const { stepResult } = message;

  if (stepResult && !stepResult.approved) {
    const isOptionList = Array.isArray(stepResult.llm_output) && stepResult.llm_output.length > 0 && typeof stepResult.llm_output[0] === 'object' && 'content' in stepResult.llm_output[0];
    if (isOptionList) {
      return <OptionSelector stepResult={stepResult} />;
    }
  }
  
  if (stepResult && stepResult.step_name === 'Workflow Progress') {
    return <ProgressFlow stepResult={stepResult} />;
  }

  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-2xl flex-shrink-0">🤖</div>
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
  hasProject: boolean; // Nova prop para indicar se há um projeto ativo
}

const MessageList: React.FC<MessageListProps> = ({ messages, isAiTyping, currentStep, hasProject }) => {
  const messagesEndRef = React.useRef<null | HTMLDivElement>(null);
  const { t } = useTranslation();
  const { user: sessionUser } = useSession(); // Obter o usuário da sessão

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping]);

  if (!hasProject && messages.length === 0) {
    // Renderiza o conteúdo do EmptyChat quando não há projeto e nenhuma mensagem
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <div className="w-20 h-20 flex items-center justify-center mb-6">
          <img src="/logo.svg" alt="Logo" className="w-16 h-16 object-contain" />
        </div>
        <h1 className="text-4xl font-bold text-foreground">{t('emptyChat.greeting', { userName: sessionUser?.full_name || t('emptyChat.guest') })}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{t('emptyChat.subtitle')}</p>
        <div ref={messagesEndRef} /> {/* Manter o ref para scroll, mesmo no estado vazio */}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
      {messages.map((message) => (
        <MessageRenderer key={message.id} message={message} />
      ))}
      {isAiTyping && <TypingIndicator currentStep={currentStep} />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;