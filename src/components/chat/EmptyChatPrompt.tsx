import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquarePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/contexts/SessionContext';
import { showError } from '@/utils/toast';
import { Project } from '@/types/database.types';
import { ChatMessage } from '@/types/chat.types';
import { useProjects } from '@/hooks/useProjects'; // Import useProjects

interface EmptyChatPromptProps {
  onNewProjectCreated: (projectId: string) => void;
  // onOptimisticMessageAdd e onOptimisticMessageRemove não são mais necessários aqui
  // pois o prompt inicial não é enviado deste componente.
}

const EmptyChatPrompt: React.FC<EmptyChatPromptProps> = ({ onNewProjectCreated }) => {
  const { t } = useTranslation();
  const { user } = useSession();
  const { createProject } = useProjects(); // Use o hook createProject
  const [isLoading, setIsLoading] = useState(false);

  const handleStartNewConversation = async () => {
    if (!user || isLoading) return;

    setIsLoading(true);
    const initialPromptForProjectName = t('emptyChat.initialPrompt'); // Isso agora é apenas para o nome do projeto

    try {
      const newProject = await createProject({
        project_name: `Análise de ${initialPromptForProjectName.substring(0, 40)}...`,
        product_link: initialPromptForProjectName, // Use isso como um placeholder para o link inicial do produto
        target_country: 'Brazil', // Default
        target_audience: 'General', // Default
      });

      if (newProject) {
        onNewProjectCreated(newProject.id);
      }
    } catch (error: any) {
      // O tratamento de erros já está em useProjects.createProject
      console.error('Error starting new conversation:', error.message);
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