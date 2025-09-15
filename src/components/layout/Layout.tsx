import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import BuyCreditsDialog from '../billing/BuyCreditsDialog';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import Header from './Header';

const Layout = () => {
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      <MobileSidebar isOpen={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen} />
      
      <div className="flex flex-col flex-1 md:pl-64">
        <Header 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
          onBuyCreditsClick={() => setIsBuyCreditsOpen(true)}
        />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <BuyCreditsDialog isOpen={isBuyCreditsOpen} onOpenChange={setIsBuyCreditsOpen} />
    </div>
  );
};

export default Layout;