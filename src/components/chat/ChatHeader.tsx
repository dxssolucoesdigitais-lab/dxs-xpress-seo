import React from 'react';

const ChatHeader = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-white/10 glass-effect z-10">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-400 animate-pulse-glow flex items-center justify-center text-xl">
            🎯
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0a0a0f] rounded-full"></div>
        </div>
        <span className="text-lg font-bold text-white">XpressSEO Assistant</span>
      </div>
      <div className="hidden md:flex items-center gap-3 text-sm">
        <div className="text-gray-400">Etapa 2/9</div>
        <div className="w-40 h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full" style={{ width: '22%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;