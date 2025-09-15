import React from 'react';
import { StepResult } from '@/types/database.types';
import { LlmOption } from '@/types/chat.types';
import { useChatActions } from '@/hooks/useChatActions';

interface OptionSelectorProps {
  stepResult: StepResult;
}

const OptionSelector: React.FC<OptionSelectorProps> = ({ stepResult }) => {
  const { selectOption } = useChatActions();
  const options = (stepResult.llm_output as LlmOption[]) || [];

  const handleSelect = (option: LlmOption) => {
    selectOption(stepResult.id, option);
  };

  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">🤖</div>
      <div className="flex-1 p-5 rounded-2xl rounded-tl-none glass-effect border border-white/10">
        <div className="prose prose-invert prose-sm max-w-none text-gray-300 mb-4">
          <p>Escolha uma das opções abaixo para prosseguirmos:</p>
        </div>
        <div className="space-y-3">
          {options.map((option) => (
            <div 
              key={option.number} 
              onClick={() => handleSelect(option)}
              className="flex items-center gap-3 p-3 rounded-lg border border-white/10 hover:bg-white/5 hover:border-cyan-400 transition-all cursor-pointer group"
            >
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 border border-white/10 group-hover:border-cyan-400 text-cyan-400 font-bold">
                {option.number}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{option.content}</p>
                {option.charCount && <p className="text-xs text-gray-400">{option.charCount} caracteres</p>}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center text-xs text-gray-500">
          💬 Clique em uma das opções para selecionar
        </div>
      </div>
    </div>
  );
};

export default OptionSelector;