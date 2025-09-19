import React, { useState, useEffect } from 'react';
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
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { Feedback } from '@/types/database.types';
import { useTranslation } from 'react-i18next';

interface FeedbackReplyDialogProps {
  feedback: Feedback | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onReplied: () => void;
}

const FeedbackReplyDialog: React.FC<FeedbackReplyDialogProps> = ({ feedback, isOpen, onOpenChange, onReplied }) => {
  const { t } = useTranslation();
  const [reply, setReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (feedback) {
      setReply(feedback.admin_response || '');
    }
  }, [feedback]);

  const handleGenerateReply = async () => {
    if (!feedback) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-feedback-reply', {
        body: { feedbackContent: feedback.content },
      });
      if (error) throw error;
      setReply(data.reply);
    } catch (error) {
      showError('toasts.feedback.generateReplyError');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !feedback) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('feedbacks')
        .update({
          admin_response: reply,
          status: 'replied',
          responded_at: new Date().toISOString(),
        })
        .eq('id', feedback.id);

      if (error) throw error;

      showSuccess('toasts.feedback.replySuccess');
      onReplied();
      onOpenChange(false);
    } catch (error) {
      showError('toasts.feedback.replyError');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border text-popover-foreground">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('feedbackReplyDialog.title')}</DialogTitle>
            <DialogDescription>{t('feedbackReplyDialog.description')}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label>{t('feedbackReplyDialog.userFeedback')}</Label>
              <div className="p-3 mt-1 text-sm rounded-md border bg-secondary text-muted-foreground max-h-28 overflow-y-auto">
                {feedback?.content}
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="feedback-reply">{t('feedbackReplyDialog.yourReply')}</Label>
                <Button type="button" variant="ghost" size="sm" onClick={handleGenerateReply} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {t('feedbackReplyDialog.generate')}
                </Button>
              </div>
              <Textarea
                id="feedback-reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={6}
                className="bg-transparent border-border"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting || !reply.trim()}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('feedbackReplyDialog.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackReplyDialog;