import { Button, Section, Text } from "@react-email/components";
import { CorreoBase, estilos, type PieCorreo } from "./_layout";

export interface CitaCanceladaProps {
  nombre: string;
  fecha: string;
  hora: string;
  /** true si la canceló el salón (el texto cambia) */
  porElSalon: boolean;
  urlReservar: string;
  pie: PieCorreo;
}

export default function CitaCancelada(p: CitaCanceladaProps) {
  return (
    <CorreoBase preview={`Cita cancelada: ${p.fecha} a las ${p.hora}`} pie={p.pie}>
      <Text style={estilos.titulo}>Cita cancelada</Text>
      <Text style={estilos.texto}>
        {p.porElSalon
          ? `Hola, ${p.nombre}. Hemos tenido que cancelar tu cita del ${p.fecha} a las ${p.hora}. Lo sentimos de verdad: si no te hemos llamado ya, lo haremos enseguida para buscar otro hueco.`
          : `Hola, ${p.nombre}. Tu cita del ${p.fecha} a las ${p.hora} queda cancelada. Gracias por avisar: esa hora ya está libre para otra clienta.`}
      </Text>
      <Section style={{ margin: "8px 0 18px" }}>
        <Button href={p.urlReservar} style={estilos.botonPrimario}>
          Reservar otra cita
        </Button>
      </Section>
    </CorreoBase>
  );
}
