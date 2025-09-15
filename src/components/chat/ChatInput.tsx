import React from 'react';
import { Send } from 'lucide-react';

const ChatInput = () => {
  return (
    <div className="p-4 bg-[#0a0a0f] border-t border-white/10">
      <div className="relative mb-4">
        <textarea
          className="w-full bg-transparent border border-white/20 rounded-2xl p-4 pr-14 text-white placeholder-gray-500 resize-none focus:ring-2 focus:ring-cyan-400 focus:outline-none glass-effect"
          placeholder="Digite sua resposta ou comando..."
          rows={1}
        ></textarea>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-cyan-500 text-black hover:bg-cyan-400 transition-all disabled:bg-gray-600" disabled>
          <Send size={20} />
        </button>
      </div>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button className="px-3 py-1.5 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all">👍 Aprovar</button>
        <button className="px-3 py-1.5 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all">🔄 Regenerar</button>
        <button className="px-3 py-1.5 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all">⏸️ Pausar</button>
        <button className="px-3 py-1.5 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all">📋 Ver Histórico</button>
      </div>
    </div>
  );
};

export default ChatInput;