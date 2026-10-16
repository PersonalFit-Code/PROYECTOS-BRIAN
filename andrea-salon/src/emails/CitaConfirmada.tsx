import { Button, Section, Text } from "@react-email/components";
import { CorreoBase, estilos, type PieCorreo } from "./_layout";

export interface CitaConfirmadaProps {
  nombre: string;
  fecha: string;       // "jueves, 16 de octubre"
  hora: string;        // "11:15"
  servicios: string[];
  profesional: string;
  total: string;       // "25 €"
  urlVer: string;
  urlCambiar: string;
  urlCancelar: string;
  horasCancelacion: number;
  pie: PieCorreo;
}

export default function CitaConfirmada(p: CitaConfirmadaProps) {
  return (
    <CorreoBase preview={`Tu cita: ${p.fecha} a las ${p.hora}`} pie={p.pie}>
      <Text style={estilos.titulo}>¡Cita confirmada, {p.nombre}!</Text>
      <Text style={estilos.texto}>Te esperamos en el salón. Aquí tienes todo lo que necesitas.</Text>

      <Section style={estilos.tarjeta}>
        <Text style={estilos.etiqueta}>Cuándo</Text>
        <Text style={estilos.dato}>
          {p.fecha} · {p.hora}
        </Text>
        <Text style={estilos.etiqueta}>Qué</Text>
        <Text style={estilos.dato}>{p.servicios.join(" + ")}</Text>
        <Text style={estilos.etiqueta}>Con</Text>
        <Text style={estilos.dato}>{p.profesional}</Text>
        <Text style={estilos.etiqueta}>Precio</Text>
        <Text style={{ ...estilos.dato, margin: 0 }}>{p.total}</Text>
      </Section>

      <Section style={{ margin: "0 0 18px" }}>
        <Button href={p.urlVer} style={estilos.botonPrimario}>
          Ver mi cita
        </Button>
      </Section>
      <Section style={{ margin: "0 0 18px" }}>
        <Button href={p.urlCambiar} style={{ ...estilos.botonSecundario, marginRight: "8px" }}>
          Cambiar la hora
        </Button>
        <Button href={p.urlCancelar} style={estilos.botonSecundario}>
          Cancelar
        </Button>
      </Section>

      <Text style={estilos.suave}>
        Puedes cambiar o cancelar tú misma hasta {p.horasCancelacion} horas antes. Después, llámanos y lo vemos.
        Llevas adjunto el evento para tu calendario.
      </Text>
    </CorreoBase>
  );
}
