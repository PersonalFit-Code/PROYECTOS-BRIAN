# Hilderwin (Westende, Bélgica) · agente de voz

Contacto llegado a través de Rudy, amigo de la madre de Brian (23/11/2026). El primer mensaje va «de parte de Rudy». Les interesó el agente que contesta las llamadas, no el rediseño de la web.

## El restaurante (datos públicos de su web, 23/11/2026)

- **Restaurant Hilderwin**, Priorijlaan 14, 8434 Westende (Middelkerke, Flandes Occidental). Junto al «tennisput», a 200 m del paseo marítimo. Aparcamiento cerca.
- Empresa: Hilderwin BV. Llevan el local Stefanie, Jonas, Nora y Olivia.
- Teléfono 059 31 04 94 · info@hilderwin.be · hilderwin.be (en neerlandés, francés, inglés y alemán).
- Cocina belga clásica de costa: pescado fresco, carne, mejillones de temporada, platos del día. Su lema: frescura y buena relación calidad-precio.
- **Abierto:** 12:00–15:00 y 18:00–22:00. **Cocina:** 12:00–14:00 y 18:00–21:00.
- **Reservas:** lunes, jueves, viernes y domingo de 12:00 a 13:30 y de 18:00 a 20:00; sábado de 12:00 a 13:30 y turnos a las 18:00 y a las 20:00. En vacaciones escolares flamencas, dos turnos de noche (18:00 y 20:00).
- **Cerrado martes y miércoles.**
- Reserva online en su propia web (día, hora y de 1 a 8 personas). **Más de 8 personas: tienen que llamar.** «Prefer to call? Always possible.»
- Normas que el agente debe saber: 1 mesa = 1 cuenta; grupos grandes, mejor reservar y limitar la elección; si llegas más de 15 minutos tarde, no garantizan la mesa; el pescado es fresco y algunos platos pueden variar de precio o no estar.
- Venden **vales regalo** online (PDF, válidos 2 años) o en el local.

### Carta (resumen)

- **Menús:** de la casa 37 €, gourmet 45 €, de lenguado 60 €, y sugerencias del día.
- **Entrantes:** sopa del día, ancas de rana, croquetas de queso y de gamba gris, 6 scampi (al ajo o de la casa), carpaccio, gambas a la plancha, cóctel de gambas.
- **Pescado:** vispannetje (cazuela de pescado del chef, 30 €), salmón con bearnesa, lomo de bacalao con mostaza, lenguado (precio del día), brochetas de scampi y de pescado, gambas, tomate relleno de gamba gris, rollitos de lenguado gratinados, sopa real de pescado.
- **Carne:** steak y entrecot con salsas (pimienta, bearnesa, champiñones, de la casa, mantequilla de ajo), brocheta mixta, codillo con mostaza, vol-au-vent de pollo, steak tartar.
- **Mejillones:** natural, al vino blanco, al ajo, ajo y nata (precio del día).
- **Otros:** pastas y lasaña (también vegetariana), ensaladas, copas de helado y postres caseros.
- Los platos de carne y mejillones van con patatas fritas, pan, croquetas o puré.

## Lo que les ofreceríamos

Un agente que coge el teléfono cuando ellos no pueden (en pleno servicio, martes y miércoles cerrados, fuera de hora):

- contesta horarios, carta, si hay plato del día, alérgenos, aparcamiento, vales regalo;
- toma reservas, sobre todo las de más de 8 personas que hoy obliga a llamar;
- habla neerlandés (flamenco), francés, inglés y alemán según quién llame;
- les deja aviso de lo que no sepa resolver.

Base técnica: el agente de voz que ya tenemos (`vapi-voice-agent/`, el de pizzería y el de citas). Hay que pasarlo a neerlandés y a reservas de restaurante.

## Lo que falta saber (preguntar)

1. ¿En qué idioma les llaman sobre todo? (Westende es Flandes: neerlandés, y mucho turista francés y alemán.)
2. ¿Qué les preguntan más por teléfono?
3. ¿Su reserva online la gestiona un programa? Para que el agente vea huecos y reserve, hay que conectarse a él.
4. ¿Cuántas llamadas pierden? ¿En qué momentos?
5. ¿Quién decide: Stefanie o Jonas?

## Cuidado

- El agente de voz **todavía no está funcionando en ningún cliente**: serían los primeros. Decirlo así y ofrecer una prueba.
- Bélgica es UE: si se graba o se guardan datos, aviso al empezar la llamada y contrato de encargado del tratamiento.
- No dar precio hasta cerrarlo con Nico: el coste por minuto va dentro.
