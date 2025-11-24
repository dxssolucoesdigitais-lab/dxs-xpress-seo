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
    <div className="max-w-2xl mx-auto flex items-start gap-4"> {/* Adicionado max-w-2xl mx-auto para centralizar e limitar largura */}
      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">
        <img src="/logo.svg" alt="XpressSEO Assistant Logo" className="w-full h-full object-contain p-1" />
      </div>
      <div className="flex-1 p-5 rounded-2xl rounded-tl-none bg-card border border-border"> {/* Alterado para bg-card */}
        <p className="text-lg font-bold text-card-foreground mb-2">{t('progressFlow.title')}</p> {/* Ajustado para text-lg e text-card-foreground */}
        {progress.completed.map((step, index) => (
          <div key={index} className="flex items-center gap-2 text-green-400">
            <CheckCircle2 size={18} /> {/* Aumentado o tamanho do ícone */}
            <span className="text-lg">{step}</span> {/* Ajustado para text-lg */}
          </div>
        ))}
        <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
          <Loader size={18} className="animate-spin" /> {/* Aumentado o tamanho do ícone */}
          <span className="text-lg font-semibold">{progress.in_progress} {t('progressFlow.inProgress')}</span> {/* Ajustado para text-lg */}
        </div>
        {progress.upcoming && progress.upcoming.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border"> {/* Alterado para border-border */}
            <p className="text-base text-muted-foreground flex items-center gap-2"> {/* Ajustado para text-base */}
              <FileText size={16} /> {/* Aumentado o tamanho do ícone */}
              <span>{t('progressFlow.nextSteps')} {progress.upcoming.join(', ')}...</span>
            </p>
          </div>
        )}
      </div>
      <div className="w-10 h-10 flex-shrink-0 invisible"></div>
    </div>
  );
};

export default ProgressFlow;