/**
 * MÓDULO LEGAL — textos em português europeu (pt-PT).
 *
 * Tradução fiel de src/i18n/messages/es/legal.ts (a fonte de verdade): índice de documentos
 * (título + slug), banner de cookies, cabeçalho/índice das páginas legais, os TRÊS DOCUMENTOS
 * estruturados (privacidade, aviso legal, cookies) e as perguntas frequentes publicadas como
 * FAQPage (JSON-LD).
 *
 * Marcadores disponíveis em qualquer texto (preenchidos por `LegalArticle` com useFormat()):
 *   {tradeName} {companyName} {nif} {registeredOffice} {registry} {email}
 *   {address} {city} {phone} {phoneTel} {siteUrl} {updated} {consentMonths}
 * Ligações: [texto](privacy | legalNotice | cookies | home | carta | https://… | mailto:… | tel:…)
 * Ênfase: **texto**
 *
 * ⚠️ Os `slug` NÃO se traduzem: formam o URL (/legal/<slug>) ligado a partir do rodapé, do
 * sitemap e do hreflang. Os ids das secções mantêm-se iguais aos espanhóis para que as âncoras
 * (#derechos…) resolvam em todos os idiomas. Os marcadores [ASSIM] do responsável vêm de
 * src/data/legal.ts e não se alteram aqui.
 */
import type { LegalMessages } from "@/i18n/messages/es/legal";

const legal: LegalMessages = {
  /* ── Índice (título + slug do URL /legal/<slug>) ── */
  privacy: { title: "Política de privacidade", slug: "privacidad" },
  legalNotice: { title: "Aviso legal", slug: "aviso-legal" },
  cookies: { title: "Política de cookies", slug: "cookies" },
  updated: "Última atualização",

  /* ── Banner de cookies ── */
  banner: {
    title: "Usamos cookies",
    text: "Usamos cookies próprias necessárias para que o site funcione. Com a sua permissão carregamos o mapa do Google e medimos como o site é utilizado com ferramentas de terceiros, que instalam as suas próprias cookies e reconstroem o percurso pelas páginas.",
    accept: "Aceitar todas",
    reject: "Só as necessárias",
    settings: "Configurar",
    save: "Guardar preferências",
    necessary: "Necessárias",
    necessaryDesc: "Imprescindíveis para que o site funcione (idioma, consentimento).",
    maps: "Mapa do Google",
    mapsDesc: "Carrega o mapa do Google Maps na secção de localização. É um serviço da Google, que recebe o seu endereço IP e instala as suas próprias cookies.",
    analytics: "Medição de visitas",
    analyticsDesc: "Saber que páginas são vistas e como se usa o site: Vercel Web Analytics (sem cookies), Google Analytics 4 e Microsoft Clarity. As duas últimas instalam cookies e enviam dados para os EUA. O Clarity reconstrói ainda o seu percurso pela página, e a Microsoft usa o que recolhe para os seus próprios fins, publicidade incluída. O que escreve no chat vai tapado.",
    more: "Mais informação",
    aria: "Aviso de cookies",
    panelTitle: "Preferências de cookies",
    panelText: "Escolha as categorias que permite. Pode mudar de ideias quando quiser em «Configurar cookies», no rodapé.",
    alwaysOn: "Sempre ativas",
    back: "Voltar",
    privacyLink: "Política de privacidade",
    cookiesLink: "Política de cookies",
    saved: "Preferências guardadas.",
    bothChoices: "São duas coisas distintas e pode aceitar uma sem a outra: o mapa só é carregado em «Como chegar»; a medição funciona em todo o site. Não usamos cookies de publicidade: à Google e à Microsoft pede-se expressamente que não as ativem.",
  },

  /* ── Páginas legais: cabeçalho, índice e rodapé ── */
  page: {
    kicker: "Informação legal",
    breadcrumbAria: "Navegação estrutural",
    home: "Início",
    updatedOn: "Última atualização: {date}",
    tocTitle: "Nesta página",
    tocAria: "Índice do documento",
    relatedTitle: "Outros documentos",
    placeholderNote: "Os dados entre parênteses retos estão pendentes de confirmação por parte do titular do site.",
    contactTitle: "Dúvidas sobre os seus dados?",
    contactText: "Escreva-nos para {email} ou ligue-nos para o {phone}. Respondemos no prazo máximo de um mês.",
    backHome: "Voltar ao início",
  },

  /* ══════════════════════════════════════════════════════════════
     DOCUMENTOS
     ══════════════════════════════════════════════════════════════ */
  docs: {
    /* ── Política de privacidade (RGPD + LOPDGDD) ── */
    privacy: {
      description:
        "Como a Tixola Tapería (Ourense) trata os seus dados quando nos escreve, usa o empregado virtual ou navega no site. Direitos, prazos e subcontratantes.",
      intro:
        "Na {tradeName} tratamos muito poucos dados e apenas os imprescindíveis: os que nos dá se nos ligar ou nos escrever, as perguntas que faz ao empregado virtual e a informação técnica mínima para que o site funcione. O site não tem formulários nem recolhe dados por si só. Aqui contamos-lhe, sem letras miudinhas, o que fazemos com eles.",
      sections: [
        {
          id: "responsable",
          title: "1. Responsável pelo tratamento",
          blocks: [
            {
              type: "dl",
              items: [
                { term: "Titular", desc: "{companyName}" },
                { term: "NIF", desc: "{nif}" },
                { term: "Sede social", desc: "{registeredOffice}" },
                { term: "Nome comercial e estabelecimento", desc: "{tradeName} · {address}" },
                { term: "Telefone", desc: "[{phone}](tel:{phoneTel})" },
                { term: "Correio eletrónico", desc: "{email}" },
              ],
            },
            {
              type: "p",
              text: "Não estamos obrigados a designar um Encarregado de Proteção de Dados (art. 37.º do RGPD e art. 34.º da LOPDGDD). Para qualquer questão sobre os seus dados, escreva-nos para {email}.",
            },
          ],
        },
        {
          id: "datos",
          title: "2. Que dados tratamos e de onde provêm",
          blocks: [
            { type: "p", text: "Todos os dados são fornecidos diretamente por si. Não compramos dados nem os obtemos de terceiros." },
            {
              type: "dl",
              items: [
                {
                  term: "Consultas por telefone ou WhatsApp",
                  desc: "O que decidir contar-nos quando nos liga ou nos escreve: normalmente o seu nome e o seu telefone. **O site não tem qualquer formulário**: as ligações de telefonar e de WhatsApp abrem a sua própria aplicação, pelo que nenhum dado passa pelos nossos servidores. Não aceitamos reservas, pelo que também não guardamos listas de nomes, datas nem horas.",
                },
                {
                  term: "Empregado virtual",
                  desc: "O texto das suas perguntas e respostas durante a sessão, o idioma e a página a partir da qual escreve. Não lhe pedimos dados pessoais para o usar e recomendamos que não os inclua.",
                },
                {
                  term: "Navegação",
                  desc: "Dados técnicos gerados por qualquer visita (endereço IP, tipo de navegador, páginas pedidas), tratados pelo nosso fornecedor de alojamento por motivos de segurança; o idioma escolhido (cookie NEXT_LOCALE) e a sua decisão sobre cookies (armazenamento local tixola_consent). **Só se aceitar a medição**, além disso: as páginas que vê, de onde chega, o seu navegador e o seu dispositivo, a sua cidade aproximada e —unicamente com o Microsoft Clarity— o percurso que faz pela página (cliques, deslocamento e movimentos do rato), tudo isso associado a um identificador que não leva o seu nome.",
                },
                {
                  term: "Alergias e intolerâncias",
                  desc: "Se no-las contar por telefone, por WhatsApp ou no próprio estabelecimento, usamo-las unicamente para lhe preparar o prato com segurança. São dados de categoria especial (art. 9.º do RGPD) que tratamos com o seu consentimento explícito, manifestado ao fornecê-los, e que não anotamos nem conservamos para além do serviço. Se as escrever no empregado virtual, esse texto viaja com o resto da mensagem para a Anthropic (EUA), com as garantias do ponto 6; não o guardamos nos nossos servidores e desaparece do seu navegador ao premir «Nova conversa» ou ao fechar o separador. É por isso que o próprio chat lhe pede que não escreva dados de saúde: para o ajudar com a ementa não são precisos.",
                },
              ],
            },
          ],
        },
        {
          id: "finalidades",
          title: "3. Finalidades, fundamento jurídico e conservação",
          blocks: [
            {
              type: "table",
              caption: "Para que usamos os seus dados, com que fundamento legal e durante quanto tempo",
              head: ["Finalidade", "Fundamento jurídico", "Conservação"],
              rows: [
                [
                  "Responder às suas consultas por telefone ou WhatsApp",
                  "O seu consentimento ao escrever-nos ou ligar-nos (art. 6.º, n.º 1, al. a) do RGPD)",
                  "O tempo que durar a conversa; depois é apagada periodicamente",
                ],
                [
                  "Responder às suas perguntas através do empregado virtual",
                  "O seu consentimento ao iniciar a conversa (art. 6.º, n.º 1, al. a) do RGPD)",
                  "Só durante a sessão de navegação; não se guarda nos nossos servidores. O fornecedor do modelo elimina a conversa dos seus sistemas no máximo em 30 dias",
                ],
                [
                  "Garantir a segurança e o funcionamento técnico do site",
                  "Interesse legítimo na segurança da rede e da informação (art. 6.º, n.º 1, al. f) do RGPD, considerando 49)",
                  "Registos técnicos do fornecedor de alojamento durante um período limitado",
                ],
                [
                  "Recordar o seu idioma e a sua decisão sobre cookies",
                  "Interesse legítimo / cookies técnicas isentas de consentimento (art. 22.º, n.º 2, da LSSI-CE)",
                  "12 meses",
                ],
                [
                  "Medir a utilização do site: páginas vistas, mapas de calor e percurso pela página",
                  "O seu consentimento no banner de cookies (art. 6.º, n.º 1, al. a) do RGPD)",
                  "Google Analytics, 2 meses os dados de utilizador (o seu ajuste por defeito). Microsoft Clarity, 30 dias as gravações de sessão —até 9 meses as marcadas e uma amostra— e 9 meses os mapas de calor. As cookies, o que diz a [Política de cookies](cookies)",
                ],
                [
                  "Responder ao exercício dos seus direitos e cumprir obrigações legais",
                  "Obrigação legal (art. 6.º, n.º 1, al. c) do RGPD)",
                  "Durante os prazos de prescrição das responsabilidades legais",
                ],
              ],
            },
            {
              type: "p",
              text: "Não tomamos decisões automatizadas com efeitos jurídicos sobre si nem elaboramos perfis. Não enviamos comunicações comerciais.",
            },
          ],
        },
        {
          id: "camarero-virtual",
          title: "4. O empregado virtual (inteligência artificial)",
          blocks: [
            {
              type: "p",
              text: "O empregado virtual é um assistente que responde sobre a ementa, os alergénios, o horário e como chegar. Para gerar cada resposta, as suas mensagens são enviadas, através do nosso servidor, à **Anthropic PBC**, fornecedora do modelo de linguagem Claude, que atua como subcontratante.",
            },
            {
              type: "ul",
              items: [
                "**Não armazenamos a conversa nos nossos servidores**: é processada no momento para responder e não existe nenhuma base de dados de chats. Apenas contamos os pedidos por endereço IP durante dez minutos, em memória, para evitar abusos.",
                "No seu navegador, a conversa é guardada no armazenamento de sessão (sessionStorage) para que não se perca ao mudar de página; desaparece ao fechar o separador e pode apagá-la a qualquer momento com o botão do próprio chat.",
                "A Anthropic tem sede nos Estados Unidos. A transferência assenta em garantias adequadas: cláusulas contratuais-tipo aprovadas pela Comissão Europeia e, quando aplicável, a adesão do fornecedor ao Quadro de Privacidade de Dados UE-EUA, de acordo com a sua documentação em vigor. Segundo as suas condições comerciais, a Anthropic não utiliza o conteúdo enviado por API para treinar os seus modelos e, de acordo com a sua documentação em vigor, elimina as entradas e saídas dos seus sistemas no máximo em 30 dias, salvo se tiver de as conservar mais tempo por lei ou se o seu sistema detetar uma utilização que viole as suas políticas (nesse caso, até 2 anos).",
                "Se não houver ligação ao fornecedor, responde um motor local com a ementa e o horário, sem enviar nada para o exterior.",
                "As respostas são geradas automaticamente e podem conter erros. **Para alergias e intolerâncias, confirme sempre com o nosso pessoal no estabelecimento.**",
                "Não escreva dados pessoais seus nem de terceiros (nomes, telefones, dados de saúde) no chat: não precisamos deles para o ajudar.",
              ],
            },
          ],
        },
        {
          id: "destinatarios",
          title: "5. Destinatários e subcontratantes",
          blocks: [
            {
              type: "p",
              text: "Não vendemos nem cedemos os seus dados. Os três primeiros desta lista são **subcontratantes**: tratam dados **por nossa conta**, seguindo as nossas instruções e com um contrato em conformidade com o art. 28.º do RGPD. Os quatro últimos **não o são**: recebem dados porque o respetivo conteúdo é carregado no site ou porque clica na respetiva ligação, e decidem por sua conta o que fazem com eles, sob a sua própria política de privacidade. Note que a Google aparece duas vezes: é nossa subcontratante para a medição e não o é para o mapa.",
            },
            {
              type: "dl",
              items: [
                {
                  term: "Vercel Inc. (EUA)",
                  desc: "Alojamento e entrega do site e, se aceitar, a medição de visitas (Vercel Web Analytics). Processa os dados técnicos de cada visita (IP, cabeçalhos) e os registos de segurança. Aderente ao Quadro de Privacidade de Dados UE-EUA e com cláusulas contratuais-tipo. [Política de privacidade da Vercel](https://vercel.com/legal/privacy-policy).",
                },
                {
                  term: "Anthropic PBC (EUA)",
                  desc: "Geração das respostas do empregado virtual (ver ponto 4). [Política de privacidade da Anthropic](https://www.anthropic.com/legal/privacy).",
                },
                {
                  term: "Google Ireland Ltd. / Google LLC — Google Analytics 4",
                  desc: "Medição de visitas, **só se a aceitar**. Aqui a Google é, sim, nossa subcontratante: di-lo a sua própria documentação do Analytics, e o contrato são os Termos de tratamento de dados do Google Ads, que para uma empresa do Espaço Económico Europeu já fazem parte do serviço sem formalidade à parte. Recebe as páginas que vê, o seu navegador e dispositivo e a sua cidade aproximada, e instala duas cookies neste mesmo domínio. A Google declara que os dados de visitantes do EEE são recolhidos em servidores do EEE e que **não regista nem armazena o seu endereço IP**: usa-o para deduzir a cidade e descarta-o no ato. [Como a Google trata os dados](https://business.safety.google/privacy/).",
                },
                {
                  term: "Microsoft Corporation / Microsoft Ireland Operations Ltd. — Microsoft Clarity",
                  desc: "Mapas de calor e reconstrução do percurso pela página, **só se a aceitar**. **A Microsoft não é nossa subcontratante**, e convém sabê-lo: as suas condições dizem expressamente que a Microsoft e nós somos responsáveis independentes, pelo que decide por sua conta o que faz com o que recolhe e reserva-se o direito de o usar para os seus próprios fins, incluindo a elaboração de perfis para fins publicitários. Pedimos-lhe expressamente que **não** ative o seu armazenamento publicitário, de modo que não instala a sua cookie de publicidade nem partilha os dados com o Microsoft Ads. O que escreve no empregado virtual e o que este lhe responde vão tapados e não chegam a sair do seu navegador. [Declaração de privacidade da Microsoft](https://privacy.microsoft.com/privacystatement).",
                },
                {
                  term: "Google LLC — Google Maps",
                  desc: "Mapa do Google Maps incorporado na secção «Como chegar». **Só é carregado se aceitar as cookies** (ou se o pedir manualmente no separador «Mapa» dessa secção); nesse momento a Google recebe o seu endereço IP e pode instalar as suas próprias cookies. Aqui a Google **não** atua por nossa conta. As ligações para o Google Maps e para as avaliações do Google abrem sites da Google. [Política de privacidade da Google](https://policies.google.com/privacy).",
                },
                {
                  term: "Meta Platforms Ireland Ltd. (WhatsApp)",
                  desc: "Se optar por nos escrever pelo WhatsApp, a comunicação decorre nessa aplicação e rege-se pelas suas condições e pela sua política de privacidade. Nós recebemos apenas a mensagem que decidir enviar.",
                },
                {
                  term: "TripAdvisor LLC",
                  desc: "Ligações para a nossa ficha e avaliações. Abrem um site de terceiros com a sua própria política de privacidade; não partilhamos dados com o TripAdvisor.",
                },
              ],
            },
            {
              type: "p",
              text: "Por outras palavras: pela Vercel, pela Anthropic e pelo Google Analytics respondemos nós, e dos três pode pedir-nos cópia das garantias do ponto 6. Pela Microsoft, pelo mapa do Google, pela Meta e pelo TripAdvisor não respondemos: o que podemos fazer —e fazemos— é dizer-lhe quando intervêm e deixar que o evite. Nada disso é carregado se não o aceitar, e as ligações só abrem se clicar nelas.",
            },
            {
              type: "p",
              text: "Poderemos também comunicar dados às autoridades competentes quando uma norma nos obrigar a isso.",
            },
          ],
        },
        {
          id: "transferencias",
          title: "6. Transferências internacionais",
          blocks: [
            {
              type: "p",
              text: "A Vercel, a Anthropic, a Google e a Microsoft podem tratar dados nos Estados Unidos. Em todos os casos existem garantias adequadas nos termos do capítulo V do RGPD: cláusulas contratuais-tipo aprovadas pela Comissão Europeia e, quando o fornecedor está certificado, o Quadro de Privacidade de Dados UE-EUA. A Google LLC e a Microsoft Corporation figuram com certificação ativa nesse quadro (verificado na lista oficial em 20 de outubro de 2026), e a Google declara acolher-se a ele para as transferências dos seus produtos de medição. Pode pedir-nos uma cópia das garantias aplicáveis escrevendo para {email}.",
            },
          ],
        },
        {
          id: "derechos",
          title: "7. Os seus direitos",
          blocks: [
            {
              type: "p",
              text: "Pode exercer a qualquer momento, gratuitamente, os direitos que o RGPD lhe reconhece:",
            },
            {
              type: "ul",
              items: [
                "**Acesso**: saber que dados seus tratamos.",
                "**Retificação**: corrigir dados inexatos ou incompletos.",
                "**Apagamento**: pedir que apaguemos os seus dados quando já não forem necessários.",
                "**Oposição** e **limitação do tratamento**.",
                "**Portabilidade**: receber os seus dados num formato estruturado, de uso corrente.",
                "**Retirar o consentimento** a qualquer momento, sem que isso afete a licitude do tratamento anterior (por exemplo, mudando a sua decisão sobre cookies).",
              ],
            },
            {
              type: "p",
              text: "Para os exercer, escreva-nos para {email} ou por correio postal para {companyName}, {registeredOffice}, indicando que direito pretende exercer e juntando um documento que comprove a sua identidade (ou um meio equivalente). Responderemos no prazo máximo de um mês.",
            },
            {
              type: "p",
              text: "Se considerar que não atendemos corretamente os seus direitos, pode apresentar uma reclamação junto da **Agencia Española de Protección de Datos** (AEPD), C/ Jorge Juan, 6, 28001 Madrid, ou através da sua sede eletrónica em [www.aepd.es](https://www.aepd.es). Antes disso, se preferir, pode dirigir-se a nós para que o resolvamos.",
            },
          ],
        },
        {
          id: "menores",
          title: "8. Menores de idade",
          blocks: [
            {
              type: "p",
              text: "O site não se dirige a menores de 14 anos e não recolhemos conscientemente dados de menores. Se detetarmos dados de um menor sem a autorização dos pais ou tutores, iremos eliminá-los.",
            },
          ],
        },
        {
          id: "seguridad",
          title: "9. Medidas de segurança",
          blocks: [
            {
              type: "p",
              text: "Aplicamos o princípio da minimização: o site não tem formulários, nem registo de utilizadores, nem base de dados de clientes. Toda a comunicação circula cifrada (HTTPS), os fornecedores envolvidos oferecem garantias contratuais e técnicas adequadas, e o acesso às mensagens recebidas está limitado ao pessoal do estabelecimento.",
            },
          ],
        },
        {
          id: "cambios",
          title: "10. Alterações a esta política",
          blocks: [
            {
              type: "p",
              text: "Podemos atualizar esta política para a adaptar a alterações legais ou do serviço; a última vez foi ao incorporar o Google Analytics e o Microsoft Clarity, e por isso o aviso de cookies voltou a perguntar-lhe. A versão em vigor é sempre a publicada nesta página, com a sua data de última atualização ({updated}). Consulte também o [Aviso legal](legalNotice) e a [Política de cookies](cookies).",
            },
          ],
        },
      ],
    },

    /* ── Aviso legal (LSSI-CE) ── */
    legalNotice: {
      description:
        "Aviso legal do site da Tixola Tapería (Ourense): titular, condições de utilização, propriedade intelectual, exclusão de responsabilidade e legislação aplicável.",
      intro:
        "Em cumprimento da Lei espanhola 34/2002, de 11 de julho, de serviços da sociedade da informação e de comércio eletrónico (LSSI-CE), informamos quem está por trás deste site e quais as condições que regem a sua utilização.",
      sections: [
        {
          id: "titular",
          title: "1. Dados de identificação do titular",
          blocks: [
            {
              type: "dl",
              items: [
                { term: "Titular", desc: "{companyName}" },
                { term: "NIF", desc: "{nif}" },
                { term: "Sede social", desc: "{registeredOffice}" },
                { term: "Dados de registo", desc: "{registry}" },
                { term: "Nome comercial", desc: "{tradeName}" },
                { term: "Estabelecimento", desc: "{address}" },
                { term: "Telefone", desc: "[{phone}](tel:{phoneTel})" },
                { term: "Correio eletrónico", desc: "{email}" },
                { term: "Site", desc: "[{siteUrl}]({siteUrl})" },
              ],
            },
            {
              type: "p",
              text: "A {tradeName} é um estabelecimento de restauração (casa de tapas e vinoteca) situado no centro histórico de {city}, junto à Catedral de San Martiño. Tem à disposição da clientela, no próprio estabelecimento, as folhas de reclamação oficiais da Xunta de Galicia (o equivalente espanhol do livro de reclamações).",
            },
          ],
        },
        {
          id: "objeto",
          title: "2. Objeto e aceitação",
          blocks: [
            {
              type: "p",
              text: "Este site tem uma finalidade exclusivamente informativa: dar a conhecer o estabelecimento, a sua ementa, o seu horário e as suas formas de contacto. Não se vende nem se contrata nada através do site, nem se reservam mesas. O acesso e a navegação atribuem a condição de pessoa utilizadora e implicam a aceitação deste Aviso legal, da [Política de privacidade](privacy) e da [Política de cookies](cookies).",
            },
            {
              type: "ul",
              items: [
                "Os preços publicados são os que se pagam, com IVA incluído; podem ser atualizados e, nesse caso, vigora o preço da ementa da casa. A disponibilidade dos pratos e as harmonizações, essas sim, são indicativas: dependem da época e do produto que houver nesse dia.",
                "O horário pode ser alterado em feriados, férias ou por motivos de força maior.",
                "O estabelecimento **não aceita reservas**: as mesas são ocupadas por ordem de chegada.",
              ],
            },
          ],
        },
        {
          id: "condiciones",
          title: "3. Condições de utilização",
          blocks: [
            {
              type: "p",
              text: "Compromete-se a utilizar o site e os seus serviços (incluindo o empregado virtual) de forma lícita e de boa-fé. Em particular, não é permitido:",
            },
            {
              type: "ul",
              items: [
                "Fazer extrações em massa ou automatizadas de conteúdos (scraping) nem sobrecarregar deliberadamente o serviço.",
                "Introduzir vírus, código malicioso ou qualquer elemento que possa danificar os sistemas próprios ou de terceiros.",
                "Usurpar a identidade de outras pessoas ou do próprio estabelecimento.",
                "Utilizar o empregado virtual para fins alheios à informação sobre o estabelecimento, para tentar obter as suas instruções internas ou para gerar conteúdos ilícitos ou ofensivos.",
              ],
            },
            {
              type: "p",
              text: "Para proteger o serviço, o empregado virtual aplica limites de utilização por endereço IP e pode recusar pedidos que os ultrapassem.",
            },
          ],
        },
        {
          id: "propiedad-intelectual",
          title: "4. Propriedade intelectual e industrial",
          blocks: [
            {
              type: "p",
              text: "O design do site, o logótipo «Tixola», os textos, as fotografias, as ilustrações, os modelos tridimensionais e o código-fonte são propriedade de {companyName} ou dos seus licenciantes e estão protegidos pela legislação de propriedade intelectual e industrial. É proibida a sua reprodução, distribuição, comunicação pública ou transformação, total ou parcial, sem autorização expressa, salvo para uso pessoal e privado da informação.",
            },
            {
              type: "p",
              text: "Os ícones de interface provêm da biblioteca Lucide (licença ISC). As marcas e logótipos de terceiros que aparecem no site (Google, Google Maps, WhatsApp, TripAdvisor) pertencem aos respetivos titulares e são utilizados unicamente para identificar os serviços para os quais remetemos.",
            },
          ],
        },
        {
          id: "responsabilidad",
          title: "5. Exclusão de responsabilidade",
          blocks: [
            {
              type: "ul",
              items: [
                "**Disponibilidade**: procuramos que o site funcione sem interrupções, mas não garantimos a sua disponibilidade permanente nem a ausência de erros. Não respondemos por danos decorrentes de interrupções, vírus ou falhas alheias ao nosso controlo.",
                "**Conteúdos**: a informação é oferecida de boa-fé e revista periodicamente; ainda assim, pode conter erros tipográficos ou dados desatualizados (preços, horário, pratos). Reservamo-nos o direito de a alterar sem aviso prévio.",
                "**Alergénios**: a informação sobre alergénios da ementa é indicativa. Na cozinha manipulam-se os 14 alergénios de declaração obrigatória (Regulamento (UE) n.º 1169/2011) e não podemos excluir vestígios. A informação válida e atualizada é a fornecida pelo pessoal no estabelecimento; consulte-a sempre antes de pedir.",
                "**Empregado virtual**: as suas respostas são geradas por inteligência artificial e podem ser inexatas ou incompletas. Têm carácter meramente informativo e não substituem a confirmação do pessoal do estabelecimento, sobretudo em matéria de alergias e preços.",
                "**Ligações**: o site contém ligações para sites de terceiros (Google Maps, WhatsApp, TripAdvisor) sobre cujos conteúdos e políticas não temos controlo nem assumimos responsabilidade.",
              ],
            },
          ],
        },
        {
          id: "proteccion-de-datos",
          title: "6. Proteção de dados e cookies",
          blocks: [
            {
              type: "p",
              text: "O tratamento dos dados pessoais rege-se pela nossa [Política de privacidade](privacy). A utilização de cookies e tecnologias semelhantes é explicada na [Política de cookies](cookies), onde também pode alterar as suas preferências.",
            },
          ],
        },
        {
          id: "legislacion",
          title: "7. Legislação aplicável e jurisdição",
          blocks: [
            {
              type: "p",
              text: "Este Aviso legal rege-se pela legislação espanhola. Para qualquer litígio decorrente do acesso ou utilização do site, as partes submetem-se aos tribunais do domicílio da pessoa utilizadora quando esta tiver a condição de consumidora; nos restantes casos, aos tribunais de {city}. Como consumidor ou consumidora, dispõe ainda das folhas de reclamação oficiais da Xunta de Galicia no próprio estabelecimento.",
            },
            {
              type: "p",
              text: "Data da última atualização: {updated}.",
            },
          ],
        },
      ],
    },

    /* ── Política de cookies ── */
    cookies: {
      description:
        "Que cookies e armazenamento local utiliza o site da Tixola Tapería, para que servem, quanto duram e como pode aceitá-las, recusá-las ou mudar a sua decisão.",
      intro:
        "Este site usa poucas cookies, e todas as que se instalam por defeito são técnicas: servem para recordar o seu idioma e a sua decisão sobre as próprias cookies. As restantes —as do mapa do Google e as da medição— não se instalam até que diga que sim. Aqui ficam os detalhes, com nomes e prazos, e como mudar de ideias.",
      sections: [
        {
          id: "que-son",
          title: "1. O que são as cookies e tecnologias semelhantes",
          blocks: [
            {
              type: "p",
              text: "Uma cookie é um pequeno ficheiro que o site guarda no seu navegador para recordar informação entre visitas ou durante a navegação. Utilizamos também tecnologias equivalentes, como o **armazenamento local** (localStorage) e o **armazenamento de sessão** (sessionStorage) do navegador, às quais se aplica a mesma regulamentação (art. 22.º, n.º 2, da LSSI-CE e Guia sobre a utilização de cookies da AEPD).",
            },
          ],
        },
        {
          id: "cookies-que-usamos",
          title: "2. Cookies e armazenamento que utilizamos",
          blocks: [
            {
              type: "table",
              caption: "Inventário de cookies e armazenamento do navegador",
              head: ["Nome", "Tipo", "Titular", "Finalidade", "Duração"],
              rows: [
                ["NEXT_LOCALE", "Técnica (cookie)", "Própria", "Recorda o idioma que escolheu (español, galego, English, português) para lhe mostrar o site nesse idioma.", "12 meses"],
                [
                  "tixola_consent",
                  "Técnica (localStorage)",
                  "Própria",
                  "Guarda as suas duas decisões —mapa do Google e medição de visitas— para não voltar a perguntar em cada visita.",
                  "{consentMonths} meses",
                ],
                ["tixola_promo_cerrada", "Técnica (localStorage)", "Própria", "Recorda que fechou o aviso da promoção do mês para não voltar a mostrá-lo.", "Até que seja publicada outra promoção ou apague os dados do navegador"],
                [
                  "tixola:waiter:*",
                  "Técnica (sessionStorage)",
                  "Própria",
                  "Conserva a conversa com o empregado virtual enquanto o separador está aberto, para que não se perca ao mudar de página.",
                  "Sessão (apaga-se ao fechar o separador)",
                ],
                [
                  "Cookies do Google Maps",
                  "De terceiros",
                  "Google LLC",
                  "Só se aceitar as cookies, ou se carregar o mapa manualmente na secção «Como chegar»: depois de carregado, a Google pode instalar as suas próprias cookies (por exemplo NID ou CONSENT) de acordo com a sua política.",
                  "Segundo a Google (até 6 meses ou mais)",
                ],
                [
                  "Vercel Web Analytics",
                  "Opcional (análise)",
                  "Vercel Inc. (EUA)",
                  "Medir de forma agregada que páginas são visitadas, de onde se chega, com que navegador e de que cidade aproximada. **Não instala qualquer cookie nem guarda nada no seu navegador**: a Vercel identifica a sessão com um código que calcula no seu servidor e descarta-o ao fim de 24 horas. Só é carregado se aceitar.",
                  "Não usa cookies",
                ],
                [
                  "_ga e _ga_RPV2JX7ZXW",
                  "Opcional (análise)",
                  "Google (próprias, neste domínio)",
                  "São instaladas pelo Google Analytics 4 se aceitar a medição. Guardam um identificador aleatório que distingue um navegador de outro e mantém o estado da sessão, para saber quanta gente entra e que páginas vê. Não levam o seu nome. São as duas únicas que instala enquanto a conta não estiver ligada ao Google Ads, e não está.",
                  "2 anos desde a sua última visita, segundo a Google. Na prática costuma ser menos: os navegadores encurtam por sua conta as cookies próprias (Chrome, 400 dias; Safari, 7)",
                ],
                [
                  "_clck e _clsk",
                  "Opcional (análise)",
                  "Microsoft (próprias, neste domínio)",
                  "São instaladas pelo Microsoft Clarity se aceitar a medição. Uma guarda o identificador com que o Clarity o reconhece entre visitas e a outra liga as páginas que vê dentro de uma mesma visita. Se recusar, o Clarity apaga as suas.",
                  "A Microsoft não publica a sua duração. O que publica, isso sim, é quanto tempo guarda os dados: 30 dias as gravações de sessão e 9 meses os mapas de calor",
                ],
                [
                  "CLID, ANONCHK, MR, SM",
                  "Opcional (análise)",
                  "Microsoft Corporation (de terceiros)",
                  "Cookies de domínio da Microsoft que o Clarity pode instalar juntamente com as anteriores. Giram em torno da MUID, o identificador de navegador da Microsoft. **A MUID não se instala**: a sua própria documentação descreve-a como cookie usada também para publicidade, e este site pede expressamente à Microsoft que não ative o armazenamento publicitário.",
                  "A Microsoft não publica a sua duração",
                ],
              ],
            },
            {
              type: "note",
              text: "Não utilizamos cookies publicitárias nem de redes sociais, e não o seguimos de um site para outro com fins comerciais. A Google e a Microsoft permitem pedir-lhes que não ativem o seu armazenamento publicitário, e é o que este site lhes pede logo que aceita: por isso a Microsoft não instala a MUID —a cookie que a sua documentação descreve como publicitária— nem partilha nada com o Microsoft Ads.",
            },
          ],
        },
        {
          id: "base-legal",
          title: "3. Fundamento legal",
          blocks: [
            {
              type: "p",
              text: "As cookies técnicas (NEXT_LOCALE, tixola_consent e o armazenamento do empregado virtual) são necessárias para prestar o serviço que solicita e estão isentas de consentimento nos termos do art. 22.º, n.º 2, da LSSI-CE. Todas as restantes —a medição e as que o mapa instala ao carregar-se— só são utilizadas com o seu consentimento, que pode retirar quando quiser. Nenhuma delas pode acolher-se à isenção que a AEPD reconhece à medição de audiência: essa isenção exige que o fornecedor atue por conta exclusiva do editor e produza apenas estatísticas anónimas, e nem o Google Analytics nem o Clarity encaixam aí. É por isso que se perguntam.",
            },
          ],
        },
        {
          id: "gestionar",
          title: "4. Como aceitar, recusar ou mudar a sua decisão",
          blocks: [
            {
              type: "p",
              text: "Na sua primeira visita aparece um aviso com três opções: **Aceitar todas**, **Só as necessárias** ou **Configurar** (para escolher categoria a categoria). A sua decisão é guardada durante {consentMonths} meses; passado esse prazo, voltaremos a perguntar. Pode alterá-la quando quiser:",
            },
            {
              type: "cookieSettings",
              label: "Configurar cookies",
              hint: "Abre o painel de preferências deste site.",
            },
            {
              type: "p",
              text: "Pode também apagar ou bloquear as cookies nas definições do seu navegador. Tenha em conta que, se bloquear as técnicas, o site deixará de recordar o seu idioma e a sua escolha:",
            },
            {
              type: "ul",
              items: [
                "[Google Chrome](https://support.google.com/chrome/answer/95647?hl=pt-PT)",
                "[Mozilla Firefox](https://support.mozilla.org/pt-PT/kb/clear-cookies-and-site-data-firefox)",
                "[Safari (Mac)](https://support.apple.com/pt-pt/guide/safari/sfri11471/mac) e [Safari (iPhone/iPad)](https://support.apple.com/pt-pt/HT201265)",
                "[Microsoft Edge](https://support.microsoft.com/pt-pt/microsoft-edge)",
              ],
            },
          ],
        },
        {
          id: "medicion",
          title: "5. A medição: Google Analytics e Microsoft Clarity",
          blocks: [
            {
              type: "p",
              text: "Se aceitar a medição carregam-se três ferramentas e convém saber o que faz cada uma, porque não são a mesma coisa nem incomodam o mesmo.",
            },
            {
              type: "dl",
              items: [
                {
                  term: "Vercel Web Analytics",
                  desc: "A mais discreta: conta páginas vistas e pouco mais, sem instalar nada no seu navegador. É da mesma empresa que aloja o site.",
                },
                {
                  term: "Google Analytics 4",
                  desc: "Conta visitas e páginas com as duas cookies da tabela acima. A Google atua aqui **por nossa conta**, como subcontratante, e declara que não regista nem armazena o endereço IP dos visitantes do Espaço Económico Europeu: usa-o para deduzir a cidade e descarta-o. Os dados de utilizador são conservados 2 meses, que é o ajuste por defeito da ferramenta.",
                },
                {
                  term: "Microsoft Clarity",
                  desc: "A mais intrusiva das três, e por isso explica-se à parte. Não grava o ecrã: **reconstrói a visita** a partir do conteúdo da página e do que faz nela —cliques, deslocamento, movimentos do rato, mudanças de tamanho da janela—, e com isso desenha mapas de calor e uma reprodução do percurso. A Microsoft **não** é nossa subcontratante: as suas condições dizem que a Microsoft e nós somos responsáveis independentes, e reserva-se o direito de usar o que recolhe para os seus próprios fins, incluindo a elaboração de perfis para fins publicitários. A Microsoft guarda as gravações de sessão 30 dias (até 9 meses as marcadas e uma amostra escolhida ao acaso) e os mapas de calor 9 meses.",
                },
              ],
            },
            {
              type: "note",
              text: "**O que escreve no empregado virtual fica de fora.** As bolhas da conversa, o que o empregado lhe responde e os botões de perguntas rápidas vão marcados para que o Clarity os tape, e o que está tapado não chega a sair do seu navegador: não é enviado nem se pode ver numa gravação. Não é um detalhe de cortesia — aí as pessoas escrevem as suas alergias, que são dados de saúde, e as próprias condições do Clarity proíbem enviá-los à Microsoft.",
            },
            {
              type: "p",
              text: "Pode recusar a medição inteira a partir do aviso de cookies, mudar de ideias quando quiser com o botão acima e, além disso, excluir-se nos sistemas dos próprios fornecedores: [complemento da Google para desativar o Analytics](https://tools.google.com/dlpage/gaoptout) e [Declaração de privacidade da Microsoft](https://privacy.microsoft.com/privacystatement). Se recusar, o Clarity apaga as suas próprias cookies e este site apaga as da Google que consegue alcançar; o que não se puder apagar caduca por si e, sem consentimento, deixa de se enviar qualquer dado.",
            },
          ],
        },
        {
          id: "terceros",
          title: "6. O mapa do Google",
          blocks: [
            {
              type: "p",
              text: "A secção «Como chegar» mostra um mapa ilustrado próprio que não instala nada. O mapa real do Google Maps é carregado se tiver aceitado as cookies; caso contrário, esse separador pede autorização e nada é carregado até clicar em «Ver mapa real». Quando é carregado, o seu navegador liga-se à Google, que recebe o seu endereço IP e pode instalar cookies de acordo com a sua [política de privacidade](https://policies.google.com/privacy) e a sua [informação sobre cookies](https://policies.google.com/technologies/cookies). Se preferir não o carregar, recuse as cookies, use a ligação «Abrir no Google Maps» ou venha a pé: estamos a um minuto da Catedral.",
            },
          ],
        },
        {
          id: "actualizaciones",
          title: "7. Atualizações desta política",
          blocks: [
            {
              type: "p",
              text: "Reveremos esta política sempre que mudarem as cookies que utilizamos ou a regulamentação aplicável. A última vez foi ao acrescentar o Google Analytics e o Microsoft Clarity: como isso muda o que verdadeiramente acontece ao aceitar, as decisões guardadas antes foram descartadas e o aviso voltou a perguntar a todos. Data da última atualização: {updated}. Mais informação sobre o tratamento dos seus dados na [Política de privacidade](privacy) e sobre o titular no [Aviso legal](legalNotice).",
            },
          ],
        },
      ],
    },
  },

  /* ══════════════════════════════════════════════════════════════
     PERGUNTAS FREQUENTES (FAQPage JSON-LD na página inicial)
     Marcadores: {hours} (horário semanal gerado), {phone}, {address}
     ══════════════════════════════════════════════════════════════ */
  faq: {
    title: "Perguntas frequentes",
    items: [
      {
        q: "Qual é o horário da Tixola Tapería?",
        a: "O nosso horário habitual é: {hours}. Em feriados e férias pode variar: consulte o estado «Aberto agora» no site ou ligue-nos para o {phone}.",
      },
      {
        q: "É preciso reservar mesa?",
        a: "Não. Na Tixola não aceitamos reservas: as mesas são ocupadas por ordem de chegada, tanto no interior como na esplanada. As melhores horas para encontrar lugar são a da abertura, as 13:00 e as 20:00. Se vier com um grupo grande, ligue-nos para o {phone} e dizemos-lhe qual a hora que mais lhe convém.",
      },
      {
        q: "Têm opções para celíacos e informação sobre alergénios?",
        a: "Sim, com uma ressalva importante. A ementa do site indica os 14 alergénios de declaração obrigatória de cada prato e permite filtrar por aquele que quiser evitar. Dito isto, os únicos pratos que declaramos sem glúten são as **Croquetas sin gluten** (croquetes sem glúten) e o **Postre sin gluten** (sobremesa sem glúten); dos restantes dizemos o que levam, nunca o que não levam. Na cozinha manipulam-se os 14 alergénios, por isso avise sempre o pessoal ao pedir e confirmamos-lhe tudo de imediato.",
      },
      {
        q: "Há pratos veganos ou vegetarianos?",
        a: "Vegetarianos, sim: a **Tixola de pisto de verduras** (frigideira de ferro com legumes estufados, ovo e batatas), as **Patatas bravas, alioli o mixtas** (batatas fritas com molho picante, com alioli ou com os dois), o **Salteado de verdura, arroz y setas** (legumes e cogumelos salteados com arroz), a **Tortilla guisada con champiñones** (omelete acabada num guisado curto de cogumelos), o **Timbal vegetal** (legumes montados em camadas), o **Queso frito** (queijo frito) e os queijos da região, de ovelha e de cabra. Vários levam ovo ou lacticínios, por isso na ementa do site pode filtrá-los por alergénio. Veganos não temos nenhum na ementa: se vier, diga-o ao pedir e na cozinha dizem-lhe o que se pode adaptar.",
      },
      {
        q: "Como chegar e onde estacionar?",
        a: "Estamos na {address}, a um minuto a pé da Catedral de San Martiño, em pleno centro histórico de Ourense. A zona é pedonal: recomendamos deixar o carro num dos parques de estacionamento do centro e vir a pé; no site encontra o botão «Como chegar», que abre o percurso no Google Maps.",
      },
      {
        q: "Têm esplanada?",
        a: "Sim, temos esplanada na própria Rúa Juan de Austria, com a igreja de Santa Eufemia ao fundo, e mantemo-la aberta todo o ano sempre que o tempo o permite. As mesas da esplanada também são por ordem de chegada.",
      },
    ],
  },
};

export default legal;
