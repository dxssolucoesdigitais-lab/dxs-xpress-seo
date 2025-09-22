import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-8">
      <div className="container mx-auto px-4 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} XpressSEO. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;