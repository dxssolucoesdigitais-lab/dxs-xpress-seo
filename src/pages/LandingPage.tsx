import React from 'react';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import Footer from '@/components/landing/Footer';
import LandingHeader from '@/components/landing/LandingHeader';

const LandingPage = () => {
  return (
    <div className="bg-background text-foreground">
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;