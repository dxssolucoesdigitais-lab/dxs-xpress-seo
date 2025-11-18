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
    <div className="flex justify-center w-full"> {/* Centraliza o bloco inteiro */}
      <div className="flex items-start gap-4 max-w-2xl w-full"> {/* Largura máxima para o balão */}
        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">
          <img src="/logo.svg" alt="XpressSEO Assistant Logo" className="w-full h-full object-contain p-1" />
        </div>
        <div className="flex-1 p-5 rounded-2xl rounded-tl-none glass-effect border border-white/10">
          <div className="space-y-3">
            <p className="text-sm font-bold text-white mb-2">{t('progressFlow.title')}</p>
            {progress.completed.map((step, index) => (
              <div key={index} className="flex items-center gap-2 text-green-400">
                <CheckCircle2 size={16} />
                <span className="text-sm">{step}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
              <Loader size={16} className="animate-spin" />
              <span className="text-sm font-semibold">{progress.in_progress} {t('progressFlow.inProgress')}</span>
            </div>
          </div>
          {progress.upcoming && progress.upcoming.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-400 flex items-center gap-2">
                <FileText size={14} />
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