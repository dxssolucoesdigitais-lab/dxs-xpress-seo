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
    <div className="message ai animate-fadeIn">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm text-white" style={{ background: 'var(--chat-ai-avatar-gradient)' }}>AI</div>
        <span className="font-semibold text-sm text-[var(--chat-message-author)]">{t('chatHeader.assistantName')}</span>
        <span className="text-xs text-[var(--chat-message-time)]">{messageTime}</span>
      </div>
      <div className="pl-11"> {/* Espaçamento para alinhar com o avatar */}
        <div className="p-4 rounded-xl text-base leading-relaxed max-w-md" style={{ background: 'var(--chat-ai-message-bg-gradient)', border: '1px solid var(--chat-ai-message-border)', color: 'var(--chat-ai-message-text)' }}>
          <p className="font-bold">{t('optionSelector.prompt')}</p>
        </div>
        <div className="pl-4 mt-3 py-4 bg-[var(--chat-options-list-bg)] border-l-4 border-[var(--chat-options-list-border-left)] rounded-lg leading-relaxed max-w-md">
          {options.map((option) => (
            <div key={option.number} className="my-2 text-[var(--chat-option-item-text)] text-base">
              <span className="font-bold text-[var(--chat-option-number)] mr-2">{option.number}.</span>
              {option.content}
              {option.charCount && <span className="text-sm text-[var(--chat-message-time)] ml-2">({option.charCount} caracteres)</span>}
            </div>
          ))}
        </div>
        <div className="pl-4 mt-3 py-3 bg-[var(--chat-instructions-bg)] border-l-4 border-[var(--chat-instructions-border-left)] rounded-md text-sm text-[var(--chat-instructions-text)] font-medium max-w-md">
          💡 {t('optionSelector.typeToSelect')}
        </div>
      </div>
    </div>
  );
};

export default OptionSelector;