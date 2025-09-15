import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '@/types/database.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectCardProps {
  project: Project;
  onDeleteRequest: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDeleteRequest }) => {
  const totalSteps = 9;
  const progressPercentage = (project.current_step / totalSteps) * 100;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDeleteRequest(project);
  };

  return (
    <div className="relative group h-full">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleDeleteClick}
        aria-label="Delete project"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
      <Link to={`/project/${project.id}`} className="h-full block">
        <Card className="glass-effect border-white/10 text-white hover:border-cyan-400 transition-all h-full">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              {project.project_name}
              <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-1" />
            </CardTitle>
            <CardDescription className="text-gray-400 truncate">{project.product_link}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-300">
              <p>Status: <span className="font-semibold text-cyan-300">{project.status}</span></p>
              <p>Target: {project.target_country}</p>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-400">Progress</span>
                  <span className="text-xs font-medium text-gray-400">Step {project.current_step}/{totalSteps}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-cyan-400 h-2 rounded-full" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};

export default ProjectCard;