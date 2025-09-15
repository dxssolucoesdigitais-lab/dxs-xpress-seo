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
      showError('Failed to fetch projects.');
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
      showError('You must be logged in to create a project.');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ ...newProjectData, user_id: session.user.id }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        showSuccess('Project created successfully!');
        
        const { error: functionError } = await supabase.functions.invoke('trigger-step', {
          body: { projectId: data.id },
        });

        if (functionError) {
          console.error('Failed to trigger initial workflow step:', functionError.message);
          showError('Could not start AI workflow automatically.');
        }

        return data;
      }
      return null;
    } catch (error: any) {
      showError('Failed to create project.');
      console.error('Error creating project:', error.message);
      return null;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      showSuccess('Project deleted successfully.');
    } catch (error: any) {
      showError('Failed to delete project.');
      console.error('Error deleting project:', error.message);
    }
  };

  return { projects, loading, createProject, deleteProject, refetchProjects: fetchProjects };
};