import React from 'react';
import { ChatMessage, StructuredChatContent, LlmOption, WorkflowProgress } from '@/types/chat.types';
import { User as UserIcon, FileText, Download, BarChart3 } from 'lucide-react';
import OptionSelector from './OptionSelector';
import ProgressFlow from './ProgressFlow';
import TypingIndicator from './TypingIndicator';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { FileMetadata } from '@/types/database.types';

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

  const renderFileAttachment = (file: FileMetadata, isGSCAnalysis: boolean = false) => (
    <div className="flex items-center gap-3 p-3 bg-[var(--chat-file-message-bg)] border-[var(--chat-file-message-border)] rounded-lg mt-2">
      <span className="text-2xl flex-shrink-0">{getFileIcon(file.fileName)}</span>
      <div className="flex-1">
        <div className="font-semibold text-base text-[var(--chat-file-message-name)]">{file.fileName}</div>
        <div className="text-sm text-[var(--chat-file-message-meta)]">{file.fileSize}</div>
      </div>
      <a
        href={file.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        download
        className="px-3 py-1 bg-[var(--chat-file-download-bg)] text-[var(--chat-file-download-text)] rounded-md text-sm font-semibold cursor-pointer transition-all hover:bg-[var(--chat-file-download-hover-bg)]"
      >
        Download
      </a>
    </div>
  );

  const time = new Date(message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (message.author === 'user') {
    const fileAttachment = message.metadata?.file as FileMetadata | undefined;
    const isGSCAnalysisRequest = message.metadata?.gscAnalysis === true;

    return (
      <div className="message user animate-fadeIn">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm text-white" style={{ background: 'var(--chat-user-avatar-gradient)' }}>VC</div>
          <span className="font-semibold text-sm text-[var(--chat-message-author)]">{t('chat.you')}</span>
          <span className="text-xs text-[var(--chat-message-time)]">{time}</span>
        </div>
        <div className="pl-11"> {/* Espaçamento para alinhar com o avatar */}
          {fileAttachment && renderFileAttachment(fileAttachment, isGSCAnalysisRequest)}
          {message.content && typeof message.content === 'string' && message.content.trim() !== '' && (
            <div className="p-4 rounded-xl bg-[var(--chat-user-message-bg)] border border-[var(--chat-user-message-border)] text-[var(--chat-user-message-text)] text-base leading-relaxed max-w-md">
              <p>{message.content}</p>
            </div>
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
    return (
      <div className="message ai animate-fadeIn">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm text-white" style={{ background: 'var(--chat-ai-avatar-gradient)' }}>AI</div>
          <span className="font-semibold text-sm text-[var(--chat-message-author)]">{t('chatHeader.assistantName')}</span>
          <span className="text-xs text-[var(--chat-message-time)]">{time}</span>
          {message.metadata?.current_step && (
            <span className="px-2 py-1 bg-[var(--chat-badge-bg)] text-[var(--chat-badge-text)] rounded-md text-xs font-semibold">
              {t('chatHeader.step')} {message.metadata.current_step}
            </span>
          )}
        </div>
        <div className="pl-11"> {/* Espaçamento para alinhar com o avatar */}
          <div className="p-4 rounded-xl text-base leading-relaxed max-w-md" style={{ background: 'var(--chat-ai-message-bg-gradient)', border: '1px solid var(--chat-ai-message-border)', color: 'var(--chat-ai-message-text)' }}>
            <div className="space-y-4">
              {structuredContent.messages.map((msgItem: any, index: number) => {
                if (msgItem.type === 'text' && typeof msgItem.data === 'string') {
                  return <p key={index}>{msgItem.data}</p>;
                }
                return null;
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default rendering for plain text or unparsed content
  return (
    <div className="message ai animate-fadeIn">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm text-white" style={{ background: 'var(--chat-ai-avatar-gradient)' }}>AI</div>
        <span className="font-semibold text-sm text-[var(--chat-message-author)]">{t('chatHeader.assistantName')}</span>
        <span className="text-xs text-[var(--chat-message-time)]">{time}</span>
        {project?.current_step && (
          <span className="px-2 py-1 bg-[var(--chat-badge-bg)] text-[var(--chat-badge-text)] rounded-md text-xs font-semibold">
            {t('chatHeader.step')} {project.current_step}
          </span>
        )}
      </div>
      <div className="pl-11"> {/* Espaçamento para alinhar com o avatar */}
        <div className="p-4 rounded-xl text-base leading-relaxed max-w-md" style={{ background: 'var(--chat-ai-message-bg-gradient)', border: '1px solid var(--chat-ai-message-border)', color: 'var(--chat-ai-message-text)' }}>
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[var(--chat-messages-bg)]">
      {messages.map((message) => (
        <MessageRenderer key={message.id} message={message} projectId={projectId} />
      ))}
      {isAiTyping && <TypingIndicator currentStep={currentStep} />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;