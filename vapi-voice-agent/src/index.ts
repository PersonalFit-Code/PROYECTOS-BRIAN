import { createApp } from "./app";
import { config } from "./config";

const server = createApp().listen(config.port, () => {
  console.log(`Servidor escuchando en http://localhost:${config.port}`);
  console.log(`Webhook de Vapi: POST http://localhost:${config.port}/voice-webhook`);
  if (!config.vapiServerSecret) {
    console.warn(
      "VAPI_SERVER_SECRET no esta definido: el webhook acepta cualquier peticion.",
    );
  }
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    console.log(`\n${signal} recibido, cerrando servidor.`);
    server.close(() => process.exit(0));
  });
}
