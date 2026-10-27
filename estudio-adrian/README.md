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
- **Repaso de fallos.** Junta las preguntas cuya última respuesta fue un fallo.
  Al acertarlas, salen del repaso.
- **Progreso.** Preguntas dominadas por tema, tests hechos, exámenes aprobados e
  historial. Se guarda en el navegador del móvil (sin cuentas ni servidor).
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
