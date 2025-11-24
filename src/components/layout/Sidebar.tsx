import React, { useState } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, User, Shield, PlusCircle, MessageCircleQuestion, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
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
  isExpanded: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onFeedbackClick, isExpanded, toggleSidebar }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
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
      <aside className={cn(
        "hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-sidebar border-r border-sidebar-border z-50 transition-all duration-300", // Usando cores da sidebar
        isExpanded ? "w-64" : "w-20"
      )}>
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border relative">
          {isExpanded ? (
            <Link to="/chat" className="text-xl font-bold text-sidebar-foreground">
              XpressSEO
            </Link>
          ) : (
            <Link to="/chat" className="flex items-center justify-center w-full">
              <img src="/logo.svg" alt="XpressSEO Logo" className="h-8 w-8" />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="absolute -right-4 top-1/2 -translate-y-1/2 bg-sidebar border border-sidebar-border rounded-full shadow-md hover:bg-sidebar-accent hidden md:flex"
          >
            {isExpanded ? <ChevronLeft className="h-4 w-4 text-sidebar-foreground" /> : <ChevronRight className="h-4 w-4 text-sidebar-foreground" />}
          </Button>
        </div>
        <div className="flex flex-col flex-1 overflow-y-hidden">
          <div className="p-4">
            <Button variant="outline" className="w-full justify-start bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-sidebar-border" onClick={() => navigate('/chat')}>
              <PlusCircle className={cn("h-4 w-4", isExpanded ? "mr-2" : "")} />
              {isExpanded && t('newProject')}
            </Button>
          </div>
          <ScrollArea className="flex-1 px-4">
            <nav className="flex-1 space-y-1">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className={cn("h-8", isExpanded ? "w-full" : "w-12 mx-auto")} />
                  <Skeleton className={cn("h-8", isExpanded ? "w-full" : "w-12 mx-auto")} />
                  <Skeleton className={cn("h-8", isExpanded ? "w-full" : "w-12 mx-auto")} />
                </div>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md',
                      projectId === project.id
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      !isExpanded && "justify-center"
                    )}
                  >
                    <Link to={`/chat/${project.id}`} className={cn("flex items-center flex-1 min-w-0", !isExpanded && "justify-center")}>
                      <MessageSquare className={cn("h-5 w-5 flex-shrink-0", isExpanded ? "mr-3" : "")} />
                      {isExpanded && <span className="truncate">{project.project_name || 'Nova Conversa'}</span>}
                    </Link>
                    {isExpanded && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0 text-sidebar-foreground hover:bg-sidebar-accent"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
                          <DropdownMenuItem onSelect={(e) => { e.preventDefault(); alert('Função de renomear em breve!'); }}>
                            Renomear
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setProjectToDelete(project); }} className="text-red-500 focus:bg-red-500/10 focus:text-red-500">
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))
              )}
            </nav>
          </ScrollArea>
          <nav className="px-4 py-4 border-t border-sidebar-border mt-auto space-y-1">
            {availableNav.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  location.pathname.startsWith(item.href)
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  !isExpanded && "justify-center"
                )}
              >
                <item.icon className={cn("h-5 w-5", isExpanded ? "mr-3" : "")} />
                {isExpanded && item.name}
              </Link>
            ))}
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground px-3",
                !isExpanded && "justify-center"
              )}
              onClick={onFeedbackClick}
            >
              <MessageCircleQuestion className={cn("h-5 w-5", isExpanded ? "mr-3" : "")} />
              {isExpanded && t('feedbackDialog.button')}
            </Button>
          </nav>
        </div>
      </aside>
      <AlertDialog open={!!projectToDelete} onOpenChange={(isOpen) => !isOpen && setProjectToDelete(null)}>
        <AlertDialogContent className="bg-popover border-border text-popover-foreground">
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