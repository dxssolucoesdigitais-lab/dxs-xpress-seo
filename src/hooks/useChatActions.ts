import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { LlmOption } from '@/types/chat.types';

export const useChatActions = () => {
  const updateStepResult = async (stepId: string, updateData: { user_selection?: LlmOption, approved: boolean }) => {
    try {
      const { error } = await supabase
        .from('step_results')
        .update(updateData)
        .eq('id', stepId);

      if (error) throw error;
      showSuccess('Your response has been saved!');
    } catch (error: any) {
      showError('Failed to save your response.');
      console.error('Error updating step result:', error.message);
    }
  };

  const selectOption = async (stepId: string, selection: LlmOption) => {
    await updateStepResult(stepId, { user_selection: selection, approved: true });
  };

  const approveStep = async (stepId: string) => {
    await updateStepResult(stepId, { approved: true });
  };

  return { selectOption, approveStep };
};