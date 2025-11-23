import React, { useState, useRef } from 'react';
import { Send, Loader2, Paperclip, BarChart3 } from 'lucide-react'; // Adicionado BarChart3
import { Project } from '@/types/database.types';
import { useSession } from '@/contexts/SessionContext';
import { useTranslation } from 'react-i18next';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, FileMetadata } from '@/types/chat.types';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  project: Project;
  isDisabled?: boolean;
  onOptimisticMessageAdd: (message: ChatMessage) => void;
  onOptimisticMessageRemove: (id: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ project, isDisabled = false, onOptimisticMessageAdd, onOptimisticMessageRemove }) => {
  const { t } = useTranslation();
  const { user } = useSession();
  const [prompt, setPrompt] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gscFileInputRef = useRef<HTMLInputElement>(null); // Novo ref para input de GSC

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleGSCFileSelect = () => {
    gscFileInputRef.current?.click();
  };

  const uploadFileToStorage = async (file: File): Promise<FileMetadata | null> => {
    if (!user) {
      showError('toasts.fileUpload.loginRequired');
      return null;
    }

    setIsUploadingFile(true);
    const filePath = `${user.id}/${project.id}/${Date.now()}-${file.name}`;

    try {
      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) throw new Error('Could not get public URL for uploaded file.');

      return {
        fileName: file.name,
        fileUrl: publicUrlData.publicUrl,
        fileType: file.type,
        fileSize: file.size,
      };
    } catch (error: any) {
      showError('toasts.fileUpload.failed', { message: error.message });
      console.error('Error uploading file:', error.message);
      return null;
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleGenericFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      showError('toasts.fileUpload.noFileSelected');
      return;
    }
    if (fileInputRef.current) fileInputRef.current.value = ''; // Clear the input

    const fileMetadata = await uploadFileToStorage(file);
    if (fileMetadata) {
      showSuccess('toasts.fileUpload.success');
      await handleSendMessage(undefined, fileMetadata);
    }
  };

  const handleGSCFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      showError('toasts.fileUpload.noFileSelected');
      return;
    }
    if (gscFileInputRef.current) gscFileInputRef.current.value = ''; // Clear the input

    if (!project.id) {
      showError('toasts.chat.noProjectForGSC');
      return;
    }

    const fileMetadata = await uploadFileToStorage(file);
    if (!fileMetadata) return;

    setIsSendingMessage(true); // Bloqueia o input enquanto a análise GSC é acionada
    const tempMessageId = `optimistic-gsc-${Date.now()}`;
    onOptimisticMessageAdd({
      id: tempMessageId,
      author: 'user',
      createdAt: new Date().toISOString(),
      content: t('chatInput.gscAnalysisStarted', { fileName: fileMetadata.fileName }),
      rawContent: JSON.stringify({ type: 'gsc_analysis_request', data: fileMetadata }),
      metadata: {
        current_step: project.current_step || 0,
        file: fileMetadata,
        gscAnalysis: true,
      },
    });

    try {
      const { error: triggerError } = await supabase.functions.invoke('trigger-gsc-analysis', {
        body: {
          projectId: project.id,
          fileMetadata: fileMetadata,
        },
      });

      if (triggerError) {
        onOptimisticMessageRemove(tempMessageId);
        const errorMessage = triggerError.context?.json?.error || triggerError.message;
        const statusCode = triggerError.context?.response?.status;

        if (statusCode === 402) {
          showError("toasts.chat.noGSCAnalysisPurchase", { message: errorMessage });
        } else {
          showError('toasts.chat.gscAnalysisTriggerFailed', { message: errorMessage || t('toasts.genericError') });
        }
        return;
      }
      showSuccess('toasts.chat.gscAnalysisTriggered');
    } catch (error: any) {
      showError('toasts.chat.gscAnalysisTriggerFailed', { message: error.message || t('toasts.genericError') });
      console.error('Error triggering GSC analysis:', error.message);
      onOptimisticMessageRemove(tempMessageId);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent | React.KeyboardEvent, fileMetadata?: FileMetadata) => {
    e?.preventDefault();

    const messageContent = prompt.trim();
    if ((!messageContent && !fileMetadata) || isDisabled || !user || isSendingMessage) return;

    setIsSendingMessage(true);
    setPrompt('');

    const tempMessageId = `optimistic-${Date.now()}`;
    onOptimisticMessageAdd({
      id: tempMessageId,
      author: 'user',
      createdAt: new Date().toISOString(),
      content: messageContent || (fileMetadata ? t('chatInput.fileAttached', { fileName: fileMetadata.fileName }) : ''),
      rawContent: messageContent || (fileMetadata ? JSON.stringify({ type: 'file_attachment', data: fileMetadata }) : ''),
      metadata: {
        current_step: project.current_step || 0,
        file: fileMetadata,
      },
    });

    try {
      const { error: triggerError } = await supabase.functions.invoke('trigger-step', {
        body: {
          projectId: project.id,
          userMessage: messageContent,
          fileMetadata: fileMetadata,
        },
      });

      if (triggerError) {
        onOptimisticMessageRemove(tempMessageId);
        const errorMessage = triggerError.context?.json?.error || triggerError.message;
        const statusCode = triggerError.context?.response?.status;

        if (statusCode === 402) {
          showError("toasts.chat.outOfCredits", { message: errorMessage });
        } else {
          showError('toasts.chat.sendMessageFailed', { message: errorMessage || t('toasts.genericError') });
        }
        return;
      } else {
        console.log('Successfully triggered workflow with user message and/or file:', messageContent, fileMetadata);
      }
    } catch (error: any) {
      showError('toasts.chat.sendMessageFailed', { message: error.message || t('toasts.genericError') });
      console.error('Error sending chat message or triggering workflow:', error.message);
      onOptimisticMessageRemove(tempMessageId);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSendMessage(e);
    }
  };

  const inputDisabled = isDisabled || !user || isSendingMessage || isUploadingFile;

  return (
    <>
      <div className="p-4 bg-background border-t border-border flex justify-center">
        <form onSubmit={handleSendMessage} className="relative max-w-4xl w-full">
          <textarea
            className="w-full bg-transparent border border-border rounded-2xl p-4 pl-14 pr-14 text-foreground placeholder:text-muted-foreground max-h-40 overflow-y-auto resize-none focus:ring-2 focus:ring-cyan-400 focus:outline-none glass-effect disabled:opacity-50"
            placeholder={inputDisabled ? t('chatInput.disabledPlaceholder') : t('chatInput.placeholder')}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={inputDisabled}
          ></textarea>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleGenericFileChange}
            className="hidden"
            disabled={inputDisabled}
          />
          <input
            type="file"
            ref={gscFileInputRef}
            onChange={handleGSCFileChange}
            className="hidden"
            disabled={inputDisabled}
            accept=".csv,.json" // Sugerir tipos de arquivo GSC
          />
          <button
            type="button"
            onClick={handleFileSelect}
            className="absolute left-4 bottom-4 h-10 w-10 flex items-center justify-center rounded-full text-muted-foreground hover:bg-accent disabled:opacity-50"
            disabled={inputDisabled}
            title={t('chatInput.attachFile')}
          >
            {isUploadingFile && !gscFileInputRef.current?.files?.[0] ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
          </button>
          <button
            type="button"
            onClick={handleGSCFileSelect}
            className="absolute left-16 bottom-4 h-10 w-10 flex items-center justify-center rounded-full text-muted-foreground hover:bg-accent disabled:opacity-50"
            disabled={inputDisabled || !project.id} // Desabilita se não houver projeto selecionado
            title={project.id ? t('chatInput.gscAnalysis') : t('chatInput.gscNoProjectTooltip')}
          >
            {isUploadingFile && gscFileInputRef.current?.files?.[0] ? <Loader2 size={20} className="animate-spin" /> : <BarChart3 size={20} />}
          </button>
          <button
            type="submit"
            className="absolute right-4 bottom-4 h-10 w-10 flex items-center justify-center rounded-full bg-cyan-500 text-black disabled:bg-gray-600"
            disabled={inputDisabled || (!prompt.trim() && !isUploadingFile)}
          >
            {isSendingMessage ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </>
  );
};

export default ChatInput;