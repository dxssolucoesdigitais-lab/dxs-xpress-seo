import { Sparkles } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const EmptyChat = () => {
  const { t } = useTranslation();
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-400 flex items-center justify-center mb-6">
        <Sparkles className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-4xl font-bold text-white">{t('emptyChat.title')}</h1>
      <p className="mt-2 text-lg text-gray-400">{t('emptyChat.subtitle')}</p>
      <p className="text-sm text-gray-500 mt-1">{t('emptyChat.description')}</p>
    </div>
  );
};

export default EmptyChat;