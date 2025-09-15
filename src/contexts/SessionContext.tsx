import { createContext, useContext, useEffect, useState } from 'react';
import { Session, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/database.types';

type SessionContextType = {
  session: Session | null;
  user: User | null;
  supabase: SupabaseClient;
  isLoading: boolean;
};

const SessionContext = createContext<SessionContextType | null>(null);

export const SessionContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Effect for handling auth state changes
  useEffect(() => {
    const fetchUser = async (userId: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching user profile:", error.message);
        setUser(null);
      } else {
        setUser(data);
      }
    };

    const getSessionAndUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        await fetchUser(session.user.id);
      }
      setIsLoading(false);
    };

    getSessionAndUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUser(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Effect for real-time user profile updates (e.g., credits)
  useEffect(() => {
    if (!session?.user) return;

    const userChannel = supabase
      .channel(`user-profile-${session.user.id}`)
      .on<User>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${session.user.id}`,
        },
        (payload) => {
          setUser(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
    };
  }, [session]);

  return (
    <SessionContext.Provider value={{ session, user, supabase, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};