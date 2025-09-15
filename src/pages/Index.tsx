import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import MessageList from "@/components/chat/MessageList";

const Index = () => {
  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f] text-gray-200 font-sans">
      <ChatHeader />
      <MessageList />
      <ChatInput />
    </div>
  );
};

export default Index;