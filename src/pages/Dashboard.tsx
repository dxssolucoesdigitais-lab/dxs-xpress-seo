import React, { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import ProjectCard from '@/components/project/ProjectCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Project } from '@/types/database.types';
import EmptyDashboard from '@/components/project/EmptyDashboard';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t } = useTranslation();
  const { projects, loading, deleteProject } = useProjects();
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.project_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      );
    }

    if (projects.length === 0) {
      return <EmptyDashboard />;
    }

    if (filteredProjects.length === 0) {
      return (
        <div className="text-center py-16 text-gray-500">
          <h3 className="text-xl font-semibold">No projects found</h3>
          <p className="mt-2">Your search for "{searchTerm}" did not match any projects.</p>
          <Button variant="link" onClick={() => setSearchTerm('')} className="text-cyan-400 mt-2">Clear search</Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onDeleteRequest={setProjectToDelete}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="min-h-full bg-[#0a0a0f] text-white p-4 sm:p-6 lg:p-8 container max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold self-start sm:self-center">{t('dashboardTitle')}</h1>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={t('searchProjects')}
                className="w-full bg-transparent border-white/20 pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link to="/">
              <Button className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex-shrink-0">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('newProject')}
              </Button>
            </Link>
          </div>
        </header>

        {renderContent()}
      </div>

      <AlertDialog open={!!projectToDelete} onOpenChange={(isOpen) => !isOpen && setProjectToDelete(null)}>
        <AlertDialogContent className="bg-[#1a1a1f] border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete the "{projectToDelete?.project_name}" project and all of its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/20 hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white">
              Yes, delete project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Dashboard;