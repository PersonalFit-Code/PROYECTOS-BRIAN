import assert from "node:assert/strict";
import { test } from "node:test";
import type { Category } from "@/lib/tipos";
import { encontrarCategoria, interpretarImporte } from "../categorias";

test("interpretarImporte entiende formatos españoles", () => {
  assert.equal(interpretarImporte("12 € en gasolina"), 12);
  assert.equal(interpretarImporte("12,50€ de cena"), 12.5);
  assert.equal(interpretarImporte("1.234,50 euros del alquiler"), 1234.5);
  assert.equal(interpretarImporte("sin números"), null);
});

const cat = (name: string, kind: "gasto" | "ingreso" = "gasto"): Category => ({ id: name, name, emoji: "", kind, monthly_budget: null, position: 0 });
const cats = ["Comida", "Restaurantes", "Transporte", "Otros"].map((c) => cat(c)).concat(cat("Nómina / clientes", "ingreso"));

test("encontrarCategoria: por nombre y por pistas del texto", () => {
  assert.equal(encontrarCategoria(cats, "gasto", "restaurantes")?.name, "Restaurantes");
  assert.equal(encontrarCategoria(cats, "gasto", null, "gasolina")?.name, "Transporte");
  assert.equal(encontrarCategoria(cats, "gasto", null, "mercadona")?.name, "Comida");
  assert.equal(encontrarCategoria(cats, "gasto", null, "algo raro")?.name, "Otros");
  assert.equal(encontrarCategoria(cats, "ingreso", null, "cliente")?.name, "Nómina / clientes");
});
