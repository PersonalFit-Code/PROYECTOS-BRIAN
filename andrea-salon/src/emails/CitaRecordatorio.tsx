import { Button, Section, Text } from "@react-email/components";
import { CorreoBase, estilos, type PieCorreo } from "./_layout";

export interface CitaRecordatorioProps {
  nombre: string;
  fecha: string;
  hora: string;
  servicios: string[];
  profesional: string;
  urlSiVoy: string;
  urlNoPuedo: string;
  urlCambiar: string;
  pie: PieCorreo;
}

export default function CitaRecordatorio(p: CitaRecordatorioProps) {
  return (
    <CorreoBase preview={`Mañana a las ${p.hora}: ${p.servicios.join(" + ")}`} pie={p.pie}>
      <Text style={estilos.titulo}>Te esperamos mañana, {p.nombre}</Text>
      <Text style={estilos.texto}>
        {p.fecha} a las <strong>{p.hora}</strong> · {p.servicios.join(" + ")} con {p.profesional}.
      </Text>
      <Text style={estilos.texto}>¿Nos confirmas que vienes? Es un toque y nos ayuda a organizar el día.</Text>

      <Section style={{ margin: "0 0 12px" }}>
        <Button href={p.urlSiVoy} style={estilos.botonPrimario}>
          Sí, voy
        </Button>
      </Section>
      <Section style={{ margin: "0 0 18px" }}>
        <Button href={p.urlNoPuedo} style={{ ...estilos.botonSecundario, marginRight: "8px" }}>
          No puedo ir
        </Button>
        <Button href={p.urlCambiar} style={estilos.botonSecundario}>
          Cambiar la hora
        </Button>
      </Section>

      <Text style={estilos.suave}>
        Si no puedes venir, avísanos: esa hora se la puede quedar otra clienta.
      </Text>
    </CorreoBase>
  );
}
