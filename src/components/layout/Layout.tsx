import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import PricingDialog from '../billing/PricingDialog';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import Header from './Header';
import AnnouncementBanner from './AnnouncementBanner';
import FeedbackDialog from './FeedbackDialog';
import SubscriptionAlert from './SubscriptionAlert';

const Layout = () => {
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-transparent text-foreground">
      <Sidebar onFeedbackClick={() => setIsFeedbackDialogOpen(true)} />
      <MobileSidebar 
        isOpen={isMobileMenuOpen} 
        onOpenChange={setIsMobileMenuOpen}
        onFeedbackClick={() => setIsFeedbackDialogOpen(true)}
      />
      
      <div className="flex flex-col flex-1 md:pl-64">
        <AnnouncementBanner />
        <Header 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
          onBuyCreditsClick={() => setIsPricingDialogOpen(true)}
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