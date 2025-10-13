import React from 'react';
import { Search, FileText, Globe, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const FeaturesSection = () => {
  const { t } = useTranslation(); // Initialize useTranslation

  const features = [
    {
      icon: <Search className="w-8 h-8 text-cyan-400" />,
      title: t('landingPage.features.keywordResearchTitle'),
      description: t('landingPage.features.keywordResearchDescription'),
    },
    {
      icon: <FileText className="w-8 h-8 text-cyan-400" />,
      title: t('landingPage.features.optimizedContentTitle'),
      description: t('landingPage.features.optimizedContentDescription'),
    },
    {
      icon: <Globe className="w-8 h-8 text-cyan-400" />,
      title: t('landingPage.features.internationalExpansionTitle'),
      description: t('landingPage.features.internationalExpansionDescription'),
    },
  ];

  return (
    <section className="py-20 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">{t('landingPage.features.title')}</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('landingPage.features.subtitle')}
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center p-6 border border-border/50 rounded-lg glass-effect">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;