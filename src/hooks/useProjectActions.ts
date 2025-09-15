import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import i18n from '@/lib/i18n';

export const useProjectActions = () => {
  const updateProjectStatus = async (projectId: string, status: 'in_progress' | 'paused') => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', projectId);

      if (error) throw error;
      const toastKey = status === 'paused' ? 'toasts.projects.paused' : 'toasts.projects.resumed';
      showSuccess(toastKey);
      return true;
    } catch (error: any) {
      showError('toasts.projects.statusUpdateFailed');
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
      try {
        const { error } = await supabase.functions.invoke('trigger-step', {
          body: { projectId },
        });
        if (error) {
           if (error.context && error.context.response.status === 402) {
            showError("toasts.projects.resumeNoCredits");
          } else {
            throw error;
          }
        }
      } catch (error: any) {
        showError('toasts.projects.resumeWorkflowFailed');
        console.error('Error invoking trigger-step function on resume:', error.message);
      }
    }
  };

  return { pauseProject, resumeProject };
};