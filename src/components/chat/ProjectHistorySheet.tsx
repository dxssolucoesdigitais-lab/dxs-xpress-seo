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

interface ProjectHistorySheetProps {
  project: Project;
  messages: ChatMessage[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const ProjectHistorySheet: React.FC<ProjectHistorySheetProps> = ({ project, messages, isOpen, onOpenChange }) => {
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
          return `## Step ${item.stepResult?.step_number}: ${item.stepResult?.step_name}\n\n${text}`;
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
      return <p className="text-gray-300 whitespace-pre-wrap">{textContent}</p>;
    }
    if (message.stepResult?.step_name === 'Workflow Progress') {
      return <p className="text-gray-500 text-sm italic">Workflow progress analysis.</p>;
    }
    return <p className="text-gray-500 text-sm italic">Generated content was approved.</p>;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full md:w-[500px] sm:max-w-none bg-[#1a1a1f] border-l border-white/10 text-white flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl flex items-center gap-2">
            <BookText className="w-6 h-6 text-cyan-400" />
            Project History
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            Review of all approved steps for "{project.project_name}".
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4 bg-white/10" />
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {historyItems.length > 0 ? (
              historyItems.map((item) => (
                <div key={item.id}>
                  <h3 className="font-semibold text-cyan-400 mb-2">
                    Step {item.stepResult?.step_number}: {item.stepResult?.step_name}
                  </h3>
                  <div className="p-4 rounded-lg bg-black/20 border border-white/10 text-sm">
                    {renderStepContent(item)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-10">
                <p>No steps have been approved yet.</p>
                <p className="text-sm">Continue the workflow to build the history.</p>
              </div>
            )}
          </div>
        </ScrollArea>
        <SheetFooter className="mt-4 grid grid-cols-2 gap-2">
          <Button 
            variant="secondary" 
            className="w-full bg-white/5 border-white/10 hover:bg-white/10"
            onClick={handleCopyAll}
            disabled={historyItems.length === 0}
          >
            {isCopied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <ClipboardCopy className="mr-2 h-4 w-4" />
            )}
            {isCopied ? 'Copied!' : 'Copy All'}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" className="w-full bg-transparent border-white/20 hover:bg-white/10">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ProjectHistorySheet;