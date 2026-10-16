/**
 * Las cifras de «Analítica»: que lo que ve Andrea cuadre con lo que se cobró y con la agenda.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  capacidadMinutos,
  escalon,
  kpis,
  limites,
  mapaCalor,
  periodoAnterior,
  porMetodo,
  porProfesional,
  serieFacturado,
  topServicios,
  variacion,
  type CitaAnalitica,
  type Entrada,
  type PagoAnalitica,
} from "../calcular";

const ZONA = "Europe/Madrid";

/** Semana del lunes 19 al domingo 25 de octubre de 2026 (el 25 cambia la hora). */
function base(extra: Partial<Entrada> = {}): Entrada {
  return {
    periodo: { desde: "2026-10-19", dias: 7 },
    zona: ZONA,
    citas: [],
    pagos: [],
    // Andrea: lunes a viernes de 9:30 a 13:30 (4 h).
    franjas: [1, 2, 3, 4, 5].map((dia) => ({ staffId: "andrea", dia, desde: "09:30", hasta: "13:30" })),
    ausencias: [],
    staff: [{ id: "andrea", nombre: "Andrea" }],
    ...extra,
  };
}

function cita(inicio: string, fin: string, estado: CitaAnalitica["estado"] = "done", extra: Partial<CitaAnalitica> = {}): CitaAnalitica {
  return { inicio, fin, estado, staffId: "andrea", clientaId: "c1", servicios: [{ nombre: "Manicura", precioCents: 2500 }], ...extra };
}

function pago(fecha: string, importeCents: number, extra: Partial<PagoAnalitica> = {}): PagoAnalitica {
  return { fecha, tipo: "booking", metodo: "card", importeCents, propinaCents: 0, staffId: "andrea", ...extra };
}

describe("periodos", () => {
  it("el periodo anterior tiene la misma longitud y acaba donde empieza el actual", () => {
    assert.deepEqual(periodoAnterior({ desde: "2026-10-19", dias: 7 }), { desde: "2026-10-12", dias: 7 });
  });

  it("los límites van de medianoche a medianoche en hora del salón", () => {
    const { desde, hasta } = limites({ desde: "2026-10-19", dias: 7 }, ZONA);
    assert.equal(desde.toISOString(), "2026-10-18T22:00:00.000Z"); // verano, +2
    assert.equal(hasta.toISOString(), "2026-10-25T23:00:00.000Z"); // ya en invierno, +1
  });
});

describe("capacidad", () => {
  it("cinco mañanas de cuatro horas son 1200 minutos", () => {
    assert.equal(capacidadMinutos(base(), "andrea"), 1200);
  });

  it("un festivo del salón y unas vacaciones suyas que se solapan no restan dos veces", () => {
    const e = base({
      ausencias: [
        { staffId: null, inicio: "2026-10-20T07:30:00Z", fin: "2026-10-20T11:30:00Z" }, // martes entero
        { staffId: "andrea", inicio: "2026-10-20T09:00:00Z", fin: "2026-10-21T22:00:00Z" }, // martes y miércoles
      ],
    });
    assert.equal(capacidadMinutos(e, "andrea"), 1200 - 240 - 240);
  });

  it("una ausencia de otra profesional no le quita horas", () => {
    const e = base({ ausencias: [{ staffId: "carolina", inicio: "2026-10-19T00:00:00Z", fin: "2026-10-26T00:00:00Z" }] });
    assert.equal(capacidadMinutos(e, "andrea"), 1200);
  });
});

describe("kpis", () => {
  it("facturado = citas + bonos vendidos − devoluciones, sin propinas ni lo pagado con bono", () => {
    const e = base({
      citas: [cita("2026-10-19T08:00:00Z", "2026-10-19T09:00:00Z"), cita("2026-10-20T08:00:00Z", "2026-10-20T09:00:00Z")],
      pagos: [
        pago("2026-10-19T09:00:00Z", 2500, { propinaCents: 300 }),
        pago("2026-10-20T09:00:00Z", 2500, { metodo: "voucher" }),
        pago("2026-10-21T10:00:00Z", 10000, { tipo: "voucher_sale", metodo: "stripe", staffId: null }),
        pago("2026-10-22T10:00:00Z", 10000, { tipo: "refund", metodo: "stripe", staffId: null }),
      ],
    });
    const k = kpis(e);
    assert.equal(k.facturadoCents, 2500 + 10000 - 10000);
    assert.equal(k.cobradoConBonoCents, 2500);
    assert.equal(k.propinasCents, 300);
    assert.equal(k.ticketMedioCents, 2500); // (2500 + 2500 con bono) / 2 citas
    assert.equal(k.citasHechas, 2);
  });

  it("la ocupación cuenta faltas (la hora estaba cogida) y no canceladas", () => {
    const e = base({
      citas: [
        cita("2026-10-19T08:00:00Z", "2026-10-19T10:00:00Z", "done"), // 120
        cita("2026-10-20T08:00:00Z", "2026-10-20T09:00:00Z", "no_show"), // 60
        cita("2026-10-21T08:00:00Z", "2026-10-21T09:00:00Z", "cancelled"),
      ],
    });
    const k = kpis(e);
    assert.equal(k.ocupacion, 180 / 1200);
    assert.equal(k.tasaFaltas, 1 / 2);
    assert.equal(k.canceladas, 1);
  });

  it("sin horario no hay ocupación (null, no un 0 % que engaña)", () => {
    assert.equal(kpis(base({ franjas: [] })).ocupacion, null);
  });
});

describe("variación", () => {
  it("relativa, y null cuando no hay base", () => {
    assert.equal(variacion(120, 100), 0.2);
    assert.equal(variacion(50, 100), -0.5);
    assert.equal(variacion(10, 0), null);
    assert.equal(variacion(0, 0), 0);
  });
});

describe("serie de facturado", () => {
  it("un punto por día, también los días sin cobros, con las devoluciones restando", () => {
    const e = base({
      pagos: [pago("2026-10-19T22:30:00Z", 1000), pago("2026-10-21T10:00:00Z", 500, { tipo: "refund" })],
    });
    const s = serieFacturado(e);
    assert.equal(s.agrupado, "dia");
    assert.equal(s.puntos.length, 7);
    // 22:30Z del 19 = 00:30 del 20 en Madrid: cuenta para el martes.
    assert.deepEqual(s.puntos[1], { fecha: "2026-10-20", cents: 1000 });
    assert.deepEqual(s.puntos[2], { fecha: "2026-10-21", cents: -500 });
  });

  it("más de 45 días se agrupa por semanas que empiezan en lunes", () => {
    const s = serieFacturado(base({ periodo: { desde: "2026-09-02", dias: 60 } }));
    assert.equal(s.agrupado, "semana");
    assert.equal(s.puntos[0]?.fecha, "2026-08-31");
  });
});

describe("por profesional", () => {
  it("ordena por facturado y separa propinas", () => {
    const e = base({
      staff: [
        { id: "andrea", nombre: "Andrea" },
        { id: "carolina", nombre: "Carolina" },
      ],
      citas: [cita("2026-10-19T08:00:00Z", "2026-10-19T09:00:00Z", "done", { staffId: "carolina" })],
      pagos: [pago("2026-10-19T09:00:00Z", 4000, { staffId: "carolina", propinaCents: 200 }), pago("2026-10-19T09:00:00Z", 1000)],
    });
    const filas = porProfesional(e);
    assert.equal(filas[0]?.nombre, "Carolina");
    assert.equal(filas[0]?.facturadoCents, 4000);
    assert.equal(filas[0]?.propinasCents, 200);
    assert.equal(filas[0]?.ocupacion, null); // Carolina no tiene horario en la base de prueba
  });
});

describe("servicios", () => {
  it("cuenta solo citas hechas y agrupa la cola en «Otros»", () => {
    const citas = Array.from({ length: 10 }, (_, i) =>
      cita("2026-10-19T08:00:00Z", "2026-10-19T09:00:00Z", "done", { servicios: [{ nombre: `S${i}`, precioCents: 100 * (i + 1) }] }),
    );
    citas.push(cita("2026-10-19T08:00:00Z", "2026-10-19T09:00:00Z", "cancelled", { servicios: [{ nombre: "S0", precioCents: 100 }] }));
    const { filas, resto } = topServicios(base({ citas }), 8);
    assert.equal(filas.length, 8);
    assert.equal(filas[0]?.nombre, "S9"); // a igual número de veces, gana la que más factura
    assert.equal(resto?.nombre, "Otros (2)");
    assert.equal(resto?.veces, 2); // S1 y S0 (la cancelada no cuenta)
  });
});

describe("mapa de calor", () => {
  it("coloca cada cita en su día y hora local", () => {
    const e = base({ citas: [cita("2026-10-19T08:00:00Z", "2026-10-19T09:00:00Z"), cita("2026-10-19T08:30:00Z", "2026-10-19T09:00:00Z")] });
    const m = mapaCalor(e);
    assert.deepEqual(m.dias, [1, 2, 3, 4, 5]);
    assert.equal(m.horas[0], 9);
    assert.equal(m.celdas[0]?.[1], 2); // 10:00 y 10:30 local: las dos en la fila de las 10
    assert.equal(m.maximo, 2);
  });

  it("la rampa pone el máximo en el paso más oscuro y el cero fuera", () => {
    assert.equal(escalon(0, 10), -1);
    assert.equal(escalon(10, 10), 4);
    assert.equal(escalon(1, 10), 0);
    assert.equal(escalon(1, 1), 4);
  });
});

describe("métodos de cobro", () => {
  it("sin devoluciones, de más a menos", () => {
    const e = base({ pagos: [pago("2026-10-19T09:00:00Z", 1000, { metodo: "cash" }), pago("2026-10-19T09:00:00Z", 3000), pago("2026-10-19T09:00:00Z", 500, { tipo: "refund" })] });
    assert.deepEqual(porMetodo(e).map((f) => f.metodo), ["card", "cash"]);
  });
});
