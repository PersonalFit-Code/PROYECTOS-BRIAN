/**
 * MÓDULO LEGAL — textos en galego.
 *
 * Tradución fiel de src/i18n/messages/es/legal.ts (a fonte de verdade): índice de documentos
 * (título + slug), banner de cookies, cabeceira/índice das páxinas legais, os TRES DOCUMENTOS
 * estruturados (privacidade, aviso legal, cookies) e as preguntas frecuentes que se publican
 * como FAQPage (JSON-LD).
 *
 * Marcadores dispoñibles en calquera texto (éncheos `LegalArticle` con useFormat()):
 *   {tradeName} {companyName} {nif} {registeredOffice} {registry} {email}
 *   {address} {city} {phone} {phoneTel} {siteUrl} {updated} {consentMonths}
 * Ligazóns: [texto](privacy | legalNotice | cookies | home | carta | https://… | mailto:… | tel:…)
 * Énfase: **texto**
 *
 * ⚠️ Os `slug` NON se traducen: forman a URL (/legal/<slug>) que ligan o pé, o sitemap e hreflang.
 * Os ids das seccións mantéñense idénticos aos do castelán para que as áncoras (#derechos…)
 * resolvan en todos os idiomas. Os marcadores [ASÍ] de src/data/legal.ts non se tocan.
 */
import type { LegalMessages } from "@/i18n/messages/es/legal";

const legal: LegalMessages = {
  /* ── Índice (título + slug da URL /legal/<slug>) ── */
  privacy: { title: "Política de privacidade", slug: "privacidad" },
  legalNotice: { title: "Aviso legal", slug: "aviso-legal" },
  cookies: { title: "Política de cookies", slug: "cookies" },
  updated: "Última actualización",

  /* ── Banner de cookies ── */
  banner: {
    title: "Usamos cookies",
    text: "Utilizamos cookies propias necesarias para o funcionamento do sitio e, se o aceptas, cookies de análise para mellorar a experiencia.",
    accept: "Aceptar todas",
    reject: "Só as necesarias",
    settings: "Configurar",
    save: "Gardar as preferencias",
    necessary: "Necesarias",
    necessaryDesc: "Imprescindibles para que a web funcione (idioma, consentimento).",
    analytics: "Analítica",
    analyticsDesc: "Axúdannos a entender como se usa a web. Só co teu consentimento.",
    more: "Máis información",
    aria: "Aviso de cookies",
    panelTitle: "Preferencias de cookies",
    panelText: "Escolle que categorías permites. Poderás cambiar a túa decisión cando queiras desde «Configurar cookies», no pé de páxina.",
    alwaysOn: "Sempre activas",
    back: "Volver",
    privacyLink: "Política de privacidade",
    cookiesLink: "Política de cookies",
    saved: "Preferencias gardadas.",
    noAnalyticsYet: "Agora mesmo non hai ningunha ferramenta de analítica instalada: a túa elección aplicarase se se activa no futuro.",
  },

  /* ── Páxinas legais: cabeceira, índice e pé ── */
  page: {
    kicker: "Información legal",
    breadcrumbAria: "Migas de pan",
    home: "Inicio",
    updatedOn: "Última actualización: {date}",
    tocTitle: "Nesta páxina",
    tocAria: "Índice do documento",
    relatedTitle: "Outros documentos",
    placeholderNote: "Os datos entre corchetes están pendentes de confirmación por parte do titular do sitio.",
    contactTitle: "Dúbidas sobre os teus datos?",
    contactText: "Escríbenos a {email} ou chámanos ao {phone}. Respondémosche no prazo máximo dun mes.",
    backHome: "Volver ao inicio",
  },

  /* ══════════════════════════════════════════════════════════════
     DOCUMENTOS
     ══════════════════════════════════════════════════════════════ */
  docs: {
    /* ── Política de privacidade (RXPD + LOPDGDD) ── */
    privacy: {
      description:
        "Como trata Tixola Tapería (Ourense) os teus datos ao reservar por teléfono ou WhatsApp, usar o camareiro virtual ou navegar pola web. Dereitos, prazos e encargados.",
      intro:
        "En {tradeName} tratamos moi poucos datos e só os imprescindibles: os que nos dás para reservar mesa, as preguntas que lle fas ao camareiro virtual e a información técnica mínima para que a web funcione. Aquí contámosche, sen letra pequena, que facemos con eles.",
      sections: [
        {
          id: "responsable",
          title: "1. Responsable do tratamento",
          blocks: [
            {
              type: "dl",
              items: [
                { term: "Titular", desc: "{companyName}" },
                { term: "NIF", desc: "{nif}" },
                { term: "Domicilio social", desc: "{registeredOffice}" },
                { term: "Nome comercial e establecemento", desc: "{tradeName} · {address}" },
                { term: "Teléfono", desc: "[{phone}](tel:{phoneTel})" },
                { term: "Correo electrónico", desc: "{email}" },
              ],
            },
            {
              type: "p",
              text: "Non estamos obrigados a designar un Delegado de Protección de Datos (art. 37 RXPD e art. 34 LOPDGDD). Para calquera cuestión sobre os teus datos escríbenos a {email}.",
            },
          ],
        },
        {
          id: "datos",
          title: "2. Que datos tratamos e de onde proceden",
          blocks: [
            { type: "p", text: "Todos os datos facilítasnolos ti directamente. Non compramos datos nin os obtemos de terceiros." },
            {
              type: "dl",
              items: [
                {
                  term: "Reservas e consultas",
                  desc: "Nome, teléfono, número de persoas, data e hora, e os comentarios que queiras engadir (terraza, celebración, alerxias). O formulario de reserva da web **non envía nada aos nosos servidores**: compón unha mensaxe que se abre na túa propia aplicación de WhatsApp e que ti decides enviar.",
                },
                {
                  term: "Camareiro virtual",
                  desc: "O texto das túas preguntas e respostas durante a sesión, o idioma e a páxina desde a que escribes. Non che pedimos datos persoais para usalo e recomendámosche non incluílos.",
                },
                {
                  term: "Navegación",
                  desc: "Datos técnicos que xera calquera visita (enderezo IP, tipo de navegador, páxinas solicitadas), tratados polo noso provedor de aloxamento por motivos de seguridade; o idioma escollido (cookie NEXT_LOCALE) e a túa decisión sobre as cookies (almacenamento local tixola_consent).",
                },
                {
                  term: "Alerxias e intolerancias",
                  desc: "Se nolas comunicas ao reservar, usámolas unicamente para preparar a túa visita e protexer a túa saúde. Son datos de categoría especial (art. 9 RXPD) que tratamos co teu consentimento explícito, manifestado ao facilitárnolos, e que non conservamos máis alá do servizo.",
                },
              ],
            },
          ],
        },
        {
          id: "finalidades",
          title: "3. Finalidades, base xurídica e conservación",
          blocks: [
            {
              type: "table",
              caption: "Para que usamos os teus datos, con que base legal e durante canto tempo",
              head: ["Finalidade", "Base xurídica", "Conservación"],
              rows: [
                [
                  "Xestionar a túa reserva e atender as túas consultas por teléfono ou WhatsApp",
                  "Execución dun contrato ou de medidas precontractuais a petición túa (art. 6.1.b RXPD)",
                  "Ata a data da reserva; despois bórrase a conversa de forma periódica",
                ],
                [
                  "Responder ás túas preguntas mediante o camareiro virtual",
                  "O teu consentimento ao iniciar a conversa (art. 6.1.a RXPD)",
                  "Só durante a sesión de navegación; non se garda nos nosos servidores",
                ],
                [
                  "Garantir a seguridade e o funcionamento técnico da web",
                  "Interese lexítimo na seguridade da rede e da información (art. 6.1.f RXPD, considerando 49)",
                  "Rexistros técnicos do provedor de aloxamento durante un período limitado",
                ],
                [
                  "Lembrar o teu idioma e a túa decisión sobre as cookies",
                  "Interese lexítimo / cookies técnicas exentas de consentimento (art. 22.2 LSSI-CE)",
                  "12 meses",
                ],
                [
                  "Medir o uso da web (analítica)",
                  "O teu consentimento no banner de cookies (art. 6.1.a RXPD). Actualmente non hai ningunha ferramenta instalada",
                  "Segundo a ferramenta, nunca máis de 24 meses",
                ],
                [
                  "Atender o exercicio dos teus dereitos e cumprir obrigas legais",
                  "Obriga legal (art. 6.1.c RXPD)",
                  "Durante os prazos de prescrición das responsabilidades legais",
                ],
              ],
            },
            {
              type: "p",
              text: "Non tomamos decisións automatizadas con efectos xurídicos sobre ti nin elaboramos perfís. Non enviamos comunicacións comerciais.",
            },
          ],
        },
        {
          id: "camarero-virtual",
          title: "4. O camareiro virtual (intelixencia artificial)",
          blocks: [
            {
              type: "p",
              text: "O camareiro virtual é un asistente que responde sobre a carta, os alérxenos, o horario e as reservas. Para xerar cada resposta, as túas mensaxes envíanse a través do noso servidor a **Anthropic PBC**, provedor do modelo de linguaxe Claude, que actúa como encargado do tratamento.",
            },
            {
              type: "ul",
              items: [
                "**Non almacenamos a conversa nos nosos servidores**: procésase ao voo para responder e non existe ningunha base de datos de chats. Só contamos as peticións por enderezo IP durante dez minutos, en memoria, para evitar abusos.",
                "No teu navegador a conversa gárdase no almacenamento de sesión (sessionStorage) para que non se perda ao cambiar de páxina; desaparece ao pechar a lapela e podes borrala en calquera momento co botón do propio chat.",
                "Anthropic ten a súa sede nos Estados Unidos. A transferencia ampárase en garantías adecuadas: cláusulas contractuais tipo aprobadas pola Comisión Europea e, de ser o caso, a adhesión do provedor ao Marco de Privacidade de Datos UE-EUA, segundo a súa documentación vixente. Conforme ás súas condicións comerciais, Anthropic non utiliza o contido enviado por API para adestrar os seus modelos e consérvao unicamente durante un período limitado para prestar o servizo e aplicar as súas políticas de uso.",
                "Se non hai conexión co provedor, responde un motor local coa carta e o horario, sen enviar nada fóra.",
                "As respostas xéranse automaticamente e poden conter erros. **Para alerxias e intolerancias, confirma sempre co noso persoal no local.**",
                "Non escribas datos persoais teus nin de terceiros (nomes, teléfonos, datos de saúde) no chat: non os necesitamos para axudarche.",
              ],
            },
          ],
        },
        {
          id: "destinatarios",
          title: "5. Destinatarios e encargados do tratamento",
          blocks: [
            {
              type: "p",
              text: "Non vendemos nin cedemos os teus datos. Só acceden a eles, como encargados do tratamento e cun contrato conforme ao art. 28 RXPD, os provedores que necesitamos para prestar o servizo:",
            },
            {
              type: "dl",
              items: [
                {
                  term: "Vercel Inc. (EUA)",
                  desc: "Aloxamento e entrega da web. Procesa os datos técnicos de cada visita (IP, cabeceiras) e os rexistros de seguridade. Adherida ao Marco de Privacidade de Datos UE-EUA e con cláusulas contractuais tipo. [Política de privacidade de Vercel](https://vercel.com/legal/privacy-policy).",
                },
                {
                  term: "Anthropic PBC (EUA)",
                  desc: "Xeración das respostas do camareiro virtual (ver apartado 4). [Política de privacidade de Anthropic](https://www.anthropic.com/legal/privacy).",
                },
                {
                  term: "Google LLC / Google Ireland Ltd.",
                  desc: "Mapa de Google Maps incrustado na sección «Como chegar». **Só se carga se premes «Ver o mapa real»**; nese momento Google recibe o teu enderezo IP e pode instalar as súas propias cookies. As ligazóns a Google Maps e ás recensións de Google abren sitios de Google. [Política de privacidade de Google](https://policies.google.com/privacy).",
                },
                {
                  term: "Meta Platforms Ireland Ltd. (WhatsApp)",
                  desc: "Se escolles escribirnos por WhatsApp, a comunicación realízase nesa aplicación e réxese polas súas condicións e pola súa política de privacidade. Nós só recibimos a mensaxe que ti decides enviar.",
                },
                {
                  term: "TripAdvisor LLC",
                  desc: "Ligazóns á nosa ficha e ás recensións. Abren un sitio de terceiros coa súa propia política de privacidade; non compartimos datos con TripAdvisor.",
                },
              ],
            },
            {
              type: "p",
              text: "Tamén poderemos comunicar datos ás autoridades competentes cando unha norma nos obrigue a iso.",
            },
          ],
        },
        {
          id: "transferencias",
          title: "6. Transferencias internacionais",
          blocks: [
            {
              type: "p",
              text: "Vercel e Anthropic poden tratar datos nos Estados Unidos. En ambos os casos existen garantías adecuadas conforme ao capítulo V do RXPD: cláusulas contractuais tipo aprobadas pola Comisión Europea e, cando o provedor está certificado, o Marco de Privacidade de Datos UE-EUA. Podes pedirnos unha copia das garantías aplicables escribindo a {email}.",
            },
          ],
        },
        {
          id: "derechos",
          title: "7. Os teus dereitos",
          blocks: [
            {
              type: "p",
              text: "Podes exercer en calquera momento, de forma gratuíta, os dereitos que che recoñece o RXPD:",
            },
            {
              type: "ul",
              items: [
                "**Acceso**: saber que datos teus tratamos.",
                "**Rectificación**: corrixir datos inexactos ou incompletos.",
                "**Supresión**: pedir que borremos os teus datos cando xa non sexan necesarios.",
                "**Oposición** e **limitación do tratamento**.",
                "**Portabilidade**: recibir os teus datos nun formato estruturado de uso común.",
                "**Retirar o consentimento** en calquera momento, sen que afecte á licitude do tratamento previo (por exemplo, cambiando a túa decisión sobre as cookies).",
              ],
            },
            {
              type: "p",
              text: "Para exercelos, escríbenos a {email} ou por correo postal a {companyName}, {registeredOffice}, indicando que dereito queres exercer e achegando un documento que acredite a túa identidade (ou un medio equivalente). Responderémosche no prazo máximo dun mes.",
            },
            {
              type: "p",
              text: "Se consideras que non atendemos correctamente os teus dereitos, podes presentar unha reclamación ante a **Axencia Española de Protección de Datos** (AEPD), C/ Jorge Juan, 6, 28001 Madrid, ou a través da súa sede electrónica en [www.aepd.es](https://www.aepd.es). Antes, se o prefires, podes dirixirte a nós para que o resolvamos.",
            },
          ],
        },
        {
          id: "menores",
          title: "8. Menores de idade",
          blocks: [
            {
              type: "p",
              text: "A web non se dirixe a menores de 14 anos e non recollemos a sabendas datos de menores. As reservas deben facelas persoas maiores de idade. Se detectamos datos dun menor sen a autorización dos seus pais ou titores, eliminarémolos.",
            },
          ],
        },
        {
          id: "seguridad",
          title: "9. Medidas de seguridade",
          blocks: [
            {
              type: "p",
              text: "Aplicamos o principio de minimización: a web non ten rexistro de usuarios nin base de datos de clientes. Toda a comunicación viaxa cifrada (HTTPS), os provedores que interveñen ofrecen garantías contractuais e técnicas adecuadas, e o acceso ás reservas recibidas está limitado ao persoal do local.",
            },
          ],
        },
        {
          id: "cambios",
          title: "10. Cambios nesta política",
          blocks: [
            {
              type: "p",
              text: "Podemos actualizar esta política para adaptala a cambios legais ou do servizo (por exemplo, se incorporamos unha ferramenta de analítica). A versión vixente é sempre a publicada nesta páxina, coa súa data de última actualización ({updated}). Consulta tamén o [Aviso legal](legalNotice) e a [Política de cookies](cookies).",
            },
          ],
        },
      ],
    },

    /* ── Aviso legal (LSSI-CE) ── */
    legalNotice: {
      description:
        "Aviso legal da web de Tixola Tapería (Ourense): titular, condicións de uso, propiedade intelectual, exclusión de responsabilidade e lexislación aplicable.",
      intro:
        "En cumprimento da Lei 34/2002, do 11 de xullo, de servizos da sociedade da información e de comercio electrónico (LSSI-CE), informámoste de quen está detrás desta web e das condicións que rexen o seu uso.",
      sections: [
        {
          id: "titular",
          title: "1. Datos identificativos do titular",
          blocks: [
            {
              type: "dl",
              items: [
                { term: "Titular", desc: "{companyName}" },
                { term: "NIF", desc: "{nif}" },
                { term: "Domicilio social", desc: "{registeredOffice}" },
                { term: "Datos rexistrais", desc: "{registry}" },
                { term: "Nome comercial", desc: "{tradeName}" },
                { term: "Establecemento", desc: "{address}" },
                { term: "Teléfono", desc: "[{phone}](tel:{phoneTel})" },
                { term: "Correo electrónico", desc: "{email}" },
                { term: "Sitio web", desc: "[{siteUrl}]({siteUrl})" },
              ],
            },
            {
              type: "p",
              text: "{tradeName} é un establecemento de hostalaría (tapería e vinoteca) situado no casco histórico de {city}, á beira da Catedral de San Martiño. Dispón de follas de reclamacións a disposición da clientela no propio local.",
            },
          ],
        },
        {
          id: "objeto",
          title: "2. Obxecto e aceptación",
          blocks: [
            {
              type: "p",
              text: "Este sitio web ten unha finalidade informativa: dar a coñecer o local, a súa carta, o seu horario e as súas vías de contacto, e facilitar a reserva de mesa por teléfono ou WhatsApp. O acceso e a navegación atribúen a condición de persoa usuaria e implican a aceptación deste Aviso legal, da [Política de privacidade](privacy) e da [Política de cookies](cookies).",
            },
            {
              type: "ul",
              items: [
                "A carta, os prezos e as maridaxes publicados son **orientativos** e poden variar segundo a tempada e a dispoñibilidade de produto. A carta vixente é a que se ofrece no local.",
                "O horario pode modificarse en festivos, vacacións ou por causas de forza maior.",
                "Unha reserva solicitada por teléfono ou WhatsApp só queda confirmada cando o local a confirma expresamente.",
              ],
            },
          ],
        },
        {
          id: "condiciones",
          title: "3. Condicións de uso",
          blocks: [
            {
              type: "p",
              text: "Comprométeste a utilizar a web e os seus servizos (incluído o camareiro virtual) de forma lícita e conforme á boa fe. En particular, non está permitido:",
            },
            {
              type: "ul",
              items: [
                "Realizar extraccións masivas ou automatizadas de contidos (scraping) nin sobrecargar deliberadamente o servizo.",
                "Introducir virus, código malicioso ou calquera elemento que poida danar os sistemas propios ou de terceiros.",
                "Suplantar a identidade doutras persoas ou do propio establecemento.",
                "Utilizar o camareiro virtual para fins alleos á información sobre o local, para tentar obter as súas instrucións internas ou para xerar contidos ilícitos ou ofensivos.",
              ],
            },
            {
              type: "p",
              text: "Para protexer o servizo, o camareiro virtual aplica límites de uso por enderezo IP e pode rexeitar peticións que os superen.",
            },
          ],
        },
        {
          id: "propiedad-intelectual",
          title: "4. Propiedade intelectual e industrial",
          blocks: [
            {
              type: "p",
              text: "O deseño da web, o logotipo «Tixola», os textos, as fotografías, as ilustracións, os modelos tridimensionais e o código fonte son titularidade de {companyName} ou dos seus licenciantes e están protexidos pola lexislación de propiedade intelectual e industrial. Queda prohibida a súa reprodución, distribución, comunicación pública ou transformación, total ou parcial, sen autorización expresa, agás para o uso persoal e privado da información.",
            },
            {
              type: "p",
              text: "As iconas de interface proceden da biblioteca Lucide (licenza ISC). As marcas e logotipos de terceiros que aparecen na web (Google, Google Maps, WhatsApp, TripAdvisor) pertencen aos seus respectivos titulares e utilízanse unicamente para identificar os servizos ligados.",
            },
          ],
        },
        {
          id: "responsabilidad",
          title: "5. Exclusión de responsabilidade",
          blocks: [
            {
              type: "ul",
              items: [
                "**Dispoñibilidade**: procuramos que a web funcione sen interrupcións, pero non garantimos a súa dispoñibilidade permanente nin a ausencia de erros. Non respondemos dos danos derivados de interrupcións, virus ou fallos alleos ao noso control.",
                "**Contidos**: a información ofrécese de boa fe e revísase periodicamente; non obstante, pode conter erros tipográficos ou datos desactualizados (prezos, horario, pratos). Reservámonos o dereito de modificala sen aviso previo.",
                "**Alérxenos**: a información sobre alérxenos da carta é orientativa. En cociña manipúlanse os 14 alérxenos de declaración obrigatoria (Regulamento (UE) n.º 1169/2011) e non podemos descartar trazas. A información válida e actualizada é a que facilita o persoal no local; consúltaa sempre antes de pedir.",
                "**Camareiro virtual**: as súas respostas xéranse mediante intelixencia artificial e poden ser inexactas ou incompletas. Teñen carácter meramente informativo e non substitúen a confirmación do persoal do local, especialmente en materia de alerxias, prezos e reservas.",
                "**Ligazóns**: a web contén ligazóns a sitios de terceiros (Google Maps, WhatsApp, TripAdvisor) sobre cuxos contidos e políticas non temos control nin asumimos responsabilidade.",
              ],
            },
          ],
        },
        {
          id: "proteccion-de-datos",
          title: "6. Protección de datos e cookies",
          blocks: [
            {
              type: "p",
              text: "O tratamento dos datos persoais réxese pola nosa [Política de privacidade](privacy). O uso de cookies e tecnoloxías similares explícase na [Política de cookies](cookies), onde tamén podes cambiar as túas preferencias.",
            },
          ],
        },
        {
          id: "legislacion",
          title: "7. Lexislación aplicable e xurisdición",
          blocks: [
            {
              type: "p",
              text: "Este Aviso legal réxese pola lexislación española. Para calquera controversia derivada do acceso ou uso da web, as partes sométense aos xulgados e tribunais do domicilio da persoa usuaria cando teña a condición de consumidora; nos demais casos, aos xulgados e tribunais de {city}. Como consumidor ou consumidora, dispós ademais das follas de reclamacións oficiais da Xunta de Galicia no propio establecemento.",
            },
            {
              type: "p",
              text: "Data de última actualización: {updated}.",
            },
          ],
        },
      ],
    },

    /* ── Política de cookies ── */
    cookies: {
      description:
        "Que cookies e almacenamento local usa a web de Tixola Tapería, para que serven, canto duran e como podes aceptalas, rexeitalas ou cambiar a túa decisión.",
      intro:
        "Esta web usa moi poucas cookies, e todas as que se instalan por defecto son técnicas: serven para lembrar o teu idioma e a túa decisión sobre as propias cookies. Aquí tes o detalle e como xestionalas.",
      sections: [
        {
          id: "que-son",
          title: "1. Que son as cookies e as tecnoloxías similares",
          blocks: [
            {
              type: "p",
              text: "Unha cookie é un pequeno ficheiro que o sitio web garda no teu navegador para lembrar información entre visitas ou durante a navegación. Utilizamos tamén tecnoloxías equivalentes, como o **almacenamento local** (localStorage) e o **almacenamento de sesión** (sessionStorage) do navegador, ás que se aplica a mesma normativa (art. 22.2 LSSI-CE e Guía sobre o uso das cookies da AEPD).",
            },
          ],
        },
        {
          id: "cookies-que-usamos",
          title: "2. Cookies e almacenamento que utilizamos",
          blocks: [
            {
              type: "table",
              caption: "Inventario de cookies e almacenamento do navegador",
              head: ["Nome", "Tipo", "Titular", "Finalidade", "Duración"],
              rows: [
                ["NEXT_LOCALE", "Técnica (cookie)", "Propia", "Lembra o idioma que escolliches (español, galego, English, português) para mostrarche a web nese idioma.", "12 meses"],
                [
                  "tixola_consent",
                  "Técnica (localStorage)",
                  "Propia",
                  "Garda a túa decisión sobre as cookies (aceptar, rexeitar ou configurar) para non volver preguntarche en cada visita.",
                  "{consentMonths} meses",
                ],
                [
                  "tixola:waiter:*",
                  "Técnica (sessionStorage)",
                  "Propia",
                  "Conserva a conversa co camareiro virtual mentres a lapela está aberta, para que non se perda ao cambiar de páxina.",
                  "Sesión (bórrase ao pechar a lapela)",
                ],
                [
                  "Cookies de Google Maps",
                  "De terceiros",
                  "Google LLC",
                  "Só se premes «Ver o mapa real» na sección «Como chegar»: ao cargarse o mapa, Google pode instalar as súas propias cookies (por exemplo NID ou CONSENT) segundo a súa política.",
                  "Segundo Google (ata 6 meses ou máis)",
                ],
                [
                  "Analítica",
                  "Opcional (análise)",
                  "Propia ou de terceiros",
                  "Medir de forma agregada como se usa a web. **Actualmente non hai ningunha ferramenta instalada**; se se activa no futuro, só se cargará co teu consentimento e esta táboa actualizarase.",
                  "Nunca máis de 24 meses",
                ],
              ],
            },
            {
              type: "note",
              text: "Non utilizamos cookies publicitarias, de redes sociais nin de seguimento entre sitios.",
            },
          ],
        },
        {
          id: "base-legal",
          title: "3. Base legal",
          blocks: [
            {
              type: "p",
              text: "As cookies técnicas (NEXT_LOCALE, tixola_consent e o almacenamento do camareiro virtual) son necesarias para prestar o servizo que solicitas e están exentas de consentimento conforme ao art. 22.2 da LSSI-CE. O resto (analítica e cookies de terceiros que se instalan ao cargar o mapa) só se utiliza co teu consentimento, que podes retirar en calquera momento.",
            },
          ],
        },
        {
          id: "gestionar",
          title: "4. Como aceptar, rexeitar ou cambiar a túa decisión",
          blocks: [
            {
              type: "p",
              text: "Na túa primeira visita aparece un aviso con tres opcións: **Aceptar todas**, **Só as necesarias** ou **Configurar** (para escoller categoría a categoría). A túa decisión gárdase durante {consentMonths} meses; pasado ese prazo volverémosche preguntar. Podes cambiala cando queiras:",
            },
            {
              type: "cookieSettings",
              label: "Configurar as cookies",
              hint: "Abre o panel de preferencias desta web.",
            },
            {
              type: "p",
              text: "Tamén podes borrar ou bloquear as cookies desde a configuración do teu navegador. Ten en conta que, se bloqueas as técnicas, a web deixará de lembrar o teu idioma e a túa elección:",
            },
            {
              type: "ul",
              items: [
                "[Google Chrome](https://support.google.com/chrome/answer/95647)",
                "[Mozilla Firefox](https://support.mozilla.org/es/kb/borrar-cookies-y-datos-del-sitio-en-firefox)",
                "[Safari (Mac)](https://support.apple.com/es-es/guide/safari/sfri11471/mac) e [Safari (iPhone/iPad)](https://support.apple.com/es-es/HT201265)",
                "[Microsoft Edge](https://support.microsoft.com/es-es/microsoft-edge)",
              ],
            },
          ],
        },
        {
          id: "terceros",
          title: "5. Cookies de terceiros: o mapa de Google",
          blocks: [
            {
              type: "p",
              text: "A sección «Como chegar» mostra un mapa ilustrado propio que non instala nada. O mapa real de Google Maps só se carga cando premes «Ver o mapa real»; nese momento o teu navegador conéctase a Google, que recibe o teu enderezo IP e pode instalar cookies conforme á súa [política de privacidade](https://policies.google.com/privacy) e á súa [información sobre cookies](https://policies.google.com/technologies/cookies). Se prefires non cargalo, usa a ligazón «Abrir en Google Maps» ou ven andando: estamos a un minuto da Catedral.",
            },
          ],
        },
        {
          id: "actualizaciones",
          title: "6. Actualizacións desta política",
          blocks: [
            {
              type: "p",
              text: "Revisaremos esta política cando cambien as cookies que utilizamos ou a normativa aplicable. Data de última actualización: {updated}. Máis información sobre o tratamento dos teus datos na [Política de privacidade](privacy) e sobre o titular no [Aviso legal](legalNotice).",
            },
          ],
        },
      ],
    },
  },

  /* ══════════════════════════════════════════════════════════════
     PREGUNTAS FRECUENTES (FAQPage JSON-LD na home)
     Marcadores: {hours} (horario semanal xerado), {phone}, {address}
     ══════════════════════════════════════════════════════════════ */
  faq: {
    title: "Preguntas frecuentes",
    items: [
      {
        q: "Cal é o horario de Tixola Tapería?",
        a: "O noso horario habitual é: {hours}. En festivos e vacacións pode variar: consulta o estado «Aberto agora» da web ou chámanos ao {phone}.",
      },
      {
        q: "Como podo reservar mesa?",
        a: "Reservamos por teléfono ou WhatsApp no {phone}; confirmámosche de contado. Para grupos grandes recomendámosche chamar con antelación. A reserva queda confirmada cando che respondemos.",
      },
      {
        q: "Tedes opcións para celíacos e información de alérxenos?",
        a: "Si. A nosa carta dixital indica os 14 alérxenos de declaración obrigatoria de cada prato e permite filtrar os que non levan glute; temos, por exemplo, croquetas de bacallau sen glute, polbo á feira e tixolas aptas. En cociña manipúlanse todos os alérxenos, así que avisa sempre o persoal para que te oriente e evitar trazas.",
      },
      {
        q: "Hai pratos veganos ou vexetarianos?",
        a: "Si. Contamos con opcións 100 % vexetais como a tixola vegana de cogomelos e verduras, a ensalada de quinoa e aguacate ou os pementos de Padrón, ademais de pratos vexetarianos como o queixo frito con marmelada de tomate, as bravas Tixola ou a táboa de queixos galegos.",
      },
      {
        q: "Como chegar e onde aparcar?",
        a: "Estamos en {address}, a un minuto a pé da Catedral de San Martiño, en pleno casco histórico de Ourense. A zona é peonil: recomendámosche aparcar nos aparcadoiros públicos do centro e achegarte camiñando; na web tes o botón «Como chegar», que abre a ruta en Google Maps.",
      },
      {
        q: "Tedes terraza?",
        a: "Si, temos terraza na propia Rúa Juan de Austria, coa igrexa de Santa Eufemia ao fondo, e mantémola aberta todo o ano sempre que o tempo o permite. Se queres mesa na terraza, indícao ao reservar.",
      },
    ],
  },
};

export default legal;
