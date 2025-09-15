import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects";
import { NewProject } from "@/types/database.types";
import NewProjectForm from "@/components/project/NewProjectForm";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const navigate = useNavigate();
  const { projects, loading, createProject } = useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If projects are loaded and exist, redirect to the dashboard.
    if (!loading && projects.length > 0) {
      navigate('/dashboard');
    }
  }, [loading, projects, navigate]);

  const handleCreateProject = async (projectData: Omit<NewProject, 'user_id'>) => {
    setIsSubmitting(true);
    const newProject = await createProject(projectData);
    if (newProject) {
      navigate(`/project/${newProject.id}`);
    }
    setIsSubmitting(false);
  };

  if (loading || (!loading && projects.length > 0)) {
    // Show a loading skeleton while checking for projects or redirecting.
    return (
      <div className="flex items-center justify-center h-full pt-10">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  // If not loading and no projects exist, show the form to create one.
  return <NewProjectForm onSubmit={handleCreateProject} isSubmitting={isSubmitting} />;
};

export default Index;