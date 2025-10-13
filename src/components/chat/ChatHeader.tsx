import React from 'react';
import { Project } from '@/types/database.types';
import { useTranslation } from 'react-i18next';

interface ChatHeaderProps {
  project: Project;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ project }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between p-4 border-b border-border glass-effect z-10">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10">
          <img src="/logo.svg" alt="XpressSEO Assistant Logo" className="w-full h-full object-contain" />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
        </div>
        <span className="text-lg font-bold text-foreground">{t('chatHeader.assistantName')}</span>
      </div>
      {/* Indicador de etapas e barra de progresso removidos */}
    </div>
  );
};

export default ChatHeader;