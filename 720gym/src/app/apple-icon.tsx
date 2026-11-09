import { ImageResponse } from "next/og";

/** Icono para iPhone (pantalla de inicio). */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function Icono() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0e0e0f", color: "#fff" }}>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 900, letterSpacing: -4, lineHeight: 1 }}>720</div>
        <div style={{ display: "flex", fontSize: 26, fontWeight: 800, letterSpacing: 6, marginTop: 6 }}>GYM</div>
      </div>
    ),
    size,
  );
}
