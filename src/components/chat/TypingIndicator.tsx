import React from 'react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  currentStep?: number;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="message ai animate-fadeIn">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm text-white" style={{ background: 'var(--chat-ai-avatar-gradient)' }}>AI</div>
        <span className="font-semibold text-sm text-[var(--chat-message-author)]">XpressSEO Assistant</span>
        <span className="text-xs text-[var(--chat-message-time)]">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div className="pl-11"> {/* Espaçamento para alinhar com o avatar */}
        <div className="p-3 bg-[var(--chat-typing-indicator-bg)] rounded-xl w-fit">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--chat-typing-dot)] mx-0.5 animate-[typing_1.4s_infinite]"></span>
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--chat-typing-dot)] mx-0.5 animate-[typing_1.4s_infinite_0.2s]"></span>
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--chat-typing-dot)] mx-0.5 animate-[typing_1.4s_infinite_0.4s]"></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;