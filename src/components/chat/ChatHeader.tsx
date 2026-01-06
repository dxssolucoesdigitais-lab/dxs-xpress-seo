import React from 'react';
import { Project } from '@/types/database.types';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  project: Project;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ project }) => {
  const { t } = useTranslation();

  return (
    <div 
      className={cn(
        "flex items-center justify-between p-5 text-foreground border-b border-border bg-background/80 backdrop-blur-lg", // Removido gradiente e sombra
        "w-full" // Centraliza o header
      )}
    >
      <h1 className="text-xl font-semibold">🤖 {t('chatHeader.assistantName')}</h1>
      <div className="flex items-center gap-4 text-sm opacity-90">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span>Online</span>
      </div>
    </div>
  );
};

export default ChatHeader;