import React from 'react';
import { Search, FileText, Globe, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: <Search className="w-8 h-8 text-cyan-400" />,
    title: 'Pesquisa de Palavras-chave',
    description: 'Nossa IA analisa seu nicho e encontra as palavras-chave de alta intenção que seus clientes estão usando para buscar produtos.',
  },
  {
    icon: <FileText className="w-8 h-8 text-cyan-400" />,
    title: 'Conteúdo Otimizado',
    description: 'Gere descrições de produtos, categorias e posts de blog que não apenas vendem, mas também são amados pelos motores de busca.',
  },
  {
    icon: <Globe className="w-8 h-8 text-cyan-400" />,
    title: 'Expansão Internacional',
    description: 'Traduza e adapte todo o seu conteúdo de SEO para o país de destino, alcançando um público global com precisão cultural.',
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Tudo que você precisa para crescer</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Deixe a IA cuidar do trabalho pesado de SEO enquanto você foca em vender.
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