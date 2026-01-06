import React from 'react';
import { CheckCircle2, Loader, FileText, Copy } from 'lucide-react'; // Adicionado Copy
import { WorkflowProgress } from '@/types/chat.types';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button'; // Importar Button
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'; // Importar o hook

interface ProgressFlowProps {
  progress: WorkflowProgress;
  messageTime: string; // Adicionado para exibir a hora da mensagem
}

const ProgressFlow: React.FC<ProgressFlowProps> = ({ progress, messageTime }) => {
  const { t } = useTranslation();
  const { copyToClipboard } = useCopyToClipboard(); // Usar o hook

  if (!progress || !progress.completed || !progress.in_progress) {
    return null;
  }

  const progressText = `
${t('progressFlow.title')}

${progress.completed.map(step => `✅ ${step}`).join('\n')}
${progress.in_progress} ${t('progressFlow.inProgress')}
${progress.upcoming && progress.upcoming.length > 0 ? `\n${t('progressFlow.nextSteps')} ${progress.upcoming.join(', ')}...` : ''}
  `.trim();

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
        <p className="font-bold text-base mb-2">{t('progressFlow.title')}</p>
        <ul className="list-none p-0 space-y-1">
          {progress.completed.map((step, index) => (
            <li key={index} className="flex items-center gap-2 text-green-400 text-base">
              <CheckCircle2 size={18} className="flex-shrink-0" />
              <span>{step}</span>
            </li>
          ))}
          <li className="flex items-center gap-2 text-cyan-400 animate-pulse text-base font-semibold">
            <Loader size={18} className="animate-spin flex-shrink-0" />
            <span>{progress.in_progress} {t('progressFlow.inProgress')}</span>
          </li>
        </ul>
        {progress.upcoming && progress.upcoming.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <FileText size={16} className="flex-shrink-0" />
              <span>{t('progressFlow.nextSteps')} {progress.upcoming.join(', ')}...</span>
            </p>
          </div>
        )}
      </div>
      {progressText && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => copyToClipboard(progressText)} 
          className="mt-2 text-muted-foreground hover:text-foreground"
        >
          <Copy className="h-4 w-4 mr-2" /> {t('chat.copy')}
        </Button>
      )}
    </div>
  );
};

export default ProgressFlow;