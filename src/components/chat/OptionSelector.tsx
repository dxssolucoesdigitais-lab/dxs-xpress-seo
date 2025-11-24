import React from 'react';
import { LlmOption } from '@/types/chat.types';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface OptionSelectorProps {
  options: LlmOption[];
  messageTime: string; // Adicionado para exibir a hora da mensagem
}

const OptionSelector: React.FC<OptionSelectorProps> = ({ options, messageTime }) => {
  const { t } = useTranslation();

  return (
    <div className="message ai animate-fadeIn max-w-2xl mx-auto flex items-start gap-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-2xl flex-shrink-0">
        <img src="/logo.svg" alt="XpressSEO Assistant Logo" className="w-full h-full object-contain p-1" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-bold text-foreground">{t('chatHeader.assistantName')}</span>
          <span className="text-xs text-muted-foreground">{messageTime}</span>
        </div>
        <div className="p-4 rounded-xl text-base leading-relaxed max-w-md bg-card border border-border text-foreground">
          <p className="font-bold">{t('optionSelector.prompt')}</p>
        </div>
        <div className="pl-4 mt-3 py-4 bg-secondary border-l-4 border-blue-500 rounded-lg leading-relaxed max-w-md">
          {options.map((option) => (
            <div key={option.number} className="my-2 text-foreground text-base">
              <span className="font-bold text-blue-400 mr-2">{option.number}.</span>
              {option.content}
              {option.charCount && <span className="text-sm text-muted-foreground ml-2">({option.charCount} caracteres)</span>}
            </div>
          ))}
        </div>
        <div className="pl-4 mt-3 py-3 bg-blue-900/20 border-l-4 border-blue-500 rounded-md text-sm text-blue-300 font-medium max-w-md">
          💡 {t('optionSelector.typeToSelect')}
        </div>
      </div>
    </div>
  );
};

export default OptionSelector;