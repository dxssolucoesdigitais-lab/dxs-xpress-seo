import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Announcement } from '@/types/database.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Loader2 } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const planOptions = [
  { value: 'all', labelKey: 'admin.announcements.targetPlans.all' },
  { value: 'free', labelKey: 'admin.announcements.targetPlans.free' },
  { value: 'basic', labelKey: 'admin.announcements.targetPlans.basic' },
  { value: 'standard', labelKey: 'admin.announcements.targetPlans.standard' },
  { value: 'premium', labelKey: 'admin.announcements.targetPlans.premium' },
];

const AnnouncementsManager = () => {
  const { t } = useTranslation();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [newTargetPlan, setNewTargetPlan] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      showError('toasts.admin.announcements.fetchError');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreate = async () => {
    if (!newContent.trim()) return;
    setIsSubmitting(true);
    try {
      // 1. Traduzir o conteúdo usando a Edge Function
      const { data: translationData, error: translateError } = await supabase.functions.invoke('translate-announcement', {
        body: { text: newContent },
      });

      if (translateError) throw translateError;

      const translatedContent = {
        pt: newContent,
        en: translationData.translation,
      };

      // 2. Salvar o anúncio com ambas as traduções e o plano-alvo
      const { error: insertError } = await supabase.from('announcements').insert({ 
        content: translatedContent,
        target_plan_types: newTargetPlan === 'all' ? ['all'] : [newTargetPlan],
      });
      if (insertError) throw insertError;

      showSuccess('toasts.admin.announcements.createSuccess');
      setNewContent('');
      setNewTargetPlan('all'); // Reset target plan
      await fetchAnnouncements();
    } catch (error) {
      showError('toasts.admin.announcements.createError');
      console.error("Erro ao criar anúncio:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (announcementToToggle: Announcement) => {
    try {
      // Desativar todos os outros anúncios primeiro
      await supabase.from('announcements').update({ is_active: false }).neq('id', announcementToToggle.id);
      
      // Ativar/desativar o anúncio selecionado
      const { error } = await supabase.from('announcements').update({ is_active: !announcementToToggle.is_active }).eq('id', announcementToToggle.id);
      if (error) throw error;
      
      showSuccess('toasts.admin.announcements.activateSuccess');
      await fetchAnnouncements(); // Re-fetch para atualizar a lista
    } catch (error) {
      showError('toasts.admin.announcements.activateError');
      console.error("Erro ao ativar/desativar anúncio:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
      showSuccess('toasts.admin.announcements.deleteSuccess');
      await fetchAnnouncements();
    } catch (error) {
      showError('toasts.admin.announcements.deleteError');
      console.error("Erro ao excluir anúncio:", error);
    }
  };

  const getTargetPlanLabel = (targetPlans: string[] | null) => {
    if (!targetPlans || targetPlans.includes('all')) {
      return t('admin.announcements.targetPlans.all');
    }
    return targetPlans.map(plan => t(`admin.announcements.targetPlans.${plan}`)).join(', ');
  };

  return (
    <Card className="glass-effect border-border text-card-foreground">
      <CardHeader>
        <CardTitle>{t('admin.announcements.title')}</CardTitle>
        <CardDescription>{t('admin.announcements.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Textarea
            placeholder={t('admin.announcements.newPlaceholder')}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="bg-transparent border-border"
            disabled={isSubmitting}
          />
          <div className="flex items-center gap-2">
            <Select value={newTargetPlan} onValueChange={setNewTargetPlan} disabled={isSubmitting}>
              <SelectTrigger className="w-[180px] bg-transparent border-border">
                <SelectValue placeholder={t('admin.announcements.targetPlans.select')} />
              </SelectTrigger>
              <SelectContent>
                {planOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleCreate} 
              disabled={isSubmitting || !newContent.trim()}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all duration-300 hover:shadow-[0_0_15px_rgba(56,189,248,0.6)] hover:-translate-y-px"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('admin.announcements.create')}
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : announcements.length > 0 ? (
            announcements.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary border border-border">
                <div className="flex-1 mr-4">
                  <p className="text-sm">{(item.content as any)?.pt || item.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('admin.announcements.target')}: {getTargetPlanLabel(item.target_plan_types)}
                  </p>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.is_active}
                      onCheckedChange={() => handleToggleActive(item)}
                    />
                    <span className="text-xs font-medium">{t('admin.announcements.active')}</span>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('admin.announcements.deleteConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('admin.announcements.deleteConfirmDescription')}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id)}>{t('deleteDialog.confirm')}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground text-sm py-4">{t('admin.announcements.noAnnouncements')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnnouncementsManager;