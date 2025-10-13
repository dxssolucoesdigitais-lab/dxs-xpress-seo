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
      <h1 className="text-3xl font-bold mb-4">Termos de Uso e Serviço da XpressSEO</h1>
      <div className="prose prose-invert dark:prose-invert max-w-none text-muted-foreground space-y-4">
        <p>Seja Bem-Vindo ao site da XpressSEO. Antes de explorar tudo o que temos a oferecer, é importante que você entenda e concorde com algumas regras básicas que regem o uso do nosso site <a href="https://www.xpressseo.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">www.xpressseo.com</a>, e qualquer outro serviço digital que nós oferecemos, como lojas e plataformas de e-commerce.</p>
        <p>Ao usar nosso site e serviços, você automaticamente concorda em seguir as regras que estabelecemos aqui. Caso não concorde com algo, por favor, considere não usar nossos serviços. É muito importante para nós que você se sinta seguro e informado a todo momento.</p>

        <h2>1. Aceitando os Termos</h2>
        <p>Ao navegar e usar o site da XpressSEO, você concorda automaticamente com nossas regras e condições. Estamos sempre procurando melhorar, então esses termos podem mudar de vez em quando. Se fizermos alterações significativas, vamos postar as atualizações aqui no site. Continuar usando o site após essas mudanças significa que você aceita os novos termos.</p>

        <h2>2. Como Usar o Nosso Site</h2>
        <p>A maior parte do nosso site está aberta para você sem a necessidade de cadastro. No entanto, algumas seções especiais podem exigir que você crie uma conta. Pedimos que você seja honesto ao fornecer suas informações e que mantenha sua senha e login seguros. Se decidir compartilhar algum conteúdo conosco, como comentários, por favor, faça-o de maneira respeitosa e dentro da lei.</p>

        <h2>3. Sua Privacidade</h2>
        <p>Na XpressSEO, a privacidade é um valor essencial. Ao interagir com nosso site, você aceita nossa Política de Privacidade, que detalha nossa abordagem responsável e conforme às leis para o manejo dos seus dados pessoais. Nosso compromisso é com a transparência e a segurança: explicamos como coletamos, usamos e protegemos suas informações, garantindo sua privacidade e oferecendo controle sobre seus dados.</p>
        <p>Adotamos práticas de segurança para proteger suas informações contra acesso não autorizado e compartilhamento indevido, assegurando que qualquer cooperação com terceiros ocorra apenas com base na sua aprovação ou exigências legais claras, reafirmando nosso comprometimento com a sua confiança e segurança digital.</p>

        <h2>4. Direitos de Conteúdo</h2>
        <p>O conteúdo disponível no site da XpressSEO, incluindo, mas não se limitando a, textos, imagens, ilustrações, designs, ícones, fotografias, programas de computador, videoclipes e áudios, constitui propriedade intelectual protegida tanto pela legislação nacional quanto por tratados internacionais sobre direitos autorais e propriedade industrial. Essa propriedade engloba não apenas materiais diretamente produzidos e publicados por nós, mas também conteúdos que são utilizados sob licença ou permissão de terceiros, garantindo que todos os direitos sejam respeitados conforme as normativas vigentes.</p>
        <p>Ao acessar nosso site, você recebe uma licença limitada, não exclusiva e revogável para visualizar e usar o conteúdo para fins pessoais e não comerciais. Isso implica que qualquer reprodução, distribuição, transmissão ou modificação do conteúdo, sem a devida autorização escrita da XpressSEO, é estritamente proibida. Tal restrição visa proteger os direitos de propriedade intelectual associados aos materiais disponibilizados, assegurando que sua utilização não infrinja os direitos dos criadores ou detentores desses direitos, além de promover um ambiente de respeito e valorização da criatividade e inovação.</p>

        <h2>5. Cookies e Mais</h2>
        <p>Utilizamos cookies para melhorar sua experiência, coletando informações anônimas durante sua visita, como suas preferências de idioma, duração da visita, páginas acessadas, e outras estatísticas de uso. Esses dados nos ajudam a personalizar seu conteúdo, otimizar a navegação, melhorar continuamente o site em design e funcionalidade, e garantir sua segurança online. Esta prática é essencial para nos permitir oferecer um serviço mais ajustado às suas necessidades e resolver qualquer problema que possa surgir mais rapidamente.</p>
        <p>Se você preferir limitar ou recusar o uso de cookies, a configuração pode ser ajustada através do seu navegador. Isso pode afetar a sua experiência no site, pois algumas funcionalidades dependem dos cookies para funcionar corretamente. Entendemos a importância do controle sobre suas informações e queremos que você saiba que, ao ajustar as configurações para bloquear cookies, algumas partes do nosso site podem não oferecer a experiência completa pretendida.</p>

        <h2>6. Explorando Links Externos</h2>
        <p>Nosso site pode incluir links para sites externos que achamos que podem ser do seu interesse. Note que não temos controle sobre esses sites externos e, portanto, não somos responsáveis pelo seu conteúdo ou políticas.</p>

        <h2>7. Mudanças e Atualizações</h2>
        <p>A evolução é parte de como operamos, o que significa que estes Termos de Uso podem passar por atualizações para refletir melhor as mudanças em nossos serviços ou na legislação. Sempre que isso acontecer, você encontrará a versão mais recente disponível aqui. Se as mudanças forem significativas, faremos o possível para notificá-lo através dos meios de contato que você nos forneceu.</p>
        <p>Continuar a acessar o site após essas mudanças indica que você concorda com os novos termos. Se, por qualquer motivo, você não concordar com as atualizações, pedimos que não continue utilizando nosso site e serviços.</p>

        <h3>Dúvidas ou Comentários?</h3>
        <p>Se tiver dúvidas sobre estes termos, não hesite em nos contatar através do e-mail <a href="mailto:dxs.automa@gmail.com" className="text-cyan-400 hover:underline">dxs.automa@gmail.com</a>.</p>
      </div>
    </div>
  );
};

export default TermsPage;