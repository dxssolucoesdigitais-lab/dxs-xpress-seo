import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { projects, loading, createProject } = useProjects();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // If projects are already loaded and exist, redirect to the dashboard.
    if (!loading && projects.length > 0) {
      navigate('/dashboard');
    }
    // If not loading and no projects exist, start creating one.
    else if (!loading && projects.length === 0 && !isCreating) {
      setIsCreating(true);
      handleCreateProject();
    }
  }, [loading, projects, navigate, isCreating]);

  const handleCreateProject = async () => {
    const newProject = await createProject({
      project_name: `Novo Projeto ${new Date().toLocaleString()}`,
      product_link: "Não definido",
      target_country: "Não definido",
      target_audience: "Não definido",
    });
    if (newProject) {
      navigate(`/project/${newProject.id}`);
    } else {
      // If creation fails, send user to dashboard to try again.
      navigate('/dashboard');
    }
  };

  // Show a loading spinner while creating the initial project.
  return (
    <div className="flex flex-col items-center justify-center h-full pt-10 text-center">
      <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
      <p className="mt-4 text-lg">Preparando seu novo projeto...</p>
      <p className="text-sm text-gray-400">Você será redirecionado em breve.</p>
    </div>
  );
};

export default Index;