import { Button, Section, Text } from "@react-email/components";
import { CorreoBase, estilos, type PieCorreo } from "./_layout";

export interface CitaCambiadaProps {
  nombre: string;
  fechaAnterior: string;
  horaAnterior: string;
  fecha: string;
  hora: string;
  servicios: string[];
  profesional: string;
  urlVer: string;
  pie: PieCorreo;
}

export default function CitaCambiada(p: CitaCambiadaProps) {
  return (
    <CorreoBase preview={`Nueva hora: ${p.fecha} a las ${p.hora}`} pie={p.pie}>
      <Text style={estilos.titulo}>Cita cambiada, {p.nombre}</Text>
      <Text style={estilos.texto}>
        Tu cita del {p.fechaAnterior} a las {p.horaAnterior} pasa a:
      </Text>
      <Section style={estilos.tarjeta}>
        <Text style={estilos.etiqueta}>Nueva cita</Text>
        <Text style={estilos.dato}>
          {p.fecha} · {p.hora}
        </Text>
        <Text style={estilos.etiqueta}>Qué</Text>
        <Text style={estilos.dato}>{p.servicios.join(" + ")}</Text>
        <Text style={estilos.etiqueta}>Con</Text>
        <Text style={{ ...estilos.dato, margin: 0 }}>{p.profesional}</Text>
      </Section>
      <Section style={{ margin: "0 0 18px" }}>
        <Button href={p.urlVer} style={estilos.botonPrimario}>
          Ver mi cita
        </Button>
      </Section>
      <Text style={estilos.suave}>Llevas adjunto el evento actualizado para tu calendario.</Text>
    </CorreoBase>
  );
}
