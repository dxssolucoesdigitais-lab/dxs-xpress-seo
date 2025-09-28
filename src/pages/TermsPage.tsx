import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsPage = () => {
  return (
    <div className="container max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para a Página Inicial
      </Link>
      <h1 className="text-3xl font-bold mb-4">Termos de Serviço</h1>
      <div className="prose prose-invert dark:prose-invert max-w-none text-muted-foreground space-y-4">
        <p>Nossos Termos de Serviço estão sendo atualizados e estarão disponíveis em breve.</p>
        <p>Este documento irá detalhar as regras e diretrizes para o uso do XpressSEO, incluindo responsabilidades do usuário, políticas de pagamento, direitos de propriedade intelectual e limitações de responsabilidade.</p>
        <p>Agradecemos a sua paciência.</p>
      </div>
    </div>
  );
};

export default TermsPage;