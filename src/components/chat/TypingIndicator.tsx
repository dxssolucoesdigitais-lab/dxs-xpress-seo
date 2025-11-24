import React from 'react';
import { Loader } from '@/components/ui/loader'; // Importar o componente Loader

interface TypingIndicatorProps {
  currentStep?: number;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ currentStep }) => {
  const message = "O XpressSEO está pensando..."; // Mensagem simplificada

  return (
    <div className="max-w-2xl mx-auto flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">
        <img src="/logo.svg" alt="XpressSEO Assistant Logo" className="w-full h-full object-contain p-1" />
      </div>
      <div className="flex-1 p-5 rounded-2xl rounded-tl-none glass-effect border border-white/10 relative">
        <p className="font-medium text-sm text-cyan-300 mb-2">{message}</p>
        <Loader variant="typing" size="md" className="text-cyan-400" /> {/* Usando o novo Loader */}
      </div>
      <div className="w-10 h-10 flex-shrink-0 invisible"></div>
    </div>
  );
};

export default TypingIndicator;