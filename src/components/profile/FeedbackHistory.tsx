import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useTranslation } from 'react-i18next';
import { Badge } from '../ui/badge';

const FeedbackHistory = () => {
  const { t } = useTranslation();
  const { user } = useSession();

  const fetchFeedbacks = async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('feedbacks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  };

  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ['userFeedbacks', user?.id],
    queryFn: fetchFeedbacks,
    enabled: !!user,
  });

  return (
    <Card className="glass-effect border-border text-card-foreground">
      <CardHeader>
        <CardTitle>{t('feedbackHistory.title')}</CardTitle>
        <CardDescription className="text-muted-foreground">{t('feedbackHistory.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : feedbacks && feedbacks.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {feedbacks.map((feedback) => (
              <AccordionItem value={feedback.id} key={feedback.id}>
                <AccordionTrigger>
                  <div className="flex justify-between items-center w-full pr-4">
                    <span className="truncate max-w-xs">{feedback.content}</span>
                    <div className="flex items-center gap-2">
                      {feedback.status === 'replied' && <Badge variant="outline">{t('feedbackHistory.replied')}</Badge>}
                      <span className="text-xs text-muted-foreground">{new Date(feedback.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-1">{t('feedbackHistory.yourMessage')}</p>
                    <p className="text-sm text-muted-foreground p-3 bg-secondary rounded-md">{feedback.content}</p>
                  </div>
                  {feedback.admin_response && (
                    <div>
                      <p className="text-sm font-semibold mb-1">{t('feedbackHistory.adminResponse')}</p>
                      <p className="text-sm text-muted-foreground p-3 bg-secondary rounded-md whitespace-pre-wrap">{feedback.admin_response}</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-center text-muted-foreground py-8">{t('feedbackHistory.noHistory')}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackHistory;