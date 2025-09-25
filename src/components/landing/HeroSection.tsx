import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative text-center py-20 md:py-32 lg:py-40 overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,white_5%,transparent_100%)]"></div>
      <div className="container mx-auto px-4 relative z-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400 leading-tight">
          Transforme de Forma Inteligente Sua Loja de Dropshipping com XpressSEO
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
          Nos bastidores são mais de 6 especialistas de IA trabalhando em conjunto para entregar seu contéudo otimizado para você dominar os resultados de busca.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all duration-300 hover:shadow-[0_0_20px_rgba(56,189,248,0.7)] hover:-translate-y-1">
            <Link to="/chat">Começar Agora (É Grátis)</Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">3 créditos gratuitos para você começar.</p>
      </div>
    </section>
  );
};

export default HeroSection;