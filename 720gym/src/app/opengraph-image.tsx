import { ImageResponse } from "next/og";

/** Vista previa al compartir el enlace por WhatsApp o redes. */
export const alt = "720 GYM CLUB · Entrena. Cuídate. Crece.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Imagen() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0E0E0F", padding: 72, color: "#fff" }}>
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, color: "rgba(255,255,255,0.6)" }}>CENTRO PRIVADO DE ENTRENAMIENTO · OURENSE</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 260,
              fontWeight: 900,
              lineHeight: 0.85,
              letterSpacing: -8,
              backgroundImage: "linear-gradient(100deg, #2f6fd6, #f7941d 50%, #3fbf6b)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            720 GYM
          </div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 800, marginTop: 24 }}>Entrena. Cuídate. Crece.</div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "rgba(255,255,255,0.75)" }}>365 días · Aforo limitado · Pilates Reformer · 5,0 en Google (64 reseñas)</div>
      </div>
    ),
    size,
  );
}
