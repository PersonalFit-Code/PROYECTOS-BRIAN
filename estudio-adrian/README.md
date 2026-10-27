# Estudio Adrián

App de estudio tipo test, al estilo de los test de autoescuela, para Adrián.
Funciona en el móvil y se puede «Añadir a pantalla de inicio» para abrirla como una app.

## Qué hace

- **Temario por temas.** Cada tema es un test de 10 preguntas. Salen primero las
  que nunca ha visto o falló la última vez, así cada test enseña algo nuevo.
  Al contestar ve al momento si ha acertado y la explicación.
- **Simulacro de examen.** Como el teórico de la DGT: 30 preguntas repartidas
  entre todos los temas, 30 minutos, apto con 3 fallos como máximo. Puede ir y
  volver entre preguntas y no sabe nada hasta que corrige. Las respuestas en
  blanco cuentan como fallo.
- **Repaso de fallos.** Junta todas las preguntas cuya última respuesta fue un
  fallo. Al acertarlas, salen del repaso.
- **Progreso.** Preguntas dominadas por tema, tests hechos, exámenes aprobados e
  historial. Se guarda en el navegador del móvil (sin cuentas ni servidor).
- Modo oscuro automático. Con teclado: `1-4` o `A-D` para contestar, `Enter` para seguir.

## Meter el temario de verdad

Todo el contenido está en **`src/data/temario.ts`**. Los tres temas que trae
(Constitución, Geografía, Primeros auxilios) son **de ejemplo**. Cada pregunta:

```ts
{
  id: "t4-01",                  // único y no se cambia después (el progreso cuelga de él)
  enunciado: "¿…?",
  opciones: ["…", "…", "…", "…"],
  correcta: 2,                  // posición de la buena: 0 = A, 1 = B, 2 = C, 3 = D
  explicacion: "Porque…",       // opcional, sale al contestar
  imagen: "/img/senal.png",     // opcional, fichero dentro de public/
}
```

Las reglas del examen (preguntas, minutos, fallos permitidos) están al principio
del mismo fichero, en `EXAMEN`.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint && npm run typecheck && npm run build
```

Next.js + Tailwind CSS. Se despliega en Vercel como los demás proyectos
(Root Directory: `estudio-adrian`).
