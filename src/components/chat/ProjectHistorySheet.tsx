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
import { BookText } from 'lucide-react';

interface ProjectHistorySheetProps {
  project: Project;
  messages: ChatMessage[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const ProjectHistorySheet: React.FC<ProjectHistorySheetProps> = ({ project, messages, isOpen, onOpenChange }) => {
  const approvedSteps = messages.filter(
    (msg) => msg.stepResult && msg.stepResult.approved
  );

  // Use a Map to store the latest version of each step result to avoid duplicates
  const uniqueApprovedSteps = new Map<string, ChatMessage>();
  approvedSteps.forEach(msg => {
    if (msg.stepResult) {
      uniqueApprovedSteps.set(msg.stepResult.id, msg);
    }
  });

  const historyItems = Array.from(uniqueApprovedSteps.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const renderStepContent = (message: ChatMessage) => {
    if (!message.stepResult) return null;

    const { stepResult } = message;
    
    if (stepResult.user_selection) {
      const selection = stepResult.user_selection as LlmOption;
      return <p className="text-gray-300 whitespace-pre-wrap">{selection.content}</p>;
    }
    
    if (typeof stepResult.llm_output === 'string') {
      return <p className="text-gray-300 whitespace-pre-wrap">{stepResult.llm_output}</p>;
    }
    
    if (stepResult.step_name === 'Workflow Progress') {
        return <p className="text-gray-500 text-sm italic">Análise de progresso do workflow.</p>;
    }
    
    return <p className="text-gray-500 text-sm italic">Conteúdo gerado e aprovado.</p>;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full md:w-[500px] sm:max-w-none bg-[#1a1a1f] border-l border-white/10 text-white flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl flex items-center gap-2">
            <BookText className="w-6 h-6 text-cyan-400" />
            Histórico do Projeto
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            Revisão de todas as etapas aprovadas para "{project.project_name}".
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4 bg-white/10" />
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {historyItems.length > 0 ? (
              historyItems.map((item) => (
                <div key={item.id}>
                  <h3 className="font-semibold text-cyan-400 mb-2">
                    Etapa {item.stepResult?.step_number}: {item.stepResult?.step_name}
                  </h3>
                  <div className="p-4 rounded-lg bg-black/20 border border-white/10 text-sm">
                    {renderStepContent(item)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-10">
                <p>Nenhuma etapa foi aprovada ainda.</p>
                <p className="text-sm">Continue o fluxo de trabalho para construir o histórico.</p>
              </div>
            )}
          </div>
        </ScrollArea>
        <SheetFooter className="mt-4">
          <SheetClose asChild>
            <Button variant="outline" className="w-full bg-transparent border-white/20 hover:bg-white/10">Fechar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ProjectHistorySheet;