import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useSession } from '@/contexts/SessionContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, LayoutDashboard, CreditCard, PlusCircle, User as UserIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ModeToggle } from '../theme/mode-toggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  onMenuClick: () => void;
  onBuyCreditsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onBuyCreditsClick }) => {
  const { t } = useTranslation();
  const { session, user } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 backdrop-blur-lg px-4 md:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <div className="flex-1" />
      <div className="flex items-center gap-2 sm:gap-4">
        {user && (
          <button
            onClick={onBuyCreditsClick}
            className={cn(
              "hidden sm:flex items-center gap-2 text-sm font-semibold bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full border border-border transition-colors",
              user.credits_remaining <= 0
                ? "text-red-400 border-red-500/50 hover:bg-destructive/10"
                : "hover:bg-accent"
            )}
          >
            <CreditCard className={cn("h-4 w-4", user.credits_remaining <= 0 ? "text-red-400" : "text-cyan-400")} />
            <span>{user.credits_remaining} {t('header.credits')}</span>
          </button>
        )}
        <Button 
          variant="secondary" 
          size="sm" 
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold btn-glow"
          onClick={onBuyCreditsClick}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('header.upgradePlan')}
        </Button>
        
        <ModeToggle />
        <LanguageSwitcher />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border-2 border-border">
                <AvatarFallback className="bg-secondary">{getInitials(user?.full_name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-popover border-border text-popover-foreground" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            {user?.role === 'admin' && (
              <DropdownMenuItem onSelect={() => navigate('/admin')} className="cursor-pointer">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>{t('header.dashboard')}</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => navigate('/profile')} className="cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>{t('header.profile')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('header.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;