import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Announcement } from '@/types/database.types';
import { Megaphone, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/contexts/SessionContext';

const AnnouncementBanner = () => {
  const { i18n } = useTranslation();
  const { user } = useSession();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        let query = supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .limit(1);

        // Filter by user plan if available, otherwise default to 'all'
        const userPlanType = user?.plan_type || 'free'; // Default to 'free' if no plan
        query = query.or(`target_plan_types.cs.{${userPlanType}},target_plan_types.cs.{all}`);

        const { data, error } = await query.single();

        if (error && error.code !== 'PGRST116') { // Ignore 'exact one row' error
          throw error;
        }

        if (data) {
          const dismissedId = localStorage.getItem('dismissed_announcement_id');
          if (dismissedId !== data.id) {
            setAnnouncement(data);
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error('Error fetching announcement:', error);
      }
    };

    fetchAnnouncement();
  }, [user, i18n.language]); // Re-fetch when user or language changes

  const handleDismiss = () => {
    if (announcement) {
      localStorage.setItem('dismissed_announcement_id', announcement.id);
      setIsVisible(false);
    }
  };

  if (!isVisible || !announcement) {
    return null;
  }

  const content = announcement.content as { [key: string]: string };
  const currentLang = i18n.language.split('-')[0]; // Pega 'en' de 'en-US'
  const displayText = content[currentLang] || content.pt; // Mostra no idioma do usuário ou fallback para português

  return (
    <div className="relative bg-cyan-500 text-black">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-sm text-center font-medium">
        <div className="flex items-center justify-center">
          <Megaphone className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{displayText}</span>
          <Button variant="ghost" size="icon" onClick={handleDismiss} className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 hover:bg-cyan-600/50">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;