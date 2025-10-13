import React from 'react';
import { Link } from 'react-router-dom';
import { LanguageSwitcher } from '../layout/LanguageSwitcher'; // Import LanguageSwitcher
import { useTranslation } from 'react-i18next'; // Import useTranslation

const Footer = () => {
  const { t } = useTranslation(); // Initialize useTranslation

  return (
    <footer className="border-t border-border/50 py-8">
      <div className="container mx-auto px-4 text-center text-muted-foreground">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
          <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-foreground transition-colors">
            {t('landingPage.footer.blog')}
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-foreground transition-colors">
            {t('landingPage.footer.contact')}
          </a>
          <Link to="/faq" className="text-sm hover:text-foreground transition-colors">
            {t('landingPage.footer.faq')}
          </Link>
          <Link to="/terms" className="text-sm hover:text-foreground transition-colors">
            {t('landingPage.footer.termsOfService')}
          </Link>
          <Link to="/privacy" className="text-sm hover:text-foreground transition-colors">
            {t('landingPage.footer.privacyPolicy')}
          </Link>
        </div>
        {/* Language Selector */}
        <div className="mb-4 flex justify-center">
          <LanguageSwitcher />
        </div>
        <p className="text-xs">&copy; {new Date().getFullYear()} {t('landingPage.footer.copyright')}</p>
        {/* New copyright text */}
        <p className="text-xs mt-1">{t('landingPage.footer.developedBy')}</p>
      </div>
    </footer>
  );
};

export default Footer;