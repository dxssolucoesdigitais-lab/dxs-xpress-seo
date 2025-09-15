import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, User, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from '@/contexts/SessionContext';

const navigation = [
  { name: 'Assistant', href: '/chat', icon: MessageSquare, admin: false },
  { name: 'Profile', href: '/profile', icon: User, admin: false },
  { name: 'Admin Panel', href: '/admin', icon: Shield, admin: true },
];

const Sidebar = () => {
  const location = useLocation();
  const { user } = useSession();

  const availableNav = navigation.filter(item => !item.admin || (item.admin && user?.role === 'admin'));

  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-background border-r border-border z-50">
      <div className="flex items-center h-16 px-6 border-b border-border">
        <Link to="/chat" className="text-xl font-bold">
          XpressSEO
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {availableNav.map((item) => (
          <Link
            key={item.name}
            to={item.href}
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
    </aside>
  );
};

export default Sidebar;