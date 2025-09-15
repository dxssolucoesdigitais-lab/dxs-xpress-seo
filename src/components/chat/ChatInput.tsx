import React, { useState, useMemo } from 'react';
import { Send, RefreshCw, Loader2, Play, Pause, BookText } from 'lucide-react';
import { useChatActions } from '@/hooks/useChatActions';
import { useProjectActions } from '@/hooks/useProjectActions';
import { ChatMessage } from '@/types/chat.types';
import { Project } from '@/types/database.types';
import ProjectHistorySheet from './ProjectHistorySheet';
import { useSession } from '@/contexts/SessionContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatInputProps {
  project: Project;
  messages: ChatMessage[];
  isDisabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ project, messages, isDisabled = false }) => {
  const { user } = useSession();
  const { approveStep, regenerateStep } = useChatActions();
  const { pauseProject, resumeProject } = useProjectActions();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const hasCredits = user && user.credits_remaining > 0;

  const latestUnapprovedStep = useMemo(() => {
    const latestAiMessage = [...messages].reverse().find(m => m.author === 'ai' && m.stepResult);
    return latestAiMessage?.stepResult && !latestAiMessage.stepResult.approved ? latestAiMessage.stepResult : null;
  }, [messages]);

  const isApprovable = useMemo(() => {
    if (!latestUnapprovedStep) return false;
    const isOptionList = Array.isArray(latestUnapprovedStep.llm_output) && latestUnapprovedStep.llm_output.length > 0;
    return !isOptionList;
  }, [latestUnapprovedStep]);

  const handleApprove = () => {
    if (latestUnapprovedStep) {
      approveStep(latestUnapprovedStep);
    }
  };

  const handleRegenerate = async () => {
    if (latestUnapprovedStep) {
      setIsRegenerating(true);
      await regenerateStep(latestUnapprovedStep);
      setIsRegenerating(false);
    }
  };

  const handlePauseToggle = async () => {
    setIsPausing(true);
    if (project.status === 'in_progress') {
      await pauseProject(project.id);
    } else if (project.status === 'paused') {
      await resumeProject(project.id);
    }
    setIsPausing(false);
  };

  const canPauseOrResume = project.status === 'in_progress' || project.status === 'paused';

  const ActionButton: React.FC<{ onClick: () => void; disabled: boolean; tooltip: string; children: React.ReactNode; showTooltip: boolean }> = ({ onClick, disabled, tooltip, children, showTooltip }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-block">
          <button onClick={onClick} disabled={disabled} className="px-3 py-1.5 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
            {children}
          </button>
        </div>
      </TooltipTrigger>
      {showTooltip && <TooltipContent><p>{tooltip}</p></TooltipContent>}
    </Tooltip>
  );

  return (
    <>
      <div className="p-4 bg-[#0a0a0f] border-t border-white/10">
        <div className="relative mb-4">
          <textarea
            className="w-full bg-transparent border border-white/20 rounded-2xl p-4 pr-14 text-white placeholder-gray-500 resize-none focus:ring-2 focus:ring-cyan-400 focus:outline-none glass-effect disabled:opacity-50"
            placeholder={isDisabled ? "Chat is disabled for this project." : "Digite sua resposta ou comando..."}
            rows={1}
            disabled
          ></textarea>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-cyan-500 text-black hover:bg-cyan-400 transition-all disabled:bg-gray-600" disabled>
            <Send size={20} />
          </button>
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <ActionButton onClick={handleApprove} disabled={!isApprovable || isDisabled || !hasCredits} tooltip="You have no credits remaining." showTooltip={!hasCredits}>
            👍 Aprovar
          </ActionButton>
          <ActionButton onClick={handleRegenerate} disabled={!latestUnapprovedStep || isDisabled || isRegenerating || !hasCredits} tooltip="You have no credits remaining." showTooltip={!hasCredits}>
            {isRegenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Regenerar
          </ActionButton>
          <ActionButton onClick={handlePauseToggle} disabled={!canPauseOrResume || isPausing || (project.status === 'paused' && !hasCredits)} tooltip="You need credits to resume." showTooltip={project.status === 'paused' && !hasCredits}>
            {isPausing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
              project.status === 'paused' ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
            {project.status === 'paused' ? 'Retomar' : 'Pausar'}
          </ActionButton>
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="px-3 py-1.5 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all flex items-center"
          >
            <BookText className="mr-2 h-4 w-4" />
            Ver Histórico
          </button>
        </div>
      </div>
      <ProjectHistorySheet 
        project={project}
        messages={messages}
        isOpen={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
      />
    </>
  );
};

export default ChatInput;