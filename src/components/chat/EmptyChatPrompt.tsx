import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquarePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/contexts/SessionContext';
import { showError } from '@/utils/toast';
import { Project } from '@/types/database.types';
import { ChatMessage } from '@/types/chat.types';
import { useProjects } from '@/hooks/useProjects';
import { Input } from '../ui/input'; // Importar o componente Input
import { Label } from '../ui/label'; // Importar o componente Label

interface EmptyChatPromptProps {
  onNewProjectCreated: (projectId: string) => void;
}

const EmptyChatPrompt: React.FC<EmptyChatPromptProps> = ({ onNewProjectCreated }) => {
  const { t } = useTranslation();
  const { user } = useSession();
  const { createProject } = useProjects();
  const [isLoading, setIsLoading] = useState(false);
  const [projectNameInput, setProjectNameInput] = useState(''); // Novo estado para o nome do projeto

  const handleStartNewConversation = async () => {
    if (!user || isLoading) return;

    const finalProjectName = projectNameInput.trim() || t('emptyChat.defaultProjectName'); // Usa o input ou um nome padrão

    setIsLoading(true);
    try {
      const newProject = await createProject({
        project_name: finalProjectName, // Usa o nome do projeto do input
        product_link: '', // Pode ser vazio ou um placeholder, já que o nome é customizado
        target_country: 'Brazil', // Default
        target_audience: 'General', // Default
      });

      if (newProject) {
        onNewProjectCreated(newProject.id);
      }
    } catch (error: any) {
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
      
      <div className="w-full max-w-md space-y-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="projectNameInput" className="text-lg">{t('emptyChat.projectNameLabel')}</Label>
          <Input
            id="projectNameInput"
            type="text"
            placeholder={t('emptyChat.projectNamePlaceholder')}
            value={projectNameInput}
            onChange={(e) => setProjectNameInput(e.target.value)}
            className="bg-transparent border-border text-center text-lg py-6"
            disabled={isLoading}
          />
        </div>
      </div>

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