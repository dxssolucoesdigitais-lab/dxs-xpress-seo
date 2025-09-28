import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPage = () => {
  return (
    <div className="container max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para a Página Inicial
      </Link>
      <h1 className="text-3xl font-bold mb-4">Política de Privacidade</h1>
      <div className="prose prose-invert dark:prose-invert max-w-none text-muted-foreground space-y-4">
        <p>Nossa Política de Privacidade está sendo cuidadosamente elaborada e estará disponível em breve.</p>
        <p>Este documento explicará em detalhes quais dados coletamos, por que os coletamos, como os utilizamos e protegemos, e quais são os seus direitos em relação às suas informações pessoais, em conformidade com a LGPD e outras leis de proteção de dados.</p>
        <p>A sua privacidade é de extrema importância para nós. Agradecemos a sua compreensão.</p>
      </div>
    </div>
  );
};

export default PrivacyPage;