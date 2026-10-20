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
    text: "We use first-party cookies that the site needs in order to work. With your permission we load the Google map and we measure how the site is used with third-party tools, which set cookies of their own and reconstruct the path taken through the pages.",
    accept: "Accept all",
    reject: "Necessary only",
    settings: "Customise",
    save: "Save preferences",
    necessary: "Necessary",
    necessaryDesc: "Essential for the website to work (language, consent).",
    maps: "Google map",
    mapsDesc: "Loads the Google Maps map in the location section. It is a Google service, which receives your IP address and sets its own cookies.",
    analytics: "Visit measurement",
    analyticsDesc: "Knowing which pages are viewed and how the site is used: Vercel Web Analytics (no cookies), Google Analytics 4 and Microsoft Clarity. The last two set cookies and send data to the US. Clarity also reconstructs the path you take through the page, and Microsoft uses what it collects for its own purposes, advertising included. Whatever you type into the chat is masked.",
    more: "More information",
    aria: "Cookie notice",
    panelTitle: "Cookie preferences",
    panelText: "Choose which categories you allow. You can change your mind at any time via “Cookie settings” in the footer.",
    alwaysOn: "Always on",
    back: "Back",
    privacyLink: "Privacy policy",
    cookiesLink: "Cookie policy",
    saved: "Preferences saved.",
    bothChoices: "These are two separate things and you can accept one without the other: the map only loads in “Find us”; the measurement works across the whole site. We do not use advertising cookies: Google and Microsoft are expressly asked not to switch them on.",
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
        "How Tixola Tapería (Ourense) handles your data when you get in touch, use the virtual waiter or browse the site: rights, retention, processors.",
      intro:
        "At {tradeName} we process very little data, and only what is strictly necessary: whatever you give us when you call or message us, the questions you ask the virtual waiter and the minimum technical information needed to make the website work. The website has no forms and collects nothing by itself. Here, with no small print, is what we do with it.",
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
                  term: "Enquiries by phone or WhatsApp",
                  desc: "Whatever you choose to tell us when you call or message us: usually your name and your phone number. **The website has no forms at all**: the call and WhatsApp links open your own app, so no data passes through our servers. We do not take bookings, so we keep no lists of names, dates or times either.",
                },
                {
                  term: "Virtual waiter",
                  desc: "The text of your questions and the replies during the session, the language and the page you write from. We do not ask for personal data to use it, and we recommend that you do not include any.",
                },
                {
                  term: "Browsing",
                  desc: "Technical data generated by any visit (IP address, browser type, pages requested), processed by our hosting provider for security purposes; the language you choose (NEXT_LOCALE cookie) and your cookie decision (tixola_consent local storage). **Only if you accept the measurement**, in addition: the pages you view, where you arrive from, your browser and your device, your approximate city and — with Microsoft Clarity only — the path you take through the page (clicks, scrolling and mouse movements), all of it tied to an identifier that does not carry your name.",
                },
                {
                  term: "Allergies and intolerances",
                  desc: "If you tell us about them by phone, on WhatsApp or in person at the bar, we use them solely to prepare your dish safely. This is special-category data (Art. 9 GDPR) that we process with your explicit consent, given when you provide it, and that we neither write down nor keep once you have been served. If you type them into the virtual waiter, that text travels with the rest of your message to Anthropic (USA), under the safeguards in section 6; we do not store it on our servers and it disappears from your browser when you press “New conversation” or close the tab. That is why the chat itself asks you not to type health data: it is not needed to help you with the menu.",
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
                  "Handling your enquiries by phone or WhatsApp",
                  "Your consent when you message or call us (Art. 6(1)(a) GDPR)",
                  "For as long as the conversation lasts; it is then deleted periodically",
                ],
                [
                  "Answering your questions through the virtual waiter",
                  "Your consent when starting the conversation (Art. 6(1)(a) GDPR)",
                  "Only during the browsing session; not stored on our servers. The model provider deletes it from its systems within 30 days",
                ],
                [
                  "Ensuring the security and technical operation of the website",
                  "Legitimate interest in network and information security (Art. 6(1)(f) GDPR, Recital 49)",
                  "Our hosting provider's technical logs, kept for a limited period",
                ],
                [
                  "Remembering your language and your cookie decision",
                  "Legitimate interest / technical cookies exempt from consent (Art. 22.2 of the Spanish Information Society Services Act, LSSI-CE)",
                  "12 months",
                ],
                [
                  "Measuring how the website is used: pages viewed, heatmaps and the path taken through the page",
                  "Your consent in the cookie banner (Art. 6(1)(a) GDPR)",
                  "Google Analytics, 2 months for user data (its default setting). Microsoft Clarity, 30 days for the session recordings — up to 9 months for flagged ones and for a sample — and 9 months for the heatmaps. The cookies, as stated in the [Cookie policy](cookies)",
                ],
                [
                  "Handling the exercise of your rights and complying with legal obligations",
                  "Legal obligation (Art. 6(1)(c) GDPR)",
                  "Until the statutory limitation periods for the relevant legal liabilities expire",
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
              text: "The virtual waiter is an assistant that answers questions about the menu, allergens, opening hours and how to find us. To generate each reply, your messages are sent via our server to **Anthropic PBC**, the provider of the Claude language model, which acts as a data processor.",
            },
            {
              type: "ul",
              items: [
                "**We do not store the conversation on our servers**: it is processed on the fly to generate a reply, and there is no chat database. We only count requests per IP address for ten minutes, in memory, to prevent abuse.",
                "In your browser, the conversation is kept in session storage (sessionStorage) so that it is not lost when you change page; it disappears when you close the tab, and you can delete it at any time using the button in the chat itself.",
                "Anthropic is headquartered in the United States. The transfer is covered by appropriate safeguards: standard contractual clauses approved by the European Commission and, where applicable, the provider's certification under the EU-US Data Privacy Framework, in accordance with its current documentation. Under its commercial terms, Anthropic does not use content submitted via the API to train its models and, according to its current documentation, deletes inputs and outputs from its systems within 30 days, unless it must keep them longer by law or because its systems detect a use that breaches its policies (in which case, up to 2 years).",
                "If the provider cannot be reached, a local engine answers using the menu and opening hours, without anything leaving our own servers.",
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
              text: "We do not sell or share your data. The first three on this list are **data processors**: they handle data **on our behalf**, following our instructions and under a contract compliant with Art. 28 GDPR. The last four **are not**: they receive data because their content loads on the site or because you click their link, and they decide for themselves what they do with it, under their own privacy policy. Note that Google appears twice: it is our processor for the measurement, and it is not for the map.",
            },
            {
              type: "dl",
              items: [
                {
                  term: "Vercel Inc. (USA)",
                  desc: "Hosting and delivery of the website and, if you accept, visit measurement (Vercel Web Analytics). Processes the technical data of each visit (IP address, headers) and the security logs. Certified under the EU-US Data Privacy Framework and bound by standard contractual clauses. [Vercel privacy policy](https://vercel.com/legal/privacy-policy).",
                },
                {
                  term: "Anthropic PBC (USA)",
                  desc: "Generation of the virtual waiter's replies (see section 4). [Anthropic privacy policy](https://www.anthropic.com/legal/privacy).",
                },
                {
                  term: "Google Ireland Ltd. / Google LLC — Google Analytics 4",
                  desc: "Visit measurement, **only if you accept it**. Here Google is indeed our processor: its own Analytics documentation says so, and the contract is the Google Ads Data Processing Terms, which for a business in the European Economic Area already form part of the service with no separate formality. It receives the pages you view, your browser and device and your approximate city, and it sets two cookies on this very domain. Google states that data from EEA visitors is collected on servers in the EEA and that it **does not log or store your IP address**: it uses it to infer the city and discards it on the spot. [How Google handles data](https://business.safety.google/privacy/).",
                },
                {
                  term: "Microsoft Corporation / Microsoft Ireland Operations Ltd. — Microsoft Clarity",
                  desc: "Heatmaps and reconstruction of the path taken through the page, **only if you accept it**. **Microsoft is not our processor**, and it is worth knowing: its terms expressly state that Microsoft and we are independent controllers, so it decides for itself what it does with what it collects and reserves the right to use it for its own purposes, including building profiles for advertising purposes. We expressly ask it **not** to switch on its advertising storage, so it sets no advertising cookie of its own and shares no data with Microsoft Ads. What you type into the virtual waiter, and what it replies, are masked and never leave your browser. [Microsoft privacy statement](https://privacy.microsoft.com/privacystatement).",
                },
                {
                  term: "Google LLC — Google Maps",
                  desc: "Google Maps map embedded in the “Find us” section. **It only loads if you accept cookies** (or if you load it yourself from the “Map” tab in that section); at that point Google receives your IP address and may set its own cookies. Here Google does **not** act on our behalf. The links to Google Maps and to Google reviews open Google websites. [Google privacy policy](https://policies.google.com/privacy).",
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
              text: "Put plainly: Vercel, Anthropic and Google Analytics are our responsibility, and for all three you can ask us for a copy of the safeguards in section 6. Microsoft, the Google map, Meta and TripAdvisor are not: what we can do — and do — is tell you when they come into play and let you avoid it. None of that loads unless you accept it, and the links only open if you click them.",
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
              text: "Vercel, Anthropic, Google and Microsoft may process data in the United States. In all cases appropriate safeguards exist under Chapter V of the GDPR: standard contractual clauses approved by the European Commission and, where the provider is certified, the EU-US Data Privacy Framework. Google LLC and Microsoft Corporation appear with active certification under that framework (checked against the official list on 20 October 2026), and Google states that it relies on it for the transfers made by its measurement products. You can request a copy of the applicable safeguards by writing to {email}.",
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
              text: "If you believe we have not handled your rights properly, you may lodge a complaint with the **Spanish Data Protection Agency** (AEPD), C/ Jorge Juan, 6, 28001 Madrid, or via its online portal at [www.aepd.es](https://www.aepd.es). If you prefer, you can contact us first so that we can resolve it.",
            },
          ],
        },
        {
          id: "menores",
          title: "8. Minors",
          blocks: [
            {
              type: "p",
              text: "The website is not aimed at children under 14, and we do not knowingly collect data from minors. If we detect data from a minor without the authorisation of their parents or guardians, we will delete it.",
            },
          ],
        },
        {
          id: "seguridad",
          title: "9. Security measures",
          blocks: [
            {
              type: "p",
              text: "We apply the principle of data minimisation: the website has no forms, no user accounts and no customer database. All communication is encrypted (HTTPS), the providers involved offer appropriate contractual and technical guarantees, and access to the messages we receive is restricted to the restaurant's staff.",
            },
          ],
        },
        {
          id: "cambios",
          title: "10. Changes to this policy",
          blocks: [
            {
              type: "p",
              text: "We may update this policy to reflect legal changes or changes to the service; the last time was when we added Google Analytics and Microsoft Clarity, which is why the cookie notice asked you again. The version in force is always the one published on this page, with its last-updated date ({updated}). See also the [Legal notice](legalNotice) and the [Cookie policy](cookies).",
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
        "In compliance with Spanish Law 34/2002, of 11 July, on information society services and electronic commerce (LSSI-CE), this notice tells you who is behind this website and the terms that govern its use.",
      sections: [
        {
          id: "titular",
          title: "1. Details of the site owner",
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
              text: "This website is for information purposes only: to present the restaurant, its menu, its opening hours and how to get in touch. Nothing is sold or contracted through the site, and no tables are booked through it either. Accessing and browsing the site makes you a user and implies acceptance of this Legal notice, the [Privacy policy](privacy) and the [Cookie policy](cookies).",
            },
            {
              type: "ul",
              items: [
                "The prices published here are the ones you pay, VAT included; they may be updated, and in that case the price on the menu in the bar is the one that applies. The availability of each dish and the wine pairings, on the other hand, are only for guidance: both depend on the season and on what comes in that day.",
                "Opening hours may change on public holidays, during holiday periods or due to force majeure.",
                "The restaurant **does not take bookings**: tables are available on a first-come, first-served basis.",
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
                "**Virtual waiter**: its replies are generated by artificial intelligence and may be inaccurate or incomplete. They are for information only and do not replace confirmation by the restaurant's staff, especially regarding allergies and prices.",
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
        "This website uses few cookies, and all of those set by default are technical: they remember your language and your decision about cookies themselves. The rest — those of the Google map and those of the measurement — are not set until you say yes. Here are the details, with names and durations, and how to change your mind.",
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
                  "Stores your two decisions — the Google map and visit measurement — so we don't ask you again on every visit.",
                  "{consentMonths} months",
                ],
                ["tixola_promo_cerrada", "Technical (localStorage)", "First-party", "Remembers that you closed the monthly promotion notice so it is not shown to you again.", "Until another promotion is published or you clear your browser data"],
                [
                  "tixola:waiter:*",
                  "Technical (sessionStorage)",
                  "First-party",
                  "Keeps your conversation with the virtual waiter while the tab is open, so it is not lost when you change page.",
                  "Session (deleted when you close the tab)",
                ],
                [
                  "Google Maps cookies",
                  "Third-party",
                  "Google LLC",
                  "Only if you accept cookies, or if you load the map yourself in the “Find us” section: once loaded, Google may set its own cookies (for example NID or CONSENT) in line with its policy.",
                  "Set by Google (up to 6 months or longer)",
                ],
                [
                  "Vercel Web Analytics",
                  "Optional (analytics)",
                  "Vercel Inc. (USA)",
                  "Measures, in aggregate, which pages are visited, where visitors come from, which browser they use and roughly which city they are in. **It sets no cookies and stores nothing in your browser**: Vercel identifies the session with a code computed on its own server and discards it after 24 hours. It loads only if you accept.",
                  "No cookies used",
                ],
                [
                  "_ga and _ga_RPV2JX7ZXW",
                  "Optional (analytics)",
                  "Google (first-party, on this domain)",
                  "Set by Google Analytics 4 if you accept the measurement. They store a random identifier that tells one browser from another and keeps the state of the session, so we can know how many people come in and which pages they look at. They do not carry your name. They are the only two it sets as long as the account is not linked to Google Ads, and it is not.",
                  "2 years from your last visit, according to Google. In practice it is usually less: browsers shorten first-party cookies on their own (Chrome, 400 days; Safari, 7)",
                ],
                [
                  "_clck and _clsk",
                  "Optional (analytics)",
                  "Microsoft (first-party, on this domain)",
                  "Set by Microsoft Clarity if you accept the measurement. One stores the identifier by which Clarity recognises you between visits and the other links the pages you view within a single visit. If you reject, Clarity deletes its own.",
                  "Microsoft does not publish their duration. What it does publish is how long it keeps the data: 30 days for the session recordings and 9 months for the heatmaps",
                ],
                [
                  "CLID, ANONCHK, MR, SM",
                  "Optional (analytics)",
                  "Microsoft Corporation (third-party)",
                  "Cookies on a Microsoft domain that Clarity may set alongside the ones above. They all revolve around MUID, Microsoft's browser identifier. **MUID is not set**: Microsoft's own documentation describes it as a cookie used for advertising as well, and this website expressly asks Microsoft not to switch on advertising storage.",
                  "Microsoft does not publish their duration",
                ],
              ],
            },
            {
              type: "note",
              text: "We do not use advertising or social media cookies, and we do not track you from one website to another for commercial purposes. Google and Microsoft both allow you to ask them not to switch on their advertising storage, and that is what this website asks of them as soon as you accept: that is why Microsoft does not set MUID — the cookie its documentation describes as an advertising one — and shares nothing with Microsoft Ads.",
            },
          ],
        },
        {
          id: "base-legal",
          title: "3. Legal basis",
          blocks: [
            {
              type: "p",
              text: "Technical cookies (NEXT_LOCALE, tixola_consent and the virtual waiter's storage) are necessary to provide the service you request and are exempt from consent under Art. 22.2 LSSI-CE. All the others — the measurement and those set by the map when it loads — are used only with your consent, which you may withdraw whenever you like. None of them can rely on the exemption that the Spanish Data Protection Agency (AEPD) allows for audience measurement: that exemption requires the provider to act on the publisher's exclusive behalf and to produce anonymous statistics only, and neither Google Analytics nor Clarity fits that description. That is why we ask about them.",
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
          id: "medicion",
          title: "5. The measurement: Google Analytics and Microsoft Clarity",
          blocks: [
            {
              type: "p",
              text: "If you accept the measurement, three tools load, and it is worth knowing what each one does, because they are not the same thing and they are not equally intrusive.",
            },
            {
              type: "dl",
              items: [
                {
                  term: "Vercel Web Analytics",
                  desc: "The most discreet: it counts pages viewed and little more, without setting anything in your browser. It belongs to the same company that hosts the website.",
                },
                {
                  term: "Google Analytics 4",
                  desc: "Counts visits and pages using the two cookies in the table above. Here Google acts **on our behalf**, as a data processor, and states that it does not log or store the IP address of visitors from the European Economic Area: it uses it to infer the city and then discards it. User data is kept for 2 months, which is the tool's default setting.",
                },
                {
                  term: "Microsoft Clarity",
                  desc: "The most intrusive of the three, which is why it is explained separately. It does not record your screen: it **reconstructs the visit** from the content of the page and from what you do on it — clicks, scrolling, mouse movements, window resizing — and from that it produces heatmaps and a replay of the path you took. Microsoft is **not** our processor: its terms state that Microsoft and we are independent controllers, and it reserves the right to use what it collects for its own purposes, including building profiles for advertising purposes. Microsoft keeps the session recordings for 30 days (up to 9 months for flagged ones and for a randomly chosen sample) and the heatmaps for 9 months.",
                },
              ],
            },
            {
              type: "note",
              text: "**What you type into the virtual waiter stays out of it.** The conversation bubbles, the waiter's replies and the quick-question buttons are all marked so that Clarity masks them, and what is masked never leaves your browser: it is not sent and cannot be seen in a session recording. This is not a mere nicety — that is where people type their allergies, which are health data, and Clarity's own terms forbid sending them to Microsoft.",
            },
            {
              type: "p",
              text: "You can reject the measurement as a whole from the cookie notice, change your mind whenever you like using the button above and, on top of that, opt out within the providers' own systems: [Google Analytics opt-out add-on](https://tools.google.com/dlpage/gaoptout) and [Microsoft privacy statement](https://privacy.microsoft.com/privacystatement). If you reject it, Clarity deletes its own cookies and this website deletes the Google ones it can reach; whatever cannot be deleted expires by itself and, without consent, nothing more is sent.",
            },
          ],
        },
        {
          id: "terceros",
          title: "6. The Google map",
          blocks: [
            {
              type: "p",
              text: "The “Find us” section shows our own illustrated map, which sets no cookies at all. The real Google Maps map loads if you have accepted cookies; if you have not, that tab asks your permission first and nothing loads until you press “Show real map”. Once it loads, your browser connects to Google, which receives your IP address and may set cookies in accordance with its [privacy policy](https://policies.google.com/privacy) and its [information on cookies](https://policies.google.com/technologies/cookies). If you'd rather not load it, reject cookies, use the “Open in Google Maps” link or simply walk here: we're one minute from the Cathedral.",
            },
          ],
        },
        {
          id: "actualizaciones",
          title: "7. Updates to this policy",
          blocks: [
            {
              type: "p",
              text: "We will review this policy whenever the cookies we use or the applicable rules change. The last time was when we added Google Analytics and Microsoft Clarity: since that changes what actually happens when you accept, the decisions saved before then were discarded and the notice asked everyone again. Last updated: {updated}. Find out more about how we process your data in the [Privacy policy](privacy) and about the site owner in the [Legal notice](legalNotice).",
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
        q: "Do I need to book a table?",
        a: "No. At Tixola we don't take bookings: tables are first come, first served, both inside and on the terrace. The best times to find one are right when we open — 13:00 and 20:00. If you're a large group, give us a call on {phone} and we'll tell you which time suits you best.",
      },
      {
        q: "Do you have coeliac-friendly options and allergen information?",
        a: "Yes, with one important caveat. The menu on this site flags the 14 allergens subject to mandatory declaration for every dish and lets you filter out whichever one you need to avoid. That said, the only dishes we declare gluten-free are the **Croquetas sin gluten** (gluten-free croquetas) and the **Postre sin gluten** (gluten-free dessert); for everything else we state what a dish contains, never what it doesn't. All 14 allergens are handled in our kitchen, so always tell our staff when you order and we'll confirm it there and then.",
      },
      {
        q: "Are there vegan or vegetarian dishes?",
        a: "Vegetarian, yes: the **Tixola de pisto de verduras** (a slow-cooked vegetable stew with eggs and chips), the **Patatas bravas, alioli o mixtas** (chips with spicy brava sauce, with aioli or with both), the **Salteado de verdura, arroz y setas** (stir-fried vegetables, rice and mushrooms), the **Tortilla guisada con champiñones** (a Spanish omelette finished in a short mushroom stew), the **Timbal vegetal** (layered vegetables), the **Queso frito** (fried cheese) and the **Queso del país**, **Queso de oveja** and **Queso de cabra** (local, sheep's and goat's cheeses). Several contain egg or dairy, so you can filter them by allergen on the menu page. Nothing on the menu is vegan: if you're coming, say so when you order and the kitchen will tell you what can be adapted.",
      },
      {
        q: "How do I get there, and where can I park?",
        a: "We're at {address}, a one-minute walk from San Martiño Cathedral, right in Ourense's old town. The area is pedestrianised, so we recommend parking in one of the public car parks in the centre and walking over; the “Get directions” button on the website opens the route in Google Maps.",
      },
      {
        q: "Do you have a terrace?",
        a: "Yes, we have a terrace right on Rúa Juan de Austria, with the church of Santa Eufemia in the background, and we keep it open all year round whenever the weather allows. Terrace tables are first come, first served too.",
      },
    ],
  },
};

export default legal;
