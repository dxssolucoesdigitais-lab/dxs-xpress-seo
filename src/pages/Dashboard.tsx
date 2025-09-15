import React from 'react';
import { useProjects } from '@/hooks/useProjects';
import ProjectCard from '@/components/project/ProjectCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { projects, loading } = useProjects();
  const { session } = useSession();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Projects</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 hidden sm:inline">{session?.user?.email}</span>
          <Button variant="outline" className="bg-transparent border-white/20 hover:bg-white/10" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
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