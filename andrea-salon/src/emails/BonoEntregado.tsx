import { Button, Img, Section, Text } from "@react-email/components";
import { CorreoBase, estilos, type PieCorreo } from "./_layout";

export interface BonoEntregadoProps {
  /** a quién va el correo (quien compró) */
  nombre: string;
  bono: string;            // "Bono 5 manicuras"
  codigo: string;          // "AS-7K3M-Q9ZD"
  queIncluye: string;      // "5 sesiones" | "Tarjeta regalo de 50 €"
  caducidad: string;       // "No caduca" | "Válido hasta el 16 de octubre de 2027"
  paraQuien: string | null;
  mensaje: string | null;
  urlBono: string;
  /** `cid:` del QR adjunto (se ve dentro del correo) */
  qrCid: string;
  pie: PieCorreo;
}

export default function BonoEntregado(p: BonoEntregadoProps) {
  return (
    <CorreoBase preview={`Tu ${p.bono}: código ${p.codigo}`} pie={p.pie}>
      <Text style={estilos.titulo}>¡Aquí tienes tu bono, {p.nombre}!</Text>
      <Text style={estilos.texto}>
        {p.paraQuien
          ? `Es para ${p.paraQuien}. Puedes reenviarle este correo o imprimirlo: el código es lo que vale.`
          : "Enséñalo en el salón (en el móvil vale) y te lo descontamos en cada visita."}
      </Text>
      {p.mensaje && <Text style={{ ...estilos.texto, fontStyle: "italic" }}>«{p.mensaje}»</Text>}

      <Section style={{ ...estilos.tarjeta, textAlign: "center" }}>
        <Text style={estilos.etiqueta}>{p.bono}</Text>
        <Img src={p.qrCid} width="200" height="200" alt={`Código QR del bono ${p.codigo}`} style={{ margin: "8px auto" }} />
        <Text style={{ ...estilos.dato, fontSize: "22px", letterSpacing: "2px" }}>{p.codigo}</Text>
        <Text style={estilos.suave}>{p.queIncluye}</Text>
        <Text style={{ ...estilos.suave, margin: 0 }}>{p.caducidad}</Text>
      </Section>

      <Section style={{ margin: "0 0 18px" }}>
        <Button href={p.urlBono} style={estilos.botonPrimario}>
          Ver el bono y lo que queda
        </Button>
      </Section>
      <Text style={estilos.suave}>
        Para reservar con el bono, reserva tu cita como siempre y dinos el código al llegar.
      </Text>
    </CorreoBase>
  );
}
