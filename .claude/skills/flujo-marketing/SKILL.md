---
name: flujo-marketing
description: Flujo de trabajo para tareas de marketing de los clientes de Brian (negocios locales de Ourense: restaurantes, tapería, cafeterías, salones, clínicas, gimnasios, pizzerías). Encadena investigación → estrategia → producción → SEO local/GEO → medición usando las skills instaladas (ECC, plugins marketing/small-business/searchfit-seo de Anthropic y, si están, marketingskills de Corey Haines, claude-seo y las skills de SEO local). Úsala para "plan de marketing", "contenido para Instagram/TikTok", "carrusel", "copy de la web", "Google Business Profile", "reseñas", "SEO local", "anuncios", "email", "informe mensual", "captar clientes".
---

# Flujo de marketing

Mismo principio que `flujo-desarrollo`: clasificar la petición, saltar a la fase que toca y
usar la mejor skill disponible en cada paso. La investigación que justifica esta selección
está en [INVESTIGACION.md](INVESTIGACION.md).

**Prioridad de skills:** en cada fase la lista va de mejor a alternativa. Usar la primera
**que esté instalada** en la sesión (las de Corey, claude-seo y localseoskills son opcionales;
ver "Instalación recomendada" al final).

## 0. Contexto del cliente (siempre primero)

Todo el marketing parte de una ficha por cliente en `comercial/<cliente>/marketing.md`
(crearla si no existe). Generarla con `product-marketing` (Corey) o, si no está, con
`ecc:brand-discovery` + `brand-voice:discover-brand`. Debe contener:

- Negocio, oferta, precios, horario y **NAP exacto** (nombre, dirección, teléfono) — igual que
  en Google Business Profile y en la web.
- Zona (barrio/Ourense/provincia), público, 3-5 competidores directos con su web y su ficha.
- Tono y idioma (castellano, gallego o ambos), palabras prohibidas, ejemplos de copy que le
  gustan. Guía de voz con `brand-voice:generate-guidelines` / `ecc:brand-voice`.
- Objetivo del trimestre (reservas, llamadas, pedidos, visitas) y cómo se mide.

Las demás skills leen esta ficha; sin ella el contenido sale genérico.

## 1. Clasificar

| Petición | Fase de entrada |
|---|---|
| "¿cómo lo está haciendo la competencia?", "estudio de mercado" | 1 Investigación |
| "plan de marketing", "calendario de contenidos", "qué publico" | 2 Estrategia |
| "carrusel", "post", "reel/TikTok", "copy", "email", "anuncio" | 3 Producción |
| "Google Maps", "ficha de Google", "reseñas", "SEO local", "salir en ChatGPT" | 4 SEO local / GEO |
| "informe", "¿funciona?", "conversiones", "analítica" | 5 Medición |
| "captar clientes para mí (Brian)" | Captación (§6) |

## 2. Fases

### Fase 1 — Investigación
- Competencia: `competitors` / `competitor-profiling` (Corey) → `local-competitor-analysis`
  (SEO local) → `marketing:competitive-brief` → `ecc:competitive-platform-analysis`.
- Mercado y cliente: `customer-research` (Corey) → `ecc:market-research` →
  `nimble:competitor-intel`.
- Copiar lo que funciona: `reverse-engineer-marketing` (Corey; tiene referencias de
  hostelería, fitness y servicios locales).
- Salida: sección "Competencia" en la ficha del cliente, con fuentes.

### Fase 2 — Estrategia  ⛔ PUERTA: Brian aprueba el plan
- Plan: `marketing-plan` (Corey) → `marketing:campaign-plan` → `ecc:marketing-campaign`.
- Contenidos: `content-strategy` (Corey) → `small-business:content-strategy` →
  `searchfit-seo:content-strategy`.
- Oferta/ganchos: `offers`, `marketing-psychology`, `marketing-ideas` (Corey).
- Rutina semanal: `small-business:marketing-monday`.
- Salida: plan de 90 días + calendario de 4 semanas (pilares, formatos, frecuencia, CTA).

### Fase 3 — Producción
- Copy web/landing: `copywriting` → `copy-editing` (Corey) → `copywriting-kit:landing-page-copy`
  → `marketing:draft-content`. Pasar siempre por `copywriting-kit:copy-proof-check` (afirmaciones
  verificables) y `brand-voice:enforce-voice`.
- Redes (carruseles Instagram, guiones TikTok/Reels): `social` (Corey) →
  `small-business:social-content-engine` → `ecc:content-engine`. Diseño en Canva con
  `canva:resize-for-social-media` / `small-business:canva-creator`; programación con `postiz`.
- Email/WhatsApp: `emails` (Corey) → `marketing:email-sequence` → `ecc:email-ops`.
- Anuncios Meta/Google: `ad-creative` + `ads` (Corey) → `small-business:ad-manager`.
- Artículos/blog: `searchfit-seo:create-content` → `ecc:article-writing`.
- Revisión de calidad: agente `brand-voice:quality-assurance`; evitar tics de IA.
- **Nada se publica sin el OK de Brian.**

### Fase 4 — SEO local / GEO
- Ficha de Google: `gbp-optimization` + `gbp-posts` (SEO local) → `seo-local` (claude-seo).
- Reseñas: `small-business:review-reputation` (respuestas) + `review-management` (estrategia).
- Web: `local-schema` / `searchfit-seo:schema-markup` (JSON-LD `LocalBusiness`, `Restaurant`,
  `HairSalon`, `Dentist`…), `local-landing-pages`, `searchfit-seo:on-page-seo`,
  `ecc:seo` + agente `ecc:seo-specialist` para lo técnico. Si hay que tocar código → pasar a
  `flujo-desarrollo`.
- Citas/directorios (NAP coherente): `local-citations` — adaptar a España (Páginas Amarillas,
  TripAdvisor, TheFork, Treatwell, Doctoralia, Apple Maps, Bing Places).
- Buscadores con IA (ChatGPT, Gemini, Perplexity): `ai-local-search` → `seo-geo` (claude-seo)
  → `small-business:seo-ai-visibility` → `searchfit-seo:ai-visibility`.
- Auditoría completa: `local-seo-audit` → `seo-audit` (claude-seo) → `searchfit-seo:seo-audit`.

### Fase 5 — Medición
- Que se mida lo que importa (llamadas, WhatsApp, reservas, formularios):
  `conversion-tracking` + `analytics` (Corey) → `product-tracking-skills:product-tracking-design-tracking-plan`.
- Mejora de conversión: `cro`, `ab-testing` (Corey).
- Informe mensual al cliente: `local-reporting` + `client-deliverables` (SEO local) →
  `marketing:performance-report` → `small-business:report-builder`. Formato con la marca
  neuro·node (ver `comercial/CLAUDE.md`).
- Registro de aprendizajes: `ecc:growth-log`.

## 6. Captación de clientes para Brian
- Encontrar negocios con web floja o sin web: `prospecting` (Corey, `local-prospecting`) →
  `small-business:lead-finder` → `nimble:local-places`.
- Auditoría rápida como gancho: `local-seo-audit` o `searchfit-seo:seo-check`.
- Mensaje: `cold-email` (Corey) → `small-business:outreach-composer`.
- Propuesta/presupuesto: **siempre** con la marca y plantillas de `neuro-node/` según
  `comercial/CLAUDE.md` (tarifas: con chatbot 650 € + 65 €/mes; sin chatbot 500 € + 35 €/mes).

## Reglas de oro
- Ficha del cliente antes que cualquier contenido.
- Localizar: Ourense, castellano/gallego, referencias y directorios españoles; nada de
  ejemplos de EE. UU. (Yelp, dólares, millas).
- Datos (horarios, precios, premios, reseñas) solo si están verificados en la ficha o la web.
- Publicar, enviar emails o lanzar anuncios requiere confirmación explícita de Brian.

## Instalación recomendada (opcional, mejora las fases 1-5)

Ver detalles y riesgos en [INVESTIGACION.md](INVESTIGACION.md).

```bash
/plugin marketplace add coreyhaines31/marketingskills
/plugin install marketing-skills@marketingskills
```

```bash
/plugin marketplace add AgriciDaniel/claude-seo
/plugin install claude-seo@agricidaniel-claude-seo
```

Las skills de SEO local (`garrettjsmith/localseoskills`, MIT) conviene copiarlas a
`.claude/skills/` en vez de instalar su plugin, que conecta un MCP de pago.
