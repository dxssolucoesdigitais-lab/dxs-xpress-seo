import React from 'react';
import { ChatMessage, StructuredChatContent, LlmOption, WorkflowProgress } from '@/types/chat.types';
import { User as UserIcon, FileText, Download, BarChart3, Copy } from 'lucide-react'; // Adicionado Copy
import OptionSelector from './OptionSelector';
import ProgressFlow from './ProgressFlow';
import TypingIndicator from './TypingIndicator';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { FileMetadata } from '@/types/database.types';
import { Button } from '../ui/button'; // Importar Button
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'; // Importar o hook

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const icons: { [key: string]: string } = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    txt: '📃',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    xlsx: '📊',
    csv: '📊',
  };
  return icons[ext || ''] || '📎';
};

const MessageRenderer: React.FC<{ message: ChatMessage; projectId: string | undefined }> = ({ message, projectId }) => {
  const { t } = useTranslation();
  const { copyToClipboard } = useCopyToClipboard(); // Usar o hook

  const renderFileAttachment = (file: FileMetadata, isGSCAnalysis: boolean = false) => (
    <div className={cn(
      "flex items-center gap-2 p-3 rounded-lg border",
      isGSCAnalysis ? "bg-amber-600/20 border-amber-500 text-amber-300" : "bg-blue-600/20 border-blue-500 text-blue-300"
    )}>
      {isGSCAnalysis ? <BarChart3 className="h-5 w-5 flex-shrink-0" /> : <FileText className="h-5 w-5 flex-shrink-0" />}
      <a
        href={file.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 text-base font-medium hover:underline truncate"
      >
        {file.fileName}
      </a>
      <a
        href={file.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        download
        className={cn("flex-shrink-0", isGSCAnalysis ? "text-amber-200 hover:text-amber-100" : "text-blue-200 hover:text-blue-100")}
        title={t('chatInput.downloadFile')}
      >
        <Download className="h-4 w-4" />
      </a>
    </div>
  );

  const time = new Date(message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (message.author === 'user') {
    const fileAttachment = message.metadata?.file as FileMetadata | undefined;
    const isGSCAnalysisRequest = message.metadata?.gscAnalysis === true;

    return (
      <div className="message user animate-fadeIn flex flex-col items-end text-right mb-8"> {/* Ajustado para Gemini-style */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-sm text-foreground">{t('chat.you')}</span>
          <div className="w-6 h-6 rounded-full flex items-center justify-center font-semibold text-sm text-white bg-gradient-to-br from-purple-600 to-blue-600 flex-shrink-0"><UserIcon size={16} /></div> {/* Ícone menor */}
        </div>
        <div className="text-foreground text-base leading-relaxed max-w-full md:max-w-2xl"> {/* Removido balão, ajustado max-width */}
          {fileAttachment && renderFileAttachment(fileAttachment, isGSCAnalysisRequest)}
          {message.content && typeof message.content === 'string' && message.content.trim() !== '' && (
            <p className={cn("text-base", { 'mt-3': fileAttachment })}>{message.content}</p>
          )}
        </div>
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
    return <OptionSelector options={structuredContent.data as LlmOption[]} messageTime={time} />;
  }

  if (structuredContent?.type === 'progress' && typeof structuredContent.data === 'object') {
    return <ProgressFlow progress={structuredContent.data as WorkflowProgress} messageTime={time} />;
  }

  // Handle the 'structured_response' type from Windmill
  if (structuredContent?.type === 'structured_response' && Array.isArray(structuredContent.messages)) {
    const contentToRender = structuredContent.messages.map((msgItem: any, index: number) => {
      if (msgItem.type === 'text' && typeof msgItem.data === 'string') {
        return <p key={index}>{msgItem.data}</p>;
      }
      return null;
    });

    const rawTextContent = structuredContent.messages
      .filter((msgItem: any) => msgItem.type === 'text' && typeof msgItem.data === 'string')
      .map((msgItem: any) => msgItem.data)
      .join('\n\n');

    return (
      <div className="message ai animate-fadeIn flex flex-col items-start mb-8"> {/* Ajustado para Gemini-style */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-2xl flex-shrink-0">
            <img src="/logo.svg" alt="XpressSEO Assistant Logo" className="w-full h-full object-contain p-1" />
          </div>
          <span className="font-bold text-foreground">{t('chatHeader.assistantName')}</span>
          <span className="text-xs text-muted-foreground">{time}</span>
          {message.metadata?.current_step && (
            <span className="px-2 py-1 bg-blue-900/20 text-blue-400 rounded-md text-xs font-semibold">
              {t('chatHeader.step')} {message.metadata.current_step}
            </span>
          )}
        </div>
        <div className="prose dark:prose-invert max-w-full md:max-w-2xl text-foreground text-base leading-relaxed"> {/* Removido balão, ajustado max-width */}
          {contentToRender}
        </div>
        {rawTextContent && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => copyToClipboard(rawTextContent)} 
            className="mt-2 text-muted-foreground hover:text-foreground"
          >
            <Copy className="h-4 w-4 mr-2" /> {t('chat.copy')}
          </Button>
        )}
      </div>
    );
  }

  // Default rendering for plain text or unparsed content
  const rawTextContent = typeof message.content === 'string' ? message.content : '';

  return (
    <div className="message ai animate-fadeIn flex flex-col items-start mb-8"> {/* Ajustado para Gemini-style */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-2xl flex-shrink-0">
          <img src="/logo.svg" alt="XpressSEO Assistant Logo" className="w-full h-full object-contain p-1" />
        </div>
        <span className="font-bold text-foreground">{t('chatHeader.assistantName')}</span>
        <span className="text-xs text-muted-foreground">{time}</span>
        {project?.current_step && (
          <span className="px-2 py-1 bg-blue-900/20 text-blue-400 rounded-md text-xs font-semibold">
            {t('chatHeader.step')} {project.current_step}
          </span>
        )}
      </div>
      <div className="prose dark:prose-invert max-w-full md:max-w-2xl text-foreground text-base leading-relaxed"> {/* Removido balão, ajustado max-width */}
        {message.content ? <p>{message.content}</p> : <p>{t('chat.analyzingNextStep')}</p>}
      </div>
      {rawTextContent && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => copyToClipboard(rawTextContent)} 
          className="mt-2 text-muted-foreground hover:text-foreground"
        >
          <Copy className="h-4 w-4 mr-2" /> {t('chat.copy')}
        </Button>
      )}
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