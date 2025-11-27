import React, { useState } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent } from '@/components/ui/sheet';
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
import RenameProjectDialog from '../projects/RenameProjectDialog'; // Importar o novo componente

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
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useSession();
  const { projects, loading, deleteProject } = useProjects();
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [projectToRename, setProjectToRename] = useState<Project | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);

  const availableNav = mainNavigation.filter(item => !item.admin || (item.admin && user?.role === 'admin'));

  const handleFeedbackClick = () => {
    onFeedbackClick();
    onOpenChange(false);
  };

  const handleNewConversationClick = () => {
    navigate('/chat');
    onOpenChange(false);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  const handleRenameClick = (project: Project) => {
    setProjectToRename(project);
    setIsRenameDialogOpen(true);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-64 bg-sidebar border-r border-sidebar-border p-0 flex flex-col"> {/* Usando cores da sidebar */}
          <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
            <Link to="/chat" onClick={() => onOpenChange(false)} className="text-xl font-bold text-sidebar-foreground">
              XpressSEO
            </Link>
          </div>
          <div className="p-4">
            <Button variant="outline" className="w-full justify-start bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-sidebar-border" onClick={handleNewConversationClick}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('newProject')}
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
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <Link to={`/chat/${project.id}`} onClick={() => onOpenChange(false)} className="flex items-center flex-1 min-w-0">
                      <MessageSquare className="mr-3 h-5 w-5 flex-shrink-0" />
                      <span className="truncate">{project.project_name || 'Nova Conversa'}</span>
                    </Link>
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
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleRenameClick(project); }}>
                          {t('renameDialog.rename')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setProjectToDelete(project); }} className="text-red-500 focus:bg-red-500/10 focus:text-red-500">
                          {t('deleteDialog.confirm')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                onClick={() => onOpenChange(false)}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  location.pathname.startsWith(item.href)
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground px-3"
              onClick={handleFeedbackClick}
            >
              <MessageCircleQuestion className="mr-3 h-5 w-5" />
              {t('feedbackDialog.button')}
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
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
      <RenameProjectDialog
        project={projectToRename}
        isOpen={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
      />
    </>
  );
};

export default MobileSidebar;