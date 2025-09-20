import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useSession } from '@/contexts/SessionContext';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { useTranslation } from 'react-i18next';

interface FeedbackDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({ isOpen, onOpenChange }) => {
  const { t } = useTranslation();
  const { user } = useSession();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('feedbacks')
        .insert({ user_id: user.id, content });

      if (error) throw error;

      showSuccess('toasts.feedback.success');
      setContent('');
      onOpenChange(false);
    } catch (error: any) {
      showError('toasts.feedback.error');
      console.error("Error submitting feedback:", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border text-popover-foreground">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('feedbackDialog.title')}</DialogTitle>
            <DialogDescription>{t('feedbackDialog.description')}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="feedback-content" className="sr-only">
              {t('feedbackDialog.label')}
            </Label>
            <Textarea
              id="feedback-content"
              placeholder={t('feedbackDialog.placeholder')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="bg-transparent border-border"
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold" disabled={isSubmitting || !content.trim()}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('feedbackDialog.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;