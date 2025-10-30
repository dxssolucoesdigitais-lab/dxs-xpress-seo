import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquarePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/contexts/SessionContext';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Project } from '@/types/database.types';
import { ChatMessage } from '@/types/chat.types';

interface EmptyChatPromptProps {
  onNewProjectCreated: (projectId: string) => void;
  onOptimisticMessageAdd: (message: ChatMessage) => void;
  onOptimisticMessageRemove: (id: string) => void;
}

const EmptyChatPrompt: React.FC<EmptyChatPromptProps> = ({ onNewProjectCreated, onOptimisticMessageAdd, onOptimisticMessageRemove }) => {
  const { t } = useTranslation();
  const { user } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartNewConversation = async () => {
    if (!user || isLoading) return;

    setIsLoading(true);
    const initialPrompt = t('emptyChat.initialPrompt'); 

    const tempMessageId = `optimistic-${Date.now()}`;
    onOptimisticMessageAdd({
      id: tempMessageId,
      author: 'user',
      createdAt: new Date().toISOString(),
      content: initialPrompt,
      rawContent: initialPrompt,
      metadata: { current_step: 0 }, // Adiciona o current_step inicial ao metadata
    });

    try {
      const { data: newProject, error } = await supabase.functions.invoke<Project>('start-workflow-from-chat', {
        body: { prompt: initialPrompt },
      });

      if (error) {
        onOptimisticMessageRemove(tempMessageId); // Remove optimistic message on error
        const errorMessage = error.context?.json?.error || error.message; // Extrai a mensagem de erro específica
        const statusCode = error.context?.response?.status; // Acessa o status de forma segura

        if (statusCode === 402) {
          showError("toasts.chat.outOfCredits", { message: errorMessage }); // Passa a mensagem específica
        } else {
          showError('toasts.chat.startWorkflowFailed', { message: errorMessage || t('toasts.genericError') }); // Fallback genérico
        }
        return; // Sai da função após mostrar o erro
      } else if (newProject) {
        onNewProjectCreated(newProject.id);
      }
    } catch (error: any) {
      // Este bloco catch agora lida com erros de rede ou exceções inesperadas
      showError('toasts.chat.startWorkflowFailed', { message: error.message || t('toasts.genericError') });
      console.error('Error starting new conversation:', error.message);
      onOptimisticMessageRemove(tempMessageId); // Garante a remoção em caso de erro genérico
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
      <div className="w-20 h-20 flex items-center justify-center mb-6">
        <img src="/logo.svg" alt="Logo" className="w-16 h-16 object-contain" />
      </div>
      <h1 className="text-4xl font-bold text-foreground">{t('emptyChat.greeting', { userName: user?.full_name || t('emptyChat.guest') })}</h1>
      <p className="mt-2 text-lg text-muted-foreground mb-8">{t('emptyChat.subtitle')}</p>
      <Button 
        size="lg" 
        onClick={handleStartNewConversation} 
        disabled={isLoading}
        className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all duration-300 hover:shadow-[0_0_15px_rgba(56,189,248,0.6)] hover:-translate-y-px"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <MessageSquarePlus className="mr-2 h-5 w-5" />
        )}
        {t('emptyChat.startButton')}
      </Button>
    </div>
  );
};

export default EmptyChatPrompt;