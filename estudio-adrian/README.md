# Estudio Adrián

App de estudio tipo test, al estilo de los test de autoescuela, para Adrián.
Funciona en el móvil y se puede «Añadir a pantalla de inicio» para abrirla como una app.

## Qué hace

Ahora mismo lleva el **curso de protección contra incendios** (examen PCI):
35 preguntas de verdadero/falso en 3 temas — Extintores (12), BIEs (11) y
Central de incendios y detección (12) — con la solución del examen original.

- **Por temas.** Cada tema es un test con todas sus preguntas. Al contestar ve
  al momento si ha acertado y, en algunas, por qué.
- **Examen completo**, en dos modos:
  - *Modo estudio*: las 35 preguntas, corrección al momento y sin reloj.
  - *Modo examen*: 35 minutos, puede ir y volver entre preguntas, corrige al
    final, apto con 7 fallos como máximo. En blanco cuenta como fallo.
- **Orden de las preguntas**: salteadas o por temario (el orden del examen
  original). Se elige en la pantalla de inicio y se recuerda.
- **Test de errores.** *Pendientes*: las que falló la última vez (al acertarlas,
  salen). *Todas*: las que ha fallado alguna vez, para asegurarlas.
- **Asistente IA** (`/asistente`). Chat con Claude para preguntar dudas del curso.
  Conoce todas las preguntas del examen con su solución, y desde cualquier
  pregunta corregida hay un enlace «Pregúntale al asistente» que abre el chat
  con esa pregunta como contexto. La conversación se guarda en el móvil.
- **Progreso.** Preguntas dominadas por tema, tests hechos, exámenes aprobados e
  historial. Se guarda en el navegador del móvil (localStorage, sin cuentas):
  si borra los datos del navegador o cambia de móvil, empieza de cero.
- Modo oscuro automático. Con teclado: `1`/`2` (o `A`/`B`) para contestar, `Enter` para seguir.

## Cambiar o añadir preguntas

Todo el contenido está en **`src/data/temario.ts`**. Cada pregunta:

```ts
{
  id: "ext-13",                 // único y no se cambia después (el progreso cuelga de él)
  enunciado: "El extintor…",    // admite \n para listas con viñetas
  opciones: VF,                 // Verdadero / Falso (o una lista propia: ["…", "…", "…"])
  correcta: V,                  // V o F; en listas propias, la posición: 0 = A, 1 = B…
  explicacion: "Porque…",       // opcional, sale al contestar
  imagen: "/img/foto.png",      // opcional, fichero dentro de public/
}
```

Las reglas del examen (minutos y fallos permitidos) están en `EXAMEN`, en el
mismo fichero.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint && npm run typecheck && npm run build
```

Next.js + Tailwind CSS. Se despliega en Vercel como los demás proyectos
(Root Directory: `estudio-adrian`).

## Asistente IA: clave y gasto

El chat llama a la API de Anthropic desde `src/app/api/asistente/route.ts`.
Necesita `ANTHROPIC_API_KEY` en las variables de entorno de Vercel (ver
`.env.example`). Sin la clave, o si la API falla, no da error: responde con las
preguntas del temario que más se parecen a la duda.

Cada pregunta cuesta dinero. Frenos que hay: solo acepta peticiones de la propia
web, 30 preguntas cada 10 minutos por IP y 150 cada 10 minutos en total por
instancia. El techo real de la factura es el **límite de gasto de la cuenta en
la consola de Anthropic**, con la recarga automática apagada.
