# Demo de Noah para Restaurant Hilderwin (Westende, Belgica)

Un agente que contesta el telefono del restaurante en neerlandes (flamenco) y
cambia a frances, ingles o aleman si quien llama habla en esos idiomas. Coge
reservas, contesta horarios, carta, aparcamiento y vales regalo, y deja recado
de lo que no sabe. La Vita Buona no se toca: es otro negocio en el mismo
servidor.

Todos los comandos, en Git Bash, desde:

    cd /c/Users/brian/proyectos/PROYECTOS-BRIAN/vapi-voice-agent

## Lo que hace

- **Saluda** en neerlandes y dice que es un asistente automatico:
  "Goeiedag, restaurant Hilderwin in Westende. U spreekt met de automatische
  assistent. Waarmee kan ik u helpen? Vous pouvez aussi parler en français."
- **Cambia de idioma solo**: si le hablan en frances, ingles o aleman, contesta
  en ese idioma hasta el final.
- **Contesta**: horario, si esta abierto ahora mismo, la carta con los precios
  que hay en su web, que los platos del dia y el pescado dependen del dia,
  aparcamiento cerca y vales regalo.
- **Reservas**: pide dia, hora, personas, nombre y telefono, y las comprueba
  antes de apuntarlas. Martes y miercoles dice que cierran. Comida de 12:00 a
  13:30. Cena de 18:00 a 20:00, salvo el sabado, que solo hay turnos a las 18:00
  y a las 20:00.
- **Mas de 8 personas**: toma los datos y dice que el restaurante le llamara
  para confirmar.
- **Lo que no sabe** (alergenos, el plato del dia de hoy, un precio que no esta
  en la web): no se lo inventa. Toma nombre, telefono y el motivo, y dice que le
  llamaran.
- Todo lo que apunta sale en el **panel de reservas**: `localhost:3000/reservas?business=hilderwin`.

## 1. Traer lo nuevo

    git pull
    npm install
    npm test

Tiene que acabar en `fail 0`.

No hace falta tocar el `.env` ni subir nada a Firebase: la ficha de Hilderwin va
dentro del programa.

## 2. Arrancar (igual que siempre)

**Ventana 1:**

    npm run dev

**Ventana 2:**

    ngrok http 3000

## 3. Decirle a Vapi que el numero es de Hilderwin

En **Vapi > Phone Numbers > tu numero**, cambia la **Server URL** por:

    https://saffron-widen-handball.ngrok-free.dev/voice-webhook?business=hilderwin

Guarda. No hay que reiniciar nada.

**Ojo:** asi el numero pasa a ser de Hilderwin. Para volver a La Vita Buona,
cambia el final por `?business=lavitabuona-prueba`. Si Vapi te deja crear otro
numero gratis (Phone Numbers > Create), usa ese para Hilderwin y no tendras que
ir cambiando.

## 4. Probarlo llamando

Llama al numero de Vapi y habla en neerlandes. Para que lo prueben alli, estas
frases cubren todo lo importante:

| Que prueba | Que decir | Que tiene que pasar |
|---|---|---|
| Si esta abierto | "Goeiedag, zijn jullie nu open?" | Dice si esta abierto ahora, segun la hora de Belgica |
| Reserva normal | "Ik wil graag reserveren voor zaterdag om acht uur, met vier personen." | Pide nombre y telefono, lo repite una vez y dice que esta apuntada |
| Turno del sabado | "Zaterdag om zeven uur 's avonds?" | Dice que el sabado por la noche solo hay turnos a las 18:00 y a las 20:00 |
| Dia cerrado | "Kan ik dinsdag reserveren?" | Dice que martes y miercoles cierran y ofrece otro dia |
| Grupo grande | "We komen met twaalf personen op zondagmiddag." | Toma los datos y dice que el restaurante le llamara para confirmar |
| Plato del dia | "Wat is de suggestie van vandaag?" | Dice que cambia cada dia y que no lo sabe; ofrece dejar recado |
| Carta | "Hoeveel kost het vispannetje?" | 30 euros |
| Aparcamiento | "Is er parking in de buurt?" | Que hay aparcamiento cerca, sin inventar mas |
| Vales regalo | "Verkopen jullie cadeaubonnen?" | En hilderwin.be (PDF, 2 años) o en el restaurante |
| Frances | "Bonjour, je voudrais réserver une table pour jeudi soir." | Sigue en frances hasta el final |
| ¿Es una persona? | "Ben jij een echte persoon?" | Dice que es el asistente automatico |

Mientras llamas, abre el panel en el navegador del portatil:

    http://localhost:3000/reservas?business=hilderwin

(usuario `cocina` y tu contraseña del panel). Cada reserva y cada recado
aparecen ahi en unos segundos, con el idioma en que hablo el cliente.

## 5. La voz

Es **"Hans Claesen - Conversational - Vlaams"**, una voz de hombre flamenca de
ElevenLabs pensada para conversacion. Habla tambien frances, ingles y aleman.

Si no os convence, prueba una de mujer sin tocar codigo: en el `.env` pon

    VOZ_RESERVAS_ID=g7B5PNoscIXomLNUmHAb

("Sharon - Multilingual", flamenca), guarda y reinicia la ventana 1 (Ctrl+C y
`npm run dev`). Para volver a la de Hans, deja `VOZ_RESERVAS_ID=` vacio.

## Si algo falla

- **La llamada no conecta o se corta al descolgar**: mira la ventana 1. Si sale
  la linea `assistant-request (... business=hilderwin)`, la llamada llega y es
  Vapi el que rechaza algo: mandame captura de la ventana 1. Lo primero que
  probaria es otra voz (punto 5).
- **Contesta como La Vita Buona**: la Server URL de Vapi no termina en
  `?business=hilderwin`.
- **Algunas frases en neerlandes suenan raras**: pasa a veces con frases muy
  cortas, porque la voz adivina el idioma por el texto. Mandame cuales.

## Lo que todavia NO hace (y hay que decirlo en la demo)

- **No esta conectado a su sistema de reservas.** Apunta la reserva en el panel,
  pero no sabe si esa noche esta lleno. Para eso hay que conectarse a su
  programa: es la pregunta 3 del CONTEXTO.
- **No sabe las fechas de las vacaciones escolares flamencas**, cuando la cena
  pasa a dos turnos. Si el cliente las menciona, propone las 18:00 o las 20:00.
- **No tiene la lista de alergenos** ni el plato del dia: deja recado.
- **El numero es de Estados Unidos**: para alguien que llama desde Belgica es
  una llamada internacional. Para un cliente de verdad haria falta un numero
  belga, que tiene su propio papeleo, como el español.
- **No es un cliente de verdad todavia**: los datos salen de su web del
  23-11-2026 y nadie del restaurante los ha confirmado.
