import React from 'react';
import { CheckCircle2, Loader, FileText } from 'lucide-react';
import { WorkflowProgress } from '@/types/chat.types';
import { useTranslation } from 'react-i18next';

interface ProgressFlowProps {
  progress: WorkflowProgress;
}

const ProgressFlow: React.FC<ProgressFlowProps> = ({ progress }) => {
  const { t } = useTranslation();

  if (!progress || !progress.completed || !progress.in_progress) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-2xl flex-shrink-0"> {/* Alterado para bg-secondary */}
        <img src="/logo.svg" alt="XpressSEO Assistant Logo" className="w-full h-full object-contain p-1" />
      </div>
      <div className="p-5 rounded-2xl rounded-tl-none bg-card border border-border max-w-xl">
        <p className="text-lg font-bold text-card-foreground mb-2">{t('progressFlow.title')}</p>
        {progress.completed.map((step, index) => (
          <div key={index} className="flex items-center gap-2 text-green-400">
            <CheckCircle2 size={18} />
            <span className="text-lg">{step}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
          <Loader size={18} className="animate-spin" />
          <span className="text-lg font-semibold">{progress.in_progress} {t('progressFlow.inProgress')}</span>
        </div>
        {progress.upcoming && progress.upcoming.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-base text-muted-foreground flex items-center gap-2">
              <FileText size={16} />
              <span>{t('progressFlow.nextSteps')} {progress.upcoming.join(', ')}...</span>
            </p>
          </div>
        )}
      </div>
      <div className="w-10 h-10 flex-shrink-0 invisible"></div> {/* Espaçador para alinhar */}
    </div>
  );
};

export default ProgressFlow;