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
    <div className="max-w-2xl w-full mx-auto flex items-start gap-4"> {/* Centered block for OptionSelector */}
      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">
        <img src="/logo.svg" alt="XpressSEO Assistant Logo" className="w-full h-full object-contain p-1" />
      </div>
      <div className="flex-1 p-5 rounded-2xl rounded-tl-none glass-effect border border-border">
        <div className="prose prose-invert dark:prose-invert prose-sm max-w-none text-muted-foreground mb-4">
          <p>{t('optionSelector.prompt')}</p>
        </div>
        <div className="space-y-3">
          {options.map((option) => (
            <div 
              key={option.number}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border border-border transition-all"
              )}
            >
              <div className={cn(
                "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-secondary border border-border text-cyan-400 font-bold"
              )}>
                {option.number}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{option.content}</p>
                {option.charCount && <p className="text-xs text-muted-foreground">{option.charCount} caracteres</p>}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center text-xs text-muted-foreground">
          {t('optionSelector.typeToSelect')}
        </div>
      </div>
    </div>
  );
};

export default OptionSelector;