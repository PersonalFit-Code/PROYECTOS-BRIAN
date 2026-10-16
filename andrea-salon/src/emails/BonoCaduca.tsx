import { Button, Section, Text } from "@react-email/components";
import { CorreoBase, estilos, type PieCorreo } from "./_layout";

export interface BonoCaducaProps {
  nombre: string;
  bono: string;
  codigo: string;
  queda: string;      // "Te quedan 2 sesiones" | "Te quedan 18 € de saldo"
  fecha: string;      // "16 de noviembre de 2026"
  urlReservar: string;
  urlBono: string;
  pie: PieCorreo;
}

/** Aviso único, N días antes de que caduque un bono con algo pendiente (ajuste del panel). */
export default function BonoCaduca(p: BonoCaducaProps) {
  return (
    <CorreoBase preview={`Tu bono caduca el ${p.fecha}`} pie={p.pie}>
      <Text style={estilos.titulo}>Que no se te pase, {p.nombre}</Text>
      <Text style={estilos.texto}>
        Tu {p.bono} ({p.codigo}) caduca el <strong>{p.fecha}</strong>. {p.queda}: reserva tu cita antes y lo aprovechas entero.
      </Text>
      <Section style={{ margin: "8px 0 12px" }}>
        <Button href={p.urlReservar} style={estilos.botonPrimario}>
          Reservar cita
        </Button>
      </Section>
      <Section style={{ margin: "0 0 18px" }}>
        <Button href={p.urlBono} style={estilos.botonSecundario}>
          Ver mi bono
        </Button>
      </Section>
    </CorreoBase>
  );
}
