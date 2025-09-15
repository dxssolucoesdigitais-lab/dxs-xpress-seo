import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/contexts/SessionContext";
import { useProjects } from "@/hooks/useProjects";
import { Project } from "@/types/database.types";
import NewProjectForm from "@/components/project/NewProjectForm";
import ChatInterface from "@/components/chat/ChatInterface";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { session } = useSession();
  const navigate = useNavigate();
  const { projects, loading, createProject } = useProjects();
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate('/login');
    }
  }, [session, navigate]);

  useEffect(() => {
    if (!loading && projects.length > 0 && !activeProject) {
      // For now, automatically select the most recent project
      setActiveProject(projects[0]);
    }
  }, [projects, loading, activeProject]);

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'current_step' | 'status' | 'extracted_data'>) => {
    setIsSubmitting(true);
    const newProject = await createProject(projectData);
    if (newProject) {
      setActiveProject(newProject);
    }
    setIsSubmitting(false);
  };

  if (!session) {
    return null; // Redirecting
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

  if (activeProject) {
    return <ChatInterface project={activeProject} />;
  }

  return <NewProjectForm onSubmit={handleCreateProject} isSubmitting={isSubmitting} />;
};

export default Index;