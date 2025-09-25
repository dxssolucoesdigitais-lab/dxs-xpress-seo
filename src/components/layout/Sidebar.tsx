import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { MessageSquare, User, Shield, PlusCircle, MessageCircleQuestion, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from '@/contexts/SessionContext';
import { useProjects } from '@/hooks/useProjects';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';
import { Project } from '@/types/database.types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const mainNavigation = [
  { name: 'Profile', href: '/profile', icon: User, admin: false },
  { name: 'Admin Panel', href: '/admin', icon: Shield, admin: true },
];

interface SidebarProps {
  onFeedbackClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onFeedbackClick }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useSession();
  const { projects, loading, deleteProject } = useProjects();
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const availableNav = mainNavigation.filter(item => !item.admin || (item.admin && user?.role === 'admin'));

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  return (
    <>
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-background border-r border-border z-50">
        <div className="flex items-center h-16 px-4 border-b border-border">
          <Link to="/chat" className="text-xl font-bold">
            XpressSEO
          </Link>
        </div>
        <div className="flex flex-col flex-1 overflow-y-hidden">
          <div className="p-4">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/chat">
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
                  <div
                    key={project.id}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md',
                      projectId === project.id
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Link to={`/chat/${project.id}`} className="flex items-center flex-1 min-w-0">
                      <MessageSquare className="mr-3 h-5 w-5 flex-shrink-0" />
                      <span className="truncate">{project.project_name || 'Nova Conversa'}</span>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); alert('Função de renomear em breve!'); }}>
                          Renomear
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setProjectToDelete(project); }} className="text-red-500 focus:bg-red-500/10 focus:text-red-500">
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              )}
            </nav>
          </ScrollArea>
          <nav className="px-4 py-4 border-t border-border mt-auto space-y-1">
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
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground px-3"
              onClick={onFeedbackClick}
            >
              <MessageCircleQuestion className="mr-3 h-5 w-5" />
              {t('feedbackDialog.button')}
            </Button>
          </nav>
        </div>
      </aside>
      <AlertDialog open={!!projectToDelete} onOpenChange={(isOpen) => !isOpen && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteDialog.description', { projectName: projectToDelete?.project_name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>{t('deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>{t('deleteDialog.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Sidebar;