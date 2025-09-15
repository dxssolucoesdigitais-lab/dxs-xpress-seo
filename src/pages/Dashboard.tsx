import React from 'react';
import { useProjects } from '@/hooks/useProjects';
import ProjectCard from '@/components/project/ProjectCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { projects, loading } = useProjects();

  return (
    <div className="min-h-full bg-[#0a0a0f] text-white p-4 sm:p-6 lg:p-8 container max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Projects</h1>
        <Link to="/">
          <Button className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
          <Link to="/">
            <div className="flex items-center justify-center h-full min-h-[224px] border-2 border-dashed border-white/20 rounded-lg text-gray-400 hover:border-cyan-400 hover:text-cyan-400 transition-all cursor-pointer">
              <div className="text-center">
                <PlusCircle className="mx-auto h-12 w-12" />
                <h3 className="mt-2 text-sm font-semibold">Create New Project</h3>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;