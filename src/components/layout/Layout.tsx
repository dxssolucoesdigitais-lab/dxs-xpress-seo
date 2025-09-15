import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import PricingDialog from '../billing/PricingDialog';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import Header from './Header';

const Layout = () => {
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      <MobileSidebar isOpen={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen} />
      
      <div className="flex flex-col flex-1 md:pl-64">
        <Header 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
          onBuyCreditsClick={() => setIsPricingDialogOpen(true)}
        />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <PricingDialog isOpen={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen} />
    </div>
  );