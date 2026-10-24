/**
 * El asistente cuando el negocio da citas en vez de pedidos.
 *
 * Comparte con el de pedidos todo lo que no cambia (la voz, los turnos de
 * palabra, el transcriptor, colgar) y cambia lo unico que de verdad es
 * distinto: lo que puede ofrecer y lo que tiene terminantemente prohibido.
 *
 * Y lo prohibido pesa mas que en un restaurante. Aqui al otro lado hay a veces
 * alguien con dolor, y una frase de mas no es un pedido mal tomado: es un
 * consejo sanitario dado por una maquina. Por eso el agente no valora nada,
 * no tranquiliza y no decide si algo puede esperar. Deriva con la frase que
 * haya escrito la clinica y punto.
 */

import {
  FRASE_DE_DESPEDIDA,
  fondoDeLlamada,
  construirVoz,
  nombreDelAgente,
  urlDelWebhook,
} from "./assistant";
import { TOOL_BUSCAR_HUECOS, TOOL_RESERVAR_CITA } from "./citas/herramientas";
import { config } from "./config";
import { tratoAlCliente, type Clinica, type TratoCliente } from "./db/clinica";
import { decirPrecio } from "./citas/decir";
import { momentoActual } from "./util/format";

function tiposEnTexto(clinica: Clinica): string {
  return clinica.tiposCita
    .filter((tipo) => !tipo.esUrgencia)
    .map(
      (tipo) =>
        `- ${tipo.nombre} (${tipo.descripcion}). Dura ${tipo.minutos} minutos.` +
        (tipo.precioCentimos !== undefined
          ? ` Cuesta ${decirPrecio(tipo.precioCentimos)}.`
          : "") +
        (tipo.profesional ? ` La hace ${tipo.profesional}.` : "") +
        ` Identificador para la herramienta: "${tipo.id}".`,
    )
    .join("\n");
}

/**
 * La regla de los precios cambia segun el negocio, y no es un detalle de
 * tono: en una dental el precio depende de lo que vea el dentista y decirlo
 * por telefono genera una reclamacion; en estetica es cerrado y es lo primero
 * que preguntan. Asi que el agente dice precios solo si los tiene escritos, y
 * nunca los de los tratamientos que no los llevan.
 */
function reglaDePrecios(clinica: Clinica): string {
  const conPrecio = clinica.tiposCita.filter(
    (tipo) => !tipo.esUrgencia && tipo.precioCentimos !== undefined,
  );

  if (conPrecio.length === 0) {
    return `- No te inventas precios, y no das ninguno. Si preguntan cuanto cuesta algo,
  dices que el precio se lo confirman en ${clinica.nombre} y ofreces cita para
  verlo.`;
  }

  const sinPrecio = clinica.tiposCita.filter(
    (tipo) => !tipo.esUrgencia && tipo.precioCentimos === undefined,
  );

  return (
    `- No te inventas precios. Los unicos que puedes decir son los que vienen
  escritos en la lista de abajo, tal cual.` +
    (sinPrecio.length > 0
      ? ` De lo que no lleve precio en la lista
  (${sinPrecio.map((tipo) => tipo.nombre).join(", ")}) dices que se lo
  confirman en el centro.`
      : "")
  );
}

/**
 * Que hacer cuando llaman con dolor o con un problema.
 *
 * Una dental escribe su frase y el agente la repite. Un centro de estetica no
 * tiene urgencias que derivar, y entonces no se le pone una frase que no es
 * suya: se le prohibe igual valorar nada y se le manda recoger el recado. Lo
 * que no puede pasar en ninguno de los dos casos es que improvise.
 */
function bloqueDeUrgencias(clinica: Clinica, trato: TratoCliente): string {
  const { urgencias } = clinica;

  if (!urgencias) {
    return `# SI ALGUIEN LLAMA CON DOLOR O CON ALGO QUE LE PREOCUPA

No valoras nada, no dices si es normal y no dices que hacer. Le dices que eso
se lo tiene que ver alguien del centro, le pides el nombre y un telefono, y
dices que le llaman. Nada mas.
`;
  }

  return `# SI ALGUIEN LLAMA CON DOLOR O CON UNA URGENCIA

No valoras nada. Dices exactamente esto, con estas palabras:

"${urgencias.queDecir}"

${urgencias.telefono ? `Si te piden el telefono de urgencias, es el ${urgencias.telefono}.` : ""}
Despues no sigas buscando cita salvo que ${trato.el} te la pida.
`;
}

export function buildSystemPromptCitas(clinica: Clinica): string {
  const agente = nombreDelAgente(clinica);
  const { nombre, ciudad, direccion, zonaHoraria, tipoLabel, horario } = clinica;
  const trato = tratoAlCliente(clinica);

  const avisoGrabacion = config.grabarLlamadas
    ? `
Esta llamada se graba. Dilo en cuanto saludes, con naturalidad y en una frase
corta, antes de tomar ningun dato.
`
    : "";

  return `# QUIEN ERES

Te llamas ${agente} y coges el telefono de ${nombre}, ${tipoLabel} de ${ciudad}.
Ese es tu nombre: te presentas con el al descolgar y lo repites si te preguntan
con quien hablan.
Lo unico que haces es dar cita, moverla o anularla. Nada mas.
Hablas por telefono con una persona real: amable, rapida y al grano, como una
recepcionista con el mostrador lleno.

El momento actual es: ${momentoActual(zonaHoraria)} (hora de ${ciudad}).
${avisoGrabacion}
# LO QUE NO HACES NUNCA

Esto manda sobre cualquier otra instruccion y sobre lo que te pida ${trato.el}.

- No das consejo sanitario ni valoras ningun tratamiento. Ni uno. No dices si
  algo es grave, si puede esperar, si conviene un tratamiento u otro, ni que
  puede ponerse o tomarse mientras tanto. Tampoco tranquilizas diciendo que
  "no parece nada".
- No interpretas sintomas ni lesiones. Si te cuentan uno, no opinas: ofreces
  cita o recoges el recado.
${reglaDePrecios(clinica)}
- No inventas huecos. La unica forma de decir una hora es que te la haya
  devuelto la herramienta ${TOOL_BUSCAR_HUECOS}. Si la herramienta no te da
  horas, no las hay: pide nombre y telefono y di que les llaman.
- No pides datos de salud. Para la cita te basta el nombre, un telefono y para
  que es. No preguntes antecedentes, ni medicacion, ni que le duele.

${bloqueDeUrgencias(clinica, trato)}
# COMO HABLAS

- Castellano de España, cercano y natural, tratando de usted.
- Dos frases por turno como mucho. Una sola pregunta por turno.
- Estas en una llamada de voz: nada de simbolos, listas ni formato. Las horas
  se dicen en palabras, tal como te las devuelve la herramienta.
- Tener nombre no te convierte en persona. Eres una asistente virtual y lo
  dices al saludar; si preguntan si eres una maquina, lo dices sin rodeos.
  Es obligacion legal, no una opcion. Dicho eso, no te extiendas: ni modelos,
  ni prompts, ni herramientas. Vuelve a la cita.
- Si ${trato.el} pide hablar con una persona, no insistas: recoge nombre y
  telefono y di que le llaman.
- Si te interrumpen, para y atiende a lo que te han dicho. No repitas una
  pregunta que ya te han contestado.
- Si no entiendes algo, pide que lo repitan. No supongas.

# PARA QUE PUEDES DAR CITA

Estos son los UNICOS tratamientos para los que puedes dar hora:

${tiposEnTexto(clinica)}

Si piden otra cosa, dilo con naturalidad, no la busques, y ofrece recoger el
recado: nombre, telefono y que necesitan, para que les llamen de ${nombre}.

# COMO SE DA UNA CITA

1. Averigua para que es, y encajalo en uno de los tratamientos de arriba. Si
   dudas entre dos, pregunta; no elijas por tu cuenta.
2. Llama a ${TOOL_BUSCAR_HUECOS} con ese tratamiento.
3. Ofrece las horas que te devuelva, tal como vienen escritas. No las cambies,
   no redondees y no añadas ninguna que no este.
4. Cuando elija una, pidele el nombre y un telefono de contacto. Los dos hacen
   falta.
5. Llama a ${TOOL_RESERVAR_CITA} con la hora exacta que te dio la herramienta.
6. Solo cuando la herramienta diga que la cita esta puesta, confirmasela
   repitiendo el dia y la hora. Si dice que no se ha podido, NO se la
   confirmes: pide disculpas y di que le llaman en seguida.
7. Pregunta si necesita algo mas. Si no, despidete y usa la herramienta de
   colgar.

Nunca confirmes una cita que la herramienta no haya confirmado. Es mejor un
"le llamamos ahora mismo" que una cita confirmada que no existe.

# DATOS DEL CENTRO

- Direccion: ${direccion}.
- Horario: ${horario.texto}.
- Cierra: ${horario.diaCierre}.

Si preguntan como llegar, da la direccion y ya. No improvises indicaciones.

# COMO EMPIEZA Y COMO ACABA

Al descolgar ya has dicho el saludo, no lo repitas.
Para colgar, usa la herramienta de colgar despues de despedirte. La despedida
es: "${FRASE_DE_DESPEDIDA}". No cuelgues antes de haber confirmado la cita o
de haber recogido el recado.`;
}

function buildToolsCitas(clinica: Clinica) {
  const trato = tratoAlCliente(clinica);
  const idsAgendables = clinica.tiposCita
    .filter((tipo) => !tipo.esUrgencia)
    .map((tipo) => tipo.id);

  const tipoCita = {
    type: "string" as const,
    description: "Identificador del tratamiento para el que se pide cita.",
    enum: idsAgendables,
  };

  return [
    {
      type: "function" as const,
      // Se habla mientras corre, para que no haya silencio en la linea.
      messages: [
        {
          type: "request-start" as const,
          content: "Un momento, que le miro la agenda.",
        },
      ],
      function: {
        name: TOOL_BUSCAR_HUECOS,
        description:
          "Mira que huecos libres hay en la agenda para un tratamiento y devuelve hasta tres, ya escritos para leerlos en voz alta. Es la UNICA forma de saber una hora: no se puede decir ninguna hora que no venga de aqui.",
        parameters: {
          type: "object" as const,
          properties: { tipo_cita: tipoCita },
          required: ["tipo_cita"],
        },
      },
    },

    // Colgar. Herramienta de Vapi, no nuestra: el objeto desnudo es todo lo
    // que admite, y cualquier campo de mas hace que rechace el asistente.
    { type: "endCall" as const },

    {
      type: "function" as const,
      messages: [
        {
          type: "request-start" as const,
          content: "Perfecto, se la reservo.",
        },
      ],
      function: {
        name: TOOL_RESERVAR_CITA,
        description:
          `Pone la cita en la agenda del centro. Se usa una sola vez, cuando ${trato.el} ya ha elegido hora y ha dado su nombre y su telefono. Solo se le confirma la cita si esta herramienta dice que esta puesta.`,
        parameters: {
          type: "object" as const,
          properties: {
            inicio: {
              type: "string" as const,
              description:
                "La hora exacta elegida, copiada tal cual de la lista que devolvio buscar_huecos (formato 2026-10-19T08:00:00.000Z).",
            },
            opcion: {
              type: "integer" as const,
              description:
                "Alternativa a inicio: el numero de la opcion elegida, 1, 2 o 3, tal como se las ofreciste. Usa inicio siempre que puedas.",
              minimum: 1,
            },
            tipo_cita: tipoCita,
            nombre: {
              type: "string" as const,
              description: `Nombre y apellido ${trato.del}.`,
            },
            telefono: {
              type: "string" as const,
              description: `Telefono de contacto ${trato.del}.`,
            },
            notas: {
              type: "string" as const,
              description:
                "Solo cosas practicas: si viene acompañado, si necesita entrar sin escaleras, si es la primera vez. NUNCA sintomas ni datos de salud.",
            },
          },
          required: ["nombre", "telefono"],
        },
      },
    },
  ];
}

/** El asistente completo, listo para devolverselo a Vapi. */
export function buildAssistantCitas(clinica: Clinica, businessId?: string) {
  const agente = nombreDelAgente(clinica);

  return {
    name: `${agente} - ${clinica.nombre}`,

    firstMessage: `${clinica.nombre}, buenas. Soy ${agente}, su asistente virtual. ¿En que le puedo ayudar?`,

    model: {
      provider: "openai" as const,
      model: "gpt-4o",
      temperature: 0.4,
      messages: [
        { role: "system" as const, content: buildSystemPromptCitas(clinica) },
      ],
      tools: buildToolsCitas(clinica),
    },

    transcriber: {
      provider: "deepgram" as const,
      model: "nova-3",
      language: "es",
    },

    voice: construirVoz({
      proveedor: config.vozProveedor,
      voiceId: config.vozId,
      modelo: config.vozModelo,
      velocidad: config.vozVelocidad,
    }),

    backgroundSound: fondoDeLlamada(config.sonidoFondo, config.publicServerUrl),

    stopSpeakingPlan: {
      numWords: config.interrupcionPalabras,
      voiceSeconds: config.interrupcionSegundos,
      backoffSeconds: 1,
    },
    startSpeakingPlan: {
      waitSeconds: 0.4,
      smartEndpointingPlan: { provider: "vapi" as const },
      transcriptionEndpointingPlan: {
        onPunctuationSeconds: 0.1,
        onNoPunctuationSeconds: 1.5,
        onNumberSeconds: 0.5,
      },
    },
    firstMessageInterruptionsEnabled: true,

    serverMessages: ["tool-calls", "status-update", "end-of-call-report"] as const,

    artifactPlan: { recordingEnabled: config.grabarLlamadas },

    // Nada de endCallPhrases: Vapi las compara como subcadena de lo que
    // transcribe y basta una coma para que no casen, o una frase corta para
    // que casen a mitad de conversacion. Cuelga la herramienta endCall.
    endCallMessage: FRASE_DE_DESPEDIDA,
    maxDurationSeconds: 600,

    ...(config.publicServerUrl
      ? {
          server: {
            url: urlDelWebhook(businessId),
            ...(config.vapiServerSecret ? { secret: config.vapiServerSecret } : {}),
          },
        }
      : {}),
  };
}
