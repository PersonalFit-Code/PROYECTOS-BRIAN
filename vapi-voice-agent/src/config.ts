import "dotenv/config";

function readPort(raw: string | undefined): number {
  if (!raw) return 3000;
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT no es un puerto valido: "${raw}"`);
  }
  return port;
}

export const config = {
  port: readPort(process.env.PORT),
  /** Si esta vacio, el servidor no comprueba la cabecera x-vapi-secret. */
  vapiServerSecret: process.env.VAPI_SERVER_SECRET ?? "",
  nodeEnv: process.env.NODE_ENV ?? "development",
} as const;
