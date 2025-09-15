import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { projects, loading } = useProjects();

  useEffect(() => {
    if (!loading) {
      if (projects.length > 0) {
        navigate('/dashboard');
      } else {
        navigate('/new-project');
      }
    }
  }, [loading, projects, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-full pt-10 text-center">
      <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
      <p className="mt-4 text-lg">Loading your workspace...</p>
    </div>
  );
};

export default Index;