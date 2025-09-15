import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { LlmOption } from '@/types/chat.types';
import { StepResult } from '@/types/database.types';

const triggerNextStep = async (projectId: string) => {
  try {
    const { error } = await supabase.functions.invoke('trigger-step', {
      body: { projectId },
    });
    if (error) throw error;
    console.log('Successfully triggered next step for project:', projectId);
  } catch (error: any) {
    showError('Failed to trigger the next step.');
    console.error('Error invoking trigger-step function:', error.message);
  }
};

export const useChatActions = () => {
  const updateStepResult = async (stepResult: StepResult, updateData: { user_selection?: LlmOption, approved: boolean }) => {
    try {
      const { error } = await supabase
        .from('step_results')
        .update(updateData)
        .eq('id', stepResult.id);

      if (error) throw error;
      showSuccess('Your response has been saved!');

      // After successfully updating, trigger the next step in the workflow
      await triggerNextStep(stepResult.project_id);

    } catch (error: any) {
      showError('Failed to save your response.');
      console.error('Error updating step result:', error.message);
    }
  };

  const selectOption = async (stepResult: StepResult, selection: LlmOption) => {
    await updateStepResult(stepResult, { user_selection: selection, approved: true });
  };

  const approveStep = async (stepResult: StepResult) => {
    await updateStepResult(stepResult, { approved: true });
  };

  return { selectOption, approveStep };
};