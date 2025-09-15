import { Outlet, Link } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard } from 'lucide-react';

const Layout = () => {
  const { session } = useSession();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f] text-white">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between max-w-7xl mx-auto px-4">
          <Link to="/dashboard" className="text-xl font-bold">
            XpressSEO
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" aria-label="Go to dashboard">
              <Button variant="ghost" size="icon">
                <LayoutDashboard className="h-5 w-5" />
              </Button>
            </Link>
            <span className="text-sm text-gray-400 hidden sm:inline">{session?.user?.email}</span>
            <Button variant="outline" className="bg-transparent border-white/20 hover:bg-white/10" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;