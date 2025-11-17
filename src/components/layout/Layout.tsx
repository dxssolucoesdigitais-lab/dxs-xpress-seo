import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import PricingDialog from '../billing/PricingDialog';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import Header from './Header';
import FeedbackDialog from './FeedbackDialog';
import SubscriptionAlert from './SubscriptionAlert';
import { cn } from '@/lib/utils'; // Importar cn para utilitários de classe

const Layout = () => {
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true); // Novo estado para a barra lateral do desktop

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className="min-h-screen flex bg-transparent text-foreground">
      <Sidebar 
        onFeedbackClick={() => setIsFeedbackDialogOpen(true)} 
        isExpanded={isSidebarExpanded} // Passar o estado para a Sidebar
        toggleSidebar={toggleSidebar} // Passar a função de toggle
      />
      <MobileSidebar 
        isOpen={isMobileMenuOpen} 
        onOpenChange={setIsMobileMenuOpen}
        onFeedbackClick={() => setIsFeedbackDialogOpen(true)}
      />
      
      <div className={cn(
        "flex flex-col flex-1 transition-all duration-300",
        isSidebarExpanded ? "md:pl-64" : "md:pl-20" // Ajustar padding com base na expansão
      )}>
        <Header 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
          onBuyCreditsClick={() => setIsPricingDialogOpen(true)}
          onToggleSidebar={toggleSidebar} // Adicionar toggle para o Header
          isSidebarExpanded={isSidebarExpanded} // Passar estado para o Header
        />
        <SubscriptionAlert onRenewClick={() => setIsPricingDialogOpen(true)} />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <PricingDialog isOpen={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen} />
      <FeedbackDialog isOpen={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen} />
    </div>
  );
};

export default Layout;