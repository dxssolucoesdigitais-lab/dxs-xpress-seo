import React from 'react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  currentStep?: number;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="message ai animate-fadeIn max-w-2xl mx-auto flex items-start gap-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-2xl flex-shrink-0">
        <img src="/logo.svg" alt="XpressSEO Assistant Logo" className="w-full h-full object-contain p-1" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-semibold text-sm text-foreground">XpressSEO Assistant</span>
          <span className="text-xs text-muted-foreground">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="p-3 bg-secondary rounded-xl w-fit">
          <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground mx-0.5 animate-[typing_1.4s_infinite]"></span>
          <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground mx-0.5 animate-[typing_1.4s_infinite_0.2s]"></span>
          <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground mx-0.5 animate-[typing_1.4s_infinite_0.4s]"></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;