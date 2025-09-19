import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Project } from '@/types/database.types';
import { ChatMessage, LlmOption } from '@/types/chat.types';
import { BookText, ClipboardCopy, Check } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { useTranslation } from 'react-i18next';

interface ProjectHistorySheetProps {
  project: Project;
  messages: ChatMessage[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const ProjectHistorySheet: React.FC<ProjectHistorySheetProps> = ({ project, messages, isOpen, onOpenChange }) => {
  const { t } = useTranslation();
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const approvedSteps = messages.filter(
    (msg) => msg.stepResult && msg.stepResult.approved
  );

  const uniqueApprovedSteps = new Map<string, ChatMessage>();
  approvedSteps.forEach(msg => {
    if (msg.stepResult) {
      uniqueApprovedSteps.set(msg.stepResult.id, msg);
    }
  });

  const historyItems = Array.from(uniqueApprovedSteps.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const getStepTextContent = (message: ChatMessage): string | null => {
    if (!message.stepResult) return null;
    const { stepResult } = message;
    if (stepResult.user_selection) {
      return (stepResult.user_selection as LlmOption).content;
    }
    if (typeof stepResult.llm_output === 'string') {
      return stepResult.llm_output;
    }
    return null;
  };

  const handleCopyAll = () => {
    const allContent = historyItems
      .map(item => {
        const text = getStepTextContent(item);
        if (text) {
          return `## ${t('historySheet.stepLabel')} ${item.stepResult?.step_number}: ${item.stepResult?.step_name}\n\n${text}`;
        }
        return null;
      })
      .filter(Boolean)
      .join('\n\n---\n\n');
    
    if (allContent) {
      copyToClipboard(allContent);
    }
  };

  const renderStepContent = (message: ChatMessage) => {
    const textContent = getStepTextContent(message);
    if (textContent) {
      return <p className="text-muted-foreground whitespace-pre-wrap">{textContent}</p>;
    }
    if (message.stepResult?.step_name === 'Workflow Progress') {
      return <p className="text-muted-foreground text-sm italic">{t('historySheet.workflowProgressContent')}</p>;
    }
    return <p className="text-muted-foreground text-sm italic">{t('historySheet.genericApprovedContent')}</p>;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full md:w-[500px] sm:max-w-none bg-popover border-l border-border text-popover-foreground flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl flex items-center gap-2">
            <BookText className="w-6 h-6 text-cyan-400" />
            {t('historySheet.title')}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {t('historySheet.description', { projectName: project.project_name })}
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4 bg-border" />
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {historyItems.length > 0 ? (
              historyItems.map((item) => (
                <div key={item.id}>
                  <h3 className="font-semibold text-cyan-400 mb-2">
                    {t('historySheet.stepLabel')} {item.stepResult?.step_number}: {item.stepResult?.step_name}
                  </h3>
                  <div className="p-4 rounded-lg bg-secondary border border-border text-sm">
                    {renderStepContent(item)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-10">
                <p>{t('historySheet.noStepsTitle')}</p>
                <p className="text-sm">{t('historySheet.noStepsDescription')}</p>
              </div>
            )}
          </div>
        </ScrollArea>
        <SheetFooter className="mt-4 grid grid-cols-2 gap-2">
          <Button 
            variant="secondary" 
            className="w-full bg-secondary border-border hover:bg-accent"
            onClick={handleCopyAll}
            disabled={historyItems.length === 0}
          >
            {isCopied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <ClipboardCopy className="mr-2 h-4 w-4" />
            )}
            {isCopied ? t('historySheet.copied') : t('historySheet.copyAll')}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" className="w-full bg-transparent border-border hover:bg-accent">{t('historySheet.close')}</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ProjectHistorySheet;