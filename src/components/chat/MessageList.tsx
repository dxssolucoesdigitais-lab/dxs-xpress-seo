import React from 'react';
import { User } from 'lucide-react';
import OptionSelector from './OptionSelector';
import ProgressFlow from './ProgressFlow';

const MessageList = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
      {/* AI Message 1: Approval Request */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">🤖</div>
        <div className="flex-1 p-5 rounded-2xl rounded-tl-none glass-effect border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-white">XpressSEO Assistant</span>
            <span className="text-xs text-gray-400">Agora</span>
          </div>
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-4">
            <p>Olá João! 👋 Vou te ajudar a criar conteúdo SEO incrível para sua loja.</p>
            <p><strong>Etapa 1/9: Título H2 da Coleção</strong></p>
            <p>Baseado no link que você forneceu, criei este título otimizado:</p>
            <div className="p-4 rounded-lg bg-black/20 border border-white/10">
              <h2 className="text-lg font-bold text-cyan-400">Camas Ortopédicas para Cães: Conforto Premium</h2>
              <p className="text-sm text-gray-400 mt-1">Coleção especialmente desenvolvida para proporcionar o máximo conforto e suporte para seu melhor amigo.</p>
            </div>
            <p>O conteúdo está aprovado? Posso prosseguir para a próxima etapa? ✨</p>
          </div>
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <button className="px-4 py-2 text-sm font-semibold text-white bg-green-500/20 border border-green-500 rounded-lg hover:bg-green-500/40 transition-all">✅ Aprovar e Continuar</button>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-yellow-500/20 border border-yellow-500 rounded-lg hover:bg-yellow-500/40 transition-all">🔄 Regenerar</button>
          </div>
        </div>
      </div>

      {/* User Message */}
      <div className="flex items-start justify-end gap-4">
        <div className="flex-1 max-w-md p-4 rounded-2xl rounded-br-none bg-gradient-to-br from-purple-600 to-blue-600 text-white">
          <p>Aprovado! Pode continuar 🚀</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0"><User size={24} /></div>
      </div>

      {/* AI Typing Indicator */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">🤖</div>
        <div className="flex items-center gap-3 p-4 rounded-2xl rounded-tl-none glass-effect border border-white/10">
          <div className="typing-dots flex gap-1.5">
            <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
            <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
            <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
          </div>
          <span className="text-sm text-gray-400 italic">Gerando 5 opções de Meta Title...</span>
        </div>
      </div>

      {/* AI Message 2: Option Selector */}
      <OptionSelector />

      {/* AI Message 3: Progress Flow */}
      <ProgressFlow />
    </div>
  );
};

export default MessageList;