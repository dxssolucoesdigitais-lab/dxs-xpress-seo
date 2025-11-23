import React from 'react';

interface TypingIndicatorProps {
  currentStep?: number; // Still keep currentStep for potential future use or general AI thinking
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ currentStep }) => {
  // Simplified message as frontend is "burro" and doesn't know specific steps
  const message = "O XpressSEO está pensando...";

  return (
    <div className="max-w-2xl mx-auto flex items-start gap-4"> {/* Centered block for TypingIndicator */}
      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">
        <img src="/logo.svg" alt="XpressSEO Assistant Logo" className="w-full h-full object-contain p-1" />
      </div>
      <div className="flex-1 p-5 rounded-2xl rounded-tl-none glass-effect border border-white/10 relative ai-thinking">
        <p className="font-medium text-sm text-cyan-300 mb-2">{message}</p>
        <div className="flex items-center gap-2 typing-dots">
          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
        </div>
      </div>
      <div className="w-10 h-10 flex-shrink-0 invisible"></div> {/* Invisible placeholder for symmetry */}
    </div>
  );
};

export default TypingIndicator;