import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { CSSProperties, ReactNode } from "react";

/**
 * Esqueleto común de los correos: cabecera carmín con el nombre del salón, cuerpo en crema y
 * pie con dirección y teléfono. Todo con estilos en línea, que es lo único que los clientes de
 * correo respetan de verdad. Las plantillas solo ponen el contenido.
 */
export const COLORES = {
  carmin: "#2B2A2D",
  carminSuave: "#7D5F52",
  rosa: "#F3E1DA",
  rosaNiebla: "#FAF5F2",
  crema: "#FFFFFF",
  tinta: "#2B2A2D",
  gris: "#5C5A5F",
  blanco: "#FFFFFF",
} as const;

export const FUENTE = "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif";

export const estilos = {
  texto: { fontFamily: FUENTE, fontSize: "15px", lineHeight: "1.55", color: COLORES.tinta, margin: "0 0 12px" } as CSSProperties,
  suave: { fontFamily: FUENTE, fontSize: "13px", lineHeight: "1.5", color: COLORES.gris, margin: "0 0 8px" } as CSSProperties,
  titulo: { fontFamily: "Didot, 'Bodoni 72', 'Bodoni MT', Georgia, serif", fontSize: "24px", lineHeight: "1.2", color: COLORES.tinta, margin: "0 0 16px", fontWeight: 700 } as CSSProperties,
  botonPrimario: {
    fontFamily: FUENTE, fontSize: "15px", fontWeight: 600, color: COLORES.blanco, backgroundColor: COLORES.carmin,
    borderRadius: "999px", padding: "12px 22px", textDecoration: "none", display: "inline-block",
  } as CSSProperties,
  botonSecundario: {
    fontFamily: FUENTE, fontSize: "14px", fontWeight: 600, color: COLORES.carmin, backgroundColor: COLORES.rosaNiebla,
    border: `1px solid ${COLORES.rosa}`, borderRadius: "999px", padding: "10px 18px", textDecoration: "none", display: "inline-block",
  } as CSSProperties,
  tarjeta: { backgroundColor: COLORES.blanco, border: `1px solid ${COLORES.rosa}`, borderRadius: "14px", padding: "18px 20px", margin: "0 0 20px" } as CSSProperties,
  etiqueta: { fontFamily: FUENTE, fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: COLORES.carminSuave, margin: "0 0 4px", fontWeight: 600 } as CSSProperties,
  dato: { fontFamily: FUENTE, fontSize: "16px", color: COLORES.tinta, margin: "0 0 12px", fontWeight: 600 } as CSSProperties,
};

export interface PieCorreo {
  nombre: string;
  direccion: string;
  telefono: string;
  web: string;
}

export function CorreoBase({ preview, pie, children }: { preview: string; pie: PieCorreo; children: ReactNode }) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, backgroundColor: COLORES.crema, fontFamily: FUENTE }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "24px 16px" }}>
          <Section style={{ backgroundColor: COLORES.carmin, borderRadius: "16px 16px 0 0", padding: "22px 24px" }}>
            <Heading as="h1" style={{ fontFamily: "Didot, 'Bodoni 72', 'Bodoni MT', Georgia, serif", fontSize: "20px", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 400, color: COLORES.blanco, margin: 0 }}>
              {pie.nombre}
            </Heading>
            <Text style={{ fontFamily: FUENTE, fontSize: "12px", color: COLORES.rosa, margin: "4px 0 0", letterSpacing: "1px" }}>
              UÑAS Y BELLEZA · OURENSE
            </Text>
          </Section>
          <Section style={{ backgroundColor: COLORES.rosaNiebla, borderRadius: "0 0 16px 16px", padding: "26px 24px 10px" }}>
            {children}
            <Hr style={{ borderColor: COLORES.rosa, margin: "20px 0 14px" }} />
            <Text style={estilos.suave}>
              {pie.nombre} · {pie.direccion}
              <br />
              Teléfono <Link href={`tel:${pie.telefono.replace(/\s+/g, "")}`} style={{ color: COLORES.carmin }}>{pie.telefono}</Link>
              {" · "}
              <Link href={pie.web} style={{ color: COLORES.carmin }}>{pie.web.replace(/^https?:\/\//, "")}</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
