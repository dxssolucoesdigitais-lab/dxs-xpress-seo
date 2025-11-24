import React from 'react';
import { LlmOption } from '@/types/chat.types';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface OptionSelectorProps {
  options: LlmOption[];
}

const OptionSelector: React.FC<OptionSelectorProps> = ({ options }) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-2xl flex-shrink-0"> {/* Alterado para bg-secondary */}
        <img src="/logo.svg" alt="XpressSEO Assistant Logo" className="w-full h-full object-contain p-1" />
      </div>
      <div className="p-5 rounded-2xl rounded-tl-none bg-card border border-border max-w-xl">
        <div className="text-lg max-w-none text-card-foreground mb-4">
          <p>{t('optionSelector.prompt')}</p>
        </div>
        <div className="space-y-3">
          {options.map((option) => (
            <div 
              key={option.number}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border border-border transition-all cursor-pointer",
                "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <div className={cn(
                "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-secondary border border-border text-cyan-400 font-bold text-base"
              )}>
                {option.number}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg text-foreground">{option.content}</p>
                {option.charCount && <p className="text-base text-muted-foreground">{option.charCount} caracteres</p>}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center text-base text-muted-foreground">
          {t('optionSelector.typeToSelect')}
        </div>
      </div>
      <div className="w-10 h-10 flex-shrink-0 invisible"></div> {/* Espaçador para alinhar */}
    </div>
  );
};

export default OptionSelector;