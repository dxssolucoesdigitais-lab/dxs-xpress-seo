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

const AnnouncementsManager = () => {
  const { t } = useTranslation();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
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
      // 1. Traduzir o conteúdo
      const { data: translationData, error: translateError } = await supabase.functions.invoke('translate-announcement', {
        body: { text: newContent },
      });

      if (translateError) throw translateError;

      const translatedContent = {
        pt: newContent,
        en: translationData.translation,
      };

      // 2. Salvar o anúncio com ambas as traduções
      const { error: insertError } = await supabase.from('announcements').insert({ content: translatedContent });
      if (insertError) throw insertError;

      showSuccess('toasts.admin.announcements.createSuccess');
      setNewContent('');
      await fetchAnnouncements();
    } catch (error) {
      showError('toasts.admin.announcements.createError');
      console.error("Erro ao criar anúncio:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      // Deactivate all other announcements
      await supabase.from('announcements').update({ is_active: false }).neq('id', announcement.id);
      // Activate the selected one
      const { error } = await supabase.from('announcements').update({ is_active: !announcement.is_active }).eq('id', announcement.id);
      if (error) throw error;
      showSuccess('toasts.admin.announcements.activateSuccess');
      await fetchAnnouncements();
    } catch (error) {
      showError('toasts.admin.announcements.activateError');
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
    }
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
          <Button 
            onClick={handleCreate} 
            disabled={isSubmitting || !newContent.trim()}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all duration-300 hover:shadow-[0_0_15px_rgba(56,189,248,0.6)] hover:-translate-y-px"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('admin.announcements.create')}
          </Button>
        </div>
        <div className="space-y-4">
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : announcements.length > 0 ? (
            announcements.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary border border-border">
                <p className="flex-1 text-sm">{(item.content as any)?.pt || item.content}</p>
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