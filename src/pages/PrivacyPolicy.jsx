import { useEffect } from "react";
import { SEOHead } from "../components/common";
import { Header, Footer } from "../components/sections";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEOHead
        title="Política de Privacidade - Mok Labs"
        description="Política de Privacidade da Mok Labs - Como coletamos, usamos e protegemos seus dados pessoais"
      />

      <Header />

      <div className="min-h-screen bg-mok-green">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12 prose prose-lg max-w-none">
            <h1 className="text-3xl sm:text-4xl font-bold text-mok-blue mb-4">
              Política de Privacidade
            </h1>

            <p className="text-gray-600 text-sm mb-8">
              <strong>Última atualização:</strong> 19/09/2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-mok-blue mb-4">
                1. Introdução
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Bem-vindo(a) ao site <strong>Mok Labs</strong> (moklabs.com.br).
                Esta Política de Privacidade descreve como coletamos, usamos,
                armazenamos, compartilhamos e protegemos os seus dados pessoais
                quando você utiliza nosso site, bem como quais são os seus
                direitos conforme a legislação aplicável, em especial a Lei
                Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 – LGPD).
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Ao utilizar nosso site, você concorda com esta política. Se não
                concordar com algum dos termos aqui descritos, solicitamos que
                não use nossos serviços.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-mok-blue mb-4">
                2. Dados que coletamos
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Podemos coletar diferentes tipos de dados pessoais, dependendo
                de como você interage conosco. Exemplos de dados que podemos
                coletar:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  Informações de identificação: nome, endereço de e-mail,
                  telefone, empresa, cargo, etc.
                </li>
                <li>
                  Informação de uso: acesso, interações, páginas visualizadas,
                  tempo gasto no site, IP, tipo de navegador, localização
                  aproximada, horários de acesso.
                </li>
                <li>
                  Informações técnicas: dispositivo usado (computador, celular,
                  tablet), sistema operacional, navegador, etc.
                </li>
                <li>
                  Cookies e tecnologias similares para coletar preferências,
                  autenticidade de sessão, rastreamento de uso.
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Se houver coleta de dados sensíveis (como dados de saúde,
                crenças religiosas, orientação sexual, etc.), isso será feito
                somente com consentimento explícito e nas hipóteses permitidas
                por lei.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-mok-blue mb-4">
                3. Base legal para o tratamento
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                De acordo com a LGPD, tratamos seus dados com base em pelo menos
                uma das seguintes hipóteses:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Seu consentimento;</li>
                <li>Cumprimento de obrigação legal ou regulatória;</li>
                <li>Execução de contrato ou de pré-contrato;</li>
                <li>
                  Exercício regular de direitos em processo judicial,
                  administrativo ou arbitral;
                </li>
                <li>
                  Proteção da vida ou da segurança física do titular ou de
                  terceiro;
                </li>
                <li>Tutela da saúde;</li>
                <li>
                  Interesse legítimo do controlador, observado o respeito aos
                  direitos e liberdades fundamentais do titular.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-mok-blue mb-4">
                4. Finalidades do uso dos dados
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Usamos os seus dados para:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  Fornecer, operar, manter e melhorar nosso site e serviços;
                </li>
                <li>
                  Personalizar sua experiência, mostrar conteúdo relevante;
                </li>
                <li>
                  Processar comunicações de contato ou solicitações que você nos
                  fizer (ex: suporte, orçamentos, contato comercial);
                </li>
                <li>
                  Enviar newsletters, atualizações ou marketing, caso você tenha
                  consentido para isso;
                </li>
                <li>Gerenciar contas de usuário, registros, acessos;</li>
                <li>Cumprir obrigações legais ou regulatórias;</li>
                <li>
                  Prevenir fraudes e assegurar a segurança, integridade do site
                  e dos usuários.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-mok-blue mb-4">
                5. Compartilhamento de dados com terceiros
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Podemos compartilhar seus dados com:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  Prestadores de serviço (operadores) que nos auxiliam na
                  operação do site: hospedagem, manutenção, análises, marketing,
                  envio de e-mail, etc.;
                </li>
                <li>
                  Parceiros comerciais, conforme consentimento ou necessidade
                  contratual;
                </li>
                <li>
                  Autoridades públicas, quando exigido por lei ou ordem
                  judicial;
                </li>
                <li>
                  Em caso de venda, fusão, aquisição ou reorganização
                  societária, os seus dados poderão fazer parte dos ativos
                  transferidos (com compromisso de manter privacidade).
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-mok-blue mb-4">
                6. Cookies e tecnologias similares
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Usamos cookies e tecnologias semelhantes para:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Garantir funcionamento técnico do site;</li>
                <li>Lembrar preferências suas;</li>
                <li>
                  Realizar análises e monitoramento de uso, para melhorar o
                  site;
                </li>
                <li>
                  Apresentar conteúdo ou anúncios de acordo com seus interesses,
                  se aplicável.
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Você pode controlar ou desativar cookies via configurações do
                navegador, mas isso pode afetar a experiência de uso.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-mok-blue mb-4">
                7. Armazenamento e segurança dos dados
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  Os dados são armazenados em servidores seguros, e adotamos
                  medidas técnicas e organizacionais razoáveis para protegê-los
                  contra acesso não autorizado, alteração, divulgação ou
                  destruição.
                </li>
                <li>
                  Limitamos o acesso aos dados pessoais apenas a pessoas que
                  precisam deles para desempenhar suas funções ou prestar os
                  serviços necessários.
                </li>
                <li>
                  Mantemos os dados pelo tempo necessário para cumprir as
                  finalidades descritas nesta Política ou conforme exigido por
                  lei. Após esse período, os dados são eliminados ou
                  anonimizados, salvo os que devam ser mantidos por obrigação
                  legal.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-mok-blue mb-4">
                8. Seus direitos
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Você, como titular dos dados, tem os seguintes direitos:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  Confirmação da existência de tratamento de seus dados
                  pessoais;
                </li>
                <li>Acesso aos seus dados;</li>
                <li>
                  Correção de dados incompletos, inexatos ou desatualizados;
                </li>
                <li>
                  Anonimização, bloqueio ou eliminação de dados tratados em
                  desacordo com esta Política ou legislação;
                </li>
                <li>
                  Portabilidade dos dados a outro fornecedor de serviço ou
                  produto, se aplicável;
                </li>
                <li>
                  Eliminação dos dados pessoais tratados com o seu
                  consentimento;
                </li>
                <li>
                  Informação das entidades públicas ou privadas com as quais
                  compartilhamos seus dados;
                </li>
                <li>
                  Informação sobre a possibilidade de não fornecer consentimento
                  e sobre as consequências da negativa;
                </li>
                <li>Revogação do consentimento, quando aplicável;</li>
                <li>
                  Oposição ao tratamento de dados que for baseado em interesse
                  legítimo, salvo nos casos permitidos em lei.
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Para exercer seus direitos, entre em contato conosco pelo e-mail{" "}
                <strong>contato@moklabs.com.br</strong>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-mok-blue mb-4">
                9. Encarregado de proteção de dados
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Designamos um encarregado para tratar de assuntos relacionados à
                proteção de dados pessoais. Ele será o ponto de contato entre
                você, nossa empresa e a Autoridade Nacional de Proteção de Dados
                (ANPD).
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  <strong>Nome:</strong> Diogo Takeuchi
                </li>
                <li>
                  <strong>E-mail:</strong> diogo.takeuchi@moklabs.com.br
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-mok-blue mb-4">
                10. Transferência internacional de dados
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Se for o caso de seus dados serem transferidos para fora do
                Brasil, garantimos que essa transferência ocorra em conformidade
                com a legislação aplicável, adotando-se mecanismos legais
                apropriados (como cláusulas contratuais padrão, garantias
                contratuais etc.), de modo a assegurar nível de proteção
                equivalente ao previsto na LGPD.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-mok-blue mb-4">
                11. Alterações desta Política
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Podemos alterar esta Política de Privacidade de tempos em tempos
                para refletir mudanças em nossas práticas, serviços ou
                exigências legais. Quando isso ocorrer, informaremos você por
                meio do site ou por outros meios apropriados. A nova política
                entrará em vigor na data indicada na parte superior.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-mok-blue mb-4">
                12. Contato
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Se tiver dúvidas, comentários ou solicitações relativas a esta
                Política de Privacidade ou ao tratamento de seus dados pessoais,
                por favor entre em contato com:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Mok Labs</strong>
                  <br />
                  E-mail: contato@moklabs.com.br
                  <br />
                  CNPJ: 47.269.943/0001-88
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PrivacyPolicy;
