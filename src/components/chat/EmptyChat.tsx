import { Sparkles } from 'lucide-react';
import React from 'react';

const EmptyChat = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-400 flex items-center justify-center mb-6">
        <Sparkles className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-4xl font-bold text-white">XpressSEO</h1>
      <p className="mt-2 text-lg text-gray-400">Seu assistente de IA para conteúdo está pronto.</p>
      <p className="text-sm text-gray-500 mt-1">O fluxo de automação foi iniciado. Aguarde a primeira mensagem do assistente.</p>
    </div>
  );
};

export default EmptyChat;