# Agentes de contenido

Sistema multi-agente para un creador que trabaja solo: seis agentes sobre Claude
que comparten un mismo "cerebro" (perfil, voz, nicho y calendario). Nada se
publica solo: todo lo que sale de un agente pasa por revisión humana.

Estado: **aparcado** (20-10-2026). Hay schema y perfil de voz; faltan `runAgent` y los agentes. Brian pasó a priorizar el setter (`../setter/PLAN.md`).

## Arrancar

```bash
cp .env.example .env.local   # y rellena ANTHROPIC_API_KEY
npm install            # genera también el cliente de Prisma
npm run db:migrate     # crea data/dev.db con las tablas
npm run dev
```

Los componentes de shadcn/ui se añaden a mano cuando hacen falta
(`npx shadcn@latest add button card ...`); `components.json` ya está listo.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind 4 + shadcn/ui
- Prisma 7 + SQLite local (`data/dev.db`) con el adaptador de better-sqlite3
- `@anthropic-ai/sdk` directo (sin Vercel AI SDK: el log de tokens y coste
  por llamada se saca de la respuesta tal cual)
- zod para validar la salida estructurada de los agentes

## Estructura

```
agentes-contenido/
├── prompts/                       el "cerebro", en Markdown editable
│   ├── voice-profile.md           quién soy, nicho, tono, palabras sí/no, estructuras
│   └── agents/                    un prompt por agente
│       ├── borradores.md
│       ├── reutilizacion.md
│       └── …                      (ideas, calendario, mensajes, resumen: fase 2)
│
├── prisma/
│   └── schema.prisma              User, VoiceSample, Idea, Draft, CalendarSlot,
│                                  InboxItem, WeeklyReview, AgentRun  (paso 2)
│
├── data/                          local-first, fuera de git
│   ├── dev.db                     SQLite
│   └── uploads/                   audios y ficheros importados
│
└── src/
    ├── agents/                    definición de cada agente
    │   ├── registry.ts            nombre → { prompt, modelo, esquema de salida }
    │   ├── borradores.ts          MVP
    │   └── reutilizacion.ts       MVP
    │
    ├── lib/
    │   ├── claude.ts              runAgent({ agent, input, context })
    │   │                            1. carga voice-profile.md + prompt del agente
    │   │                            2. busca 3-5 ejemplos de mi voz (retrieval.ts)
    │   │                            3. llama a Claude, valida la salida con zod
    │   │                            4. guarda AgentRun: tokens, coste, latencia
    │   ├── retrieval.ts           elige los ejemplos de voz más parecidos al encargo
    │   ├── pricing.ts             €/$ por millón de tokens según modelo
    │   ├── db.ts                  cliente Prisma único
    │   └── utils.ts               cn() para Tailwind
    │
    ├── components/
    │   ├── ui/                    shadcn
    │   └── layout/                barra lateral, cabecera
    │
    └── app/
        ├── (dashboard)/
        │   ├── layout.tsx         barra lateral: Hoy · Ideas · Borradores · Calendario · Voz
        │   ├── page.tsx           "Hoy": qué toca grabar/publicar y lo pendiente de revisar
        │   ├── ideas/             lista de ideas con estado
        │   ├── borradores/        lista + editor de cada borrador ([id])
        │   ├── reutilizar/        pieza madre → reel, carrusel, post, stories
        │   ├── calendario/        kanban semanal: idea → borrador → grabado → editado → publicado
        │   ├── voz/               editar perfil de voz y subir/pegar ejemplos
        │   └── coste/             historial de AgentRun: tokens, € y latencia
        └── api/
            └── agents/[agent]/    POST → runAgent (las páginas usan server actions;
                                   esto queda para el bot de Telegram y el cron)
```

## Decisiones del andamiaje

- **Carpeta propia dentro del monorepo**, como el resto de proyectos.
- **Sin Vercel AI SDK**: con el SDK de Anthropic tenemos el `usage` exacto de
  cada llamada para `AgentRun`, y no necesitamos streaming al chat.
- **RAG del MVP sin embeddings**: con 10-50 ejemplos basta con puntuar por
  formato, plataforma y palabras clave del encargo. Los embeddings llegan en
  la fase 3, como dice el plan; `retrieval.ts` es el único sitio que cambia.
- **Server actions** para la UI; la ruta `/api/agents/[agent]` existe para
  quien llama desde fuera (bot, cron).
