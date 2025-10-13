import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PrivacyPage = () => {
  const { t } = useTranslation();

  return (
    <div className="container max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('privacyPage.backLink')}
      </Link>
      <h1 className="text-3xl font-bold mb-4">{t('privacyPage.title')}</h1>
      <div className="prose prose-invert dark:prose-invert max-w-none text-muted-foreground space-y-4">
        <p dangerouslySetInnerHTML={{ __html: t('privacyPage.intro1') }}></p>
        <p>{t('privacyPage.intro2')}</p>

        <h2>{t('privacyPage.definitionsTitle')}</h2>
        <ul>
          {(t('privacyPage.definitionsList', { returnObjects: true }) as string[]).map((item, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: item }}></li>
          ))}
        </ul>

        <h2>{t('privacyPage.dataCollectionTitle')}</h2>
        <p>{t('privacyPage.dataCollectionIntro')}</p>
        <ul>
          <li dangerouslySetInnerHTML={{ __html: t('privacyPage.dataCollectionList1') }}></li>
          <li dangerouslySetInnerHTML={{ __html: t('privacyPage.dataCollectionList2') }}></li>
        </ul>

        <h2>{t('privacyPage.cookiesTitle')}</h2>
        <p dangerouslySetInnerHTML={{ __html: t('privacyPage.cookiesIntro') }}></p>

        <h3>{t('privacyPage.cookiesTypesTitle')}</h3>
        <ul>
          {(t('privacyPage.cookiesTypesList', { returnObjects: true }) as string[]).map((item, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: item }}></li>
          ))}
        </ul>

        <h2>{t('privacyPage.dataProcessingTitle')}</h2>
        <p>{t('privacyPage.dataProcessingIntro')}</p>
        <ul>
          {(t('privacyPage.dataProcessingList', { returnObjects: true }) as string[]).map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <h2>{t('privacyPage.dataSharingTitle')}</h2>
        <p>{t('privacyPage.dataSharingIntro')}</p>
        <ul>
          {(t('privacyPage.dataSharingList', { returnObjects: true }) as string[]).map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <h2>{t('privacyPage.externalLinksTitle')}</h2>
        <p>{t('privacyPage.externalLinksP1')}</p>
        <p>{t('privacyPage.externalLinksP2')}</p>

        <h2>{t('privacyPage.dataSubjectRightsTitle')}</h2>
        <p>{t('privacyPage.dataSubjectRightsIntro')}</p>
        <ul>
          {(t('privacyPage.dataSubjectRightsList', { returnObjects: true }) as string[]).map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <p dangerouslySetInnerHTML={{ __html: t('privacyPage.dataSubjectRightsContact') }}></p>

        <h2>{t('privacyPage.dataSecurityTitle')}</h2>
        <p>{t('privacyPage.dataSecurityP1')}</p>

        <h2>{t('privacyPage.policyChangesTitle')}</h2>
        <p>{t('privacyPage.policyChangesP1')}</p>

        <h2>{t('privacyPage.contactTitle')}</h2>
        <p dangerouslySetInnerHTML={{ __html: t('privacyPage.contactEmail') }}></p>
      </div>
    </div>
  );
};

export default PrivacyPage;