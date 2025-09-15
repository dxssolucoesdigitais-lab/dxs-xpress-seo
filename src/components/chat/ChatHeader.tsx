import React from 'react';
import { Project } from '@/types/database.types';

interface ChatHeaderProps {
  project: Project;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ project }) => {
  const totalSteps = 9; // Assuming a 9-step workflow
  const progressPercentage = (project.current_step / totalSteps) * 100;

  return (
    <div className="flex items-center justify-between p-4 border-b border-border glass-effect z-10">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-400 animate-pulse-glow flex items-center justify-center text-xl">
            🎯
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
        </div>
        <span className="text-lg font-bold text-foreground">XpressSEO Assistant</span>
      </div>
      <div className="hidden md:flex items-center gap-3 text-sm">
        <div className="text-muted-foreground">Etapa {project.current_step}/{totalSteps}</div>
        <div className="w-40 h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;