import React from 'react';
import { CheckCircle2, Loader, FileText } from 'lucide-react';
import { StepResult } from '@/types/database.types';

interface ProgressFlowProps {
  stepResult: StepResult;
}

interface WorkflowProgress {
  completed: string[];
  in_progress: string;
  upcoming: string[];
}

const ProgressFlow: React.FC<ProgressFlowProps> = ({ stepResult }) => {
  const progress = stepResult.llm_output as WorkflowProgress;

  if (!progress || !progress.completed || !progress.in_progress) {
    return null; // Or a fallback UI
  }

  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">🤖</div>
      <div className="flex-1 p-5 rounded-2xl rounded-tl-none glass-effect border border-white/10">
        <div className="space-y-3">
          <p className="text-sm font-bold text-white mb-2">Progresso do Workflow:</p>
          {progress.completed.map((step, index) => (
            <div key={index} className="flex items-center gap-2 text-green-400">
              <CheckCircle2 size={16} />
              <span className="text-sm">{step}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
            <Loader size={16} className="animate-spin" />
            <span className="text-sm font-semibold">{progress.in_progress} (em andamento...)</span>
          </div>
        </div>
        {progress.upcoming && progress.upcoming.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-400 flex items-center gap-2">
              <FileText size={14} />
              <span>Próximas etapas: {progress.upcoming.join(', ')}...</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressFlow;