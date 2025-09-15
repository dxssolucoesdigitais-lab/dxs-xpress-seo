import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

const ChatPage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full">
      {/* This is the main content area for the chat */}
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-400 flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white">{t('emptyChat.title')}</h1>
        <p className="mt-2 text-lg text-gray-400">{t('emptyChat.subtitle')}</p>
        <p className="text-sm text-gray-500 mt-1">
          Faça uma pergunta ou dê um comando para começar.
        </p>
      </div>

      {/* This is the input area */}
      <div className="p-4 bg-[#0a0a0f] border-t border-white/10">
        <div className="relative">
          <Input
            className="w-full bg-transparent border border-white/20 rounded-2xl p-4 pr-14 text-white placeholder-gray-500 resize-none focus:ring-2 focus:ring-cyan-400 focus:outline-none glass-effect"
            placeholder="Pergunte qualquer coisa ao XpressSEO..."
          />
          <Button size="icon" className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-cyan-500 text-black hover:bg-cyan-400 transition-all">
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;