import React from 'react';
import { useUsageHistory } from '@/hooks/useUsageHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

const UsageHistory = () => {
  const { t } = useTranslation();
  const { history, loading } = useUsageHistory();

  return (
    <Card className="glass-effect border-border text-card-foreground">
      <CardHeader>
        <CardTitle>{t('usageHistory.title')}</CardTitle>
        <CardDescription className="text-muted-foreground">{t('usageHistory.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('usageHistory.action')}</TableHead>
                <TableHead className="text-right">{t('usageHistory.creditsUsed')}</TableHead>
                <TableHead>{t('usageHistory.date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  </TableRow>
                ))
              ) : history.length > 0 ? (
                history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.action_type}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">-{item.credits_used}</Badge>
                    </TableCell>
                    <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    {t('usageHistory.noHistory')}
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

export default UsageHistory;