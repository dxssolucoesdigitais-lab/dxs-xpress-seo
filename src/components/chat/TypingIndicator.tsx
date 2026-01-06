import React from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next'; // Importar useTranslation

interface TypingIndicatorProps {
  currentStep?: number;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ currentStep }) => {
  const { t } = useTranslation(); // Usar useTranslation

  return (
    <div className="message ai animate-fadeIn flex flex-col items-start mb-8"> {/* Ajustado para Gemini-style */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-2xl flex-shrink-0">
          <img src="/logo.svg" alt="XpressSEO Assistant Logo" className="w-full h-full object-contain p-1" />
        </div>
        <span className="font-bold text-foreground">{t('chatHeader.assistantName')}</span>
        <span className="text-xs text-muted-foreground">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div className="p-3 w-fit"> {/* Removido bg-secondary e rounded-xl */}
        <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground mx-0.5 animate-[typing_1.4s_infinite]"></span>
        <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground mx-0.5 animate-[typing_1.4s_infinite_0.2s]"></span>
        <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground mx-0.5 animate-[typing_1.4s_infinite_0.4s]"></span>
      </div>
    </div>
  );
};

export default TypingIndicator;