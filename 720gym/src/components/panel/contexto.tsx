"use client";

import { createContext, useContext } from "react";
import type { Entrenador } from "@/data/panel-demo";

export type Filtro = Entrenador | "Todos";
export type Documento =
  | { tipo: "informe" }
  | { tipo: "factura"; cliente: string; plan: string; lineas: { fecha: string; concepto: string; importe: number; metodo: string }[]; numero: string };

export interface ContextoPanel {
  filtro: Filtro;
  abrirFicha: (socioId: string) => void;
  imprimir: (d: Documento) => void;
}

export const Contexto = createContext<ContextoPanel>({ filtro: "Todos", abrirFicha: () => {}, imprimir: () => {} });
export const usePanelCtx = () => useContext(Contexto);
