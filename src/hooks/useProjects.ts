import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { Project, NewProject } from '@/types/database.types';
import { showError, showSuccess } from '@/utils/toast';

export const useProjects = () => {
  const { session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!session?.user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      showError('toasts.projects.fetchFailed');
      console.error('Error fetching projects:', error.message);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (!session?.user) return;

    const channel = supabase
      .channel('projects-changes')
      .on<Project>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects', filter: `user_id=eq.${session.user.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProjects(currentProjects => [payload.new, ...currentProjects].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
          }
          if (payload.eventType === 'UPDATE') {
            setProjects(currentProjects =>
              currentProjects.map(p => (p.id === payload.new.id ? payload.new : p))
            );
          }
          if (payload.eventType === 'DELETE') {
             setProjects(currentProjects => currentProjects.filter(p => p.id !== (payload.old as Project).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const createProject = async (newProjectData: Omit<NewProject, 'user_id'>): Promise<Project | null> => {
    if (!session?.user) {
      showError('toasts.plans.loginRequired');
      return null;
    }

    try {
      // Chama a Edge Function start-workflow-from-chat para criar o projeto e deduzir o crédito.
      const { data: newProject, error } = await supabase.functions.invoke<Project>('start-workflow-from-chat', {
        body: { 
          projectName: newProjectData.project_name, // Passa o nome do projeto diretamente
          productLink: newProjectData.product_link // Mantém o productLink para compatibilidade ou uso futuro
        },
      });

      if (error) {
        if (error.context && error.context.response.status === 402) {
          showError("toasts.projects.noCreditsToStart");
        } else {
          console.error('Failed to create project via start-workflow-from-chat:', error.message);
          showError('toasts.projects.createFailed');
        }
        return null;
      }

      if (newProject) {
        showSuccess('toasts.projects.createSuccess');
        return newProject;
      }
      return null;
    } catch (error: any) {
      showError('toasts.projects.createFailed');
      console.error('Error creating project:', error.message);
      return null;
    }
  };

  const updateProjectName = async (projectId: string, newName: string) => {
    if (!session?.user) {
      showError('toasts.plans.loginRequired');
      return false;
    }
    try {
      const { error } = await supabase
        .from('projects')
        .update({ project_name: newName, updated_at: new Date().toISOString() })
        .eq('id', projectId)
        .eq('user_id', session.user.id); // Garante que o usuário só pode atualizar seus próprios projetos

      if (error) throw error;
      showSuccess('toasts.projects.renameSuccess');
      // A atualização do estado 'projects' será tratada pelo Realtime
      return true;
    } catch (error: any) {
      showError('toasts.projects.renameFailed');
      console.error('Error renaming project:', error.message);
      return false;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      showSuccess('toasts.projects.deleteSuccess');
    } catch (error: any) {
      showError('toasts.projects.deleteFailed');
      console.error('Error deleting project:', error.message);
    }
  };

  return { projects, loading, createProject, updateProjectName, deleteProject, refetchProjects: fetchProjects };
};