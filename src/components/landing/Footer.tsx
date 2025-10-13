import React from 'react';
import { Link } from 'react-router-dom';
import { LanguageSwitcher } from '../layout/LanguageSwitcher'; // Import LanguageSwitcher

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-8">
      <div className="container mx-auto px-4 text-center text-muted-foreground">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
          <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-foreground transition-colors">
            Blog
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-foreground transition-colors">
            Contato
          </a>
          <Link to="/faq" className="text-sm hover:text-foreground transition-colors">
            FAQ
          </Link>
          <Link to="/terms" className="text-sm hover:text-foreground transition-colors">
            Termos de Serviço
          </Link>
          <Link to="/privacy" className="text-sm hover:text-foreground transition-colors">
            Política de Privacidade
          </Link>
        </div>
        {/* Language Selector */}
        <div className="mb-4 flex justify-center">
          <LanguageSwitcher />
        </div>
        <p className="text-xs">&copy; {new Date().getFullYear()} XpressSEO. Todos os direitos reservados.</p>
        {/* New copyright text */}
        <p className="text-xs mt-1">Desenvolvido por DXS Digital.</p>
      </div>
    </footer>
  );
};

export default Footer;