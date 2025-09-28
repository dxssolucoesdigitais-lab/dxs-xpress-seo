import React, { useState } from 'react';
import { Send, Loader2, Play, Pause, BookText, Paperclip } from 'lucide-react';
import { useProjectActions } from '@/hooks/useProjectActions';
import { ChatMessage } from '@/types/chat.types';
import { Project } from '@/types/database.types';
import ProjectHistorySheet from './ProjectHistorySheet';
import { useSession } from '@/contexts/SessionContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { showError } from '@/utils/toast';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  project: Project;
  messages: ChatMessage[];
  isDisabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ project, messages, isDisabled = false }) => {
  const { t } = useTranslation();
  const { user } = useSession();
  const { pauseProject, resumeProject } = useProjectActions();
  const [isPausing, setIsPausing] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const hasCredits = user && user.credits_remaining > 0;
  
  const userPlan = user?.plan_type || 'free';
  const isFreeTrial = userPlan === 'free';
  const canUploadFile = userPlan === 'premium' || isFreeTrial;
  const canAnalyzeLink = true; // Liberado para todos

  const handlePauseToggle = async () => {
    setIsPausing(true);
    if (project.status === 'in_progress') {
      await pauseProject(project.id);
    } else if (project.status === 'paused') {
      await resumeProject(project.id);
    }
    setIsPausing(false);
  };

  const handleAnalyzeClick = (type: 'upload' | 'link') => {
    if (type === 'upload') {
      if (!canUploadFile) {
        showError('toasts.plans.premiumFeatureRequired');
        return;
      }
      alert(t('chatInput.uploadFile') + ' - Funcionalidade em breve!');
    } else if (type === 'link') {
      if (!canAnalyzeLink) return;
      alert(t('chatInput.analyzeLink') + ' - Funcionalidade em breve!');
    }
  };

  const canPauseOrResume = project.status === 'in_progress' || project.status === 'paused';

  return (
    <>
      <div className="p-4 bg-background border-t border-border">
        <div className="relative mb-4">
          <textarea
            className="w-full bg-transparent border border-border rounded-2xl p-4 pr-14 text-foreground placeholder:text-muted-foreground resize-none focus:ring-2 focus:ring-cyan-400 focus:outline-none glass-effect disabled:opacity-50"
            placeholder={isDisabled ? t('chatInput.disabledPlaceholder') : t('chatInput.placeholder')}
            rows={1}
            disabled
          ></textarea>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-cyan-500 text-black hover:bg-cyan-400 transition-all disabled:bg-gray-600 duration-300 hover:shadow-[0_0_15px_rgba(56,189,248,0.6)] hover:-translate-y-px" disabled>
            <Send size={20} />
          </button>
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button disabled={isDisabled || !hasCredits} size="sm" className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold">
                    <Paperclip className="mr-2 h-4 w-4" />
                    {t('chatInput.analyze')}
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              {!hasCredits && <TooltipContent><p>{t('chatInput.noCreditsTooltip')}</p></TooltipContent>}
            </Tooltip>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => handleAnalyzeClick('upload')} className="cursor-pointer">
                {t('chatInput.uploadFile')}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleAnalyzeClick('link')} className="cursor-pointer">
                {t('chatInput.analyzeLink')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handlePauseToggle} disabled={!canPauseOrResume || isPausing || (project.status === 'paused' && !hasCredits)} size="sm" className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold">
                {isPausing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                  project.status === 'paused' ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
                {project.status === 'paused' ? t('chatInput.resume') : t('chatInput.pause')}
              </Button>
            </TooltipTrigger>
            {project.status === 'paused' && !hasCredits && <TooltipContent><p>{t('chatInput.noCreditsToResumeTooltip')}</p></TooltipContent>}
          </Tooltip>

          <Button 
            onClick={() => setIsHistoryOpen(true)}
            size="sm" className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
          >
            <BookText className="mr-2 h-4 w-4" />
            {t('chatInput.viewHistory')}
          </Button>
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