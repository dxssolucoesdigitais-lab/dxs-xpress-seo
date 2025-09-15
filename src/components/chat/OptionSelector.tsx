import React, { useState } from 'react';
import { StepResult } from '@/types/database.types';
import { LlmOption } from '@/types/chat.types';
import { useChatActions } from '@/hooks/useChatActions';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from '@/contexts/SessionContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';

interface OptionSelectorProps {
  stepResult: StepResult;
}

const OptionSelector: React.FC<OptionSelectorProps> = ({ stepResult }) => {
  const { t } = useTranslation();
  const { user } = useSession();
  const { selectOption } = useChatActions();
  const [isSubmitting, setIsSubmitting] = useState<number | null>(null);
  const options = (stepResult.llm_output as LlmOption[]) || [];
  const hasCredits = user && user.credits_remaining > 0;

  const handleSelect = async (option: LlmOption) => {
    if (!hasCredits) return;
    setIsSubmitting(option.number);
    await selectOption(stepResult, option);
  };

  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">🤖</div>
      <div className="flex-1 p-5 rounded-2xl rounded-tl-none glass-effect border border-white/10">
        <div className="prose prose-invert prose-sm max-w-none text-gray-300 mb-4">
          <p>{t('optionSelector.prompt')}</p>
        </div>
        <div className="space-y-3">
          {options.map((option) => (
            <Tooltip key={option.number}>
              <TooltipTrigger asChild>
                <div 
                  onClick={!isSubmitting && hasCredits ? () => handleSelect(option) : undefined}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border border-white/10 transition-all",
                    !isSubmitting && hasCredits && "hover:bg-white/5 hover:border-cyan-400 cursor-pointer group",
                    (isSubmitting || !hasCredits) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 border border-white/10 text-cyan-400 font-bold",
                    !isSubmitting && hasCredits && "group-hover:border-cyan-400"
                  )}>
                    {isSubmitting === option.number ? <Loader2 className="h-4 w-4 animate-spin" /> : option.number}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{option.content}</p>
                    {option.charCount && <p className="text-xs text-gray-400">{option.charCount} caracteres</p>}
                  </div>
                </div>
              </TooltipTrigger>
              {!hasCredits && (
                <TooltipContent>
                  <p>{t('optionSelector.noCreditsTooltip')}</p>
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </div>
        <div className="mt-4 text-center text-xs text-gray-500">
          {hasCredits ? t('optionSelector.helperText') : t('optionSelector.noCreditsWarning')}
        </div>
      </div>
    </div>
  );
};

export default OptionSelector;