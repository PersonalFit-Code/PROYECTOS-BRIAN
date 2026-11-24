import { createElement, type ComponentType, type SVGProps } from "react";
import {
  Accessibility, Activity, AudioLines, Baby, CalendarDays, ChartNoAxesColumnIncreasing, ClipboardList, Clock, Dumbbell, Flower2, GraduationCap, HeartPulse,
  Hourglass, KeyRound, Layers, PersonStanding, Shield, ShieldCheck, TrendingUp, Trophy, User, UserCheck, Users, Wind,
} from "lucide-react";
import { BarraDiscos, Berimbau, Cinturon, Kettlebell, PesoMuerto, PressBanca, Reformer, Sentadilla } from "./IconosMarca";

/**
 * Icono para cada idea de una ficha (etiquetas, tarjetas, niveles), como en el boceto de Brais.
 * Se elige por el texto, de más concreto a más general: al añadir una tarjeta nueva en
 * src/data/conceptos.ts coge sola su icono; si ninguna regla encaja, no pinta ninguno.
 */
type Icono = ComponentType<SVGProps<SVGSVGElement>>;
const reglas: [RegExp, Icono][] = [
  [/sentadilla/i, Sentadilla],
  [/press de banca/i, PressBanca],
  [/peso muerto/i, PesoMuerto],
  [/material de competición/i, BarraDiscos],
  [/reformer/i, Reformer],
  [/mat y wall|wall unit/i, Layers],
  [/suelo pélvico|core/i, HeartPulse],
  [/respiraci/i, Wind],
  [/postural|cuerpo y movilidad/i, PersonStanding],
  [/hatha|bienestar/i, Flower2],
  [/operativo/i, ShieldCheck],
  [/civil/i, Shield],
  [/música|ritmo/i, AudioLines],
  [/capoeira adultos/i, Berimbau],
  [/jiu-jitsu adultos/i, Cinturon],
  [/infantil|niños|kids|psicomotricidad/i, Baby],
  [/escuela/i, GraduationCap],
  [/competi|campe/i, Trophy],
  [/cómo se entrena/i, Kettlebell],
  [/para quién/i, Users],
  [/fuerza y musculación/i, Dumbbell],
  [/acondicionamiento/i, Activity],
  [/acceso e instalaciones/i, KeyRound],
  [/365|un mes/i, CalendarDays],
  [/horario/i, Clock],
  [/planificación/i, ClipboardList],
  [/sesiones presenciales|técnica para/i, UserCheck],
  [/progres|nivel|adaptado/i, ChartNoAxesColumnIncreasing],
  [/duran/i, TrendingUp],
  [/años|tercera edad/i, Hourglass],
  [/grupos reducidos|aforo|máximo|ourense|equipo/i, Users],
  [/para adultos|gimnasia para adultos/i, Accessibility],
  [/adultos|jóvenes/i, User],
];

export function iconoDe(texto: string): Icono | null {
  return reglas.find(([r]) => r.test(texto))?.[1] ?? null;
}

export default function IconoConcepto({ texto, className, strokeWidth = 1.6 }: { texto: string; className?: string; strokeWidth?: number }) {
  const icono = iconoDe(texto);
  return icono ? createElement(icono, { className, strokeWidth, "aria-hidden": true }) : null;
}
