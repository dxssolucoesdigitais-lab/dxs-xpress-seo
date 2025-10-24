import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Project } from '@/types/database.types';
import { useSession } from '@/contexts/SessionContext';
import { useTranslation } from 'react-i18next';
import { showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types/chat.types'; // Import ChatMessage

interface ChatInputProps {
  project: Project | null;
  isDisabled?: boolean;
  onNewProjectCreated?: (projectId: string) => void;
  onOptimisticMessageAdd: (message: ChatMessage) => void; // New prop
  onOptimisticMessageRemove: (id: string) => void; // New prop
}

const ChatInput: React.FC<ChatInputProps> = ({ project, isDisabled = false, onNewProjectCreated, onOptimisticMessageAdd, onOptimisticMessageRemove }) => {
  const { t } = useTranslation();
  const { user } = useSession();
  const [prompt, setPrompt] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isDisabled || !user || isSendingMessage) return;

    setIsSendingMessage(true);
    const userMessage = prompt.trim();
    setPrompt('');

    const tempMessageId = `optimistic-${Date.now()}`;
    onOptimisticMessageAdd({
      id: tempMessageId,
      author: 'user',
      createdAt: new Date().toISOString(),
      content: userMessage,
      rawContent: userMessage,
    });

    try {
      if (!project) {
        const { data: newProject, error } = await supabase.functions.invoke<Project>('start-workflow-from-chat', {
          body: { prompt: userMessage },
        });

        if (error) {
          onOptimisticMessageRemove(tempMessageId); // Remove optimistic message on error
          if (error.context && error.context.response.status === 402) {
            showError("toasts.chat.outOfCredits");
          } else {
            throw error;
          }
        } else if (newProject) {
          onNewProjectCreated?.(newProject.id);
        }
      } else {
        const { error: triggerError } = await supabase.functions.invoke('trigger-step', {
          body: { projectId: project.id, userMessage: userMessage },
        });

        if (triggerError) {
          onOptimisticMessageRemove(tempMessageId); // Remove optimistic message on error
          if (triggerError.context && triggerError.context.response.status === 402) {
            showError("toasts.chat.outOfCredits");
          } else {
            throw triggerError;
          }
        } else {
          console.log('Successfully triggered workflow with user message:', userMessage);
        }
      }
    } catch (error: any) {
      showError('toasts.chat.sendMessageFailed');
      console.error('Error sending chat message or triggering workflow:', error.message);
      onOptimisticMessageRemove(tempMessageId); // Ensure removal if generic error
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <>
      <div className="p-4 bg-background border-t border-border">
        <form onSubmit={handleSendMessage} className="relative">
          <textarea
            className="w-full bg-transparent border border-border rounded-2xl p-4 pr-14 text-foreground placeholder:text-muted-foreground resize-none focus:ring-2 focus:ring-cyan-400 focus:outline-none glass-effect disabled:opacity-50"
            placeholder={isDisabled ? t('chatInput.disabledPlaceholder') : t('chatInput.placeholder')}
            rows={1}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isDisabled || isSendingMessage}
          ></textarea>
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-cyan-500 text-black hover:bg-cyan-400 transition-all disabled:bg-gray-600 duration-300 hover:shadow-[0_0_15px_rgba(56,189,248,0.6)] hover:-translate-y-px" disabled={isDisabled || !prompt.trim() || isSendingMessage}>
            {isSendingMessage ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </>
  );
};

export default ChatInput;