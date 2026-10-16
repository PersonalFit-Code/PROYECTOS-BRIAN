/**
 * Tipos compartidos del asistente de preguntas frecuentes (widget ⇄ API ⇄ motores de respuesta).
 *
 * Portado del camarero virtual de tixola y recortado a lo que necesita un salón:
 *  - Hacia la API de Anthropic se usa siempre `Anthropic.MessageParam` (ver `app/api/chat/route.ts`).
 *  - Entre el widget y `POST /api/chat` viaja un formato mínimo de solo texto (`ChatApiMessage`).
 *  - Los motores (`answerOffline`, sufijo de contexto) aceptan `AsistenteTurn`, un tipo estructural
 *    al que `Anthropic.MessageParam` es asignable sin conversión.
 *
 * Este fichero es PURO (sin React, sin Node, sin `server-only`): lo importan el widget, la ruta y las
 * pruebas por igual.
 */

/* ────────────────────────────────────────────────────────────
   Página desde la que se pregunta
   ──────────────────────────────────────────────────────────── */

/** Sección de la web en la que está la persona: contexto para el prompt y para las respuestas sin IA. */
export type AsistentePage = "home" | "servicios" | "equipo" | "galeria" | "resenas" | "bonos" | "contacto" | "legal" | "otra";

export const ASISTENTE_PAGES: readonly AsistentePage[] = ["home", "servicios", "equipo", "galeria", "resenas", "bonos", "contacto", "legal", "otra"];

export function isAsistentePage(value: unknown): value is AsistentePage {
  return typeof value === "string" && (ASISTENTE_PAGES as readonly string[]).includes(value);
}

/**
 * Página a partir de la ruta SIN idioma ("/servicios", "/legal/privacidad", "/"). Se calcula en el
 * cliente con `usePathname` en el momento de preguntar, y no se fija al montar el widget: el panel
 * vive en el layout y sobrevive a la navegación, así que la página cambia bajo él.
 */
export function pageFromPath(path: string): AsistentePage {
  const primero = path.split(/[?#]/)[0].split("/").filter(Boolean)[0] ?? "";
  if (!primero) return "home";
  return isAsistentePage(primero) && primero !== "home" && primero !== "otra" ? primero : "otra";
}

/* ────────────────────────────────────────────────────────────
   Mensajes
   ──────────────────────────────────────────────────────────── */

/** Roles del historial (el prompt del sistema no forma parte de él). */
export type ChatRole = "user" | "assistant";

/** Mensaje tal y como lo envía el widget a `POST /api/chat` (solo texto). */
export interface ChatApiMessage {
  role: ChatRole;
  content: string;
}

/** Cuerpo de `POST /api/chat`. `locale` y `page` llegan sin validar y se normalizan en el servidor. */
export interface ChatRequestBody {
  messages: ChatApiMessage[];
  locale?: string;
  page?: AsistentePage | string;
}

/**
 * Cómo se ha generado la respuesta (cabecera `x-asistente-mode`):
 *  - `claude`   → respuesta en streaming del modelo.
 *  - `offline`  → no hay `ANTHROPIC_API_KEY`: motor determinista con las preguntas frecuentes, los
 *                 servicios y el horario. Es el modo NORMAL mientras el salón no active la IA.
 *  - `fallback` → hay clave, pero el modelo ha fallado (límite de uso, red…) y responde el motor
 *                 determinista.
 */
export type AsistenteMode = "claude" | "offline" | "fallback";

export const ASISTENTE_MODE_HEADER = "x-asistente-mode";

export function isAsistenteMode(value: unknown): value is AsistenteMode {
  return value === "claude" || value === "offline" || value === "fallback";
}

/**
 * Turno mínimo que entienden los motores. `Anthropic.MessageParam` es asignable a este tipo:
 * el contenido es texto o una lista de bloques que se inspeccionan en tiempo de ejecución.
 */
export interface AsistenteTurn {
  /** `system` existe en `Anthropic.MessageParam` (mensajes de sistema a mitad de conversación); los motores lo ignoran */
  role: ChatRole | "system";
  content: string | ReadonlyArray<unknown>;
}

function isTextBlock(block: unknown): block is { type: "text"; text: string } {
  if (typeof block !== "object" || block === null) return false;
  const b = block as { type?: unknown; text?: unknown };
  return b.type === "text" && typeof b.text === "string";
}

/** Texto plano de un turno (concatena los bloques de texto; ignora imágenes u otros bloques). */
export function turnText(turn: AsistenteTurn): string {
  if (typeof turn.content === "string") return turn.content;
  return turn.content.filter(isTextBlock).map((block) => block.text).join("\n");
}

/** Estado de un mensaje en el widget. */
export type ChatMessageStatus = "done" | "streaming" | "error";

/** Mensaje del widget. Vive SOLO en memoria (ver `useChatSession`). */
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  status: ChatMessageStatus;
  createdAt: number;
}

/** Límites compartidos por el widget (textarea) y la API (validación y cuota por IP). */
export const CHAT_LIMITS = {
  /** nº máximo de mensajes de historial por petición */
  maxMessages: 20,
  /** caracteres por mensaje */
  maxChars: 1000,
  /** peticiones por IP y ventana */
  rateLimit: 30,
  /** ventana de la cuota en ms (10 min) */
  rateWindowMs: 10 * 60 * 1000,
} as const;

/* ────────────────────────────────────────────────────────────
   Servicios tal y como los conoce el asistente
   ──────────────────────────────────────────────────────────── */

/**
 * Un servicio del salón NORMALIZADO para el asistente, venga del fixture (antes de conectar la base
 * de datos) o de Supabase. La ruta lo construye en el servidor y se lo pasa a los dos motores.
 *
 * La regla que manda en todo el asistente: LO QUE NO SE SABE VA A `null`, NUNCA A UN NÚMERO
 * INVENTADO. Un precio o una duración que el asistente afirma es información que la clienta puede
 * dar por buena (art. 61.2 TRLGDCU), así que mejor un «pregúntanos» que una cifra que luego no cuadra.
 */
export interface ServicioAsistente {
  slug: string;
  nombre: string;
  descripcion: string | null;
  /** Nombre visible de la categoría ("Manos", "Pies", "Mirada"…), si la hay. */
  categoria: string | null;
  /** Precio en CÉNTIMOS; `null` = no publicado (depende del trabajo, se pregunta en el salón). */
  precioCents: number | null;
  /** `true` = el precio es «desde». */
  precioDesde: boolean;
  /** Duración aproximada en minutos; `null` = no la sabemos. */
  duracionMin: number | null;
  /** `false` = no entra en la reserva online: se pide en el salón. */
  reservableOnline: boolean;
  /** Dato sin confirmar con Andrea (el fixture lo es todo): hay que decirlo al darlo. */
  pendiente: boolean;
}
