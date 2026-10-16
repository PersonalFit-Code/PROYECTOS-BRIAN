import "server-only";

import QRCode from "qrcode";

/**
 * QR del bono en PNG. Margen generoso y corrección media: se escanea desde una pantalla con brillo
 * bajo o desde un papel arrugado en el mostrador. Carmín sobre blanco tiene contraste de sobra
 * para cualquier lector.
 */
export async function qrPng(texto: string, ancho = 512): Promise<Buffer> {
  return QRCode.toBuffer(texto, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 2,
    width: ancho,
    color: { dark: "#2E2127", light: "#FFFFFF" },
  });
}
