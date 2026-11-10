# Investigación: mejores repos de skills de marketing (10/11/2026)

Datos verificados con la API de GitHub y clones superficiales; no se ejecutó ningún script de
los repos. Criterio: encaje con un freelance que hace webs y marketing para negocios locales
en Ourense (SEO local, Google Business Profile, redes, copy, email, anuncios, informes).

## Ranking

| # | Repo | ★ | Último push | Licencia | Skills mkt | Veredicto |
|---|---|---|---|---|---|---|
| 1 | coreyhaines31/marketingskills | 59,6k | 10/11/2026 | MIT | 53 | **Instalar** — estándar de facto; skills largas y rigurosas, contexto compartido por cliente (`product-marketing`), `conversion-tracking` con snippets de clic en teléfono/WhatsApp/Calendly, referencias de hostelería y fitness. Orientado a SaaS y sin GBP. Sin hooks ni MCP. |
| 2 | AgriciDaniel/claude-seo | 27,9k | 01/11/2026 | MIT | 26 + 19 agentes | **Instalar** — `seo-local` (GBP, NAP, reseñas), `seo-maps`, `seo-geo`, GSC/GA4. Pesado: Python 3.11 + navegador headless (`/seo setup`) y hook PostToolUse que valida schema. Sin telemetría (PRIVACY.md). |
| 3 | anthropics/knowledge-work-plugins (`small-business`, `marketing`) | 35,3k | 10/11/2026 | Apache-2.0 | ~23 | **Ya disponible** en la cuenta — reseñas, propuestas, contenido social con Canva, rutina semanal, informes. Depende de conectores. |
| 4 | garrettjsmith/localseoskills | 147 | 30/10/2026 | MIT | 39 | **Copiar skills** — lo que más encaja con negocios locales (GBP, posts, reseñas, landings locales, schema, citas, informes de cliente). El plugin conecta un MCP de pago; muy centrado en EE. UU. |
| 5 | AgriciDaniel/claude-ads | 10,9k | 01/11/2026 | MIT | 34 | Seleccionar cuando se gestionen anuncios (Meta, Google, TikTok, landing, presupuesto). |
| 6 | alirezarezvani/claude-skills (`marketing-skill/`) | 29,6k | 10/11/2026 | MIT | 50 | Seleccionar `local-seo-manager`; el resto solapa con Corey. Mismo nombre de plugin que Corey (conflicto). |
| 7 | zubair-trabzada/geo-seo-claude | 11,6k | 10/11/2026 | MIT | 15 | Inspiración (auditoría GEO 0-100, llms.txt). Instalador `curl \| bash`. |
| 8 | affaan-m/ECC | 300,7k | 09/11/2026 | MIT | ~13 | Ya instalado: `marketing-campaign`, `content-engine`, `brand-voice`, `brand-discovery`, `market-research`, `seo`, `article-writing`, `crosspost`, `social-publisher`, `email-ops`, `growth-log`. Skills cortas, orientado a desarrollo. |
| 9 | zubair-trabzada/ai-marketing-claude | 2,9k | 02/03/2026 | MIT | 15 | Inspiración (`market-proposal`). Abandonado, SKILL.md sin frontmatter. |
| 10 | nowork-studio/notfair-plugin | 4,1k | 10/11/2026 | MIT | 45 | Inspiración; depende del SaaS notfair.co. |
| 11 | irinabuht12-oss/marketing-skills | 7,2k | 27/10/2026 | **Sin licencia** | 49 | Evitar (no reutilizable legalmente; embudo comercial). |
| 12 | anthropics/skills | 192k | 06/11/2026 | Mixta | ~3 | `pptx`/`docx`/`pdf` y `frontend-design`, ya disponibles. |

Listas curadas revisadas: VoltAgent/awesome-agent-skills (la más útil para marketing),
hesreallyhim/awesome-claude-code (herramientas, poco marketing), travisvn/awesome-claude-skills
(parada desde abril de 2026).

## Combinación recomendada

- **Base estrategia + producción + medición:** Corey Haines.
- **SEO local / GEO:** skills GBP de localseoskills + claude-seo.
- **Operativa pyme (reseñas, propuestas, rutina semanal, Canva):** small-business y marketing
  de Anthropic (ya en la cuenta).
- **ECC:** complemento (brand voice, campañas, crosspost).

## Instalación

```bash
/plugin marketplace add coreyhaines31/marketingskills
/plugin install marketing-skills@marketingskills
```

```bash
/plugin marketplace add AgriciDaniel/claude-seo
/plugin install claude-seo@agricidaniel-claude-seo
```

Skills de SEO local a copiar (sin el plugin, para evitar su MCP de pago):

```bash
git clone --depth 1 https://github.com/garrettjsmith/localseoskills /tmp/lss
cp -r /tmp/lss/skills/{gbp-optimization,gbp-posts,review-management,local-landing-pages,local-schema,local-citations,local-reporting,client-deliverables,ai-local-search,local-keyword-research,local-competitor-analysis,local-seo-audit} .claude/skills/
```

Anuncios (cuando haga falta):

```bash
/plugin marketplace add agricidaniel/claude-ads
/plugin install claude-ads@ai-marketing-hub-claude-ads
```

## Riesgos detectados

- **Hooks que ejecutan código:** ECC (`node -e` en casi todos los eventos), claude-seo (Python
  tras cada Edit/Write), cockpit opcional de claude-ads.
- **`curl | bash`:** instaladores de zubair-trabzada. Usar siempre `/plugin`.
- **MCP remotos/SaaS:** localseoskills (`mcp.localseodata.com`), notfair, y los conectores de
  knowledge-work-plugins. Revisar `.mcp.json` antes de autorizar.
- **Contenido comercial:** enlaces de afiliado en algunas skills de Corey; comunidades Skool y
  versiones "Pro" en zubair y AgriciDaniel.
- **Idioma:** ningún repo está en español → la ficha de cliente (`flujo-marketing` §0) fija
  tono, zona, NAP y competidores para localizar la salida.
