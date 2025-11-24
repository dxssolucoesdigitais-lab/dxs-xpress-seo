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
        "flex items-center justify-between p-5 text-white shadow-md",
        "bg-gradient-to-br from-[#667eea] to-[#764ba2]" // Aplicando o gradiente diretamente
      )}
    >
      <h1 className="text-xl font-semibold">🤖 {t('chatHeader.assistantName')}</h1>
      <div className="flex items-center gap-4 text-sm opacity-90">
        <div className="w-2 h-2 bg-chat-status-indicator rounded-full animate-pulse"></div>
        <span>Online</span>
      </div>
    </div>
  );
};

export default ChatHeader;