import { ImageResponse } from "next/og";

/* Imagen para compartir (Open Graph / Twitter), 1200×630, generada al compilar. */
export const alt = "BH Tacos · Los auténticos French Tacos de Lyon en Ourense";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0F0F0F", color: "#F5F5F5", padding: 72, position: "relative", fontFamily: "sans-serif" }}>
        <div style={{ position: "absolute", right: -120, top: -120, width: 520, height: 520, borderRadius: 520, background: "#E63946", opacity: 0.35, display: "flex" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "62%" }}>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 800, letterSpacing: 2 }}>
            BH <span style={{ color: "#FF7D85", marginLeft: 14 }}>TACOS</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1, textTransform: "uppercase" }}>Los auténticos French Tacos</div>
            <div style={{ fontSize: 44, marginTop: 20, color: "#FFD166", fontWeight: 700 }}>de Lyon, en Ourense</div>
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#C9C3BC" }}>Rúa Pena Trevinca, 12 · Ourense</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "38%" }}>
          <div style={{ display: "flex", flexDirection: "column", width: 340, borderRadius: 60, overflow: "hidden", transform: "rotate(-8deg)" }}>
            <div style={{ height: 70, background: "#F2B572", display: "flex" }} />
            <div style={{ height: 30, background: "#FFC94A", display: "flex" }} />
            <div style={{ height: 50, background: "#7A3E2A", display: "flex" }} />
            <div style={{ height: 50, background: "#FFD166", display: "flex" }} />
            <div style={{ height: 70, background: "#E19A52", display: "flex" }} />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
