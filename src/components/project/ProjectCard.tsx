import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '@/types/database.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const totalSteps = 9;
  const progressPercentage = (project.current_step / totalSteps) * 100;

  return (
    <Link to={`/project/${project.id}`}>
      <Card className="glass-effect border-white/10 text-white hover:border-cyan-400 transition-all group">
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
  );
};

export default ProjectCard;