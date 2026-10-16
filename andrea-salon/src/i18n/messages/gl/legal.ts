import type { DeepPartial, Messages } from "@/i18n/types";

/**
 * MÓDULO LEGAL — textos en galego (ver `messages/es/legal.ts`, que manda).
 *
 * `src/data/legal.ts` deixa o TEXTO dos documentos en `messages/<idioma>/` para que cada idioma o
 * traduza; aquí está traducido enteiro e coa mesma estrutura (mesmas seccións, mesmos `id`, mesmos
 * marcadores `{así}` e mesmos destinos de ligazón `[texto](privacy)`).
 *
 * O que NON se toca desde aquí:
 *  - os `slug` (non se escriben: caen aos do castelán, porque forman a URL /legal/<slug>);
 *  - a táboa de encargados do tratamento, que sae de `SUBPROCESSORS` en `src/data/legal.ts`;
 *  - os marcadores de datos pendentes («[NIF PENDIENTE]»…), que tamén saen de alí.
 * Cando cambie o texto en castelán, hai que cambiar este á vez (e `LEGAL_UPDATED_AT`).
 */
const legal: DeepPartial<Messages["legal"]> = {
  privacy: { title: "Política de privacidade" },
  legalNotice: { title: "Aviso legal" },
  cookies: { title: "Política de cookies" },

  page: {
    kicker: "Información legal",
    breadcrumbAria: "Ruta de navegación",
    home: "Inicio",
    updatedOn: "Última actualización: {date}",
    tocTitle: "Nesta páxina",
    tocAria: "Índice do documento",
    relatedTitle: "Outros documentos",
    placeholderNote: "Os datos entre corchetes están pendentes de confirmación por parte da titular do salón.",
    contactTitle: "Dúbidas sobre os teus datos?",
    contactText: "Escríbenos a {email} ou chámanos ao {phone}. Respondémosche no prazo máximo dun mes.",
    backHome: "Volver ao inicio",
  },

  docs: {
    /* ── Política de privacidade (RGPD + LOPDGDD) ── */
    privacy: {
      description:
        "Como trata Andrea Salón (Ourense) os teus datos cando reservas unha cita, mercas un bono ou nos escribes. Dereitos, prazos e encargados do tratamento.",
      intro:
        "En {tradeName} tratamos poucos datos e só os que fan falta para darche cita, avisarte e atenderte ben: o teu nome, o teu móbil e o teu correo cando reservas, e o que ti decidas contarnos. Aquí explicámosche, sen letra pequena, que facemos con eles, quen nos axuda a tratalos e como podes pedirnos que os borremos.",
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
                { term: "Domicilio", desc: "{registeredOffice}" },
                { term: "Nome comercial e establecemento", desc: "{tradeName} · {address}" },
                { term: "Teléfono", desc: "[{phone}](tel:{phoneTel})" },
                { term: "Correo electrónico", desc: "{email}" },
              ],
            },
            {
              type: "p",
              text: "Non estamos obrigados a designar un delegado de protección de datos (art. 37 RGPD e art. 34 LOPDGDD). Para calquera cuestión sobre os teus datos, escríbenos a {email}.",
            },
          ],
        },
        {
          id: "datos",
          title: "2. Que datos tratamos e de onde proceden",
          blocks: [
            {
              type: "p",
              text: "Todos os datos que tratamos dásnolos ti directamente: ao reservar, ao mercar un bono ou ao escribirnos. Non mercamos datos nin os obtemos de terceiros.",
            },
            {
              type: "dl",
              items: [
                {
                  term: "Reserva de cita",
                  desc: "Nome, teléfono móbil, correo electrónico, o servizo e a profesional que escolles, a data e a hora, e as notas que queiras deixarnos. Con eles confirmámosche a cita, lembrámoscha e xestionámola se a cambias ou a cancelas.",
                },
                {
                  term: "Alerxias e sensibilidades",
                  desc: "Se nas notas da reserva ou no salón nos contas unha alerxia (a un esmalte, ao acrílico, a un adhesivo), usámola unicamente para non usar ese produto contigo. É un dato de saúde (art. 9 RGPD) que tratamos co teu **consentimento explícito**, que nos dás ao escribilo. Só o ve o equipo que te atende, non sae nunca en exportacións de datos e borrámolo cando nolo pidas.",
                },
                {
                  term: "Bonos e tarxetas agasallo",
                  desc: "Cando a tenda de bonos estea activa: nome e correo de quen merca e, se é un agasallo, de quen o recibe; o bono, o seu código, as sesións consumidas e a data de cada canxe. **Non gardamos datos da túa tarxeta**: o pagamento faino Stripe na súa propia páxina e a nós só nos chega a confirmación.",
                },
                {
                  term: "Historial de visitas",
                  desc: "As citas que tiveches, os servizos e o que pagaches. Sérvenos para atenderte mellor (saber que che fixemos a última vez) e para a xestión interna do salón.",
                },
                {
                  term: "Consultas por teléfono, WhatsApp ou Instagram",
                  desc: "O que ti decidas contarnos. Os botóns de chamar e de WhatsApp abren a túa propia aplicación: ningunha mensaxe pasa polos nosos servidores.",
                },
                {
                  term: "Navegación",
                  desc: "Datos técnicos que xera calquera visita (enderezo IP, tipo de navegador, páxinas solicitadas), tratados polo noso provedor de aloxamento por motivos de seguridade; o idioma escollido (cookie NEXT_LOCALE) e a túa decisión sobre as cookies (almacenamento local as-consent).",
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
                  "Xestionar a túa cita: confirmala, lembrarcha o día antes e permitirche cambiala ou cancelala",
                  "Execución do servizo que nos pides (art. 6.1.b RGPD)",
                  "Mentres sexas clienta e ata 3 anos despois da túa última visita; despois anonimízase",
                ],
                [
                  "Ter en conta as túas alerxias e sensibilidades",
                  "O teu consentimento explícito (art. 9.2.a RGPD)",
                  "Ata que o retires ou pidas que o borremos",
                ],
                [
                  "Vender e canxear bonos e tarxetas agasallo",
                  "Execución do contrato (art. 6.1.b RGPD) e obrigas contables e fiscais (art. 6.1.c RGPD)",
                  "O que dure o bono e os prazos fiscais (ata 6 anos)",
                ],
                [
                  "Enviarche novidades ou promocións",
                  "Só co teu consentimento, que podes marcar ao reservar e retirar cando queiras (art. 6.1.a RGPD)",
                  "Ata que te deas de baixa",
                ],
                [
                  "Garantir a seguridade e o funcionamento técnico da web",
                  "Interese lexítimo na seguridade da rede e da información (art. 6.1.f RGPD, considerando 49)",
                  "Rexistros técnicos do provedor de aloxamento durante un período limitado",
                ],
                [
                  "Lembrar o teu idioma e a túa decisión sobre as cookies",
                  "Cookies técnicas exentas de consentimento (art. 22.2 LSSI-CE)",
                  "{consentMonths} meses",
                ],
                [
                  "Atender o exercicio dos teus dereitos e cumprir obrigas legais",
                  "Obriga legal (art. 6.1.c RGPD)",
                  "Durante os prazos de prescrición das responsabilidades legais",
                ],
              ],
            },
            {
              type: "p",
              text: "Non tomamos decisións automatizadas con efectos xurídicos sobre ti nin elaboramos perfís. As etiquetas internas do panel (por exemplo, «hai tempo que non vén») serven só para que o salón te atenda mellor, nunca para decidir nada sobre ti.",
            },
          ],
        },
        {
          id: "destinatarios",
          title: "4. Encargados do tratamento e outros destinatarios",
          blocks: [
            {
              type: "p",
              text: "Non vendemos nin cedemos os teus datos. Para que a web, a axenda, os correos e os pagamentos funcionen, apoiámonos nestas empresas, que tratan datos **por conta nosa**, seguindo as nosas instrucións e cun contrato conforme ao art. 28 do RGPD:",
            },
            {
              type: "subprocessors",
              caption: "Encargados do tratamento",
              head: ["Empresa", "Para que", "Onde trata os datos", "Garantía"],
            },
            {
              type: "p",
              text: "Hai ademais terceiros que **non actúan por conta nosa** e aos que chegan datos só porque o seu contido se carga na web ou porque ti premes a súa ligazón: **Google** (o mapa de «Como chegar», que só se carga se aceptas as cookies, e as ligazóns a Google Maps e ás opinións), **Meta** (as ligazóns a WhatsApp, Instagram e Facebook) e **Stripe** como responsable da páxina de pagamento. Cada un actúa baixo a súa propia política de privacidade.",
            },
            {
              type: "p",
              text: "Tamén poderemos comunicar datos ás autoridades competentes cando unha norma nos obrigue a iso.",
            },
          ],
        },
        {
          id: "transferencias",
          title: "5. Transferencias internacionais",
          blocks: [
            {
              type: "p",
              text: "A base de datos coas túas citas e os teus datos está na Unión Europea (Frankfurt). O aloxamento da web e o envío de correos poden implicar tratamentos nos Estados Unidos, sempre con garantías axeitadas conforme ao capítulo V do RGPD: cláusulas contractuais tipo aprobadas pola Comisión Europea e, cando o provedor está certificado, o Marco de Privacidade de Datos UE-EUA. Podes pedirnos unha copia das garantías aplicables escribindo a {email}.",
            },
          ],
        },
        {
          id: "derechos",
          title: "6. Os teus dereitos",
          blocks: [
            {
              type: "p",
              text: "Podes exercer en calquera momento, de forma gratuíta, os dereitos que che recoñece o RGPD:",
            },
            {
              type: "ul",
              items: [
                "**Acceso**: saber que datos teus tratamos.",
                "**Rectificación**: corrixir datos inexactos ou incompletos.",
                "**Supresión**: pedir que borremos os teus datos cando xa non sexan necesarios.",
                "**Oposición** e **limitación do tratamento**.",
                "**Portabilidade**: recibir os teus datos nun formato estruturado de uso común.",
                "**Retirar o consentimento** en calquera momento, sen que afecte á licitude do tratamento previo (por exemplo, as alerxias anotadas, as comunicacións comerciais ou a túa decisión sobre as cookies).",
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
          title: "7. Menores de idade e cambios nesta política",
          blocks: [
            {
              type: "p",
              text: "A reserva en liña está pensada para maiores de 14 anos. Se unha persoa menor desa idade quere unha cita, debe reservala a súa nai, pai ou titor cos seus propios datos. Esta política pode actualizarse: a data da versión vixente aparece ao principio da páxina.",
            },
          ],
        },
      ],
    },

    /* ── Aviso legal (LSSI-CE) ── */
    legalNotice: {
      description:
        "Quen está detrás da web de Andrea Salón (Ourense) e en que condicións se usa: datos da titular, reservas, cancelacións, bonos e propiedade intelectual.",
      intro:
        "Esta web é de {tradeName}, un salón de unllas e beleza en {city}. Aquí tes os datos da titular que esixe a lei e as condicións coas que podes usar a web, reservar unha cita e, cando estea dispoñible, mercar un bono.",
      sections: [
        {
          id: "titular",
          title: "1. Titular da web",
          blocks: [
            {
              type: "p",
              text: "En cumprimento do artigo 10 da Lei 34/2002, de servizos da sociedade da información e de comercio electrónico (LSSI-CE), estes son os datos da titular:",
            },
            {
              type: "dl",
              items: [
                { term: "Titular", desc: "{companyName}" },
                { term: "NIF", desc: "{nif}" },
                { term: "Domicilio", desc: "{registeredOffice}" },
                { term: "Establecemento", desc: "{tradeName} · {address}" },
                { term: "Teléfono", desc: "[{phone}](tel:{phoneTel})" },
                { term: "Correo electrónico", desc: "{email}" },
                { term: "Web", desc: "{siteUrl}" },
              ],
            },
          ],
        },
        {
          id: "objeto",
          title: "2. Obxecto da web",
          blocks: [
            {
              type: "p",
              text: "A web informa sobre o salón —servizos, equipo, galería, opinións, horario e como chegar— e permite **reservar cita en liña**. Cando a tenda estea activa, permitirá tamén mercar bonos e tarxetas agasallo. Non hai rexistro de usuarios nin tenda de produtos.",
            },
          ],
        },
        {
          id: "reservas",
          title: "3. Reservas, cambios e cancelacións",
          blocks: [
            {
              type: "ul",
              items: [
                "Ao reservar, pedímosche nome, móbil e correo para confirmarche a cita e lembrarcha. A reserva queda **confirmada ao instante** e chégache un correo coas ligazóns para cambiala ou cancelala.",
                "Podes cambiar ou cancelar a cita desde esa ligazón ata o prazo que se indica na propia reserva. Pasado ese prazo, chámanos: o que poidamos recolocar, recolocámolo.",
                "Se non vés e non avisas, o salón pode pedirche un sinal na seguinte reserva. As condicións concretas (prazos e sinal) son as que se amosan na pantalla de reserva no momento de reservar.",
                "A reserva é para a hora escollida. Se chegas tarde, o servizo pode acurtarse ou moverse para non atrasar a seguinte clienta.",
              ],
            },
            {
              type: "note",
              text: "A política de cancelación definitiva está pendente de confirmar co salón. Ata entón, manda o que se indique na pantalla de reserva.",
            },
          ],
        },
        {
          id: "bonos",
          title: "4. Bonos e tarxetas agasallo",
          blocks: [
            {
              type: "ul",
              items: [
                "O prezo, o número de sesións e a **data de caducidade** amósanse en grande antes de pagar e repítense no correo que recibes co bono.",
                "O pagamento realízase na páxina segura de Stripe con tarxeta, Apple Pay ou Google Pay. {tradeName} non ve nin garda os datos da túa tarxeta. O importe cóbrase na conta do salón.",
                "O bono cánxease no salón presentando o seu código ou o seu QR. Cada sesión descóntase ao usala e dicímosche cantas che quedan.",
                "Os bonos non son reembolsables en diñeiro agás nos casos que estableza a lei. Se un servizo deixa de ofrecerse, cámbiase por outro de igual valor.",
                "Como consumidora, tes **14 días para desistir** da compra dun bono sen dar explicacións, sempre que aínda non canxeases ningunha sesión. Escríbenos a {email} e devolvémosche o importe polo mesmo medio de pagamento.",
              ],
            },
            {
              type: "note",
              text: "A caducidade dos bonos está pendente de confirmar co salón. Ata que a tenda se active, os bonos mércanse no salón.",
            },
          ],
        },
        {
          id: "precios",
          title: "5. Prezos e servizos",
          blocks: [
            {
              type: "p",
              text: "Os prezos da web inclúen IVE e son os vixentes no momento de reservar. Os servizos marcados «desde» dependen do traballo (lonxitude, estado da unlla, deseño): o prezo final acórdase contigo no salón antes de comezar. As duracións son orientativas.",
            },
          ],
        },
        {
          id: "uso",
          title: "6. Condicións de uso",
          blocks: [
            {
              type: "p",
              text: "O acceso é libre e gratuíto. Quen a visita comprométese a facer un uso axeitado dos seus contidos, a dar datos veraces ao reservar e a non usar a web para reservas falsas, masivas ou automatizadas, nin para actividades contrarias á lei ou á boa fe. O salón pode cancelar as reservas que detecte como abusivas.",
            },
          ],
        },
        {
          id: "propiedad",
          title: "7. Propiedade intelectual e industrial",
          blocks: [
            {
              type: "p",
              text: "Os textos, o deseño, o logotipo e as fotografías desta web pertencen a {tradeName} ou úsanse con permiso. Non se permite reproducilos con fins comerciais sen autorización. As opinións das clientas pertencen ás súas autoras e cítanse co seu nome e a plataforma de orixe (Google).",
            },
          ],
        },
        {
          id: "enlaces",
          title: "8. Ligazóns a outras webs",
          blocks: [
            {
              type: "p",
              text: "Esta web ten ligazóns a servizos de terceiros (Google Maps, Instagram, Facebook, WhatsApp e a pasarela de pagamento de Stripe). Os seus contidos e as súas condicións son responsabilidade deses terceiros.",
            },
          ],
        },
        {
          id: "responsabilidad",
          title: "9. Responsabilidade",
          blocks: [
            {
              type: "p",
              text: "A titular procura que a información estea actualizada e sexa correcta, pero non responde de interrupcións do servizo alleas ao seu control, de erros en servizos de terceiros nin dos danos derivados dun uso indebido da web. Se por un fallo técnico unha reserva non quedase rexistrada, comunicarémoscho en canto o saibamos e buscaremos outra hora.",
            },
          ],
        },
        {
          id: "ley",
          title: "10. Lei aplicable e xurisdición",
          blocks: [
            {
              type: "p",
              text: "Estas condicións réxense pola lexislación española. As controversias someteranse aos xulgados e tribunais que correspondan conforme á lei; se quen reclama actúa como consumidora, aos do seu domicilio. Podes acudir tamén á plataforma europea de resolución de litixios en liña: [ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr).",
            },
          ],
        },
      ],
    },

    /* ── Política de cookies (LSSI-CE art. 22.2 + guía AEPD) ── */
    cookies: {
      description:
        "Que cookies usa a web de Andrea Salón (Ourense): só as técnicas e, se o aceptas, as do mapa de Google. Sen analítica nin publicidade.",
      intro:
        "Esta web usa moi poucas cookies. As imprescindibles para que funcione (o teu idioma e a túa decisión sobre as cookies) non precisan permiso. O único que si o precisa é o mapa de Google da páxina de contacto, e por iso non se carga ata que o aceptes.",
      sections: [
        {
          id: "resumen",
          title: "1. En resumo",
          blocks: [
            {
              type: "ul",
              items: [
                "Ao entrar, preguntámosche cun aviso. Ata que escollas, a web non carga nada que instale cookies de terceiros.",
                "Se rexeitas, todo funciona igual —reservar incluído— agás o mapa incrustado: tes o enderezo e a ligazón para abrilo en Google Maps.",
                "**Non usamos cookies de analítica nin de publicidade.** As tipografías sérvense desde a propia web, sen conectar con Google Fonts.",
                "O pagamento dos bonos faise na páxina de Stripe, non na nosa: as cookies desa páxina son de Stripe e réxense pola súa política.",
              ],
            },
          ],
        },
        {
          id: "cuales",
          title: "2. Que se garda no teu navegador",
          blocks: [
            {
              type: "table",
              caption: "Cookies e almacenamento local que usa esta web",
              head: ["Nome", "Quen", "Para que", "Duración"],
              rows: [
                ["NEXT_LOCALE", "Esta web (técnica)", "Lembrar o idioma que escolles", "12 meses"],
                ["as-consent", "Esta web (técnica, almacenamento local)", "Gardar a túa decisión sobre as cookies e a data", "{consentMonths} meses"],
                ["Cookies de Google Maps", "Google LLC (terceiros)", "Funcionamento do mapa incrustado; Google pode medir o seu uso", "As que indique Google · só se aceptas o mapa"],
              ],
            },
            {
              type: "p",
              text: "As dúas primeiras son técnicas: non identifican a ninguén, non saen do teu dispositivo e están exentas de consentimento (art. 22.2 LSSI-CE). Google actúa como responsable independente das súas: [policies.google.com/technologies/cookies](https://policies.google.com/technologies/cookies).",
            },
          ],
        },
        {
          id: "eleccion",
          title: "3. A túa elección e como cambiala",
          blocks: [
            {
              type: "p",
              text: "O que escolles no aviso gárdase no teu navegador durante {consentMonths} meses; despois volvémoscho preguntar. Podes cambiar de opinión cando queiras desde «Configurar as cookies», ao pé de cada páxina, ou co botón de aquí abaixo. Para retirar o permiso do mapa abonda con desactivalo: deixa de cargarse no momento. As cookies que Google xa instalase bórranse desde os axustes do teu navegador (Chrome, Safari, Firefox ou Edge).",
            },
            { type: "cookieSettings", label: "Configurar as cookies", hint: "Abre o panel para cambiar a túa elección." },
          ],
        },
        {
          id: "mas",
          title: "4. Máis información",
          blocks: [
            {
              type: "p",
              text: "Como tratamos os teus datos persoais explícase na [política de privacidade](privacy). Para calquera dúbida sobre as cookies, escríbenos a {email}.",
            },
          ],
        },
      ],
    },
  },
};
export default legal;
