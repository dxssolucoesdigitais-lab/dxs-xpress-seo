import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Globe, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto max-w-6xl">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Transforme de Forma Inteligente Sua Loja de Dropshipping com{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                XpressSEO
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Nos bastidores vários especialistas de IA trabalhando em conjunto para entregar conteúdo otimizado para você dominar os resultados de busca.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" onClick={() => navigate("/auth")} className="shadow-elegant">
                Começar Agora (É Grátis) <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-sm text-muted-foreground">3 créditos gratuitos para você começar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tudo que você precisa para crescer</h2>
            <p className="text-muted-foreground text-lg">Deixe a IA cuidar do trabalho pesado de SEO enquanto você foca em vender.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-elegant border-border/50 hover:shadow-glow transition-smooth animate-slide-up">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Pesquisa de Palavras-chave</CardTitle>
                <CardDescription>
                  Nossa IA analisa seu nicho e encontra as palavras-chave de alta intenção que seus clientes estão usando para buscar produtos.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-elegant border-border/50 hover:shadow-glow transition-smooth animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Conteúdo Otimizado</CardTitle>
                <CardDescription>
                  Gere descrições de produtos, categorias e posts de blog que não apenas vendem, mas também são amados pelos motores de busca.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-elegant border-border/50 hover:shadow-glow transition-smooth animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Expansão Internacional</CardTitle>
                <CardDescription>
                  Traduza e adapte todo o seu conteúdo de SEO para o país de destino, alcançando um público global com precisão cultural.
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
            Pronto para dominar os resultados de busca?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Comece agora com 3 créditos gratuitos e transforme sua loja de dropshipping
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="shadow-glow">
            Começar Agora (É Grátis) <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap justify-center gap-6 mb-4 text-sm">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth">Blog</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth">Contato</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth">FAQ</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth">Termos de Serviço</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-smooth">Política de Privacidade</a>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 XpressSEO. Todos os direitos reservados. Desenvolvido por DXS Digital.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
