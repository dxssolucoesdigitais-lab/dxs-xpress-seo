import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/contexts/SessionContext";
import { useProjects } from "@/hooks/useProjects";
import { NewProject } from "@/types/database.types";
import NewProjectForm from "@/components/project/NewProjectForm";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { session } = useSession();
  const navigate = useNavigate();
  const { projects, loading, createProject } = useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate('/login');
    } else if (!loading && projects.length > 0) {
      navigate('/dashboard');
    }
  }, [session, navigate, loading, projects]);

  const handleCreateProject = async (projectData: Omit<NewProject, 'user_id'>) => {
    setIsSubmitting(true);
    const newProject = await createProject(projectData);
    if (newProject) {
      navigate(`/project/${newProject.id}`);
    }
    setIsSubmitting(false);
  };

  if (!session || (!loading && projects.length > 0)) {
    // Render nothing while redirecting
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0f]">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  // If session exists, not loading, and no projects, show the form
  return <NewProjectForm onSubmit={handleCreateProject} isSubmitting={isSubmitting} />;
};

export default Index;