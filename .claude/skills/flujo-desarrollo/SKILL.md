---
name: flujo-desarrollo
description: Flujo de trabajo para cualquier tarea de desarrollo en los proyectos de Brian (webs Next.js + TypeScript + Tailwind, servidor Express de Vapi, Supabase, Vercel/Render). Clasifica la tarea (bug, funcionalidad nueva, cambio, web/landing, refactor, despliegue, MVP), la dimensiona y encadena las skills y agentes del plugin ECC con dos puertas de aprobación (plan y commit). Úsala al empezar cualquier tarea de código: "arregla", "añade", "cambia", "haz la web de", "despliega", "refactoriza", "revisa".
---

# Flujo de desarrollo

Un único punto de entrada para tareas de código. Decide **qué tipo de tarea es**, **qué
tamaño tiene** y **qué fases toca**, y en cada fase usa la skill o el agente de ECC que
corresponde. Las tareas pequeñas no pagan la ceremonia de las grandes.

## 0. Antes de nada (siempre, 1 minuto)

1. Situarse en la carpeta del proyecto (`tixola-taperia/`, `dos-puertas/`, `andrea-salon/`,
   `hungceed/`, `vapi-voice-agent/`…) y leer su `CLAUDE.md` / `AGENTS.md` / `README.md` /
   `PLAN.md` / `PENDIENTE.md` si existen.
2. **Next.js**: los proyectos avisan de que *no es el Next.js que conoces*. Antes de escribir
   código de Next, mirar la guía en `node_modules/next/dist/docs/` (instalar dependencias con
   `npm ci` si falta `node_modules`).
3. Rama: trabajar en la rama asignada a la sesión; nunca en `main` directamente.
4. Documentos comerciales (propuestas, briefings, presupuestos) **no** son este flujo: van con
   la marca neuro·node según `comercial/CLAUDE.md`.

## 1. Clasificar la tarea

| Si la petición es… | Tipo | Orquestador ECC |
|---|---|---|
| "no funciona", "da error", "se ve mal en móvil" | **Bug** | `ecc:orch-fix-defect` |
| "añade", "quiero que tenga", "integra X" | **Funcionalidad nueva** | `ecc:orch-add-feature` |
| "cambia", "en vez de X que haga Y" | **Cambio** | `ecc:orch-change-feature` |
| "hazme la web de…", "landing", "rediseña" | **Web / UI** | ver §4 (rama UI) |
| "limpia", "simplifica", "código muerto" | **Refactor** | `ecc:orch-refine-code` |
| "sube", "despliega", "pon en producción" | **Despliegue** | ver §5 |
| proyecto nuevo desde cero | **MVP** | `ecc:orch-build-mvp` |
| "revisa este PR / estos cambios" | **Revisión** | `ecc:orch-review` o `/code-review` |

Si no encaja, usar `ecc:feature-dev` (flujo guiado genérico).

## 2. Dimensionar

- **Trivial** (texto, color, un enlace, <10 líneas, sin lógica): ir directo a §3 fase 4 → 6.
- **Pequeña** (un componente o endpoint, 1-3 ficheros): fases 2 → 4 → 5 → 6.
- **Estándar** (varias piezas, datos, formularios, integraciones): todas las fases.
- **Grande / MVP**: todas las fases + plan escrito en el repo (`PLAN.md` del proyecto) y
  trabajo por hitos con commit en cada uno.

Sube un nivel si toca: **pagos, reservas, datos personales (RGPD), autenticación, secretos,
webhooks públicos** (p. ej. Vapi, WhatsApp, Supabase RLS).

## 3. Fases

### Fase 1 — Investigar y reutilizar
- `ecc:search-first`: buscar librería, componente o integración existente antes de escribir
  código propio (npm, MCP, skills, repos de los otros proyectos de esta carpeta: muchas webs
  comparten patrones — cabecera, carta, reservas, WhatsApp).
- `ecc:documentation-lookup` / agente `ecc:docs-lookup` para APIs de terceros (Supabase,
  Vapi, Stripe, Resend…). Para Next.js, la documentación local de `node_modules`.
- Agente `ecc:code-explorer` si hay que entender un código que no conocemos.

### Fase 2 — Planificar  ⛔ PUERTA 1
- `/ecc:plan` (agente `ecc:planner`): requisitos, riesgos, pasos, ficheros afectados.
- Para estándar/grande: agente `ecc:architect` o `ecc:code-architect` si hay decisiones de
  arquitectura (modelo de datos, colas, auth). Registrar decisiones con
  `ecc:architecture-decision-records` si son difíciles de revertir.
- **Parar y pedir confirmación a Brian** antes de tocar código si la tarea es estándar o
  mayor, o si cambia algo visible para el cliente final.

### Fase 3 — Andamiaje (solo MVP)
- `ecc:project-init` + skill `ecc:nextjs-turbopack` / `ecc:vite-patterns` según el caso.
- Copiar convenciones de un proyecto hermano (estructura `src/`, `eslint.config.mjs`,
  Tailwind) en lugar de inventarlas.

### Fase 4 — Implementar con tests
- `ecc:tdd-workflow` (agente `ecc:tdd-guide`): test que falla → mínimo código → refactor.
  - Lógica (reservas, precios, bonos, webhooks, validaciones): test obligatorio con
    `tsx --test` (patrón ya usado en `andrea-salon` y `vapi-voice-agent`).
  - UI pura: comprobación visual en vez de test unitario (ver §4).
- Patrones por capa: `ecc:frontend-patterns`, `ecc:react-patterns`, `ecc:backend-patterns`,
  `ecc:api-design`, `ecc:typescript-patterns`, `ecc:postgres-patterns` (Supabase),
  `ecc:error-handling`.
- Si se rompe el build/tipos: `/ecc:build-fix` (agente `ecc:build-error-resolver`).

### Fase 5 — Revisar
Se lanzan en paralelo los que apliquen:
- Siempre: agente `ecc:code-reviewer` (o `ecc:typescript-reviewer` / `ecc:react-reviewer`).
- Seguridad (si aplica el "sube un nivel" de §2): `ecc:security-review` + agente
  `ecc:security-reviewer`.
- Errores silenciosos en integraciones (webhooks, fetch, Supabase): agente
  `ecc:silent-failure-hunter`.
- Calidad/simplificación: skill integrada `/simplify`.
- Tests faltantes: agente `ecc:pr-test-analyzer`.

Corregir lo bloqueante; lo opcional se anota para Brian.

### Fase 6 — Verificar y entregar  ⛔ PUERTA 2
1. `ecc:verification-loop` con los comandos reales del proyecto (tabla abajo). Todo en verde
   o se explica qué falla y por qué.
2. Para cambios visibles: arrancar la app (`/run` o `npm run dev`) y hacer captura con
   Playwright en móvil (390 px) y escritorio (1440 px).
3. Commit en español, claro y descriptivo (`ecc:prp-commit` ayuda a seleccionar ficheros).
   Empujar a la rama asignada. **No** crear PR salvo que Brian lo pida.
4. Resumen final: qué se hizo, qué se verificó, qué queda pendiente (actualizar
   `PENDIENTE.md` / `README.md` del proyecto si existe la lista).

## Comandos de verificación por proyecto

| Proyecto | typecheck | lint | test | build |
|---|---|---|---|---|
| `tixola-taperia` | `npm run typecheck` | `npm run lint` | — | `npm run build` |
| `dos-puertas` | `npm run typecheck` | `npm run lint` | — | `npm run build` |
| `hungceed` | `npm run typecheck` | `npm run lint` | — | `npm run build` |
| `andrea-salon` | `npm run typecheck` | `npm run lint` | `npm test` | `npm run build` |
| `vapi-voice-agent` | `npm run typecheck` | — | `npm test` | `npm run build` |

Proyecto nuevo: mismos scripts (`dev`, `build`, `lint`, `typecheck`, `test`) para que esta
tabla siga valiendo.

## 4. Rama UI — webs y landings de negocios locales

Para "hazme la web de…" o rediseños, en lugar de TDD:
1. Briefing: leer `BRIEF.md` / `docs/` del proyecto (carta, horarios, fotos, tono).
2. Dirección visual: `ecc:frontend-design-direction` (o `website-design:web-design-system`
   para dejar un `DESIGN.md`). Evitar el look genérico de IA: `vectorlab-ux-skills:anti-slop`.
3. Construir con `ecc:frontend-patterns` + `ecc:make-interfaces-feel-better`; movimiento con
   `ecc:motion-foundations` solo si aporta.
4. Accesibilidad: `ecc:accessibility` / agente `ecc:a11y-architect`.
5. SEO técnico y local desde el primer día: `ecc:seo` (agente `ecc:seo-specialist`) —
   metadatos, `LocalBusiness`/`Restaurant` JSON-LD, sitemap, robots, NAP coherente con Google
   Business Profile.
6. QA: `ecc:browser-qa` (consola limpia, Core Web Vitals, 3 anchos, axe) → veredicto
   SHIP / DO-NOT-SHIP.

## 5. Despliegue

- Webs Next.js → Vercel; `vapi-voice-agent` → Render (`render.yaml` en la raíz).
- `ecc:deployment-patterns` para checklist de producción; skill `engineering:deploy-checklist`
  si hace falta lista formal.
- Variables y claves **nunca** en el repo (ni en `render.yaml`): se ponen en el panel.
- Tras desplegar: `ecc:canary-watch` o `ecc:browser-qa` contra la URL real.

## Reglas de oro

- Una tarea = un tipo. Si a mitad aparece otra (p. ej. un bug al añadir una función), se
  anota y se trata aparte.
- Nada se da por terminado sin la Fase 6 en verde o una explicación honesta de lo que falla.
- Preferir copiar un patrón probado de otro proyecto de la carpeta antes que inventar uno.
- Si la tarea es de marketing (contenido, SEO de contenidos, redes, anuncios), usar la skill
  `flujo-marketing`.
