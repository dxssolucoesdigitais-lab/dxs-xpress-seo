import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/chat');
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-full pt-10 text-center">
      <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
      <p className="mt-4 text-lg">Loading your workspace...</p>
    </div>
  );
};

export default Index;