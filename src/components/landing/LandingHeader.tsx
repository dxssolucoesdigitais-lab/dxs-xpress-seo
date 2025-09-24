import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSession } from '@/contexts/SessionContext';

const LandingHeader = () => {
  const { session } = useSession();

  return (
    <header className="sticky top-0 z-50 py-4 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="XpressSEO Logo" className="h-8 w-8" />
          <span className="text-xl font-bold">XpressSEO</span>
        </Link>
        <nav>
          {session ? (
            <Button asChild className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold">
              <Link to="/chat">Acessar Painel</Link>
            </Button>
          ) : (
            <Button asChild variant="ghost">
              <Link to="/login">Entrar</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default LandingHeader;