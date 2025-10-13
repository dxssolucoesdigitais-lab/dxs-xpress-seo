import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FaqPage = () => {
  const { t } = useTranslation();
  const faqData = t('faqPage.categories', { returnObjects: true }) as { category: string; questions: { q: string; a: string }[] }[];

  return (
    <div className="container max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <Link to="/chat" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('faqPage.backLink')}
      </Link>
      <h1 className="text-3xl font-bold mb-2">{t('faqPage.title')}</h1>
      <p className="text-muted-foreground mb-8">{t('faqPage.subtitle')}</p>

      <div className="space-y-8">
        {faqData.map((categoryItem, categoryIndex) => (
          <div key={categoryIndex}>
            <h2 className="text-2xl font-semibold mb-4 border-b border-border pb-2">{categoryItem.category}</h2>
            <Accordion type="single" collapsible className="w-full">
              {categoryItem.questions.map((item, questionIndex) => (
                <AccordionItem value={`item-${categoryIndex}-${questionIndex}`} key={questionIndex}>
                  <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                  <AccordionContent className="prose prose-invert dark:prose-invert prose-sm max-w-none text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaqPage;