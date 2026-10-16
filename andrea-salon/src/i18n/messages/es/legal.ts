/**
 * MÓDULO LEGAL — textos (español de España).
 *
 * Contiene: índice de documentos (título + slug), cabecera/índice de las páginas legales y los
 * TRES DOCUMENTOS estructurados (privacidad, aviso legal, cookies).
 *
 * Marcadores disponibles en cualquier texto (los rellena `LegalArticle` con useFormat()):
 *   {tradeName} {companyName} {nif} {registeredOffice} {email}
 *   {address} {city} {phone} {phoneTel} {siteUrl} {updated} {consentMonths}
 * Enlaces: [texto](privacy | legalNotice | cookies | home | servicios | bonos | reservar | https://… | mailto:… | tel:…)
 * Énfasis: **texto**
 *
 * ⚠️ Los datos del titular ({nif}, {registeredOffice}, {email}) salen de `BUSINESS.legal` vía
 * `src/data/legal.ts` y se muestran resaltados mientras conserven los corchetes.
 * Los `slug` NO se traducen: forman la URL (/legal/<slug>) que enlazan el pie, el sitemap y hreflang.
 *
 * La web de hoy no tiene chat ni tienda de bonos, pero la política ya los describe porque llegan
 * en las fases 2 y 3 y el texto tiene que estar listo ANTES de que exista el tratamiento, no
 * después. Cada uno dice claramente que solo se aplica cuando la pieza esté activa.
 */
import type { LegalDoc } from "@/data/legal";

export interface LegalMessages {
  privacy: { title: string; slug: string };
  legalNotice: { title: string; slug: string };
  cookies: { title: string; slug: string };
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
}

const legal: LegalMessages = {
  /* ── Índice (título + slug de la URL /legal/<slug>) ── */
  privacy: { title: "Política de privacidad", slug: "privacidad" },
  legalNotice: { title: "Aviso legal", slug: "aviso-legal" },
  cookies: { title: "Política de cookies", slug: "cookies" },

  /* ── Páginas legales: cabecera, índice y pie ── */
  page: {
    kicker: "Información legal",
    breadcrumbAria: "Migas de pan",
    home: "Inicio",
    updatedOn: "Última actualización: {date}",
    tocTitle: "En esta página",
    tocAria: "Índice del documento",
    relatedTitle: "Otros documentos",
    placeholderNote: "Los datos entre corchetes están pendientes de confirmación por parte de la titular del salón.",
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
        "Cómo trata Andrea Salón (Ourense) tus datos cuando reservas una cita, compras un bono o nos escribes. Derechos, plazos y encargados del tratamiento.",
      intro:
        "En {tradeName} tratamos pocos datos y solo los que hacen falta para darte cita, avisarte y atenderte bien: tu nombre, tu móvil y tu correo cuando reservas, y lo que tú decidas contarnos. Aquí te explicamos, sin letra pequeña, qué hacemos con ellos, quién nos ayuda a tratarlos y cómo puedes pedirnos que los borremos.",
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
                { term: "Domicilio", desc: "{registeredOffice}" },
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
            { type: "p", text: "Todos los datos nos los facilitas tú directamente, al reservar, al comprar un bono o al escribirnos. No compramos datos ni los obtenemos de terceros." },
            {
              type: "dl",
              items: [
                {
                  term: "Reserva de cita",
                  desc: "Nombre, teléfono móvil, correo electrónico, el servicio y la profesional que eliges, la fecha y la hora, y las notas que quieras dejarnos. Con ellos te confirmamos la cita, te la recordamos y la gestionamos si la cambias o la cancelas.",
                },
                {
                  term: "Alergias y sensibilidades",
                  desc: "Si en las notas de la reserva o en el salón nos cuentas una alergia (a un esmalte, al acrílico, a un adhesivo), la usamos únicamente para no usar ese producto contigo. Es un dato de salud (art. 9 RGPD) que tratamos con tu **consentimiento explícito**, que nos das al escribirlo. Lo ve solo el equipo que te atiende, no sale nunca en exportaciones de datos y lo borramos cuando nos lo pidas.",
                },
                {
                  term: "Bonos y tarjetas regalo",
                  desc: "Cuando la tienda de bonos esté activa: nombre y correo de quien compra y, si es un regalo, de quien lo recibe; el bono, su código, las sesiones consumidas y la fecha de cada canje. **No guardamos datos de tu tarjeta**: el pago lo hace Stripe en su propia página y a nosotros solo nos llega la confirmación.",
                },
                {
                  term: "Historial de visitas",
                  desc: "Las citas que has tenido, los servicios y lo que has pagado. Nos sirve para atenderte mejor (saber qué te hiciste la última vez) y para la gestión interna del salón.",
                },
                {
                  term: "Consultas por teléfono, WhatsApp o Instagram",
                  desc: "Lo que tú decidas contarnos. Los botones de llamar y de WhatsApp abren tu propia aplicación: ningún mensaje pasa por nuestros servidores.",
                },
                {
                  term: "Navegación",
                  desc: "Datos técnicos que genera cualquier visita (dirección IP, tipo de navegador, páginas solicitadas), tratados por nuestro proveedor de alojamiento por motivos de seguridad; el idioma elegido (cookie NEXT_LOCALE) y tu decisión sobre cookies (almacenamiento local as-consent).",
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
                  "Gestionar tu cita: confirmarla, recordártela el día antes y permitirte cambiarla o cancelarla",
                  "Ejecución del servicio que nos pides (art. 6.1.b RGPD)",
                  "Mientras seas clienta y hasta 3 años después de tu última visita; después se anonimiza",
                ],
                [
                  "Tener en cuenta tus alergias y sensibilidades",
                  "Tu consentimiento explícito (art. 9.2.a RGPD)",
                  "Hasta que lo retires o pidas que lo borremos",
                ],
                [
                  "Vender y canjear bonos y tarjetas regalo",
                  "Ejecución del contrato (art. 6.1.b RGPD) y obligaciones contables y fiscales (art. 6.1.c RGPD)",
                  "Lo que dure el bono y los plazos fiscales (hasta 6 años)",
                ],
                [
                  "Enviarte novedades o promociones",
                  "Solo con tu consentimiento, que puedes marcar al reservar y retirar cuando quieras (art. 6.1.a RGPD)",
                  "Hasta que te des de baja",
                ],
                [
                  "Garantizar la seguridad y el funcionamiento técnico de la web",
                  "Interés legítimo en la seguridad de la red y de la información (art. 6.1.f RGPD, considerando 49)",
                  "Registros técnicos del proveedor de alojamiento durante un periodo limitado",
                ],
                [
                  "Recordar tu idioma y tu decisión sobre cookies",
                  "Cookies técnicas exentas de consentimiento (art. 22.2 LSSI-CE)",
                  "{consentMonths} meses",
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
              text: "No tomamos decisiones automatizadas con efectos jurídicos sobre ti ni elaboramos perfiles. Las etiquetas internas del panel (por ejemplo, «hace tiempo que no viene») sirven solo para que el salón te atienda mejor, nunca para decidir nada sobre ti.",
            },
          ],
        },
        {
          id: "destinatarios",
          title: "4. Encargados del tratamiento y otros destinatarios",
          blocks: [
            {
              type: "p",
              text: "No vendemos ni cedemos tus datos. Para que la web, la agenda, los correos y los pagos funcionen nos apoyamos en estas empresas, que tratan datos **por cuenta nuestra**, siguiendo nuestras instrucciones y con un contrato conforme al art. 28 del RGPD:",
            },
            {
              type: "subprocessors",
              caption: "Encargados del tratamiento",
              head: ["Empresa", "Para qué", "Dónde trata los datos", "Garantía"],
            },
            {
              type: "p",
              text: "Hay además terceros que **no actúan por cuenta nuestra** y a los que llegan datos solo porque su contenido se carga en la web o porque tú pulsas su enlace: **Google** (el mapa de «Cómo llegar», que solo se carga si aceptas las cookies, y los enlaces a Google Maps y a las reseñas), **Meta** (los enlaces a WhatsApp, Instagram y Facebook) y **Stripe** como responsable de la página de pago. Cada uno actúa bajo su propia política de privacidad.",
            },
            {
              type: "p",
              text: "También podremos comunicar datos a las autoridades competentes cuando una norma nos obligue a ello.",
            },
          ],
        },
        {
          id: "transferencias",
          title: "5. Transferencias internacionales",
          blocks: [
            {
              type: "p",
              text: "La base de datos con tus citas y tus datos está en la Unión Europea (Fráncfort). El alojamiento de la web y el envío de correos pueden implicar tratamientos en Estados Unidos, siempre con garantías adecuadas conforme al capítulo V del RGPD: cláusulas contractuales tipo aprobadas por la Comisión Europea y, cuando el proveedor está certificado, el Marco de Privacidad de Datos UE-EE. UU. Puedes pedirnos una copia de las garantías aplicables escribiendo a {email}.",
            },
          ],
        },
        {
          id: "derechos",
          title: "6. Tus derechos",
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
                "**Retirar el consentimiento** en cualquier momento, sin que afecte a la licitud del tratamiento previo (por ejemplo, las alergias anotadas, las comunicaciones comerciales o tu decisión sobre cookies).",
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
          title: "7. Menores de edad y cambios en esta política",
          blocks: [
            {
              type: "p",
              text: "La reserva online está pensada para mayores de 14 años. Si una persona menor de esa edad quiere una cita, debe reservarla su madre, padre o tutor con sus propios datos. Esta política puede actualizarse: la fecha de la versión vigente aparece al principio de la página.",
            },
          ],
        },
      ],
    },

    /* ── Aviso legal (LSSI-CE) ── */
    legalNotice: {
      description:
        "Quién está detrás de la web de Andrea Salón (Ourense) y en qué condiciones se usa: datos de la titular, reservas, cancelaciones, bonos y propiedad intelectual.",
      intro:
        "Esta web es de {tradeName}, un salón de uñas y belleza en {city}. Aquí tienes los datos de la titular que exige la ley y las condiciones con las que puedes usar la web, reservar una cita y, cuando esté disponible, comprar un bono.",
      sections: [
        {
          id: "titular",
          title: "1. Titular de la web",
          blocks: [
            { type: "p", text: "En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), estos son los datos de la titular:" },
            {
              type: "dl",
              items: [
                { term: "Titular", desc: "{companyName}" },
                { term: "NIF", desc: "{nif}" },
                { term: "Domicilio", desc: "{registeredOffice}" },
                { term: "Establecimiento", desc: "{tradeName} · {address}" },
                { term: "Teléfono", desc: "[{phone}](tel:{phoneTel})" },
                { term: "Correo electrónico", desc: "{email}" },
                { term: "Web", desc: "{siteUrl}" },
              ],
            },
          ],
        },
        {
          id: "objeto",
          title: "2. Objeto de la web",
          blocks: [
            {
              type: "p",
              text: "La web informa sobre el salón —servicios, equipo, galería, reseñas, horario y cómo llegar— y permite **reservar cita online**. Cuando la tienda esté activa, permitirá también comprar bonos y tarjetas regalo. No hay registro de usuarios ni tienda de productos.",
            },
          ],
        },
        {
          id: "reservas",
          title: "3. Reservas, cambios y cancelaciones",
          blocks: [
            {
              type: "ul",
              items: [
                "Al reservar, te pedimos nombre, móvil y correo para confirmarte la cita y recordártela. La reserva queda **confirmada al instante** y te llega un correo con los enlaces para cambiarla o cancelarla.",
                "Puedes cambiar o cancelar la cita desde ese enlace hasta el plazo que se indica en la propia reserva. Pasado ese plazo, llámanos: lo que podamos recolocar, lo recolocamos.",
                "Si no vienes y no avisas, el salón puede pedirte una señal en la siguiente reserva. Las condiciones concretas (plazos y señal) son las que se muestran en la pantalla de reserva en el momento de reservar.",
                "La reserva es para la hora elegida. Si llegas tarde, el servicio puede acortarse o moverse para no retrasar a la siguiente clienta.",
              ],
            },
            { type: "note", text: "La política de cancelación definitiva está pendiente de confirmar con el salón. Hasta entonces manda lo que se indique en la pantalla de reserva." },
          ],
        },
        {
          id: "bonos",
          title: "4. Bonos y tarjetas regalo",
          blocks: [
            {
              type: "ul",
              items: [
                "El precio, el número de sesiones y la **fecha de caducidad** se muestran en grande antes de pagar y se repiten en el correo que recibes con el bono.",
                "El pago se realiza en la página segura de Stripe con tarjeta, Apple Pay o Google Pay. {tradeName} no ve ni guarda los datos de tu tarjeta. El importe se cobra en la cuenta del salón.",
                "El bono se canjea en el salón presentando su código o su QR. Cada sesión se descuenta al usarla y te decimos cuántas te quedan.",
                "Los bonos no son reembolsables en dinero salvo lo que establezca la ley. Si un servicio deja de ofrecerse, se cambia por otro de igual valor.",
                "Como consumidora, tienes **14 días para desistir** de la compra de un bono sin dar explicaciones, siempre que no hayas canjeado ninguna sesión. Escríbenos a {email} y te devolvemos el importe por el mismo medio de pago.",
              ],
            },
            { type: "note", text: "La caducidad de los bonos está pendiente de confirmar con el salón. Hasta que la tienda se active, los bonos se compran en el salón." },
          ],
        },
        {
          id: "precios",
          title: "5. Precios y servicios",
          blocks: [
            {
              type: "p",
              text: "Los precios de la web incluyen IVA y son los vigentes en el momento de reservar. Los servicios marcados «desde» dependen del trabajo (largo, estado de la uña, diseño): el precio final se acuerda contigo en el salón antes de empezar. Las duraciones son orientativas.",
            },
          ],
        },
        {
          id: "uso",
          title: "6. Condiciones de uso",
          blocks: [
            {
              type: "p",
              text: "El acceso es libre y gratuito. Quien la visita se compromete a hacer un uso adecuado de sus contenidos, a dar datos veraces al reservar y a no usar la web para reservas falsas, masivas o automatizadas, ni para actividades contrarias a la ley o a la buena fe. El salón puede cancelar las reservas que detecte como abusivas.",
            },
          ],
        },
        {
          id: "propiedad",
          title: "7. Propiedad intelectual e industrial",
          blocks: [
            {
              type: "p",
              text: "Los textos, el diseño, el logotipo y las fotografías de esta web pertenecen a {tradeName} o se usan con permiso. No se permite reproducirlos con fines comerciales sin autorización. Las reseñas de clientas pertenecen a sus autoras y se citan con su nombre y la plataforma de origen (Google).",
            },
          ],
        },
        {
          id: "enlaces",
          title: "8. Enlaces a otras webs",
          blocks: [
            {
              type: "p",
              text: "Esta web enlaza a servicios de terceros (Google Maps, Instagram, Facebook, WhatsApp y la pasarela de pago de Stripe). Sus contenidos y sus condiciones son responsabilidad de esos terceros.",
            },
          ],
        },
        {
          id: "responsabilidad",
          title: "9. Responsabilidad",
          blocks: [
            {
              type: "p",
              text: "La titular procura que la información esté actualizada y sea correcta, pero no responde de interrupciones del servicio ajenas a su control, de errores en servicios de terceros ni de los daños derivados de un uso indebido de la web. Si por un fallo técnico una reserva no quedara registrada, te lo comunicaremos en cuanto lo sepamos y buscaremos otra hora.",
            },
          ],
        },
        {
          id: "ley",
          title: "10. Ley aplicable y jurisdicción",
          blocks: [
            {
              type: "p",
              text: "Estas condiciones se rigen por la legislación española. Las controversias se someterán a los juzgados y tribunales que correspondan conforme a la ley; si quien reclama actúa como consumidora, a los de su domicilio. Puedes acudir también a la plataforma europea de resolución de litigios en línea: [ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr).",
            },
          ],
        },
      ],
    },

    /* ── Política de cookies (LSSI-CE art. 22.2 + guía AEPD) ── */
    cookies: {
      description:
        "Qué cookies usa la web de Andrea Salón (Ourense): solo las técnicas y, si lo aceptas, las del mapa de Google. Sin analítica ni publicidad.",
      intro:
        "Esta web usa muy pocas cookies. Las imprescindibles para que funcione (tu idioma y tu decisión sobre cookies) no necesitan permiso. Lo único que sí lo necesita es el mapa de Google de la página de contacto, y por eso no se carga hasta que lo aceptes.",
      sections: [
        {
          id: "resumen",
          title: "1. En resumen",
          blocks: [
            {
              type: "ul",
              items: [
                "Al entrar te preguntamos con un aviso. Hasta que eliges, la web no carga nada que instale cookies de terceros.",
                "Si rechazas, todo funciona igual —reservar incluido— salvo el mapa incrustado: tienes la dirección y el enlace para abrirla en Google Maps.",
                "**No usamos cookies de analítica ni de publicidad.** Las tipografías se sirven desde la propia web, sin conectar con Google Fonts.",
                "El pago de los bonos se hace en la página de Stripe, no en la nuestra: las cookies de esa página son de Stripe y se rigen por su política.",
              ],
            },
          ],
        },
        {
          id: "cuales",
          title: "2. Qué se guarda en tu navegador",
          blocks: [
            {
              type: "table",
              caption: "Cookies y almacenamiento local que usa esta web",
              head: ["Nombre", "Quién", "Para qué", "Duración"],
              rows: [
                ["NEXT_LOCALE", "Esta web (técnica)", "Recordar el idioma que eliges", "12 meses"],
                ["as-consent", "Esta web (técnica, almacenamiento local)", "Guardar tu decisión sobre cookies y la fecha", "{consentMonths} meses"],
                ["Cookies de Google Maps", "Google LLC (terceros)", "Funcionamiento del mapa incrustado; Google puede medir su uso", "Las que indique Google · solo si aceptas el mapa"],
              ],
            },
            {
              type: "p",
              text: "Las dos primeras son técnicas: no identifican a nadie, no salen de tu dispositivo y están exentas de consentimiento (art. 22.2 LSSI-CE). Google actúa como responsable independiente de las suyas: [policies.google.com/technologies/cookies](https://policies.google.com/technologies/cookies).",
            },
          ],
        },
        {
          id: "eleccion",
          title: "3. Tu elección y cómo cambiarla",
          blocks: [
            {
              type: "p",
              text: "Lo que eliges en el aviso se guarda en tu navegador durante {consentMonths} meses; después te lo volvemos a preguntar. Puedes cambiar de opinión cuando quieras desde «Configurar cookies», al pie de cada página o con el botón de aquí abajo. Para retirar el permiso del mapa basta con desactivarlo: deja de cargarse al momento. Las cookies que Google ya hubiera instalado se borran desde los ajustes de tu navegador (Chrome, Safari, Firefox o Edge).",
            },
            { type: "cookieSettings", label: "Configurar cookies", hint: "Abre el panel para cambiar tu elección." },
          ],
        },
        {
          id: "mas",
          title: "4. Más información",
          blocks: [
            {
              type: "p",
              text: "Cómo tratamos tus datos personales está explicado en la [política de privacidad](privacy). Para cualquier duda sobre cookies, escríbenos a {email}.",
            },
          ],
        },
      ],
    },
  },
};
export default legal;
