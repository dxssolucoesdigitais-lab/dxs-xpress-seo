import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { MessageSquare, User, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from '@/contexts/SessionContext';

const navigation = [
  { name: 'Assistant', href: '/chat', icon: MessageSquare, admin: false },
  { name: 'Profile', href: '/profile', icon: User, admin: false },
  { name: 'Admin Panel', href: '/admin', icon: Shield, admin: true },
];

interface MobileSidebarProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onOpenChange }) => {
  const location = useLocation();
  const { user } = useSession();

  const availableNav = navigation.filter(item => !item.admin || (item.admin && user?.role === 'admin'));

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 bg-background border-r border-border p-0">
        <div className="flex items-center h-16 px-6 border-b border-border">
          <Link to="/chat" className="text-xl font-bold">
            XpressSEO
          </Link>
        </div>
        <nav className="px-4 py-6 space-y-2">
          {availableNav.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => onOpenChange(false)}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                location.pathname.startsWith(item.href)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;