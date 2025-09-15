import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

export const useProjectActions = () => {
  const updateProjectStatus = async (projectId: string, status: 'in_progress' | 'paused') => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', projectId);

      if (error) throw error;
      showSuccess(`Project has been ${status === 'paused' ? 'paused' : 'resumed'}.`);
      return true;
    } catch (error: any) {
      showError('Failed to update project status.');
      console.error('Error updating project status:', error.message);
      return false;
    }
  };

  const pauseProject = async (projectId: string) => {
    return await updateProjectStatus(projectId, 'paused');
  };

  const resumeProject = async (projectId: string) => {
    const success = await updateProjectStatus(projectId, 'in_progress');
    if (success) {
      // After resuming, trigger the next step to continue the workflow
      try {
        const { error } = await supabase.functions.invoke('trigger-step', {
          body: { projectId },
        });
        if (error) {
           if (error.context && error.context.response.status === 402) {
            showError("Project resumed, but you have no credits to continue the AI workflow.");
          } else {
            throw error;
          }
        }
      } catch (error: any) {
        showError('Failed to restart the workflow.');
        console.error('Error invoking trigger-step function on resume:', error.message);
      }
    }
  };

  return { pauseProject, resumeProject };
};