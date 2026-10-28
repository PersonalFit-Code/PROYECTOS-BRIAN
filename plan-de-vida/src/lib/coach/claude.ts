import "server-only";

import Anthropic from "@anthropic-ai/sdk";

let cliente: Anthropic | null = null;

/** Cliente de Claude, o null si no hay clave (la app funciona igual, con respuestas por reglas). */
export function getClaude(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!cliente) cliente = new Anthropic({ timeout: 60_000, maxRetries: 1 });
  return cliente;
}

export function textoDe(msg: Anthropic.Message): string {
  return msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

export function logErrorClaude(donde: string, err: unknown): void {
  if (err instanceof Anthropic.AuthenticationError) console.error(`[${donde}] ANTHROPIC_API_KEY no válida (401).`);
  else if (err instanceof Anthropic.APIError) console.error(`[${donde}] error de la API de Anthropic (${err.status ?? "?"}): ${err.message}`);
  else console.error(`[${donde}] error inesperado:`, err);
}
