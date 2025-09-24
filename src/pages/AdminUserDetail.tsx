import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Project } from '@/types/database.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showError, showSuccess } from '@/utils/toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type UsageHistory = {
  id: string;
  action_type: string;
  credits_used: number;
  timestamp: string;
};

const AdminUserDetail = () => {
  const { t } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [usageHistory, setUsageHistory] = useState<UsageHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCredits, setNewCredits] = useState<number | string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const userPromise = supabase.from('users').select('*').eq('id', userId).single();
      const projectsPromise = supabase.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      const usageHistoryPromise = supabase.from('usage_history').select('id, action_type, credits_used, timestamp').eq('user_id', userId).order('timestamp', { ascending: false }).limit(50);

      const [{ data: userData, error: userError }, { data: projectsData, error: projectsError }, { data: usageData, error: usageError }] = await Promise.all([userPromise, projectsPromise, usageHistoryPromise]);

      if (userError) throw userError;
      if (projectsError) throw projectsError;
      if (usageError) throw usageError;

      setUser(userData);
      setProjects(projectsData || []);
      setUsageHistory(usageData || []);
      setNewCredits(userData?.credits_remaining || 0);

    } catch (error: any) {
      showError('toasts.admin.fetchUserDetailsFailed');
      console.error('Error fetching user details:', error.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || newCredits === '' || user?.credits_remaining === Number(newCredits)) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ credits_remaining: Number(newCredits) })
        .eq('id', userId);

      if (error) throw error;
      showSuccess("toasts.admin.updateCreditsSuccess");
      await fetchData(); // Refresh data
    } catch (error: any) {
      showError('toasts.admin.updateCreditsFailed');
      console.error('Error updating credits:', error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container max-w-7xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold">{t('admin.userDetail.userNotFound')}</h2>
        <Link to="/admin">
          <Button variant="link" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('admin.userDetail.backToDashboard')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Link to="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('admin.userDetail.backToUsers')}
      </Link>
      <h1 className="text-3xl font-bold mb-2">{user.full_name}</h1>
      <p className="text-muted-foreground mb-8">{user.email}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card className="glass-effect border-border text-card-foreground">
            <CardHeader>
              <CardTitle>{t('admin.userDetail.manageCredits')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateCredits} className="space-y-4">
                <div>
                  <Label htmlFor="credits">{t('admin.userDetail.creditBalance')}</Label>
                  <Input
                    id="credits"
                    type="number"
                    value={newCredits}
                    onChange={(e) => setNewCredits(e.target.value)}
                    className="bg-transparent border-border"
                  />
                </div>
                <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all duration-300 hover:shadow-[0_0_15px_rgba(56,189,248,0.6)] hover:-translate-y-px" disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('admin.userDetail.updateCredits')}
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card className="glass-effect border-border text-card-foreground">
            <CardHeader>
              <CardTitle>{t('admin.userDetail.usageHistory')}</CardTitle>
              <CardDescription className="text-muted-foreground">{t('admin.userDetail.last50')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('usageHistory.action')}</TableHead>
                      <TableHead className="text-right">{t('usageHistory.date')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usageHistory.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.action_type}</TableCell>
                        <TableCell className="text-right text-xs">{new Date(item.timestamp).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="glass-effect border-border text-card-foreground">
            <CardHeader>
              <CardTitle>{t('admin.userDetail.userProjects')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.userDetail.projectName')}</TableHead>
                    <TableHead>{t('admin.userDetail.status')}</TableHead>
                    <TableHead>{t('admin.userDetail.createdAt')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map(project => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <Link to={`/chat/${project.id}`} className="hover:text-cyan-400 font-medium">
                          {project.project_name}
                        </Link>
                      </TableCell>
                      <TableCell>{project.status}</TableCell>
                      <TableCell>{new Date(project.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;