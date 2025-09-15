import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { LlmOption } from '@/types/chat.types';
import { StepResult } from '@/types/database.types';

const triggerNextStep = async (projectId: string) => {
  try {
    const { error } = await supabase.functions.invoke('trigger-step', {
      body: { projectId },
    });

    if (error) {
      if (error.context && error.context.response.status === 402) {
        showError("toasts.chat.outOfCredits");
      } else {
        throw error;
      }
    } else {
      console.log('Successfully triggered next step for project:', projectId);
    }
  } catch (error: any) {
    showError('toasts.chat.nextStepTriggerFailed');
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
      showSuccess('toasts.chat.responseSaved');

      await triggerNextStep(stepResult.project_id);

    } catch (error: any) {
      showError('toasts.chat.responseSaveFailed');
      console.error('Error updating step result:', error.message);
    }
  };

  const selectOption = async (stepResult: StepResult, selection: LlmOption) => {
    await updateStepResult(stepResult, { user_selection: selection, approved: true });
  };

  const approveStep = async (stepResult: StepResult) => {
    await updateStepResult(stepResult, { approved: true });
  };

  const regenerateStep = async (stepResult: StepResult) => {
    try {
      const { error } = await supabase.functions.invoke('regenerate-step', {
        body: { stepResultId: stepResult.id },
      });

      if (error) {
        if (error.context && error.context.response.status === 402) {
          showError("toasts.chat.noCreditsToRegenerate");
        } else {
          throw error;
        }
      } else {
        showSuccess('toasts.chat.regenerating');
        await triggerNextStep(stepResult.project_id);
      }
    } catch (error: any) {
      showError('toasts.chat.regenerateFailed');
      console.error('Error invoking regenerate-step function:', error.message);
    }
  };

  return { selectOption, approveStep, regenerateStep };
};