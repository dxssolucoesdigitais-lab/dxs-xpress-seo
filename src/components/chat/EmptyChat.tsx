import React from 'react';
import { useTranslation } from 'react-i18next';

interface EmptyChatProps {
  userName?: string | null;
}

const EmptyChat: React.FC<EmptyChatProps> = ({ userName }) => {
  const { t } = useTranslation();
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-400 flex items-center justify-center mb-6">
        <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
      </div>
      <h1 className="text-4xl font-bold text-foreground">{t('emptyChat.greeting', { userName: userName || t('emptyChat.guest') })}</h1>
      <p className="mt-2 text-lg text-muted-foreground">{t('emptyChat.subtitle')}</p>
    </div>
  );
};

export default EmptyChat;