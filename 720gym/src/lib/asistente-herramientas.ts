import type Anthropic from "@anthropic-ai/sdk";
import { dias } from "@/data/horario";
import { capacidad } from "@/data/plazas";
import { planesPago } from "@/data/pagos";

/**
 * Herramientas del asistente (tool use). Todas son «del cliente»: Claude decide llamarlas y quien
 * las ejecuta es el navegador (reserva, alta, ficha…), porque en la demo los datos viven allí; en
 * producción las ejecuta el servidor contra la base de datos. `strict: true` garantiza que los
 * argumentos cumplen el esquema (salida estructurada).
 */
export const clasesReservables = Object.keys(capacidad);
export const idsPlanes = planesPago.map((p) => p.id);

const obj = (properties: Record<string, unknown>, required: string[]) => ({
  type: "object" as const,
  properties,
  required,
  additionalProperties: false,
});
const texto = (description: string) => ({ type: "string", description });

export const herramientas: Anthropic.Beta.BetaTool[] = [
  {
    name: "ver_plazas",
    description:
      "Lista las próximas sesiones de clases dirigidas de 720 (día, hora, clase) con las plazas libres en este momento. Úsala antes de proponer o reservar una clase.",
    strict: true,
    input_schema: obj(
      {
        dia: { type: "string", enum: ["cualquiera", ...dias], description: "Día de la semana, o «cualquiera»." },
        clase: { type: "string", enum: ["cualquiera", ...clasesReservables], description: "Clase, o «cualquiera»." },
      },
      ["dia", "clase"],
    ),
  },
  {
    name: "reservar_clase",
    description: "Reserva una plaza en una sesión concreta. Pide antes nombre y teléfono. Solo si ver_plazas indica plazas libres.",
    strict: true,
    input_schema: obj(
      {
        dia: { type: "string", enum: [...dias] },
        hora: texto("Hora de inicio en formato HH:MM, como aparece en ver_plazas."),
        clase: { type: "string", enum: clasesReservables },
        nombre: texto("Nombre del cliente."),
        telefono: texto("Teléfono del cliente (9 cifras)."),
      },
      ["dia", "hora", "clase", "nombre", "telefono"],
    ),
  },
  {
    name: "crear_alta",
    description:
      "Da de alta al cliente en un plan de pago y devuelve el enlace a la pasarela segura (tarjeta, Apple Pay, Google Pay). Pide antes nombre y teléfono.",
    strict: true,
    input_schema: obj(
      {
        plan_id: { type: "string", enum: idsPlanes, description: "Plan elegido del catálogo de 720." },
        nombre: texto("Nombre del cliente."),
        telefono: texto("Teléfono del cliente (9 cifras)."),
        email: texto("Email del cliente, o cadena vacía si no lo ha dado."),
      },
      ["plan_id", "nombre", "telefono", "email"],
    ),
  },
  {
    name: "guardar_ficha_cliente",
    description:
      "Guarda o actualiza en el CRM la ficha del cliente con lo que se sabe de él en esta conversación. Llámala en silencio en cuanto sepas su objetivo, y otra vez cuando sepas algo nuevo.",
    strict: true,
    input_schema: obj(
      {
        nombre: texto("Nombre, o cadena vacía si no se sabe."),
        telefono: texto("Teléfono, o cadena vacía si no se sabe."),
        objetivo: texto("Qué quiere conseguir, en pocas palabras (p. ej. «perder peso y ganar fuerza»)."),
        disponibilidad: texto("Días u horas en que puede entrenar, o cadena vacía."),
        plan_recomendado: texto("Plan o clase de 720 que le encaja, o cadena vacía."),
        temperatura: { type: "string", enum: ["frio", "templado", "caliente"], description: "Probabilidad de alta: caliente = quiere apuntarse ya." },
        siguiente_paso: texto("Qué debería hacer la gerencia (p. ej. «llamar hoy para cerrar el bono»)."),
        idioma: texto("Idioma de la conversación."),
        resumen: texto("Resumen de la conversación en una frase."),
      },
      ["nombre", "telefono", "objetivo", "disponibilidad", "plan_recomendado", "temperatura", "siguiente_paso", "idioma", "resumen"],
    ),
  },
  {
    name: "avisar_gerente",
    description:
      "Avisa al WhatsApp de la gerencia con un resumen: quejas, dudas que no puedes resolver con los datos, salud o lesiones, o ventas grandes (bonos de 10+, parejas, grupos, alquiler de salas).",
    strict: true,
    input_schema: obj(
      {
        motivo: { type: "string", enum: ["venta_grande", "queja", "duda_compleja", "lesion_o_salud", "otro"] },
        urgencia: { type: "string", enum: ["normal", "alta"] },
        resumen: texto("Resumen para la gerencia en 2 o 3 frases: qué quiere y qué hay que hacer."),
        nombre: texto("Nombre, o cadena vacía."),
        telefono: texto("Teléfono, o cadena vacía."),
      },
      ["motivo", "urgencia", "resumen", "nombre", "telefono"],
    ),
  },
  {
    name: "crear_plan_4_semanas",
    description:
      "Crea un plan de entrenamiento de 4 semanas personalizado que el cliente descarga en PDF. Solo con nombre y teléfono. Ejercicios generales y seguros; sin dietas ni consejo médico.",
    strict: true,
    input_schema: obj(
      {
        nombre: texto("Nombre del cliente."),
        telefono: texto("Teléfono del cliente."),
        objetivo: texto("Objetivo del plan."),
        nivel: { type: "string", enum: ["principiante", "intermedio", "avanzado"] },
        dias_por_semana: { type: "integer", enum: [2, 3, 4, 5] },
        semanas: {
          type: "array",
          description: "Exactamente 4 semanas.",
          items: obj(
            {
              semana: { type: "integer", enum: [1, 2, 3, 4] },
              enfoque: texto("Enfoque de la semana en pocas palabras."),
              sesiones: {
                type: "array",
                items: obj(
                  {
                    dia: texto("Día (p. ej. «Lunes»)."),
                    titulo: texto("Título de la sesión."),
                    ejercicios: { type: "array", items: texto("Ejercicio con series y repeticiones, p. ej. «Sentadilla goblet 3×10»."), description: "4 a 6 ejercicios." },
                  },
                  ["dia", "titulo", "ejercicios"],
                ),
              },
            },
            ["semana", "enfoque", "sesiones"],
          ),
        },
        consejos: { type: "array", items: texto("Consejo breve."), description: "3 consejos generales." },
      },
      ["nombre", "telefono", "objetivo", "nivel", "dias_por_semana", "semanas", "consejos"],
    ),
  },
];
