/**
 * Fichero .ics para "añadir al calendario". Se genera a mano: son diez líneas y así no hay
 * dependencia. Las horas van en UTC (sufijo Z), que es lo que entienden todos los calendarios.
 */
export interface EventoIcs {
  uid: string;
  inicio: Date;
  fin: Date;
  titulo: string;
  descripcion?: string;
  lugar?: string;
  url?: string;
}

function utc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

/** Escapa lo que el formato exige: barras, comas, puntos y coma y saltos de línea. */
function escapa(texto: string): string {
  return texto.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Las líneas de un .ics no pasan de 75 octetos; las largas se continúan con un espacio. */
function plegar(linea: string): string {
  const partes: string[] = [];
  let resto = linea;
  while (resto.length > 73) {
    partes.push(resto.slice(0, 73));
    resto = " " + resto.slice(73);
  }
  partes.push(resto);
  return partes.join("\r\n");
}

export function generarIcs(evento: EventoIcs): string {
  const lineas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Andrea Salon//Citas//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${evento.uid}`,
    `DTSTAMP:${utc(new Date())}`,
    `DTSTART:${utc(evento.inicio)}`,
    `DTEND:${utc(evento.fin)}`,
    `SUMMARY:${escapa(evento.titulo)}`,
    ...(evento.descripcion ? [`DESCRIPTION:${escapa(evento.descripcion)}`] : []),
    ...(evento.lugar ? [`LOCATION:${escapa(evento.lugar)}`] : []),
    ...(evento.url ? [`URL:${evento.url}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lineas.map(plegar).join("\r\n") + "\r\n";
}
