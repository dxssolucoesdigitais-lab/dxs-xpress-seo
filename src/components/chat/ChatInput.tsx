import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Project } from '@/types/database.types';
import { useSession } from '@/contexts/SessionContext';
import { useTranslation } from 'react-i18next';
import { showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types/chat.types';
import { cn } from '@/lib/utils'; // Importar cn para utilitários de classe

interface ChatInputProps {
  project: Project; // Project agora é sempre esperado estar presente
  isDisabled?: boolean;
  onOptimisticMessageAdd: (message: ChatMessage) => void;
  onOptimisticMessageRemove: (id: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ project, isDisabled = false, onOptimisticMessageAdd, onOptimisticMessageRemove }) => {
  const { t } = useTranslation();
  const { user } = useSession();
  const [prompt, setPrompt] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const handleSendMessage = async (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault(); // Conditionally call preventDefault

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
      metadata: { current_step: project.current_step || 0 }, // Adiciona o current_step ao metadata
    });

    try {
      // Agora, ChatInput sempre assume que um projeto existe e envia mensagens para trigger-step
      const { error: triggerError } = await supabase.functions.invoke('trigger-step', {
        body: { projectId: project.id, userMessage: userMessage },
      });

      if (triggerError) {
        onOptimisticMessageRemove(tempMessageId); // Remove a mensagem otimista em caso de erro
        const errorMessage = triggerError.context?.json?.error || triggerError.message; // Extrai a mensagem de erro específica
        const statusCode = triggerError.context?.response?.status; // Acessa o status de forma segura

        if (statusCode === 402) {
          showError("toasts.chat.outOfCredits", { message: errorMessage }); // Passa a mensagem específica
        } else {
          showError('toasts.chat.sendMessageFailed', { message: errorMessage || t('toasts.genericError') }); // Fallback genérico
        }
        return; // Sai da função após mostrar o erro
      } else {
        console.log('Successfully triggered workflow with user message:', userMessage);
      }
    } catch (error: any) {
      // Este bloco catch agora lida com erros de rede ou exceções inesperadas
      showError('toasts.chat.sendMessageFailed', { message: error.message || t('toasts.genericError') });
      console.error('Error sending chat message or triggering workflow:', error.message);
      onOptimisticMessageRemove(tempMessageId); // Garante a remoção em caso de erro genérico
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSendMessage(e); // Pass the keyboard event to handleSendMessage
    }
  };

  return (
    <>
      <div className="p-4 bg-background border-t border-border flex justify-center">
        <form onSubmit={handleSendMessage} className="relative max-w-4xl w-full"> {/* Alterado para max-w-4xl */}
          <textarea
            className="w-full bg-transparent border border-border rounded-2xl p-4 pr-14 text-foreground placeholder:text-muted-foreground max-h-40 overflow-y-auto focus:ring-2 focus:ring-cyan-400 focus:outline-none glass-effect disabled:opacity-50"
            placeholder={isDisabled ? t('chatInput.disabledPlaceholder') : t('chatInput.placeholder')}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isDisabled || !user || isSendingMessage} // Desabilita se não houver usuário
          ></textarea>
          <button type="submit" className="absolute right-4 bottom-4 p-2 rounded-full bg-cyan-500 text-black disabled:bg-gray-600" disabled={isDisabled || !prompt.trim() || isSendingMessage || !user}>
            {isSendingMessage ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </>
  );
};

export default ChatInput;