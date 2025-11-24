import React from 'react';
import { CheckCircle2, Loader, FileText } from 'lucide-react';
import { WorkflowProgress } from '@/types/chat.types';
import { useTranslation } from 'react-i18next';

interface ProgressFlowProps {
  progress: WorkflowProgress;
  messageTime: string; // Adicionado para exibir a hora da mensagem
}

const ProgressFlow: React.FC<ProgressFlowProps> = ({ progress, messageTime }) => {
  const { t } = useTranslation();

  if (!progress || !progress.completed || !progress.in_progress) {
    return null;
  }

  return (
    <div className="message ai animate-fadeIn max-w-2xl mx-auto flex items-start gap-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-2xl flex-shrink-0">
        <img src="/logo.svg" alt="XpressSEO Assistant Logo" className="w-full h-full object-contain p-1" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-bold text-foreground">{t('chatHeader.assistantName')}</span>
          <span className="text-xs text-muted-foreground">{messageTime}</span>
        </div>
        <div className="p-4 rounded-xl text-base leading-relaxed max-w-md bg-card border border-border text-foreground">
          <p className="font-bold text-base mb-2">{t('progressFlow.title')}</p>
          {progress.completed.map((step, index) => (
            <div key={index} className="flex items-center gap-2 text-green-400 text-base">
              <CheckCircle2 size={18} />
              <span>{step}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-cyan-400 animate-pulse text-base font-semibold">
            <Loader size={18} className="animate-spin" />
            <span>{progress.in_progress} {t('progressFlow.inProgress')}</span>
          </div>
          {progress.upcoming && progress.upcoming.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <FileText size={16} />
                <span>{t('progressFlow.nextSteps')} {progress.upcoming.join(', ')}...</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressFlow;