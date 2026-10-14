# El camarero virtual, explicado para la barra

Media cara para quien atiende en Tixola. **Imprímela y déjala en la barra.**

No es burocracia: el art. 4 del Reglamento (UE) 2024/1689 de inteligencia artificial —aplicable
desde el 2 de febrero de 2025— obliga a quien pone en servicio un sistema de IA a procurar que las
personas que se ocupan de él tengan «un nivel suficiente de alfabetización en materia de IA». Para un
bar, eso es exactamente esto: que quien está en la barra sepa qué contesta el chat de la web, qué no
contesta, y qué hacer cuando un cliente llegue diciendo «me lo dijo el chat».

---

## Qué es

En la web hay un chat con un botón de camarero. Lo atiende un **asistente de inteligencia
artificial**, no una persona. El modelo es de **Anthropic**, una empresa estadounidense; nosotros le
damos la carta, el horario y la lista de vinos, y él redacta las respuestas.

**Se presenta siempre como IA.** Su primer mensaje dice literalmente que es un asistente de
inteligencia artificial y no una persona, y si alguien le pregunta si es humano, lo repite.

---

## Qué sabe y qué contesta

- **La carta entera**: los 47 platos, con su precio y los alérgenos que la carta declara.
- **Los alérgenos**, con una advertencia fija: que se confirmen con el personal, porque en cocina se
  manipulan los catorce.
- **El horario**, si estamos abiertos ahora y qué días cerramos.
- **Cómo llegar**, la dirección y el teléfono.
- **Los vinos de la carta**: nombre, denominación y color. Puede recomendar maridajes.

## Qué NO hace — y esto es lo importante

| No hace | Qué dice en su lugar |
|---|---|
| **No coge reservas.** Ni por el chat, ni por teléfono, ni por WhatsApp. | Que las mesas van por orden de llegada y que lo mejor es venir al abrir. |
| **No garantiza que un plato NO lleve un alérgeno.** | Dice «no llevan X **entre sus alérgenos declarados**» y remite al personal. Nunca «es sin gluten» salvo en los dos platos que la propia carta llama así. |
| **No da consejo médico ni dietético.** Ni embarazo, ni diabetes, ni dietas. | Que eso no le corresponde, y remite al personal y al médico. |
| **No sabe el precio de los vinos** ni por botella ni por copa. | Que se consulta en la barra. |
| **No conoce ingredientes que no estén en la carta.** No los deduce ni los inventa. | Que lo pregunten en el local. |
| **No habla de otros restaurantes** ni hace de asistente general. | Reconduce hacia la carta o la visita. |

---

## Si alguien llega diciendo «me lo dijo el chat de la web»

1. **Escúchale y compruébalo.** Lo que el asistente dice sobre la carta sale de la carta real, así
   que lo normal es que tenga razón.
2. **Si lo que dice no cuadra, manda la carta del local**, que es la válida. No discutas con el
   chat: discúlpate, sirve lo que corresponda y avisa a Tatiana.
3. **Si era sobre un alérgeno, trátalo como si no lo hubiera dicho nadie.** Pregunta de nuevo, mira
   la carta de papel y, ante la duda, no lo sirvas. El chat avisa siempre de que se confirme con el
   personal: esa confirmación eres tú.
4. **Si alguien dice que reservó por el chat, no ha reservado.** El asistente tiene prohibido
   prometerlo. Trátalo como lo que es: alguien que ha llegado sin mesa.
5. **Apunta lo que pasó y díselo a Tatiana.** Si el chat se equivocó de verdad, se corrige en el
   mismo día: es un texto, no un programa que haya que reescribir.

---

## Lo que el cliente tiene que saber (y la web ya le dice)

- Que habla con una IA, no con una persona.
- Que lo que escriba se envía a Anthropic, en Estados Unidos, para generar la respuesta.
- Que **no debe escribir datos personales ni de salud** — y que el asistente tiene prohibido
  pedírselos.
- Que la conversación **no se guarda en ningún servidor nuestro**: vive solo en su navegador y
  desaparece al cerrar la pestaña o al pulsar «Nueva conversación».

---

## Si hay que apagarlo

Se apaga quitando la clave de Anthropic en el panel de Vercel. El chat **no desaparece**: pasa a un
modo sin conexión que responde con la carta y el horario, sin IA. Nada se rompe.

---

*Última revisión: 14 de octubre de 2026. Si cambia la carta, el horario o la lista de vinos, el
asistente lo aprende solo: lee los mismos datos que la web.*
