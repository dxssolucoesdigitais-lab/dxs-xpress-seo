import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TermsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="container max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('termsPage.backLink')}
      </Link>
      <h1 className="text-3xl font-bold mb-4">{t('termsPage.title')}</h1>
      <div className="prose prose-invert dark:prose-invert max-w-none text-muted-foreground space-y-4">
        <p dangerouslySetInnerHTML={{ __html: t('termsPage.intro1') }}></p>
        <p>{t('termsPage.intro2')}</p>

        <h2>{t('termsPage.section1.title')}</h2>
        <p>{t('termsPage.section1.p1')}</p>

        <h2>{t('termsPage.section2.title')}</h2>
        <p>{t('termsPage.section2.p1')}</p>

        <h2>{t('termsPage.section3.title')}</h2>
        <p>{t('termsPage.section3.p1')}</p>
        <p>{t('termsPage.section3.p2')}</p>

        <h2>{t('termsPage.section4.title')}</h2>
        <p>{t('termsPage.section4.p1')}</p>
        <p>{t('termsPage.section4.p2')}</p>

        <h2>{t('termsPage.section5.title')}</h2>
        <p>{t('termsPage.section5.p1')}</p>
        <p>{t('termsPage.section5.p2')}</p>

        <h2>{t('termsPage.section6.title')}</h2>
        <p>{t('termsPage.section6.p1')}</p>

        <h2>{t('termsPage.section7.title')}</h2>
        <p>{t('termsPage.section7.p1')}</p>
        <p>{t('termsPage.section7.p2')}</p>

        <h3>{t('termsPage.contactTitle')}</h3>
        <p dangerouslySetInnerHTML={{ __html: t('termsPage.contactEmail') }}></p>
      </div>
    </div>
  );
};

export default TermsPage;