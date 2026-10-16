/**
 * El lector de las importaciones: tiene que aguantar lo que exporte cualquier programa.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { campo, detectarSeparador, fechaEuropea, filasCsv, horaTexto, leerCsv, normalizarCabecera } from "../csvLeer";

describe("separador", () => {
  it("punto y coma de Excel en español, coma, tabulador", () => {
    assert.equal(detectarSeparador("nombre;teléfono;email\n"), ";");
    assert.equal(detectarSeparador("nombre,telefono\n"), ",");
    assert.equal(detectarSeparador("nombre\ttelefono\n"), "\t");
  });

  it("no cuenta los separadores que van dentro de comillas", () => {
    assert.equal(detectarSeparador('"Gil, Andrea";646;x\n'), ";");
  });
});

describe("filas", () => {
  it("comillas, comillas escapadas y saltos de línea dentro de una celda", () => {
    const filas = filasCsv('a;b\n"uno; dos";"dice ""hola""\ny más"\r\n\n');
    assert.deepEqual(filas, [
      ["a", "b"],
      ["uno; dos", 'dice "hola"\ny más'],
    ]);
  });

  it("quita el BOM y las líneas vacías", () => {
    assert.deepEqual(filasCsv("﻿a;b\n\n1;2\n"), [
      ["a", "b"],
      ["1", "2"],
    ]);
  });
});

describe("cabeceras y campos", () => {
  it("normaliza tildes, mayúsculas y espacios", () => {
    assert.equal(normalizarCabecera(" Teléfono Móvil "), "telefono_movil");
  });

  it("encuentra el campo por cualquiera de sus alias", () => {
    const { filas } = leerCsv("Nombre;Móvil\nAndrea;646771356\n");
    assert.equal(campo(filas[0]!, ["telefono", "movil", "tel"]), "646771356");
    assert.equal(campo(filas[0]!, ["email"]), "");
  });
});

describe("fechas y horas", () => {
  it("formatos europeos e ISO; rechaza fechas que no existen", () => {
    assert.equal(fechaEuropea("15/10/2026"), "2026-10-15");
    assert.equal(fechaEuropea("5-3-27"), "2027-03-05");
    assert.equal(fechaEuropea("2026-10-15 09:30"), "2026-10-15");
    assert.equal(fechaEuropea("31/02/2026"), null);
    assert.equal(fechaEuropea("mañana"), null);
  });

  it("horas escritas de mil maneras", () => {
    assert.equal(horaTexto("9:30"), "09:30");
    assert.equal(horaTexto("09.30"), "09:30");
    assert.equal(horaTexto("930"), "09:30"); // así lo teclean muchas agendas
    assert.equal(horaTexto("1730"), "17:30");
    assert.equal(horaTexto("9h30"), "09:30");
    assert.equal(horaTexto("17"), "17:00");
    assert.equal(horaTexto("25:00"), null);
  });
});
