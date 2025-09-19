import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Feedback } from '@/types/database.types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Eye, MessageSquareReply } from 'lucide-react';
import FeedbackReplyDialog from './FeedbackReplyDialog';

interface FeedbackWithUser extends Feedback {
  users: {
    full_name: string | null;
    email: string;
  } | null;
}

const FeedbackViewer = () => {
  const { t } = useTranslation();
  const [feedbacks, setFeedbacks] = useState<FeedbackWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .select(`*, users (full_name, email)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedbacks(data as FeedbackWithUser[] || []);
    } catch (error) {
      showError('toasts.feedback.fetchError');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleMarkAsRead = async (id: string) => {
    const originalFeedbacks = [...feedbacks];
    setFeedbacks(current => current.map(f => f.id === id ? { ...f, status: 'read' } : f));
    const { error } = await supabase.from('feedbacks').update({ status: 'read' }).eq('id', id);
    if (error) {
      showError('toasts.feedback.updateStatusError');
      setFeedbacks(originalFeedbacks);
    }
  };

  const handleOpenReplyDialog = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setIsReplyDialogOpen(true);
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const statusVariant = {
    unread: 'default',
    read: 'secondary',
    replied: 'outline',
  };

  return (
    <>
      <Card className="glass-effect border-border text-card-foreground">
        <CardHeader>
          <CardTitle>{t('feedbackViewer.title')}</CardTitle>
          <CardDescription>{t('feedbackViewer.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('feedbackViewer.user')}</TableHead>
                  <TableHead>{t('feedbackViewer.feedback')}</TableHead>
                  <TableHead>{t('feedbackViewer.status')}</TableHead>
                  <TableHead className="text-right">{t('feedbackViewer.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : feedbacks.length > 0 ? (
                  feedbacks.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 border">
                            <AvatarFallback className="bg-secondary text-xs">
                              {getInitials(item.users?.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{item.users?.full_name}</p>
                            <p className="text-xs text-muted-foreground">{item.users?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-md truncate">{item.content}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[item.status] || 'default'}>{t(`feedbackViewer.statuses.${item.status}`)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {item.status === 'unread' && (
                            <Button variant="ghost" size="icon" onClick={() => handleMarkAsRead(item.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleOpenReplyDialog(item)}>
                            <MessageSquareReply className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                      {t('feedbackViewer.noFeedback')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      <FeedbackReplyDialog
        feedback={selectedFeedback}
        isOpen={isReplyDialogOpen}
        onOpenChange={setIsReplyDialogOpen}
        onReplied={fetchFeedbacks}
      />
    </>
  );
};

export default FeedbackViewer;