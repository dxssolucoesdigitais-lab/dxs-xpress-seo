import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { MessageSquare, User, Shield, PlusCircle, MessageCircleQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from '@/contexts/SessionContext';
import { useProjects } from '@/hooks/useProjects';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';

const mainNavigation = [
  { name: 'Profile', href: '/profile', icon: User, admin: false },
  { name: 'Admin Panel', href: '/admin', icon: Shield, admin: true },
];

interface MobileSidebarProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onFeedbackClick: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onOpenChange, onFeedbackClick }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useSession();
  const { projects, loading } = useProjects();

  const availableNav = mainNavigation.filter(item => !item.admin || (item.admin && user?.role === 'admin'));

  const handleFeedbackClick = () => {
    onFeedbackClick();
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 bg-background border-r border-border p-0 flex flex-col">
        <div className="flex items-center h-16 px-4 border-b border-border">
          <Link to="/chat" onClick={() => onOpenChange(false)} className="text-xl font-bold">
            XpressSEO
          </Link>
        </div>
        <div className="p-4">
          <Button asChild variant="outline" className="w-full justify-start">
            <Link to="/chat" onClick={() => onOpenChange(false)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('newProject')}
            </Link>
          </Button>
        </div>
        <ScrollArea className="flex-1 px-4">
          <nav className="flex-1 space-y-1">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/chat/${project.id}`}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors truncate',
                    projectId === project.id
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <MessageSquare className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{project.project_name || 'Nova Conversa'}</span>
                </Link>
              ))
            )}
          </nav>
        </ScrollArea>
        <nav className="px-4 py-4 border-t border-border mt-auto space-y-1">
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
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground px-3"
            onClick={handleFeedbackClick}
          >
            <MessageCircleQuestion className="mr-3 h-5 w-5" />
            {t('feedbackDialog.button')}
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;