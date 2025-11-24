import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import PricingDialog from '../billing/PricingDialog';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import Header from './Header';
import FeedbackDialog from './FeedbackDialog';
import SubscriptionAlert from './SubscriptionAlert';
import { cn } from '@/lib/utils';

const Layout = () => {
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground"> {/* Alterado para bg-background */}
      <Sidebar 
        onFeedbackClick={() => setIsFeedbackDialogOpen(true)} 
        isExpanded={isSidebarExpanded}
        toggleSidebar={toggleSidebar}
      />
      <MobileSidebar 
        isOpen={isMobileMenuOpen} 
        onOpenChange={setIsMobileMenuOpen}
        onFeedbackClick={() => setIsFeedbackDialogOpen(true)}
      />
      
      <div className={cn(
        "flex flex-col flex-1 transition-all duration-300",
        isSidebarExpanded ? "md:pl-64" : "md:pl-20"
      )}>
        <Header 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
          onBuyCreditsClick={() => setIsPricingDialogOpen(true)}
          onToggleSidebar={toggleSidebar}
          isSidebarExpanded={isSidebarExpanded}
        />
        <SubscriptionAlert onRenewClick={() => setIsPricingDialogOpen(true)} />
        <main className="flex-1 flex flex-col"> {/* Adicionado flex flex-col para o layout do chat */}
          <Outlet />
        </main>
      </div>

      <PricingDialog isOpen={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen} />
      <FeedbackDialog isOpen={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen} />
    </div>
  );
};

export default Layout;