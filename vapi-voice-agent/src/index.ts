import { createApp } from "./app";
import { config } from "./config";

const server = createApp().listen(config.port, () => {
  console.log(`Servidor escuchando en http://localhost:${config.port}`);
  console.log(`Webhook de Vapi: POST http://localhost:${config.port}/voice-webhook`);
  // Lo que se le dice a Vapi, para poder compararlo de un vistazo con lo que
  // hay puesto en su panel sin tener que abrir el .env.
  console.log(
    config.publicServerUrl
      ? `Direccion publica (la que debe estar en Vapi): ${config.publicServerUrl}/voice-webhook`
      : "PUBLIC_SERVER_URL vacio: Vapi no sabra donde mandar los tool-calls.",
  );
  console.log(
    `Voz: ${config.vozProveedor} / ${config.vozId}` +
      (config.vozProveedor === "11labs"
        ? ` (${config.vozModelo}, velocidad ${config.vozVelocidad})`
        : "") +
      `. Sonido de fondo: ${config.sonidoFondo}.`,
  );
  console.log(
    config.grabarLlamadas
      ? "Grabacion de llamadas: ACTIVADA. El agente avisa al descolgar."
      : "Grabacion de llamadas: desactivada.",
  );
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
