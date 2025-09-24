import React from 'react';

interface TypingIndicatorProps {
  currentStep?: number;
}

const contextualMessages: { [key: number]: string } = {
  1: "Ok, começando a análise inicial...",
  2: "Agora vamos criar títulos irresistíveis! 🎯",
  3: "Perfeito! Criando descrições que geram cliques...",
  4: "Hora de descrever o produto com detalhes de mestre. ✍️",
  5: "Está ficando incrível! Meta titles do produto... 🚀",
  6: "Criando as meta descriptions perfeitas para o produto.",
  7: "Escrevendo um artigo de blog para atrair ainda mais gente.",
  8: "Preparando legendas magnéticas para as redes sociais. 📱",
  9: "Quase lá! Validação técnica em andamento... 🔍"
};

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ currentStep }) => {
  const message = currentStep ? contextualMessages[currentStep] : "Analisando a próxima etapa...";

  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">🤖</div>
      <div className="flex-1 p-5 rounded-2xl rounded-tl-none glass-effect border border-white/10 relative ai-thinking">
        <p className="font-medium text-sm text-cyan-300 mb-2">{message}</p>
        <div className="flex items-center gap-2 typing-dots">
          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;