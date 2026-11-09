/**
 * Catálogo de lo que se puede pagar online (pasarela). Precios reales del dosier 2025-26 y del PDF
 * de 720 Pilates. `mensual` = suscripción con cobro recurrente; si no, pago único.
 * Los ids van en la URL: /alta?plan=gimnasio-libre
 */
export interface PlanPago {
  id: string;
  nombre: string;
  grupo: "Gimnasio" | "Entrenamiento personal" | "720 Pilates";
  precio: number; // euros
  mensual: boolean;
  detalle: string;
  destacado?: boolean;
}

export const planesPago: PlanPago[] = [
  { id: "gimnasio-libre", nombre: "Gimnasio libre", grupo: "Gimnasio", precio: 35, mensual: true, detalle: "Acceso ilimitado 365 días. Oferta de apertura.", destacado: true },
  { id: "supervision", nombre: "Supervisión en grupo", grupo: "Gimnasio", precio: 45, mensual: true, detalle: "Acceso ilimitado + 1 h/mes supervisada (máx. 10)." },
  { id: "paquete-inicio", nombre: "Paquete Inicio", grupo: "Gimnasio", precio: 75, mensual: false, detalle: "Valoración, plan, 1 sesión personal y 1 mes de acceso." },
  { id: "entrada-diaria", nombre: "Entrada diaria", grupo: "Gimnasio", precio: 5, mensual: false, detalle: "Acceso por un día." },
  { id: "valoracion", nombre: "1 sesión + valoración inicial", grupo: "Entrenamiento personal", precio: 35, mensual: false, detalle: "Entrevista, valoración y plan. 1–1,5 h." },
  { id: "bono-5", nombre: "Bono 5 sesiones", grupo: "Entrenamiento personal", precio: 150, mensual: false, detalle: "30 €/sesión. No caduca." },
  { id: "bono-10", nombre: "Bono 10 sesiones", grupo: "Entrenamiento personal", precio: 270, mensual: false, detalle: "27 €/sesión. El recomendado.", destacado: true },
  { id: "bono-15", nombre: "Bono 15 sesiones", grupo: "Entrenamiento personal", precio: 375, mensual: false, detalle: "25 €/sesión. No caduca." },
  { id: "reformer-1", nombre: "Reformer 1 día/semana", grupo: "720 Pilates", precio: 55, mensual: true, detalle: "Grupo reducido, 50 min." },
  { id: "reformer-2", nombre: "Reformer 2 días/semana", grupo: "720 Pilates", precio: 95, mensual: true, detalle: "Grupo reducido, 50 min.", destacado: true },
  { id: "reformer-3", nombre: "Reformer 3 días/semana", grupo: "720 Pilates", precio: 127, mensual: true, detalle: "Grupo reducido, 50 min." },
  { id: "mat-1", nombre: "Mat Integral 1 día/semana", grupo: "720 Pilates", precio: 40, mensual: true, detalle: "Suelo y Wall Unit, 50 min." },
  { id: "mat-2", nombre: "Mat Integral 2 días/semana", grupo: "720 Pilates", precio: 57, mensual: true, detalle: "Suelo y Wall Unit, 50 min." },
  { id: "mixto-2", nombre: "Mixto 2 días (Mat + Reformer)", grupo: "720 Pilates", precio: 78, mensual: true, detalle: "Lo mejor de los dos." },
  { id: "hipopresivos-1", nombre: "Hipopresivos 1 día/semana", grupo: "720 Pilates", precio: 35, mensual: true, detalle: "Sesiones de 30 min." },
  { id: "sesion-suelta", nombre: "Sesión suelta de Pilates", grupo: "720 Pilates", precio: 15, mensual: false, detalle: "Una clase." },
];

export const planPorId = (id?: string | null) => planesPago.find((p) => p.id === id);
export const eur = (n: number) => `${n.toLocaleString("es-ES", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })} €`;
