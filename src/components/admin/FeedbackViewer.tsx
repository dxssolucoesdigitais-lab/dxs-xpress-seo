import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface Feedback {
  id: string;
  content: string;
  created_at: string;
  users: {
    full_name: string | null;
    email: string;
  } | null;
}

const FeedbackViewer = () => {
  const { t } = useTranslation();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .select(`
          id,
          content,
          created_at,
          users (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      showError('toasts.feedback.fetchError');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
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
                <TableHead className="text-right">{t('feedbackViewer.date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
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
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{item.users?.full_name}</span>
                          <span className="text-xs text-muted-foreground">{item.users?.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-pre-wrap">{item.content}</TableCell>
                    <TableCell className="text-right text-xs">{new Date(item.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                    {t('feedbackViewer.noFeedback')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default FeedbackViewer;