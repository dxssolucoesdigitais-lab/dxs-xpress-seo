import React, { useMemo } from 'react';
import { Send } from 'lucide-react';
import { useChatActions } from '@/hooks/useChatActions';
import { ChatMessage } from '@/types/chat.types';

interface ChatInputProps {
  messages: ChatMessage[];
  isDisabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ messages, isDisabled = false }) => {
  const { approveStep } = useChatActions();

  const latestUnapprovedStep = useMemo(() => {
    const latestAiMessage = [...messages].reverse().find(m => m.author === 'ai' && m.stepResult);
    return latestAiMessage?.stepResult && !latestAiMessage.stepResult.approved ? latestAiMessage.stepResult : null;
  }, [messages]);

  const isApprovable = useMemo(() => {
    if (!latestUnapprovedStep) return false;
    // It's approvable if it's not an option list (which requires a click selection)
    const isOptionList = Array.isArray(latestUnapprovedStep.llm_output) && latestUnapprovedStep.llm_output.length > 0;
    return !isOptionList;
  }, [latestUnapprovedStep]);

  const handleApprove = () => {
    if (latestUnapprovedStep) {
      approveStep(latestUnapprovedStep);
    }
  };

  return (
    <div className="p-4 bg-[#0a0a0f] border-t border-white/10">
      <div className="relative mb-4">
        <textarea
          className="w-full bg-transparent border border-white/20 rounded-2xl p-4 pr-14 text-white placeholder-gray-500 resize-none focus:ring-2 focus:ring-cyan-400 focus:outline-none glass-effect disabled:opacity-50"
          placeholder={isDisabled ? "Chat is disabled for this project." : "Digite sua resposta ou comando..."}
          rows={1}
          disabled // Text input disabled for now, but also based on prop
        ></textarea>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-cyan-500 text-black hover:bg-cyan-400 transition-all disabled:bg-gray-600" disabled>
          <Send size={20} />
        </button>
      </div>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button 
          onClick={handleApprove}
          disabled={!isApprovable || isDisabled}
          className="px-3 py-1.5 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          👍 Aprovar
        </button>
        <button className="px-3 py-1.5 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>🔄 Regenerar</button>
        <button className="px-3 py-1.5 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>⏸️ Pausar</button>
        <button className="px-3 py-1.5 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>📋 Ver Histórico</button>
      </div>
    </div>
  );
};

export default ChatInput;