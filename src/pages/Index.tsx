import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import MessageList from "@/components/chat/MessageList";
import { useSession } from "@/contexts/SessionContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate('/login');
    }
  }, [session, navigate]);

  if (!session) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f] text-gray-200 font-sans">
      <ChatHeader />
      <MessageList />
      <ChatInput />
    </div>
  );
};

export default Index;