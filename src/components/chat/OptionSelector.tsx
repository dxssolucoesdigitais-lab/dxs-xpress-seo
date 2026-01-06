import React from 'react';
import { LlmOption } from '@/types/chat.types';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button'; // Importar Button
import { Copy } from 'lucide-react'; // Importar Copy
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'; // Importar o hook

interface OptionSelectorProps {
  options: LlmOption[];
  messageTime: string; // Adicionado para exibir a hora da mensagem
}

const OptionSelector: React.FC<OptionSelectorProps> = ({ options, messageTime }) => {
  const { t } = useTranslation();
  const { copyToClipboard } = useCopyToClipboard(); // Usar o hook

  const optionsText = options.map(option => `${option.number}. ${option.content}`).join('\n');
  const fullContent = `${t('optionSelector.prompt')}\n\n${optionsText}\n\n💡 ${t('optionSelector.typeToSelect')}`;

  return (
    <div className="message ai animate-fadeIn flex flex-col items-start mb-8"> {/* Ajustado para Gemini-style */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-2xl flex-shrink-0">
          <img src="/logo.svg" alt="XpressSEO Assistant Logo" className="w-full h-full object-contain p-1" />
        </div>
        <span className="font-bold text-foreground">{t('chatHeader.assistantName')}</span>
        <span className="text-xs text-muted-foreground">{messageTime}</span>
      </div>
      <div className="prose dark:prose-invert max-w-full md:max-w-2xl text-foreground text-base leading-relaxed"> {/* Removido balão, ajustado max-width */}
        <p className="font-bold">{t('optionSelector.prompt')}</p>
        <ul className="list-none p-0 space-y-2 mt-4">
          {options.map((option) => (
            <li key={option.number} className="flex items-start gap-2">
              <span className="font-bold text-blue-400 flex-shrink-0">{option.number}.</span>
              <span className="flex-1">{option.content}</span>
              {option.charCount && <span className="text-sm text-muted-foreground ml-2 flex-shrink-0">({option.charCount} caracteres)</span>}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          💡 {t('optionSelector.typeToSelect')}
        </p>
      </div>
      {fullContent && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => copyToClipboard(fullContent)} 
          className="mt-2 text-muted-foreground hover:text-foreground"
        >
          <Copy className="h-4 w-4 mr-2" /> {t('chat.copy')}
        </Button>
      )}
    </div>
  );
};

export default OptionSelector;