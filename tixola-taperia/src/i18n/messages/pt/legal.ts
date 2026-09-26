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
    text: "Utilizamos cookies próprias necessárias ao funcionamento do site e, se as aceitar, cookies de análise para melhorar a experiência.",
    accept: "Aceitar todas",
    reject: "Só as necessárias",
    settings: "Configurar",
    save: "Guardar preferências",
    necessary: "Necessárias",
    necessaryDesc: "Imprescindíveis para que o site funcione (idioma, consentimento).",
    analytics: "Análise",
    analyticsDesc: "Ajudam-nos a perceber como o site é utilizado. Só com o seu consentimento.",
    more: "Mais informação",
    aria: "Aviso de cookies",
    panelTitle: "Preferências de cookies",
    panelText: "Escolha as categorias que permite. Pode mudar de ideias quando quiser em «Configurar cookies», no rodapé.",
    alwaysOn: "Sempre ativas",
    back: "Voltar",
    privacyLink: "Política de privacidade",
    cookiesLink: "Política de cookies",
    saved: "Preferências guardadas.",
    noAnalyticsYet: "Neste momento não está instalada nenhuma ferramenta de análise: a sua escolha aplicar-se-á se alguma vier a ser ativada.",
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
        "Como a Tixola Tapería (Ourense) trata os seus dados ao reservar por telefone ou WhatsApp, usar o empregado virtual ou navegar no site. Direitos e prazos.",
      intro:
        "Na {tradeName} tratamos muito poucos dados e apenas os imprescindíveis: os que nos dá para reservar mesa, as perguntas que faz ao empregado virtual e a informação técnica mínima para que o site funcione. Aqui contamos-lhe, sem letras pequenas, o que fazemos com eles.",
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
                  term: "Reservas e consultas",
                  desc: "Nome, telefone, número de pessoas, data e hora, e os comentários que queira acrescentar (esplanada, celebração, alergias). O formulário de reserva do site **não envia nada para os nossos servidores**: compõe uma mensagem que se abre na sua própria aplicação de WhatsApp e que é você quem decide enviar.",
                },
                {
                  term: "Empregado virtual",
                  desc: "O texto das suas perguntas e respostas durante a sessão, o idioma e a página a partir da qual escreve. Não lhe pedimos dados pessoais para o usar e recomendamos que não os inclua.",
                },
                {
                  term: "Navegação",
                  desc: "Dados técnicos gerados por qualquer visita (endereço IP, tipo de navegador, páginas pedidas), tratados pelo nosso fornecedor de alojamento por motivos de segurança; o idioma escolhido (cookie NEXT_LOCALE) e a sua decisão sobre cookies (armazenamento local tixola_consent).",
                },
                {
                  term: "Alergias e intolerâncias",
                  desc: "Se nos as comunicar ao reservar, usamo-las unicamente para preparar a sua visita e proteger a sua saúde. São dados de categoria especial (art. 9.º do RGPD) que tratamos com o seu consentimento explícito, manifestado ao fornecê-los, e que não conservamos para além do serviço.",
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
                  "Gerir a sua reserva e responder às suas consultas por telefone ou WhatsApp",
                  "Execução de um contrato ou de diligências pré-contratuais a seu pedido (art. 6.º, n.º 1, al. b) do RGPD)",
                  "Até à data da reserva; depois, a conversa é apagada periodicamente",
                ],
                [
                  "Responder às suas perguntas através do empregado virtual",
                  "O seu consentimento ao iniciar a conversa (art. 6.º, n.º 1, al. a) do RGPD)",
                  "Só durante a sessão de navegação; não se guarda nos nossos servidores",
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
                  "Medir a utilização do site (análise)",
                  "O seu consentimento no banner de cookies (art. 6.º, n.º 1, al. a) do RGPD). Atualmente não está instalada nenhuma ferramenta",
                  "Consoante a ferramenta, nunca mais de 24 meses",
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
              text: "O empregado virtual é um assistente que responde sobre a ementa, os alergénios, o horário e as reservas. Para gerar cada resposta, as suas mensagens são enviadas, através do nosso servidor, à **Anthropic PBC**, fornecedora do modelo de linguagem Claude, que atua como subcontratante.",
            },
            {
              type: "ul",
              items: [
                "**Não armazenamos a conversa nos nossos servidores**: é processada no momento para responder e não existe nenhuma base de dados de chats. Apenas contamos os pedidos por endereço IP durante dez minutos, em memória, para evitar abusos.",
                "No seu navegador, a conversa é guardada no armazenamento de sessão (sessionStorage) para que não se perca ao mudar de página; desaparece ao fechar o separador e pode apagá-la a qualquer momento com o botão do próprio chat.",
                "A Anthropic tem sede nos Estados Unidos. A transferência assenta em garantias adequadas: cláusulas contratuais-tipo aprovadas pela Comissão Europeia e, quando aplicável, a adesão do fornecedor ao Quadro de Privacidade de Dados UE-EUA, de acordo com a sua documentação em vigor. Segundo as suas condições comerciais, a Anthropic não utiliza o conteúdo enviado por API para treinar os seus modelos e conserva-o apenas durante um período limitado para prestar o serviço e aplicar as suas políticas de utilização.",
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
              text: "Não vendemos nem cedemos os seus dados. Só lhes acedem, como subcontratantes e com um contrato conforme ao art. 28.º do RGPD, os fornecedores de que precisamos para prestar o serviço:",
            },
            {
              type: "dl",
              items: [
                {
                  term: "Vercel Inc. (EUA)",
                  desc: "Alojamento e entrega do site. Processa os dados técnicos de cada visita (IP, cabeçalhos) e os registos de segurança. Aderente ao Quadro de Privacidade de Dados UE-EUA e com cláusulas contratuais-tipo. [Política de privacidade da Vercel](https://vercel.com/legal/privacy-policy).",
                },
                {
                  term: "Anthropic PBC (EUA)",
                  desc: "Geração das respostas do empregado virtual (ver secção 4). [Política de privacidade da Anthropic](https://www.anthropic.com/legal/privacy).",
                },
                {
                  term: "Google LLC / Google Ireland Ltd.",
                  desc: "Mapa do Google Maps incorporado na secção «Como chegar». **Só é carregado se clicar em «Ver mapa real»**; nesse momento a Google recebe o seu endereço IP e pode instalar as suas próprias cookies. As ligações para o Google Maps e para as avaliações do Google abrem sites da Google. [Política de privacidade da Google](https://policies.google.com/privacy).",
                },
                {
                  term: "Meta Platforms Ireland Ltd. (WhatsApp)",
                  desc: "Se optar por nos escrever pelo WhatsApp, a comunicação decorre nessa aplicação e rege-se pelas suas condições e pela sua política de privacidade. Nós recebemos apenas a mensagem que você decide enviar.",
                },
                {
                  term: "TripAdvisor LLC",
                  desc: "Ligações para a nossa ficha e avaliações. Abrem um site de terceiros com a sua própria política de privacidade; não partilhamos dados com o TripAdvisor.",
                },
              ],
            },
            {
              type: "p",
              text: "Poderemos também comunicar dados às autoridades competentes quando uma norma nos obrigue a isso.",
            },
          ],
        },
        {
          id: "transferencias",
          title: "6. Transferências internacionais",
          blocks: [
            {
              type: "p",
              text: "A Vercel e a Anthropic podem tratar dados nos Estados Unidos. Em ambos os casos existem garantias adequadas nos termos do capítulo V do RGPD: cláusulas contratuais-tipo aprovadas pela Comissão Europeia e, quando o fornecedor está certificado, o Quadro de Privacidade de Dados UE-EUA. Pode pedir-nos uma cópia das garantias aplicáveis escrevendo para {email}.",
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
                "**Apagamento**: pedir que apaguemos os seus dados quando já não sejam necessários.",
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
              text: "O site não se dirige a menores de 14 anos e não recolhemos conscientemente dados de menores. As reservas devem ser feitas por pessoas maiores de idade. Se detetarmos dados de um menor sem a autorização dos pais ou tutores, eliminá-los-emos.",
            },
          ],
        },
        {
          id: "seguridad",
          title: "9. Medidas de segurança",
          blocks: [
            {
              type: "p",
              text: "Aplicamos o princípio da minimização: o site não tem registo de utilizadores nem base de dados de clientes. Toda a comunicação circula cifrada (HTTPS), os fornecedores envolvidos oferecem garantias contratuais e técnicas adequadas, e o acesso às reservas recebidas está limitado ao pessoal do estabelecimento.",
            },
          ],
        },
        {
          id: "cambios",
          title: "10. Alterações a esta política",
          blocks: [
            {
              type: "p",
              text: "Podemos atualizar esta política para a adaptar a alterações legais ou do serviço (por exemplo, se incorporarmos uma ferramenta de análise). A versão em vigor é sempre a publicada nesta página, com a sua data de última atualização ({updated}). Consulte também o [Aviso legal](legalNotice) e a [Política de cookies](cookies).",
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
              text: "A {tradeName} é um estabelecimento de restauração (casa de tapas e vinoteca) situado no centro histórico de {city}, junto à Catedral de San Martiño. Dispõe de livro de reclamações à disposição da clientela no próprio estabelecimento.",
            },
          ],
        },
        {
          id: "objeto",
          title: "2. Objeto e aceitação",
          blocks: [
            {
              type: "p",
              text: "Este site tem uma finalidade informativa: dar a conhecer o estabelecimento, a sua ementa, o seu horário e as suas vias de contacto, e facilitar a reserva de mesa por telefone ou WhatsApp. O acesso e a navegação atribuem a condição de pessoa utilizadora e implicam a aceitação deste Aviso legal, da [Política de privacidade](privacy) e da [Política de cookies](cookies).",
            },
            {
              type: "ul",
              items: [
                "A ementa, os preços e as harmonizações publicados são **indicativos** e podem variar consoante a época e a disponibilidade de produto. A ementa em vigor é a oferecida no estabelecimento.",
                "O horário pode ser alterado em feriados, férias ou por motivos de força maior.",
                "Uma reserva pedida por telefone ou WhatsApp só fica confirmada quando o estabelecimento a confirma expressamente.",
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
              text: "Compromete-se a utilizar o site e os seus serviços (incluindo o empregado virtual) de forma lícita e conforme à boa-fé. Em particular, não é permitido:",
            },
            {
              type: "ul",
              items: [
                "Fazer extrações massivas ou automatizadas de conteúdos (scraping) ou sobrecarregar deliberadamente o serviço.",
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
              text: "Os ícones de interface provêm da biblioteca Lucide (licença ISC). As marcas e logótipos de terceiros que aparecem no site (Google, Google Maps, WhatsApp, TripAdvisor) pertencem aos respetivos titulares e são utilizados unicamente para identificar os serviços ligados.",
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
                "**Empregado virtual**: as suas respostas são geradas por inteligência artificial e podem ser inexatas ou incompletas. Têm carácter meramente informativo e não substituem a confirmação do pessoal do estabelecimento, sobretudo em matéria de alergias, preços e reservas.",
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
              text: "Este Aviso legal rege-se pela legislação espanhola. Para qualquer litígio decorrente do acesso ou utilização do site, as partes submetem-se aos tribunais do domicílio da pessoa utilizadora quando esta tenha a condição de consumidora; nos restantes casos, aos tribunais de {city}. Como consumidor ou consumidora, dispõe ainda do livro de reclamações oficial da Xunta de Galicia no próprio estabelecimento.",
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
        "Este site usa muito poucas cookies, e todas as que se instalam por defeito são técnicas: servem para recordar o seu idioma e a sua decisão sobre as próprias cookies. Aqui tem o detalhe e como as gerir.",
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
                  "Guarda a sua decisão sobre as cookies (aceitar, recusar ou configurar) para não voltar a perguntar em cada visita.",
                  "{consentMonths} meses",
                ],
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
                  "Só se clicar em «Ver mapa real» na secção «Como chegar»: ao carregar o mapa, a Google pode instalar as suas próprias cookies (por exemplo NID ou CONSENT) de acordo com a sua política.",
                  "Segundo a Google (até 6 meses ou mais)",
                ],
                [
                  "Análise",
                  "Opcional (análise)",
                  "Própria ou de terceiros",
                  "Medir de forma agregada como o site é utilizado. **Atualmente não está instalada nenhuma ferramenta**; se vier a ser ativada, só será carregada com o seu consentimento e esta tabela será atualizada.",
                  "Nunca mais de 24 meses",
                ],
              ],
            },
            {
              type: "note",
              text: "Não utilizamos cookies publicitárias, de redes sociais nem de rastreio entre sites.",
            },
          ],
        },
        {
          id: "base-legal",
          title: "3. Fundamento legal",
          blocks: [
            {
              type: "p",
              text: "As cookies técnicas (NEXT_LOCALE, tixola_consent e o armazenamento do empregado virtual) são necessárias para prestar o serviço que solicita e estão isentas de consentimento nos termos do art. 22.º, n.º 2, da LSSI-CE. As restantes (análise e cookies de terceiros instaladas ao carregar o mapa) só são utilizadas com o seu consentimento, que pode retirar a qualquer momento.",
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
          id: "terceros",
          title: "5. Cookies de terceiros: o mapa da Google",
          blocks: [
            {
              type: "p",
              text: "A secção «Como chegar» mostra um mapa ilustrado próprio que não instala nada. O mapa real do Google Maps só é carregado quando clica em «Ver mapa real»; nesse momento o seu navegador liga-se à Google, que recebe o seu endereço IP e pode instalar cookies de acordo com a sua [política de privacidade](https://policies.google.com/privacy) e a sua [informação sobre cookies](https://policies.google.com/technologies/cookies). Se preferir não o carregar, use a ligação «Abrir no Google Maps» ou venha a pé: estamos a um minuto da Catedral.",
            },
          ],
        },
        {
          id: "actualizaciones",
          title: "6. Atualizações desta política",
          blocks: [
            {
              type: "p",
              text: "Reveremos esta política sempre que mudem as cookies que utilizamos ou a regulamentação aplicável. Data da última atualização: {updated}. Mais informação sobre o tratamento dos seus dados na [Política de privacidade](privacy) e sobre o titular no [Aviso legal](legalNotice).",
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
        q: "Como posso reservar mesa?",
        a: "Reservamos por telefone ou WhatsApp através do {phone}; confirmamos na hora. Para grupos grandes recomendamos ligar com antecedência. A reserva fica confirmada quando lhe respondemos.",
      },
      {
        q: "Têm opções para celíacos e informação sobre alergénios?",
        a: "Sim. A nossa ementa digital indica os 14 alergénios de declaração obrigatória de cada prato e permite filtrar os que não têm glúten; temos, por exemplo, croquetes de bacalhau sem glúten, pulpo á feira (polvo à galega) e tixolas adequadas. Na cozinha manipulam-se todos os alergénios, por isso avise sempre o pessoal para que o oriente e para evitar vestígios.",
      },
      {
        q: "Há pratos veganos ou vegetarianos?",
        a: "Sim. Temos opções 100 % vegetais como a tixola vegana de cogumelos e legumes, a salada de quinoa e abacate ou os pimentos de Padrón, além de pratos vegetarianos como o queijo frito com doce de tomate, as bravas Tixola ou a tábua de queijos galegos.",
      },
      {
        q: "Como chegar e onde estacionar?",
        a: "Estamos na {address}, a um minuto a pé da Catedral de San Martiño, em pleno centro histórico de Ourense. A zona é pedonal: recomendamos estacionar nos parques públicos do centro e vir a pé; no site tem o botão «Como chegar», que abre o percurso no Google Maps.",
      },
      {
        q: "Têm esplanada?",
        a: "Sim, temos esplanada na própria Rúa Juan de Austria, com a igreja de Santa Eufemia ao fundo, e mantemo-la aberta todo o ano sempre que o tempo o permite. Se quiser mesa na esplanada, indique-o ao reservar.",
      },
    ],
  },
};

export default legal;
