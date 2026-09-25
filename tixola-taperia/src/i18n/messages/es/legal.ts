/**
 * MÓDULO LEGAL — textos (español de España).
 *
 * Contiene: índice de documentos (título + slug), banner de cookies, cabecera/índice de las
 * páginas legales, los TRES DOCUMENTOS estructurados (privacidad, aviso legal, cookies) y las
 * preguntas frecuentes que se publican como FAQPage (JSON-LD).
 *
 * Marcadores disponibles en cualquier texto (los rellena `LegalArticle` con useFormat()):
 *   {tradeName} {companyName} {nif} {registeredOffice} {registry} {email}
 *   {address} {city} {phone} {siteUrl} {updated} {consentMonths}
 * Enlaces: [texto](privacy | legalNotice | cookies | home | carta | https://… | mailto:… | tel:…)
 * Énfasis: **texto**
 *
 * ⚠️ Los datos del responsable ({companyName}, {nif}, {registeredOffice}, {email}) salen de
 * src/data/legal.ts y se muestran resaltados mientras conserven los corchetes.
 * Este fichero es la fuente de verdad: los demás idiomas pueden traducirlo parcialmente.
 */
import type { LegalDoc, LegalFaqItem } from "@/data/legal";

export interface LegalMessages {
  privacy: { title: string; slug: string };
  legalNotice: { title: string; slug: string };
  cookies: { title: string; slug: string };
  updated: string;
  banner: {
    title: string;
    text: string;
    accept: string;
    reject: string;
    settings: string;
    save: string;
    necessary: string;
    necessaryDesc: string;
    analytics: string;
    analyticsDesc: string;
    more: string;
    aria: string;
    panelTitle: string;
    panelText: string;
    alwaysOn: string;
    back: string;
    privacyLink: string;
    cookiesLink: string;
    saved: string;
    noAnalyticsYet: string;
  };
  page: {
    kicker: string;
    breadcrumbAria: string;
    home: string;
    updatedOn: string;
    tocTitle: string;
    tocAria: string;
    relatedTitle: string;
    placeholderNote: string;
    contactTitle: string;
    contactText: string;
    backHome: string;
  };
  docs: {
    privacy: LegalDoc;
    legalNotice: LegalDoc;
    cookies: LegalDoc;
  };
  faq: {
    title: string;
    items: readonly LegalFaqItem[];
  };
}

const legal: LegalMessages = {
  /* ── Índice (título + slug de la URL /legal/<slug>) ── */
  privacy: { title: "Política de privacidad", slug: "privacidad" },
  legalNotice: { title: "Aviso legal", slug: "aviso-legal" },
  cookies: { title: "Política de cookies", slug: "cookies" },
  updated: "Última actualización",

  /* ── Banner de cookies ── */
  banner: {
    title: "Usamos cookies",
    text: "Utilizamos cookies propias necesarias para el funcionamiento del sitio y, si lo aceptas, cookies de análisis para mejorar la experiencia.",
    accept: "Aceptar todas",
    reject: "Solo necesarias",
    settings: "Configurar",
    save: "Guardar preferencias",
    necessary: "Necesarias",
    necessaryDesc: "Imprescindibles para que la web funcione (idioma, consentimiento).",
    analytics: "Analítica",
    analyticsDesc: "Nos ayudan a entender cómo se usa la web. Solo con tu consentimiento.",
    more: "Más información",
    aria: "Aviso de cookies",
    panelTitle: "Preferencias de cookies",
    panelText: "Elige qué categorías permites. Podrás cambiar tu decisión cuando quieras desde «Configurar cookies», en el pie de página.",
    alwaysOn: "Siempre activas",
    back: "Volver",
    privacyLink: "Política de privacidad",
    cookiesLink: "Política de cookies",
    saved: "Preferencias guardadas.",
    noAnalyticsYet: "Ahora mismo no hay ninguna herramienta de analítica instalada: tu elección se aplicará si se activa en el futuro.",
  },

  /* ── Páginas legales: cabecera, índice y pie ── */
  page: {
    kicker: "Información legal",
    breadcrumbAria: "Migas de pan",
    home: "Inicio",
    updatedOn: "Última actualización: {date}",
    tocTitle: "En esta página",
    tocAria: "Índice del documento",
    relatedTitle: "Otros documentos",
    placeholderNote: "Los datos entre corchetes están pendientes de confirmación por parte del titular del sitio.",
    contactTitle: "¿Dudas sobre tus datos?",
    contactText: "Escríbenos a {email} o llámanos al {phone}. Te respondemos en el plazo máximo de un mes.",
    backHome: "Volver al inicio",
  },

  /* ══════════════════════════════════════════════════════════════
     DOCUMENTOS
     ══════════════════════════════════════════════════════════════ */
  docs: {
    /* ── Política de privacidad (RGPD + LOPDGDD) ── */
    privacy: {
      description:
        "Cómo trata Tixola Tapería (Ourense) tus datos al reservar por teléfono o WhatsApp, usar el camarero virtual o navegar por la web. Derechos, plazos y encargados.",
      intro:
        "En {tradeName} tratamos muy pocos datos y solo los imprescindibles: los que nos das para reservar mesa, las preguntas que le haces al camarero virtual y la información técnica mínima para que la web funcione. Aquí te contamos, sin letra pequeña, qué hacemos con ellos.",
      sections: [
        {
          id: "responsable",
          title: "1. Responsable del tratamiento",
          blocks: [
            {
              type: "dl",
              items: [
                { term: "Titular", desc: "{companyName}" },
                { term: "NIF", desc: "{nif}" },
                { term: "Domicilio social", desc: "{registeredOffice}" },
                { term: "Nombre comercial y establecimiento", desc: "{tradeName} · {address}" },
                { term: "Teléfono", desc: "[{phone}](tel:{phoneTel})" },
                { term: "Correo electrónico", desc: "{email}" },
              ],
            },
            {
              type: "p",
              text: "No estamos obligados a designar un Delegado de Protección de Datos (art. 37 RGPD y art. 34 LOPDGDD). Para cualquier cuestión sobre tus datos escríbenos a {email}.",
            },
          ],
        },
        {
          id: "datos",
          title: "2. Qué datos tratamos y de dónde proceden",
          blocks: [
            { type: "p", text: "Todos los datos nos los facilitas tú directamente. No compramos datos ni los obtenemos de terceros." },
            {
              type: "dl",
              items: [
                {
                  term: "Reservas y consultas",
                  desc: "Nombre, teléfono, número de personas, fecha y hora, y los comentarios que quieras añadir (terraza, celebración, alergias). El formulario de reserva de la web **no envía nada a nuestros servidores**: compone un mensaje que se abre en tu propia aplicación de WhatsApp y que tú decides enviar.",
                },
                {
                  term: "Camarero virtual",
                  desc: "El texto de tus preguntas y respuestas durante la sesión, el idioma y la página desde la que escribes. No te pedimos datos personales para usarlo y te recomendamos no incluirlos.",
                },
                {
                  term: "Navegación",
                  desc: "Datos técnicos que genera cualquier visita (dirección IP, tipo de navegador, páginas solicitadas), tratados por nuestro proveedor de alojamiento por motivos de seguridad; el idioma elegido (cookie NEXT_LOCALE) y tu decisión sobre cookies (almacenamiento local tixola_consent).",
                },
                {
                  term: "Alergias e intolerancias",
                  desc: "Si nos las comunicas al reservar, las usamos únicamente para preparar tu visita y proteger tu salud. Son datos de categoría especial (art. 9 RGPD) que tratamos con tu consentimiento explícito, manifestado al facilitárnoslos, y que no conservamos más allá del servicio.",
                },
              ],
            },
          ],
        },
        {
          id: "finalidades",
          title: "3. Finalidades, base jurídica y conservación",
          blocks: [
            {
              type: "table",
              caption: "Para qué usamos tus datos, con qué base legal y durante cuánto tiempo",
              head: ["Finalidad", "Base jurídica", "Conservación"],
              rows: [
                [
                  "Gestionar tu reserva y atender tus consultas por teléfono o WhatsApp",
                  "Ejecución de un contrato o de medidas precontractuales a petición tuya (art. 6.1.b RGPD)",
                  "Hasta la fecha de la reserva; después se borra la conversación de forma periódica",
                ],
                [
                  "Responder a tus preguntas mediante el camarero virtual",
                  "Tu consentimiento al iniciar la conversación (art. 6.1.a RGPD)",
                  "Solo durante la sesión de navegación; no se guarda en nuestros servidores",
                ],
                [
                  "Garantizar la seguridad y el funcionamiento técnico de la web",
                  "Interés legítimo en la seguridad de la red y de la información (art. 6.1.f RGPD, considerando 49)",
                  "Registros técnicos del proveedor de alojamiento durante un periodo limitado",
                ],
                [
                  "Recordar tu idioma y tu decisión sobre cookies",
                  "Interés legítimo / cookies técnicas exentas de consentimiento (art. 22.2 LSSI-CE)",
                  "12 meses",
                ],
                [
                  "Medir el uso de la web (analítica)",
                  "Tu consentimiento en el banner de cookies (art. 6.1.a RGPD). Actualmente no hay ninguna herramienta instalada",
                  "Según la herramienta, nunca más de 24 meses",
                ],
                [
                  "Atender el ejercicio de tus derechos y cumplir obligaciones legales",
                  "Obligación legal (art. 6.1.c RGPD)",
                  "Durante los plazos de prescripción de las responsabilidades legales",
                ],
              ],
            },
            {
              type: "p",
              text: "No tomamos decisiones automatizadas con efectos jurídicos sobre ti ni elaboramos perfiles. No enviamos comunicaciones comerciales.",
            },
          ],
        },
        {
          id: "camarero-virtual",
          title: "4. El camarero virtual (inteligencia artificial)",
          blocks: [
            {
              type: "p",
              text: "El camarero virtual es un asistente que responde sobre la carta, los alérgenos, el horario y las reservas. Para generar cada respuesta, tus mensajes se envían a través de nuestro servidor a **Anthropic PBC**, proveedor del modelo de lenguaje Claude, que actúa como encargado del tratamiento.",
            },
            {
              type: "ul",
              items: [
                "**No almacenamos la conversación en nuestros servidores**: se procesa al vuelo para responder y no existe ninguna base de datos de chats. Solo contamos las peticiones por dirección IP durante diez minutos, en memoria, para evitar abusos.",
                "En tu navegador la conversación se guarda en el almacenamiento de sesión (sessionStorage) para que no se pierda al cambiar de página; desaparece al cerrar la pestaña y puedes borrarla en cualquier momento con el botón del propio chat.",
                "Anthropic tiene su sede en Estados Unidos. La transferencia se ampara en garantías adecuadas: cláusulas contractuales tipo aprobadas por la Comisión Europea y, en su caso, la adhesión del proveedor al Marco de Privacidad de Datos UE-EE. UU., según su documentación vigente. Conforme a sus condiciones comerciales, Anthropic no utiliza el contenido enviado por API para entrenar sus modelos y lo conserva únicamente durante un periodo limitado para prestar el servicio y aplicar sus políticas de uso.",
                "Si no hay conexión con el proveedor, responde un motor local con la carta y el horario, sin enviar nada fuera.",
                "Las respuestas se generan automáticamente y pueden contener errores. **Para alergias e intolerancias, confirma siempre con nuestro personal en el local.**",
                "No escribas datos personales tuyos ni de terceros (nombres, teléfonos, datos de salud) en el chat: no los necesitamos para ayudarte.",
              ],
            },
          ],
        },
        {
          id: "destinatarios",
          title: "5. Destinatarios y encargados del tratamiento",
          blocks: [
            {
              type: "p",
              text: "No vendemos ni cedemos tus datos. Solo acceden a ellos, como encargados del tratamiento y con un contrato conforme al art. 28 RGPD, los proveedores que necesitamos para prestar el servicio:",
            },
            {
              type: "dl",
              items: [
                {
                  term: "Vercel Inc. (EE. UU.)",
                  desc: "Alojamiento y entrega de la web. Procesa los datos técnicos de cada visita (IP, cabeceras) y los registros de seguridad. Adherida al Marco de Privacidad de Datos UE-EE. UU. y con cláusulas contractuales tipo. [Política de privacidad de Vercel](https://vercel.com/legal/privacy-policy).",
                },
                {
                  term: "Anthropic PBC (EE. UU.)",
                  desc: "Generación de las respuestas del camarero virtual (ver apartado 4). [Política de privacidad de Anthropic](https://www.anthropic.com/legal/privacy).",
                },
                {
                  term: "Google LLC / Google Ireland Ltd.",
                  desc: "Mapa de Google Maps incrustado en la sección «Cómo llegar». **Solo se carga si pulsas «Ver mapa real»**; en ese momento Google recibe tu dirección IP y puede instalar sus propias cookies. Los enlaces a Google Maps y a las reseñas de Google abren sitios de Google. [Política de privacidad de Google](https://policies.google.com/privacy).",
                },
                {
                  term: "Meta Platforms Ireland Ltd. (WhatsApp)",
                  desc: "Si eliges escribirnos por WhatsApp, la comunicación se realiza en esa aplicación y se rige por sus condiciones y su política de privacidad. Nosotros solo recibimos el mensaje que tú decides enviar.",
                },
                {
                  term: "TripAdvisor LLC",
                  desc: "Enlaces a nuestra ficha y reseñas. Abren un sitio de terceros con su propia política de privacidad; no compartimos datos con TripAdvisor.",
                },
              ],
            },
            {
              type: "p",
              text: "También podremos comunicar datos a las autoridades competentes cuando una norma nos obligue a ello.",
            },
          ],
        },
        {
          id: "transferencias",
          title: "6. Transferencias internacionales",
          blocks: [
            {
              type: "p",
              text: "Vercel y Anthropic pueden tratar datos en Estados Unidos. En ambos casos existen garantías adecuadas conforme al capítulo V del RGPD: cláusulas contractuales tipo aprobadas por la Comisión Europea y, cuando el proveedor está certificado, el Marco de Privacidad de Datos UE-EE. UU. Puedes pedirnos una copia de las garantías aplicables escribiendo a {email}.",
            },
          ],
        },
        {
          id: "derechos",
          title: "7. Tus derechos",
          blocks: [
            {
              type: "p",
              text: "Puedes ejercer en cualquier momento, de forma gratuita, los derechos que te reconoce el RGPD:",
            },
            {
              type: "ul",
              items: [
                "**Acceso**: saber qué datos tuyos tratamos.",
                "**Rectificación**: corregir datos inexactos o incompletos.",
                "**Supresión**: pedir que borremos tus datos cuando ya no sean necesarios.",
                "**Oposición** y **limitación del tratamiento**.",
                "**Portabilidad**: recibir tus datos en un formato estructurado de uso común.",
                "**Retirar el consentimiento** en cualquier momento, sin que afecte a la licitud del tratamiento previo (por ejemplo, cambiando tu decisión sobre cookies).",
              ],
            },
            {
              type: "p",
              text: "Para ejercerlos, escríbenos a {email} o por correo postal a {companyName}, {registeredOffice}, indicando qué derecho quieres ejercer y acompañando un documento que acredite tu identidad (o un medio equivalente). Te responderemos en el plazo máximo de un mes.",
            },
            {
              type: "p",
              text: "Si consideras que no hemos atendido correctamente tus derechos, puedes presentar una reclamación ante la **Agencia Española de Protección de Datos** (AEPD), C/ Jorge Juan, 6, 28001 Madrid, o a través de su sede electrónica en [www.aepd.es](https://www.aepd.es). Antes, si lo prefieres, puedes dirigirte a nosotros para que lo resolvamos.",
            },
          ],
        },
        {
          id: "menores",
          title: "8. Menores de edad",
          blocks: [
            {
              type: "p",
              text: "La web no se dirige a menores de 14 años y no recabamos a sabiendas datos de menores. Las reservas deben realizarlas personas mayores de edad. Si detectamos datos de un menor sin la autorización de sus padres o tutores, los eliminaremos.",
            },
          ],
        },
        {
          id: "seguridad",
          title: "9. Medidas de seguridad",
          blocks: [
            {
              type: "p",
              text: "Aplicamos el principio de minimización: la web no tiene registro de usuarios ni base de datos de clientes. Toda la comunicación viaja cifrada (HTTPS), los proveedores que intervienen ofrecen garantías contractuales y técnicas adecuadas, y el acceso a las reservas recibidas está limitado al personal del local.",
            },
          ],
        },
        {
          id: "cambios",
          title: "10. Cambios en esta política",
          blocks: [
            {
              type: "p",
              text: "Podemos actualizar esta política para adaptarla a cambios legales o del servicio (por ejemplo, si incorporamos una herramienta de analítica). La versión vigente es siempre la publicada en esta página, con su fecha de última actualización ({updated}). Consulta también el [Aviso legal](legalNotice) y la [Política de cookies](cookies).",
            },
          ],
        },
      ],
    },

    /* ── Aviso legal (LSSI-CE) ── */
    legalNotice: {
      description:
        "Aviso legal de la web de Tixola Tapería (Ourense): titular, condiciones de uso, propiedad intelectual, exclusión de responsabilidad y legislación aplicable.",
      intro:
        "En cumplimiento de la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), te informamos de quién está detrás de esta web y de las condiciones que rigen su uso.",
      sections: [
        {
          id: "titular",
          title: "1. Datos identificativos del titular",
          blocks: [
            {
              type: "dl",
              items: [
                { term: "Titular", desc: "{companyName}" },
                { term: "NIF", desc: "{nif}" },
                { term: "Domicilio social", desc: "{registeredOffice}" },
                { term: "Datos registrales", desc: "{registry}" },
                { term: "Nombre comercial", desc: "{tradeName}" },
                { term: "Establecimiento", desc: "{address}" },
                { term: "Teléfono", desc: "[{phone}](tel:{phoneTel})" },
                { term: "Correo electrónico", desc: "{email}" },
                { term: "Sitio web", desc: "[{siteUrl}]({siteUrl})" },
              ],
            },
            {
              type: "p",
              text: "{tradeName} es un establecimiento de hostelería (tapería y vinoteca) situado en el casco histórico de {city}, junto a la Catedral de San Martiño. Dispone de hojas de reclamaciones a disposición de la clientela en el propio local.",
            },
          ],
        },
        {
          id: "objeto",
          title: "2. Objeto y aceptación",
          blocks: [
            {
              type: "p",
              text: "Este sitio web tiene una finalidad informativa: dar a conocer el local, su carta, su horario y sus vías de contacto, y facilitar la reserva de mesa por teléfono o WhatsApp. El acceso y la navegación atribuyen la condición de persona usuaria e implican la aceptación de este Aviso legal, de la [Política de privacidad](privacy) y de la [Política de cookies](cookies).",
            },
            {
              type: "ul",
              items: [
                "La carta, los precios y los maridajes publicados son **orientativos** y pueden variar según la temporada y la disponibilidad de producto. La carta vigente es la que se ofrece en el local.",
                "El horario puede modificarse en festivos, vacaciones o por causas de fuerza mayor.",
                "Una reserva solicitada por teléfono o WhatsApp solo queda confirmada cuando el local la confirma expresamente.",
              ],
            },
          ],
        },
        {
          id: "condiciones",
          title: "3. Condiciones de uso",
          blocks: [
            {
              type: "p",
              text: "Te comprometes a utilizar la web y sus servicios (incluido el camarero virtual) de forma lícita y conforme a la buena fe. En particular, no está permitido:",
            },
            {
              type: "ul",
              items: [
                "Realizar extracciones masivas o automatizadas de contenidos (scraping) ni sobrecargar deliberadamente el servicio.",
                "Introducir virus, código malicioso o cualquier elemento que pueda dañar los sistemas propios o de terceros.",
                "Suplantar la identidad de otras personas o del propio establecimiento.",
                "Utilizar el camarero virtual para fines ajenos a la información sobre el local, para intentar obtener sus instrucciones internas o para generar contenidos ilícitos u ofensivos.",
              ],
            },
            {
              type: "p",
              text: "Para proteger el servicio, el camarero virtual aplica límites de uso por dirección IP y puede rechazar peticiones que los superen.",
            },
          ],
        },
        {
          id: "propiedad-intelectual",
          title: "4. Propiedad intelectual e industrial",
          blocks: [
            {
              type: "p",
              text: "El diseño de la web, el logotipo «Tixola», los textos, las fotografías, las ilustraciones, los modelos tridimensionales y el código fuente son titularidad de {companyName} o de sus licenciantes y están protegidos por la legislación de propiedad intelectual e industrial. Queda prohibida su reproducción, distribución, comunicación pública o transformación, total o parcial, sin autorización expresa, salvo para el uso personal y privado de la información.",
            },
            {
              type: "p",
              text: "Los iconos de interfaz proceden de la biblioteca Lucide (licencia ISC). Las marcas y logotipos de terceros que aparecen en la web (Google, Google Maps, WhatsApp, TripAdvisor) pertenecen a sus respectivos titulares y se utilizan únicamente para identificar los servicios enlazados.",
            },
          ],
        },
        {
          id: "responsabilidad",
          title: "5. Exclusión de responsabilidad",
          blocks: [
            {
              type: "ul",
              items: [
                "**Disponibilidad**: procuramos que la web funcione sin interrupciones, pero no garantizamos su disponibilidad permanente ni la ausencia de errores. No respondemos de los daños derivados de interrupciones, virus o fallos ajenos a nuestro control.",
                "**Contenidos**: la información se ofrece de buena fe y se revisa periódicamente; no obstante, puede contener errores tipográficos o datos desactualizados (precios, horario, platos). Nos reservamos el derecho de modificarla sin previo aviso.",
                "**Alérgenos**: la información sobre alérgenos de la carta es orientativa. En cocina se manipulan los 14 alérgenos de declaración obligatoria (Reglamento (UE) n.º 1169/2011) y no podemos descartar trazas. La información válida y actualizada es la que facilita el personal en el local; consúltala siempre antes de pedir.",
                "**Camarero virtual**: sus respuestas se generan mediante inteligencia artificial y pueden ser inexactas o incompletas. Tienen carácter meramente informativo y no sustituyen la confirmación del personal del local, especialmente en materia de alergias, precios y reservas.",
                "**Enlaces**: la web contiene enlaces a sitios de terceros (Google Maps, WhatsApp, TripAdvisor) sobre cuyos contenidos y políticas no tenemos control ni asumimos responsabilidad.",
              ],
            },
          ],
        },
        {
          id: "proteccion-de-datos",
          title: "6. Protección de datos y cookies",
          blocks: [
            {
              type: "p",
              text: "El tratamiento de los datos personales se rige por nuestra [Política de privacidad](privacy). El uso de cookies y tecnologías similares se explica en la [Política de cookies](cookies), donde también puedes cambiar tus preferencias.",
            },
          ],
        },
        {
          id: "legislacion",
          title: "7. Legislación aplicable y jurisdicción",
          blocks: [
            {
              type: "p",
              text: "Este Aviso legal se rige por la legislación española. Para cualquier controversia derivada del acceso o uso de la web, las partes se someten a los juzgados y tribunales del domicilio de la persona usuaria cuando tenga la condición de consumidora; en los demás casos, a los juzgados y tribunales de {city}. Como consumidor o consumidora, dispones además de las hojas de reclamaciones oficiales de la Xunta de Galicia en el propio establecimiento.",
            },
            {
              type: "p",
              text: "Fecha de última actualización: {updated}.",
            },
          ],
        },
      ],
    },

    /* ── Política de cookies ── */
    cookies: {
      description:
        "Qué cookies y almacenamiento local usa la web de Tixola Tapería, para qué sirven, cuánto duran y cómo puedes aceptarlas, rechazarlas o cambiar tu decisión.",
      intro:
        "Esta web usa muy pocas cookies, y todas las que se instalan por defecto son técnicas: sirven para recordar tu idioma y tu decisión sobre las propias cookies. Aquí tienes el detalle y cómo gestionarlas.",
      sections: [
        {
          id: "que-son",
          title: "1. Qué son las cookies y tecnologías similares",
          blocks: [
            {
              type: "p",
              text: "Una cookie es un pequeño fichero que el sitio web guarda en tu navegador para recordar información entre visitas o durante la navegación. Utilizamos también tecnologías equivalentes, como el **almacenamiento local** (localStorage) y el **almacenamiento de sesión** (sessionStorage) del navegador, a las que se aplica la misma normativa (art. 22.2 LSSI-CE y Guía sobre el uso de las cookies de la AEPD).",
            },
          ],
        },
        {
          id: "cookies-que-usamos",
          title: "2. Cookies y almacenamiento que utilizamos",
          blocks: [
            {
              type: "table",
              caption: "Inventario de cookies y almacenamiento del navegador",
              head: ["Nombre", "Tipo", "Titular", "Finalidad", "Duración"],
              rows: [
                ["NEXT_LOCALE", "Técnica (cookie)", "Propia", "Recuerda el idioma que has elegido (español, galego, English, português) para mostrarte la web en ese idioma.", "12 meses"],
                [
                  "tixola_consent",
                  "Técnica (localStorage)",
                  "Propia",
                  "Guarda tu decisión sobre las cookies (aceptar, rechazar o configurar) para no volver a preguntarte en cada visita.",
                  "{consentMonths} meses",
                ],
                [
                  "tixola:waiter:*",
                  "Técnica (sessionStorage)",
                  "Propia",
                  "Conserva la conversación con el camarero virtual mientras la pestaña está abierta, para que no se pierda al cambiar de página.",
                  "Sesión (se borra al cerrar la pestaña)",
                ],
                [
                  "Cookies de Google Maps",
                  "De terceros",
                  "Google LLC",
                  "Solo si pulsas «Ver mapa real» en la sección «Cómo llegar»: al cargarse el mapa, Google puede instalar sus propias cookies (por ejemplo NID o CONSENT) según su política.",
                  "Según Google (hasta 6 meses o más)",
                ],
                [
                  "Analítica",
                  "Opcional (análisis)",
                  "Propia o de terceros",
                  "Medir de forma agregada cómo se usa la web. **Actualmente no hay ninguna herramienta instalada**; si se activa en el futuro, solo se cargará con tu consentimiento y esta tabla se actualizará.",
                  "Nunca más de 24 meses",
                ],
              ],
            },
            {
              type: "note",
              text: "No utilizamos cookies publicitarias, de redes sociales ni de seguimiento entre sitios.",
            },
          ],
        },
        {
          id: "base-legal",
          title: "3. Base legal",
          blocks: [
            {
              type: "p",
              text: "Las cookies técnicas (NEXT_LOCALE, tixola_consent y el almacenamiento del camarero virtual) son necesarias para prestar el servicio que solicitas y están exentas de consentimiento conforme al art. 22.2 de la LSSI-CE. El resto (analítica y cookies de terceros que se instalan al cargar el mapa) solo se utiliza con tu consentimiento, que puedes retirar en cualquier momento.",
            },
          ],
        },
        {
          id: "gestionar",
          title: "4. Cómo aceptar, rechazar o cambiar tu decisión",
          blocks: [
            {
              type: "p",
              text: "En tu primera visita aparece un aviso con tres opciones: **Aceptar todas**, **Solo necesarias** o **Configurar** (para elegir categoría a categoría). Tu decisión se guarda durante {consentMonths} meses; pasado ese plazo te lo volveremos a preguntar. Puedes cambiarla cuando quieras:",
            },
            {
              type: "cookieSettings",
              label: "Configurar cookies",
              hint: "Abre el panel de preferencias de esta web.",
            },
            {
              type: "p",
              text: "También puedes borrar o bloquear las cookies desde la configuración de tu navegador. Ten en cuenta que, si bloqueas las técnicas, la web dejará de recordar tu idioma y tu elección:",
            },
            {
              type: "ul",
              items: [
                "[Google Chrome](https://support.google.com/chrome/answer/95647)",
                "[Mozilla Firefox](https://support.mozilla.org/es/kb/borrar-cookies-y-datos-del-sitio-en-firefox)",
                "[Safari (Mac)](https://support.apple.com/es-es/guide/safari/sfri11471/mac) y [Safari (iPhone/iPad)](https://support.apple.com/es-es/HT201265)",
                "[Microsoft Edge](https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-6415-4e2c-b5d3-b4e4c4d3a0b7)",
              ],
            },
          ],
        },
        {
          id: "terceros",
          title: "5. Cookies de terceros: el mapa de Google",
          blocks: [
            {
              type: "p",
              text: "La sección «Cómo llegar» muestra un mapa ilustrado propio que no instala nada. El mapa real de Google Maps solo se carga cuando pulsas «Ver mapa real»; en ese momento tu navegador se conecta a Google, que recibe tu dirección IP y puede instalar cookies conforme a su [política de privacidad](https://policies.google.com/privacy) y a su [información sobre cookies](https://policies.google.com/technologies/cookies). Si prefieres no cargarlo, usa el enlace «Abrir en Google Maps» o llega andando: estamos a un minuto de la Catedral.",
            },
          ],
        },
        {
          id: "actualizaciones",
          title: "6. Actualizaciones de esta política",
          blocks: [
            {
              type: "p",
              text: "Revisaremos esta política cuando cambien las cookies que utilizamos o la normativa aplicable. Fecha de última actualización: {updated}. Más información sobre el tratamiento de tus datos en la [Política de privacidad](privacy) y sobre el titular en el [Aviso legal](legalNotice).",
            },
          ],
        },
      ],
    },
  },

  /* ══════════════════════════════════════════════════════════════
     PREGUNTAS FRECUENTES (FAQPage JSON-LD en la home)
     Marcadores: {hours} (horario semanal generado), {phone}, {address}
     ══════════════════════════════════════════════════════════════ */
  faq: {
    title: "Preguntas frecuentes",
    items: [
      {
        q: "¿Cuál es el horario de Tixola Tapería?",
        a: "Nuestro horario habitual es: {hours}. En festivos y vacaciones puede variar: consulta el estado «Abierto ahora» de la web o llámanos al {phone}.",
      },
      {
        q: "¿Cómo puedo reservar mesa?",
        a: "Reservamos por teléfono o WhatsApp en el {phone}; te confirmamos al momento. Para grupos grandes te recomendamos llamar con antelación. La reserva queda confirmada cuando te respondemos.",
      },
      {
        q: "¿Tenéis opciones para celíacos e información de alérgenos?",
        a: "Sí. Nuestra carta digital indica los 14 alérgenos de declaración obligatoria de cada plato y permite filtrar los que no llevan gluten; tenemos, por ejemplo, croquetas de bacalao sin gluten, pulpo á feira y tixolas aptas. En cocina se manipulan todos los alérgenos, así que avisa siempre al personal para que te oriente y evitar trazas.",
      },
      {
        q: "¿Hay platos veganos o vegetarianos?",
        a: "Sí. Contamos con opciones 100 % vegetales como la tixola vegana de setas y verduras, la ensalada de quinoa y aguacate o los pimientos de Padrón, además de platos vegetarianos como el queso frito con mermelada de tomate, las bravas Tixola o la tabla de quesos gallegos.",
      },
      {
        q: "¿Cómo llegar y dónde aparcar?",
        a: "Estamos en {address}, a un minuto a pie de la Catedral de San Martiño, en pleno casco histórico de Ourense. La zona es peatonal: te recomendamos aparcar en los aparcamientos públicos del centro y acercarte caminando; en la web tienes el botón «Cómo llegar» que abre la ruta en Google Maps.",
      },
      {
        q: "¿Tenéis terraza?",
        a: "Sí, tenemos terraza en la propia Rúa Juan de Austria, con la iglesia de Santa Eufemia al fondo, y la mantenemos abierta todo el año siempre que el tiempo lo permite. Si quieres mesa en la terraza, indícalo al reservar.",
      },
    ],
  },
};

export default legal;
