import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '@/types/database.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from 'react-i18next';

interface ProjectCardProps {
  project: Project;
  onDeleteRequest: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDeleteRequest }) => {
  const { t } = useTranslation();
  const totalSteps = 9;
  const progressPercentage = (project.current_step / totalSteps) * 100;

  const handleDelete = (e: Event) => {
    e.stopPropagation();
    e.preventDefault();
    onDeleteRequest(project);
  };

  return (
    <div className="relative group h-full">
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-50 group-hover:opacity-100">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background border-border">
            <DropdownMenuItem onSelect={handleDelete} className="text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>{t('projectCard.delete')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Link to={`/project/${project.id}`} className="h-full block">
        <Card className="glass-effect border-white/10 text-white hover:border-cyan-400 transition-all h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex justify-between items-start">
              <span className="pr-8">{project.project_name}</span>
              <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-1 flex-shrink-0" />
            </CardTitle>
            <CardDescription className="text-gray-400 truncate">{project.product_link}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-between">
            <div className="text-sm text-gray-300 space-y-2">
              <p>{t('projectCard.status')}: <span className="font-semibold text-cyan-300">{project.status}</span></p>
              <p>{t('projectCard.target')}: {project.target_country}</p>
              {project.target_audience && (
                <p className="line-clamp-2">{t('projectCard.audience')}: {project.target_audience}</p>
              )}
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-400">{t('projectCard.progress')}</span>
                <span className="text-xs font-medium text-gray-400">{t('projectCard.step')} {project.current_step}/{totalSteps}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-cyan-400 h-2 rounded-full" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};

export default ProjectCard;