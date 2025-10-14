import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LandingHeader from "@/components/landing/LandingHeader";
import { Link, useNavigate } from "react-router-dom";
import { Search, FileText, Globe, ArrowRight } from "lucide-react";
import { useTranslation } from 'react-i18next';

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto max-w-6xl">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              {t('landingPage.hero.title')}{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                XpressSEO
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              {t('landingPage.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" onClick={() => navigate("/login")} className="shadow-elegant transition-all duration-300 ease-in-out hover:shadow-glow hover:-translate-y-1">
                {t('landingPage.hero.ctaButton')} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-sm text-muted-foreground">{t('landingPage.hero.freeCreditsNote')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landingPage.features.title')}</h2>
            <p className="text-muted-foreground text-lg">{t('landingPage.features.subtitle')}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-elegant border-border/50 transition-all duration-300 ease-in-out hover:shadow-glow animate-slide-up">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4" style={{ background: "var(--gradient-primary)" }}>
                  <Search className="w-6 h-6 text-white" />
                </div>
                <CardTitle>{t('landingPage.features.keywordResearchTitle')}</CardTitle>
                <CardDescription>
                  {t('landingPage.features.keywordResearchDescription')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-elegant border-border/50 transition-all duration-300 ease-in-out hover:shadow-glow animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4" style={{ background: "var(--gradient-primary)" }}>
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle>{t('landingPage.features.optimizedContentTitle')}</CardTitle>
                <CardDescription>
                  {t('landingPage.features.optimizedContentDescription')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-elegant border-border/50 transition-all duration-300 ease-in-out hover:shadow-glow animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4" style={{ background: "var(--gradient-primary)" }}>
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <CardTitle>{t('landingPage.features.internationalExpansionTitle')}</CardTitle>
                <CardDescription>
                  {t('landingPage.features.internationalExpansionDescription')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('landingPage.cta.title')}
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            {t('landingPage.cta.subtitle')}
          </p>
          <Button size="lg" onClick={() => navigate("/login")} className="shadow-glow transition-all duration-300 ease-in-out hover:-translate-y-1">
            {t('landingPage.cta.button')} <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap justify-center gap-6 mb-4 text-sm">
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out">
              {t('landingPage.footer.blog')}
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out">
              {t('landingPage.footer.contact')}
            </a>
            <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out">
              {t('landingPage.footer.faq')}
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out">
              {t('landingPage.footer.termsOfService')}
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out">
              {t('landingPage.footer.privacyPolicy')}
            </Link>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} {t('landingPage.footer.copyright')}</p>
            <p className="text-xs mt-1">{t('landingPage.footer.developedBy')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;