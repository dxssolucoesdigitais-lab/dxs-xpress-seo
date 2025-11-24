import React from 'react';
import { Loader } from '@/components/ui/loader';

interface TypingIndicatorProps {
  currentStep?: number;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ currentStep }) => {
  const message = "O XpressSEO está pensando...";

  return (
    <div className="max-w-2xl mx-auto flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-2xl flex-shrink-0"> {/* Alterado para bg-secondary */}
        <img src="/logo.svg" alt="XpressSEO Assistant Logo" className="w-full h-full object-contain p-1" />
      </div>
      <div className="p-5 rounded-2xl rounded-tl-none bg-card border border-border relative max-w-md">
        <p className="font-medium text-base text-cyan-300 mb-2">{message}</p>
        <Loader variant="typing" size="md" className="text-cyan-400" />
      </div>
      <div className="w-10 h-10 flex-shrink-0 invisible"></div> {/* Espaçador para alinhar */}
    </div>
  );
};

export default TypingIndicator;