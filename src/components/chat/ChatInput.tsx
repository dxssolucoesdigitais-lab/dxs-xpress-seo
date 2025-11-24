import React, { useState, useRef } from 'react';
import { Send, Loader2, Paperclip, BarChart3, X } from 'lucide-react';
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

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface UploadedFile extends FileMetadata {
  fileObject: File;
}

const ChatInput: React.FC<ChatInputProps> = ({ project, isDisabled = false, onOptimisticMessageAdd, onOptimisticMessageRemove }) => {
  const { t } = useTranslation();
  const { user } = useSession();
  const [prompt, setPrompt] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gscFileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        fileSize: formatFileSize(file.size), // Format size here
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
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      showError('toasts.fileUpload.noFileSelected');
      return;
    }
    if (fileInputRef.current) fileInputRef.current.value = '';

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) { // Max 10MB
        showError(`File "${file.name}" is too large. Max: 10MB`);
        continue;
      }
      const fileMetadata = await uploadFileToStorage(file);
      if (fileMetadata) {
        setUploadedFiles(prev => [...prev, { ...fileMetadata, fileObject: file }]);
        showSuccess('toasts.fileUpload.success');
      }
    }
  };

  const handleGSCFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      showError('toasts.fileUpload.noFileSelected');
      return;
    }
    if (gscFileInputRef.current) gscFileInputRef.current.value = '';

    if (!project.id) {
      showError('toasts.chat.noProjectForGSC');
      return;
    }

    const fileMetadata = await uploadFileToStorage(file);
    if (!fileMetadata) return;

    setIsSendingMessage(true);
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

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault();

    const messageContent = prompt.trim();
    const hasFiles = uploadedFiles.length > 0;

    if ((!messageContent && !hasFiles) || isDisabled || !user || isSendingMessage) return;

    setIsSendingMessage(true);
    setPrompt('');
    
    // Clear files after sending
    const filesToSend = [...uploadedFiles];
    setUploadedFiles([]);

    const tempMessageId = `optimistic-${Date.now()}`;
    onOptimisticMessageAdd({
      id: tempMessageId,
      author: 'user',
      createdAt: new Date().toISOString(),
      content: messageContent || (hasFiles ? t('chatInput.fileAttached', { fileName: filesToSend.map(f => f.fileName).join(', ') }) : ''),
      rawContent: messageContent || (hasFiles ? JSON.stringify({ type: 'file_attachment', data: filesToSend }) : ''),
      metadata: {
        current_step: project.current_step || 0,
        files: filesToSend, // Pass all file metadata
      },
    });

    try {
      const { error: triggerError } = await supabase.functions.invoke('trigger-step', {
        body: {
          projectId: project.id,
          userMessage: messageContent,
          fileMetadata: filesToSend, // Pass all file metadata
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
        console.log('Successfully triggered workflow with user message and/or file:', messageContent, filesToSend);
      }
    } catch (error: any) {
      showError('toasts.chat.sendMessageFailed', { message: error.message || t('toasts.genericError') });
      console.error('Error sending chat message or triggering workflow:', error.message);
      onOptimisticMessageRemove(tempMessageId);
    } finally {
      setIsSendingMessage(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Reset textarea height
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSendMessage(e);
    }
  };

  const inputDisabled = isDisabled || !user || isSendingMessage || isUploadingFile;

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [prompt]);

  return (
    <div className="p-5 bg-[var(--chat-input-bg)] border-t border-[var(--chat-input-border)] shadow-md">
      <div className="flex flex-col md:flex-row gap-3 items-end">
        <div className="flex flex-col gap-2 flex-1 w-full">
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-1 bg-[var(--chat-file-chip-bg-gradient)] border border-[var(--chat-file-chip-border)] rounded-lg text-sm text-[var(--chat-file-chip-text)]">
                  <span className="text-base">{getFileIcon(file.fileName)}</span>
                  <span className="font-medium max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">{file.fileName}</span>
                  <span className="text-xs text-[var(--chat-file-chip-size-text)]">{file.fileSize}</span>
                  <X className="w-4 h-4 text-[var(--chat-file-chip-remove)] cursor-pointer hover:scale-110 transition-transform" onClick={() => removeFile(index)} />
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 items-center w-full">
            <label htmlFor="fileInput" className="px-3 py-2 bg-[var(--chat-upload-button-bg)] border border-[var(--chat-upload-button-border)] rounded-lg cursor-pointer transition-all hover:bg-[var(--chat-upload-button-hover-bg)] hover:border-[var(--chat-upload-button-hover-border)] hover:text-[var(--chat-upload-button-hover-text)] flex items-center gap-2 text-sm text-[var(--chat-upload-button-text)] font-medium">
              {isUploadingFile && !gscFileInputRef.current?.files?.[0] ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
              {t('chatInput.attachFile')}
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleGenericFileChange}
              className="hidden"
              disabled={inputDisabled}
              multiple
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xlsx,.csv"
              id="fileInput"
            />
            <label htmlFor="gscFileInput" className="px-3 py-2 bg-[var(--chat-upload-button-bg)] border border-[var(--chat-upload-button-border)] rounded-lg cursor-pointer transition-all hover:bg-[var(--chat-upload-button-hover-bg)] hover:border-[var(--chat-upload-button-hover-border)] hover:text-[var(--chat-upload-button-hover-text)] flex items-center gap-2 text-sm text-[var(--chat-upload-button-text)] font-medium"
              title={project.id ? t('chatInput.gscAnalysis') : t('chatInput.gscNoProjectTooltip')}
            >
              {isUploadingFile && gscFileInputRef.current?.files?.[0] ? <Loader2 size={16} className="animate-spin" /> : <BarChart3 size={16} />}
              {t('chatInput.gscAnalysis')}
            </label>
            <input
              type="file"
              ref={gscFileInputRef}
              onChange={handleGSCFileChange}
              className="hidden"
              disabled={inputDisabled || !project.id}
              accept=".csv,.json"
              id="gscFileInput"
            />
            <textarea
              ref={textareaRef}
              className="flex-1 p-3 border-2 border-[var(--chat-input-border)] rounded-xl text-base text-foreground placeholder:text-muted-foreground resize-none min-h-[50px] max-h-[150px] focus:outline-none focus:border-[var(--chat-input-focus-border)] focus:shadow-[0_0_0_3px_var(--chat-input-focus-shadow)] bg-transparent"
              placeholder={inputDisabled ? t('chatInput.disabledPlaceholder') : t('chatInput.placeholder')}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={inputDisabled}
              rows={1}
            ></textarea>
          </div>
        </div>
        <button
          type="submit"
          onClick={handleSendMessage}
          className="px-6 py-3 bg-[var(--chat-send-button-gradient)] text-[var(--chat-send-button-text)] rounded-xl text-base font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[var(--chat-send-button-shadow)] disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
          disabled={inputDisabled || (!prompt.trim() && uploadedFiles.length === 0)}
        >
          {isSendingMessage ? <Loader2 size={20} className="animate-spin" /> : <span className="flex items-center justify-center gap-1">Enviar <Send size={16} /></span>}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;