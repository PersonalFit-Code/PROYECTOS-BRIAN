/**
 * LEGAL MODULE — English copy.
 *
 * Faithful translation of src/i18n/messages/es/legal.ts (the source of truth): document index
 * (title + slug), cookie banner, legal page chrome, the THREE structured documents (privacy,
 * legal notice, cookies) and the FAQ published as FAQPage (JSON-LD).
 *
 * Placeholders available in any text (filled by `LegalArticle` with useFormat()):
 *   {tradeName} {companyName} {nif} {registeredOffice} {registry} {email}
 *   {address} {city} {phone} {phoneTel} {siteUrl} {updated} {consentMonths}
 * Links: [text](privacy | legalNotice | cookies | home | carta | https://… | mailto:… | tel:…)
 * Emphasis: **text**
 *
 * ⚠️ The `slug` values are NOT translated: they form the URL (/legal/<slug>) linked from the
 * footer, the sitemap and hreflang. Section ids are kept identical to the Spanish ones so that
 * anchors (#derechos…) resolve in every language.
 */
import type { LegalMessages } from "@/i18n/messages/es/legal";

const legal: LegalMessages = {
  /* ── Index (title + slug of the URL /legal/<slug>) ── */
  privacy: { title: "Privacy policy", slug: "privacidad" },
  legalNotice: { title: "Legal notice", slug: "aviso-legal" },
  cookies: { title: "Cookie policy", slug: "cookies" },
  updated: "Last updated",

  /* ── Cookie banner ── */
  banner: {
    title: "We use cookies",
    text: "We use our own necessary cookies to make the site work and, if you accept them, analytics cookies to improve your experience.",
    accept: "Accept all",
    reject: "Necessary only",
    settings: "Customise",
    save: "Save preferences",
    necessary: "Necessary",
    necessaryDesc: "Essential for the website to work (language, consent).",
    analytics: "Analytics",
    analyticsDesc: "Help us understand how the site is used. Only with your consent.",
    more: "More information",
    aria: "Cookie notice",
    panelTitle: "Cookie preferences",
    panelText: "Choose which categories you allow. You can change your mind at any time via “Cookie settings” in the footer.",
    alwaysOn: "Always on",
    back: "Back",
    privacyLink: "Privacy policy",
    cookiesLink: "Cookie policy",
    saved: "Preferences saved.",
    noAnalyticsYet: "No analytics tool is currently installed: your choice will apply if one is enabled in the future.",
  },

  /* ── Legal pages: header, contents and footer ── */
  page: {
    kicker: "Legal information",
    breadcrumbAria: "Breadcrumb",
    home: "Home",
    updatedOn: "Last updated: {date}",
    tocTitle: "On this page",
    tocAria: "Document contents",
    relatedTitle: "Other documents",
    placeholderNote: "Details in square brackets are awaiting confirmation by the site owner.",
    contactTitle: "Questions about your data?",
    contactText: "Email us at {email} or call us on {phone}. We'll reply within one month at the latest.",
    backHome: "Back to home",
  },

  /* ══════════════════════════════════════════════════════════════
     DOCUMENTS
     ══════════════════════════════════════════════════════════════ */
  docs: {
    /* ── Privacy policy (GDPR + LOPDGDD) ── */
    privacy: {
      description:
        "How Tixola Tapería (Ourense) handles your data when you book by phone or WhatsApp, use the virtual waiter or browse the site: rights, retention, processors.",
      intro:
        "At {tradeName} we process very little data, and only what is strictly necessary: the details you give us to book a table, the questions you ask the virtual waiter and the minimum technical information needed to make the website work. Here, with no small print, is what we do with it.",
      sections: [
        {
          id: "responsable",
          title: "1. Data controller",
          blocks: [
            {
              type: "dl",
              items: [
                { term: "Controller", desc: "{companyName}" },
                { term: "Tax ID (NIF)", desc: "{nif}" },
                { term: "Registered office", desc: "{registeredOffice}" },
                { term: "Trading name and premises", desc: "{tradeName} · {address}" },
                { term: "Telephone", desc: "[{phone}](tel:{phoneTel})" },
                { term: "Email", desc: "{email}" },
              ],
            },
            {
              type: "p",
              text: "We are not required to appoint a Data Protection Officer (Art. 37 GDPR and Art. 34 of the Spanish Data Protection Act, LOPDGDD). For any question about your data, write to us at {email}.",
            },
          ],
        },
        {
          id: "datos",
          title: "2. What data we process and where it comes from",
          blocks: [
            { type: "p", text: "All the data comes directly from you. We do not buy data or obtain it from third parties." },
            {
              type: "dl",
              items: [
                {
                  term: "Bookings and enquiries",
                  desc: "Name, telephone number, number of guests, date and time, and any comments you wish to add (terrace, celebration, allergies). The website's booking form **sends nothing to our servers**: it composes a message that opens in your own WhatsApp app, and you decide whether to send it.",
                },
                {
                  term: "Virtual waiter",
                  desc: "The text of your questions and the replies during the session, the language and the page you write from. We do not ask for personal data to use it, and we recommend that you do not include any.",
                },
                {
                  term: "Browsing",
                  desc: "Technical data generated by any visit (IP address, browser type, pages requested), processed by our hosting provider for security purposes; the language you choose (NEXT_LOCALE cookie) and your cookie decision (tixola_consent local storage).",
                },
                {
                  term: "Allergies and intolerances",
                  desc: "If you tell us about them when booking, we use them solely to prepare for your visit and protect your health. This is special-category data (Art. 9 GDPR) that we process with your explicit consent, given when you provide it, and that we do not keep beyond the service.",
                },
              ],
            },
          ],
        },
        {
          id: "finalidades",
          title: "3. Purposes, legal basis and retention",
          blocks: [
            {
              type: "table",
              caption: "What we use your data for, on what legal basis and for how long",
              head: ["Purpose", "Legal basis", "Retention"],
              rows: [
                [
                  "Managing your booking and handling your enquiries by phone or WhatsApp",
                  "Performance of a contract or of pre-contractual steps taken at your request (Art. 6(1)(b) GDPR)",
                  "Until the date of the booking; the conversation is then deleted periodically",
                ],
                [
                  "Answering your questions through the virtual waiter",
                  "Your consent when starting the conversation (Art. 6(1)(a) GDPR)",
                  "Only during the browsing session; not stored on our servers",
                ],
                [
                  "Ensuring the security and technical operation of the website",
                  "Legitimate interest in network and information security (Art. 6(1)(f) GDPR, Recital 49)",
                  "Hosting provider's technical logs for a limited period",
                ],
                [
                  "Remembering your language and your cookie decision",
                  "Legitimate interest / technical cookies exempt from consent (Art. 22.2 of the Spanish Information Society Services Act, LSSI-CE)",
                  "12 months",
                ],
                [
                  "Measuring how the website is used (analytics)",
                  "Your consent in the cookie banner (Art. 6(1)(a) GDPR). No tool is currently installed",
                  "Depending on the tool, never more than 24 months",
                ],
                [
                  "Handling the exercise of your rights and complying with legal obligations",
                  "Legal obligation (Art. 6(1)(c) GDPR)",
                  "For the limitation periods of the corresponding legal liabilities",
                ],
              ],
            },
            {
              type: "p",
              text: "We do not make automated decisions with legal effects on you, nor do we create profiles. We do not send marketing communications.",
            },
          ],
        },
        {
          id: "camarero-virtual",
          title: "4. The virtual waiter (artificial intelligence)",
          blocks: [
            {
              type: "p",
              text: "The virtual waiter is an assistant that answers questions about the menu, allergens, opening hours and bookings. To generate each reply, your messages are sent via our server to **Anthropic PBC**, the provider of the Claude language model, which acts as a data processor.",
            },
            {
              type: "ul",
              items: [
                "**We do not store the conversation on our servers**: it is processed on the fly to generate a reply, and there is no chat database. We only count requests per IP address for ten minutes, in memory, to prevent abuse.",
                "In your browser, the conversation is kept in session storage (sessionStorage) so that it is not lost when you change page; it disappears when you close the tab, and you can delete it at any time using the button in the chat itself.",
                "Anthropic is headquartered in the United States. The transfer is covered by appropriate safeguards: standard contractual clauses approved by the European Commission and, where applicable, the provider's certification under the EU-US Data Privacy Framework, in accordance with its current documentation. Under its commercial terms, Anthropic does not use content submitted via the API to train its models and retains it only for a limited period in order to provide the service and enforce its usage policies.",
                "If the provider cannot be reached, a local engine replies using the menu and opening hours, without sending anything outside.",
                "Replies are generated automatically and may contain errors. **For allergies and intolerances, always confirm with our staff on the premises.**",
                "Do not type personal data, yours or anyone else's (names, phone numbers, health data), into the chat: we do not need it to help you.",
              ],
            },
          ],
        },
        {
          id: "destinatarios",
          title: "5. Recipients and data processors",
          blocks: [
            {
              type: "p",
              text: "We do not sell or share your data. It is accessed only by the providers we need in order to deliver the service, acting as data processors under a contract compliant with Art. 28 GDPR:",
            },
            {
              type: "dl",
              items: [
                {
                  term: "Vercel Inc. (USA)",
                  desc: "Hosting and delivery of the website. Processes the technical data of each visit (IP address, headers) and the security logs. Certified under the EU-US Data Privacy Framework and bound by standard contractual clauses. [Vercel privacy policy](https://vercel.com/legal/privacy-policy).",
                },
                {
                  term: "Anthropic PBC (USA)",
                  desc: "Generation of the virtual waiter's replies (see section 4). [Anthropic privacy policy](https://www.anthropic.com/legal/privacy).",
                },
                {
                  term: "Google LLC / Google Ireland Ltd.",
                  desc: "Google Maps map embedded in the “Find us” section. **It only loads if you press “Show real map”**; at that point Google receives your IP address and may set its own cookies. The links to Google Maps and to Google reviews open Google websites. [Google privacy policy](https://policies.google.com/privacy).",
                },
                {
                  term: "Meta Platforms Ireland Ltd. (WhatsApp)",
                  desc: "If you choose to message us on WhatsApp, the communication takes place in that app and is governed by its terms and privacy policy. We only receive the message you decide to send.",
                },
                {
                  term: "TripAdvisor LLC",
                  desc: "Links to our listing and reviews. They open a third-party website with its own privacy policy; we do not share data with TripAdvisor.",
                },
              ],
            },
            {
              type: "p",
              text: "We may also disclose data to the competent authorities where required by law.",
            },
          ],
        },
        {
          id: "transferencias",
          title: "6. International transfers",
          blocks: [
            {
              type: "p",
              text: "Vercel and Anthropic may process data in the United States. In both cases appropriate safeguards exist under Chapter V of the GDPR: standard contractual clauses approved by the European Commission and, where the provider is certified, the EU-US Data Privacy Framework. You can request a copy of the applicable safeguards by writing to {email}.",
            },
          ],
        },
        {
          id: "derechos",
          title: "7. Your rights",
          blocks: [
            {
              type: "p",
              text: "You may exercise, at any time and free of charge, the rights the GDPR grants you:",
            },
            {
              type: "ul",
              items: [
                "**Access**: to know what data of yours we process.",
                "**Rectification**: to correct inaccurate or incomplete data.",
                "**Erasure**: to ask us to delete your data when it is no longer necessary.",
                "**Objection** and **restriction of processing**.",
                "**Portability**: to receive your data in a structured, commonly used format.",
                "**Withdrawal of consent** at any time, without affecting the lawfulness of prior processing (for example, by changing your cookie decision).",
              ],
            },
            {
              type: "p",
              text: "To exercise them, write to us at {email} or by post to {companyName}, {registeredOffice}, stating which right you wish to exercise and enclosing a document proving your identity (or an equivalent means). We will reply within one month at the latest.",
            },
            {
              type: "p",
              text: "If you believe we have not handled your rights properly, you may lodge a complaint with the **Spanish Data Protection Agency** (AEPD), C/ Jorge Juan, 6, 28001 Madrid, or through its online office at [www.aepd.es](https://www.aepd.es). If you prefer, you can contact us first so that we can resolve it.",
            },
          ],
        },
        {
          id: "menores",
          title: "8. Minors",
          blocks: [
            {
              type: "p",
              text: "The website is not aimed at children under 14, and we do not knowingly collect data from minors. Bookings must be made by adults. If we detect data from a minor without the authorisation of their parents or guardians, we will delete it.",
            },
          ],
        },
        {
          id: "seguridad",
          title: "9. Security measures",
          blocks: [
            {
              type: "p",
              text: "We apply the principle of data minimisation: the website has no user accounts and no customer database. All communication is encrypted (HTTPS), the providers involved offer appropriate contractual and technical guarantees, and access to the bookings we receive is restricted to the restaurant's staff.",
            },
          ],
        },
        {
          id: "cambios",
          title: "10. Changes to this policy",
          blocks: [
            {
              type: "p",
              text: "We may update this policy to reflect legal changes or changes to the service (for example, if we add an analytics tool). The version in force is always the one published on this page, with its last-updated date ({updated}). See also the [Legal notice](legalNotice) and the [Cookie policy](cookies).",
            },
          ],
        },
      ],
    },

    /* ── Legal notice (LSSI-CE) ── */
    legalNotice: {
      description:
        "Legal notice for the Tixola Tapería (Ourense) website: owner, terms of use, intellectual property, disclaimer and applicable law.",
      intro:
        "In compliance with Spanish Law 34/2002 of 11 July on information society services and electronic commerce (LSSI-CE), this notice tells you who is behind this website and the terms that govern its use.",
      sections: [
        {
          id: "titular",
          title: "1. Owner identification",
          blocks: [
            {
              type: "dl",
              items: [
                { term: "Owner", desc: "{companyName}" },
                { term: "Tax ID (NIF)", desc: "{nif}" },
                { term: "Registered office", desc: "{registeredOffice}" },
                { term: "Company registry details", desc: "{registry}" },
                { term: "Trading name", desc: "{tradeName}" },
                { term: "Premises", desc: "{address}" },
                { term: "Telephone", desc: "[{phone}](tel:{phoneTel})" },
                { term: "Email", desc: "{email}" },
                { term: "Website", desc: "[{siteUrl}]({siteUrl})" },
              ],
            },
            {
              type: "p",
              text: "{tradeName} is a hospitality establishment (tapas bar and wine bar) located in the old town of {city}, beside San Martiño Cathedral. Official complaint forms are available to customers on the premises.",
            },
          ],
        },
        {
          id: "objeto",
          title: "2. Purpose and acceptance",
          blocks: [
            {
              type: "p",
              text: "This website is for information purposes: to present the restaurant, its menu, opening hours and contact channels, and to make it easy to book a table by phone or WhatsApp. Accessing and browsing the site makes you a user and implies acceptance of this Legal notice, the [Privacy policy](privacy) and the [Cookie policy](cookies).",
            },
            {
              type: "ul",
              items: [
                "The menu, prices and wine pairings published here are **for guidance** and may vary with the season and product availability. The menu in force is the one offered on the premises.",
                "Opening hours may change on public holidays, during holiday periods or due to force majeure.",
                "A booking requested by phone or WhatsApp is only confirmed once the restaurant expressly confirms it.",
              ],
            },
          ],
        },
        {
          id: "condiciones",
          title: "3. Terms of use",
          blocks: [
            {
              type: "p",
              text: "You undertake to use the website and its services (including the virtual waiter) lawfully and in good faith. In particular, the following is not permitted:",
            },
            {
              type: "ul",
              items: [
                "Carrying out bulk or automated extraction of content (scraping) or deliberately overloading the service.",
                "Introducing viruses, malicious code or anything that could damage our systems or those of third parties.",
                "Impersonating other people or the establishment itself.",
                "Using the virtual waiter for purposes unrelated to information about the restaurant, to attempt to obtain its internal instructions, or to generate unlawful or offensive content.",
              ],
            },
            {
              type: "p",
              text: "To protect the service, the virtual waiter applies usage limits per IP address and may reject requests that exceed them.",
            },
          ],
        },
        {
          id: "propiedad-intelectual",
          title: "4. Intellectual and industrial property",
          blocks: [
            {
              type: "p",
              text: "The website design, the “Tixola” logo, the texts, photographs, illustrations, 3D models and source code are the property of {companyName} or its licensors and are protected by intellectual and industrial property law. Their reproduction, distribution, public communication or transformation, in whole or in part, is prohibited without express authorisation, except for personal, private use of the information.",
            },
            {
              type: "p",
              text: "Interface icons come from the Lucide library (ISC licence). Third-party trade marks and logos appearing on the website (Google, Google Maps, WhatsApp, TripAdvisor) belong to their respective owners and are used solely to identify the linked services.",
            },
          ],
        },
        {
          id: "responsabilidad",
          title: "5. Disclaimer",
          blocks: [
            {
              type: "ul",
              items: [
                "**Availability**: we strive to keep the website running without interruption, but we do not guarantee its permanent availability or the absence of errors. We are not liable for damage arising from interruptions, viruses or failures beyond our control.",
                "**Content**: the information is provided in good faith and reviewed periodically; nevertheless, it may contain typographical errors or out-of-date details (prices, opening hours, dishes). We reserve the right to change it without prior notice.",
                "**Allergens**: the allergen information on the menu is for guidance. Our kitchen handles all 14 allergens subject to mandatory declaration (Regulation (EU) No 1169/2011) and we cannot rule out traces. The valid, up-to-date information is that provided by our staff on the premises; always check with them before ordering.",
                "**Virtual waiter**: its replies are generated by artificial intelligence and may be inaccurate or incomplete. They are for information only and do not replace confirmation by the restaurant's staff, especially regarding allergies, prices and bookings.",
                "**Links**: the website contains links to third-party sites (Google Maps, WhatsApp, TripAdvisor) over whose content and policies we have no control and accept no responsibility.",
              ],
            },
          ],
        },
        {
          id: "proteccion-de-datos",
          title: "6. Data protection and cookies",
          blocks: [
            {
              type: "p",
              text: "The processing of personal data is governed by our [Privacy policy](privacy). The use of cookies and similar technologies is explained in the [Cookie policy](cookies), where you can also change your preferences.",
            },
          ],
        },
        {
          id: "legislacion",
          title: "7. Applicable law and jurisdiction",
          blocks: [
            {
              type: "p",
              text: "This Legal notice is governed by Spanish law. For any dispute arising from access to or use of the website, the parties submit to the courts of the user's place of residence where the user is a consumer; in all other cases, to the courts of {city}. As a consumer, you also have access to the official complaint forms of the Xunta de Galicia (the Galician regional government) on the premises.",
            },
            {
              type: "p",
              text: "Last updated: {updated}.",
            },
          ],
        },
      ],
    },

    /* ── Cookie policy ── */
    cookies: {
      description:
        "Which cookies and local storage the Tixola Tapería website uses, what they are for, how long they last and how to accept, reject or change your decision.",
      intro:
        "This website uses very few cookies, and all of those set by default are technical: they remember your language and your decision about cookies themselves. Here are the details and how to manage them.",
      sections: [
        {
          id: "que-son",
          title: "1. What cookies and similar technologies are",
          blocks: [
            {
              type: "p",
              text: "A cookie is a small file that a website stores in your browser to remember information between visits or while you browse. We also use equivalent technologies, such as the browser's **local storage** (localStorage) and **session storage** (sessionStorage), to which the same rules apply (Art. 22.2 LSSI-CE and the Spanish Data Protection Agency's guide on the use of cookies).",
            },
          ],
        },
        {
          id: "cookies-que-usamos",
          title: "2. Cookies and storage we use",
          blocks: [
            {
              type: "table",
              caption: "Inventory of cookies and browser storage",
              head: ["Name", "Type", "Owner", "Purpose", "Duration"],
              rows: [
                ["NEXT_LOCALE", "Technical (cookie)", "First-party", "Remembers the language you have chosen (español, galego, English, português) so we can show you the site in that language.", "12 months"],
                [
                  "tixola_consent",
                  "Technical (localStorage)",
                  "First-party",
                  "Stores your cookie decision (accept, reject or customise) so we don't ask you again on every visit.",
                  "{consentMonths} months",
                ],
                [
                  "tixola:waiter:*",
                  "Technical (sessionStorage)",
                  "First-party",
                  "Keeps your conversation with the virtual waiter while the tab is open, so it isn't lost when you change page.",
                  "Session (deleted when you close the tab)",
                ],
                [
                  "Google Maps cookies",
                  "Third-party",
                  "Google LLC",
                  "Only if you press “Show real map” in the “Find us” section: when the map loads, Google may set its own cookies (for example NID or CONSENT) in line with its policy.",
                  "Set by Google (up to 6 months or longer)",
                ],
                [
                  "Analytics",
                  "Optional (analytics)",
                  "First-party or third-party",
                  "To measure, in aggregate, how the website is used. **No tool is currently installed**; if one is enabled in the future, it will only load with your consent and this table will be updated.",
                  "Never more than 24 months",
                ],
              ],
            },
            {
              type: "note",
              text: "We do not use advertising, social media or cross-site tracking cookies.",
            },
          ],
        },
        {
          id: "base-legal",
          title: "3. Legal basis",
          blocks: [
            {
              type: "p",
              text: "Technical cookies (NEXT_LOCALE, tixola_consent and the virtual waiter's storage) are necessary to provide the service you request and are exempt from consent under Art. 22.2 LSSI-CE. All others (analytics and the third-party cookies set when the map loads) are used only with your consent, which you may withdraw at any time.",
            },
          ],
        },
        {
          id: "gestionar",
          title: "4. How to accept, reject or change your decision",
          blocks: [
            {
              type: "p",
              text: "On your first visit a notice appears with three options: **Accept all**, **Necessary only** or **Customise** (to choose category by category). Your decision is stored for {consentMonths} months; after that we will ask you again. You can change it whenever you like:",
            },
            {
              type: "cookieSettings",
              label: "Cookie settings",
              hint: "Opens this website's preferences panel.",
            },
            {
              type: "p",
              text: "You can also delete or block cookies from your browser settings. Bear in mind that if you block technical cookies, the website will no longer remember your language or your choice:",
            },
            {
              type: "ul",
              items: [
                "[Google Chrome](https://support.google.com/chrome/answer/95647)",
                "[Mozilla Firefox](https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox)",
                "[Safari (Mac)](https://support.apple.com/en-gb/guide/safari/sfri11471/mac) and [Safari (iPhone/iPad)](https://support.apple.com/en-gb/HT201265)",
                "[Microsoft Edge](https://support.microsoft.com/en-gb/microsoft-edge)",
              ],
            },
          ],
        },
        {
          id: "terceros",
          title: "5. Third-party cookies: the Google map",
          blocks: [
            {
              type: "p",
              text: "The “Find us” section shows our own illustrated map, which sets nothing. The real Google Maps map only loads when you press “Show real map”; at that moment your browser connects to Google, which receives your IP address and may set cookies in accordance with its [privacy policy](https://policies.google.com/privacy) and its [information on cookies](https://policies.google.com/technologies/cookies). If you'd rather not load it, use the “Open in Google Maps” link or simply walk: we're one minute from the Cathedral.",
            },
          ],
        },
        {
          id: "actualizaciones",
          title: "6. Updates to this policy",
          blocks: [
            {
              type: "p",
              text: "We will review this policy whenever the cookies we use or the applicable rules change. Last updated: {updated}. Find out more about how we process your data in the [Privacy policy](privacy) and about the site owner in the [Legal notice](legalNotice).",
            },
          ],
        },
      ],
    },
  },

  /* ══════════════════════════════════════════════════════════════
     FREQUENTLY ASKED QUESTIONS (FAQPage JSON-LD on the home page)
     Placeholders: {hours} (generated weekly schedule), {phone}, {address}
     ══════════════════════════════════════════════════════════════ */
  faq: {
    title: "Frequently asked questions",
    items: [
      {
        q: "What are Tixola Tapería's opening hours?",
        a: "Our usual opening hours are: {hours}. They may vary on public holidays and during holiday periods: check the “Open now” status on the website or call us on {phone}.",
      },
      {
        q: "How can I book a table?",
        a: "We take bookings by phone or WhatsApp on {phone}, and confirm straight away. For large groups we recommend calling ahead. A booking is confirmed once we reply to you.",
      },
      {
        q: "Do you have coeliac-friendly options and allergen information?",
        a: "Yes. Our digital menu flags the 14 allergens subject to mandatory declaration for every dish and lets you filter out anything containing gluten; we have, for example, gluten-free cod croquetas, pulpo á feira (Galician-style octopus) and suitable skillets. All the allergens are handled in our kitchen, so always tell our staff so they can advise you and avoid traces.",
      },
      {
        q: "Are there vegan or vegetarian dishes?",
        a: "Yes. We have 100% plant-based options such as the vegan mushroom and vegetable skillet, the quinoa and avocado salad and the Padrón peppers, as well as vegetarian dishes like fried cheese with tomato jam, our Tixola bravas and the Galician cheese board.",
      },
      {
        q: "How do I get there, and where can I park?",
        a: "We're at {address}, a one-minute walk from San Martiño Cathedral, right in Ourense's old town. The area is pedestrianised, so we recommend parking in one of the public car parks in the centre and walking over; the “Get directions” button on the website opens the route in Google Maps.",
      },
      {
        q: "Do you have a terrace?",
        a: "Yes, we have a terrace right on Rúa Juan de Austria, with the church of Santa Eufemia in the background, and we keep it open all year round whenever the weather allows. If you'd like a table on the terrace, let us know when you book.",
      },
    ],
  },
};

export default legal;
