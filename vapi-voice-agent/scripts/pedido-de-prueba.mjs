/**
 * Manda un pedido de prueba al servidor local, como lo haria el agente de voz.
 *
 * Existe para no tener que pegar a mano un curl larguisimo cada vez: al
 * pegarlo en la terminal se cuelan caracteres y el JSON se rompe. Con esto
 * basta `npm run prueba:pedido`.
 *
 * Lee el puerto y el secreto del .env, asi que no hay que pasarle nada.
 */

import "dotenv/config";

const puerto = process.env.PORT ?? "3000";
const secreto = process.env.VAPI_SERVER_SECRET ?? "";
const negocio = process.argv[2] ?? process.env.DEFAULT_BUSINESS_ID ?? "";

const url =
  `http://localhost:${puerto}/voice-webhook` +
  (negocio ? `?business=${encodeURIComponent(negocio)}` : "");

const cuerpo = {
  message: {
    type: "tool-calls",
    call: { id: `PRUEBA-${Date.now()}` },
    toolCallList: [
      {
        id: "t1",
        name: "registrar_pedido",
        parameters: {
          articulos: [{ plato: "margarita", cantidad: 2 }],
          entrega: "reparto",
          direccion: "Rua do Paseo 5, 2 A",
          telefono: "600123456",
          notas: "pedido de prueba",
        },
      },
    ],
  },
};

console.log(`Enviando pedido de prueba a ${url}`);

try {
  const respuesta = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(secreto ? { "x-vapi-secret": secreto } : {}),
    },
    body: JSON.stringify(cuerpo),
  });

  const datos = await respuesta.json();
  console.log(`HTTP ${respuesta.status}`);
  console.log(datos?.results?.[0]?.result ?? JSON.stringify(datos, null, 2));
} catch (error) {
  console.error(
    "No se ha podido contactar con el servidor. ¿Esta arrancado con npm run dev?",
  );
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
