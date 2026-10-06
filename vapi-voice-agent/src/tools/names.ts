/**
 * Nombres de las herramientas del agente.
 *
 * El nombre viaja por dos sitios que tienen que coincidir exactamente: la
 * declaracion que se le manda a Vapi (src/assistant.ts) y el despacho de los
 * tool-calls que llegan de vuelta (src/routes/voiceWebhook.ts). Teniendolo
 * aqui, cambiar un nombre es un solo sitio y el compilador avisa si algo queda
 * descolgado.
 *
 * Este modulo crecera con registrar_pedido.
 */

export const TOOL_CALCULAR_TOTAL = "calcular_total";
