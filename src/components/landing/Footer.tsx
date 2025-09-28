import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-8">
      <div className="container mx-auto px-4 text-center text-muted-foreground">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
          <Link to="/blog" className="text-sm hover:text-foreground transition-colors">
            Blog
          </Link>
          <Link to="/contact" className="text-sm hover:text-foreground transition-colors">
            Contato
          </Link>
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
        <p className="text-xs">&copy; {new Date().getFullYear()} XpressSEO. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;