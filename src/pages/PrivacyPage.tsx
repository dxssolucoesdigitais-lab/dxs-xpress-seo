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
      <h1 className="text-3xl font-bold mb-4">Política de Privacidade da XpressSEO</h1>
      <div className="prose prose-invert dark:prose-invert max-w-none text-muted-foreground space-y-4">
        <p>Bem-vindo à XpressSEO, inscrita no CNPJ 40.080.986/0001-71, com sede na Rua Monsenhor Kimura, 445, Vila Cleópatra, Maringá-PR, 87010-450. Nosso compromisso é com a integridade e a segurança dos dados pessoais dos nossos usuários e clientes. Esta Política de Privacidade aplica-se a todas as interações digitais realizadas em nosso site <a href="https://www.xpressseo.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">www.xpressseo.com</a>, serviços associados, aplicativos móveis e outras plataformas digitais sob nosso controle.</p>
        <p>Ao acessar e utilizar nossas plataformas, você reconhece e concorda com as práticas descritas nesta política. Nós tratamos a proteção de seus dados pessoais com a máxima seriedade e nos comprometemos a processá-los de forma responsável, transparente e segura.</p>

        <h2>Definições</h2>
        <ul>
          <li><strong>“Dados Pessoais”</strong> são informações que identificam ou podem identificar uma pessoa natural.</li>
          <li><strong>“Dados Pessoais Sensíveis”</strong> são informações que revelam características pessoais íntimas, como origem racial, convicções religiosas, opiniões políticas, dados genéticos ou biométricos.</li>
          <li><strong>“Tratamento de Dados Pessoais”</strong> abrange qualquer operação com Dados Pessoais, como coleta, registro, armazenamento, uso, compartilhamento ou destruição.</li>
          <li><strong>“Leis de Proteção de Dados”</strong> são todas as leis que regulamentam o Tratamento de Dados Pessoais, incluindo a LGPD (Lei Geral de Proteção de Dados Pessoais, Lei nº 13.709/18).</li>
        </ul>

        <h2>Dados Coletados e Motivos da Coleta</h2>
        <p>Nós coletamos e processamos os seguintes tipos de dados pessoais:</p>
        <ul>
          <li><strong>Informações Fornecidas por Você:</strong> Isso inclui, mas não se limita a, nome, sobrenome, endereço de e-mail, endereço físico, informações de pagamento e quaisquer outras informações que você optar por fornecer ao criar uma conta, fazer uma compra ou interagir com nossos serviços de atendimento ao cliente.</li>
          <li><strong>Informações Coletadas Automaticamente:</strong> Quando você visita nosso site, coletamos automaticamente informações sobre seu dispositivo e sua interação com nosso site. Isso pode incluir dados como seu endereço IP, tipo de navegador, detalhes do dispositivo, fuso horário, páginas visitadas, produtos visualizados, sites ou termos de busca que o direcionaram ao nosso site, e informações sobre como você interage com nosso site.</li>
        </ul>

        <h2>Uso de Cookies e Tecnologias de Rastreamento</h2>
        <p>A XpressSEO utiliza cookies, que são pequenos arquivos de texto armazenados no seu dispositivo, e outras tecnologias de rastreamento para melhorar a experiência do usuário em nosso site <a href="https://www.xpressseo.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">www.xpressseo.com</a>, entender como nossos serviços são utilizados e otimizar nossas estratégias de marketing.</p>

        <h3>Tipos de Cookies Utilizados:</h3>
        <ul>
          <li><strong>Cookies Essenciais:</strong> Essenciais para o funcionamento do site, permitindo que você navegue e use suas funcionalidades. Sem esses cookies, serviços como carrinho de compras e processamento de pagamento não podem ser fornecidos.</li>
          <li><strong>Cookies de Desempenho e Analíticos:</strong> Coletam informações sobre como os visitantes usam o nosso site, quais páginas são visitadas com mais frequência e se eles recebem mensagens de erro. Esses cookies são usados apenas para melhorar o desempenho e a experiência do usuário no site.</li>
          <li><strong>Cookies de Funcionalidade:</strong> Permitem que o site lembre de escolhas que você faz (como seu nome de usuário, idioma ou a região em que você está) e forneça recursos aprimorados e mais pessoais.</li>
          <li><strong>Cookies de Publicidade e Redes Sociais:</strong> Usados para oferecer anúncios mais relevantes para você e seus interesses. Eles também são usados para limitar o número de vezes que você vê um anúncio, bem como ajudar a medir a eficácia das campanhas publicitárias.</li>
        </ul>

        <h2>Finalidades do Processamento de Dados</h2>
        <p>Os dados coletados são utilizados para:</p>
        <ul>
          <li>Proporcionar, operar e melhorar nossos serviços e ofertas;</li>
          <li>Processar suas transações e enviar notificações relacionadas a suas compras;</li>
          <li>Personalizar sua experiência de usuário e recomendar conteúdo ou produtos que possam ser do seu interesse;</li>
          <li>Comunicar informações importantes, ofertas e promoções, conforme sua preferência de comunicação;</li>
          <li>Realizar análises internas para desenvolver e aprimorar nossos serviços;</li>
          <li>Cumprir obrigações legais e regulatórias aplicáveis.</li>
        </ul>

        <h2>Compartilhamento e Transferência de Dados Pessoais</h2>
        <p>Nós podemos compartilhar seus dados pessoais com terceiros nas seguintes circunstâncias:</p>
        <ul>
          <li>Com fornecedores de serviços e parceiros que nos auxiliam nas operações de negócio, desde que estes atuem em conformidade com nossas diretrizes de proteção de dados e com a legislação aplicável;</li>
          <li>Para cumprir com obrigações legais, responder a processos judiciais, ou proteger nossos direitos e propriedades, bem como a segurança de nossos clientes e do público;</li>
          <li>Em caso de reestruturação corporativa, venda, fusão ou outra transferência de ativos, garantindo que a entidade receptora concorde em respeitar a privacidade de seus dados de acordo com uma política equivalente à nossa.</li>
        </ul>

        <h2>Links para outros sites e redes sociais</h2>
        <p>Nossa plataforma pode incluir links para sites externos de parceiros, anunciantes e fornecedores. Clicar nesses links implica que você será direcionado para fora do nosso site, entrando em domínios que seguem suas próprias políticas de privacidade, pelas quais não somos responsáveis.</p>
        <p>Recomendamos a leitura atenta dessas políticas antes de fornecer qualquer dado pessoal. Da mesma forma, não assumimos responsabilidade pelas práticas de privacidade de terceiros como Facebook, Apple, Google e Microsoft. Aconselhamos você a se informar sobre as políticas de privacidade dessas entidades ao utilizar seus serviços ou aplicativos.</p>

        <h2>Direitos dos Titulares dos Dados</h2>
        <p>Você possui diversos direitos em relação aos seus dados pessoais, incluindo:</p>
        <ul>
          <li>O direito de acesso, retificação ou exclusão de seus dados pessoais sob nossa posse;</li>
          <li>O direito de limitar ou se opor ao nosso processamento de seus dados;</li>
          <li>O direito à portabilidade de dados;</li>
          <li>O direito de retirar seu consentimento a qualquer momento, quando o processamento for baseado em consentimento.</li>
        </ul>
        <p>Para exercer esses direitos, entre em contato conosco através de <a href="mailto:suporte.xpressseo@gmail.com" className="text-cyan-400 hover:underline">suporte.xpressseo@gmail.com</a>.</p>

        <h2>Segurança dos Dados</h2>
        <p>Implementamos medidas de segurança técnica e organizacional para proteger seus dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, é importante notar que nenhum sistema é completamente seguro. Nos comprometemos a notificar você e qualquer autoridade aplicável de quaisquer brechas de segurança de acordo com a legislação vigente.</p>

        <h2>Alterações na Política de Privacidade</h2>
        <p>Nossa Política de Privacidade pode ser atualizada periodicamente. A versão mais atual será sempre publicada em nosso site, indicando a data da última revisão. Encorajamos você a revisar regularmente nossa política para estar sempre informado sobre como estamos protegendo seus dados.</p>

        <h2>Contato</h2>
        <p>Se tiver dúvidas ou preocupações sobre nossa Política de Privacidade ou práticas de dados, por favor, não hesite em nos contatar em <a href="mailto:suporte.xpressseo@gmail.com" className="text-cyan-400 hover:underline">suporte.xpressseo@gmail.com</a>. Estamos comprometidos em resolver quaisquer questões relacionadas à privacidade de nossos usuários e clientes.</p>
      </div>
    </div>
  );
};

export default PrivacyPage;