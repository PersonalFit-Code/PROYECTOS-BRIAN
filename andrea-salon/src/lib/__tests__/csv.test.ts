/**
 * El CSV que abre Andrea en Excel.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { aCsv } from "../csv";

const BOM = "﻿";

describe("aCsv", () => {
  it("empieza con BOM, separa con ; y acaba cada línea con CRLF", () => {
    const csv = aCsv(
      [
        { nombre: "Ana", visitas: 3, gasto: 25.5 },
        { nombre: "Bea", visitas: 0, gasto: 0 },
      ],
      [
        { clave: "nombre", cabecera: "Nombre" },
        { clave: "visitas", cabecera: "Visitas" },
        { clave: "gasto", cabecera: "Gasto (€)" },
      ],
    );
    assert.equal(csv, `${BOM}Nombre;Visitas;Gasto (€)\r\nAna;3;25,5\r\nBea;0;0\r\n`);
  });

  it("solo saca las columnas pedidas, en su orden", () => {
    const csv = aCsv(
      [{ nombre: "Ana", notes: "alergia al acrílico", telefono: "+34646771356" }],
      [
        { clave: "telefono", cabecera: "Teléfono" },
        { clave: "nombre", cabecera: "Nombre" },
      ],
    );
    assert.equal(csv, `${BOM}Teléfono;Nombre\r\n+34646771356;Ana\r\n`);
    assert.ok(!csv.includes("alergia"), "las notas no salen si no se piden");
  });

  it("entrecomilla lo que hace falta y dobla las comillas (RFC 4180)", () => {
    const csv = aCsv(
      [{ a: "con;punto y coma", b: 'con "comillas"', c: "con\nsalto", d: "con\r\nretorno", e: "normal", f: "" }],
      (["a", "b", "c", "d", "e", "f"] as const).map((clave) => ({ clave, cabecera: clave })),
      { bom: false },
    );
    assert.equal(csv, 'a;b;c;d;e;f\r\n"con;punto y coma";"con ""comillas""";"con\nsalto";"con\r\nretorno";normal;\r\n');
  });

  it("null, undefined y los números no finitos son celdas vacías; las fechas van tal cual", () => {
    const csv = aCsv(
      [{ a: null, b: undefined, c: Number.NaN, d: "2026-10-25T10:00:00+02:00", e: "25/10/2026" }],
      (["a", "b", "c", "d", "e"] as const).map((clave) => ({ clave, cabecera: clave })),
      { bom: false },
    );
    assert.equal(csv, "a;b;c;d;e\r\n;;;2026-10-25T10:00:00+02:00;25/10/2026\r\n");
  });

  it("neutraliza lo que Excel ejecutaría como fórmula, sin tocar teléfonos ni negativos", () => {
    const filas = [
      { v: "=HYPERLINK(\"http://mal\";\"pincha\")" },
      { v: "@SUM(A1)" },
      { v: "+34 646 77 13 56" },
      { v: "-12,50" },
      { v: "-cmd|' /C calc'!A0" },
      { v: "+cmd|' /C calc'!A0" },
      { v: "\tx" },
      { v: "texto normal = con igual dentro" },
    ];
    const columnas = [{ clave: "v" as const, cabecera: "v" }];
    const lineas = aCsv(filas, columnas, { bom: false }).split("\r\n");
    assert.equal(lineas[1], `"'=HYPERLINK(""http://mal"";""pincha"")"`);
    assert.equal(lineas[2], "'@SUM(A1)");
    assert.equal(lineas[3], "+34 646 77 13 56");
    assert.equal(lineas[4], "-12,50");
    assert.equal(lineas[5], "'-cmd|' /C calc'!A0");
    assert.equal(lineas[6], "'+cmd|' /C calc'!A0");
    assert.equal(lineas[7], "'\tx");
    assert.equal(lineas[8], "texto normal = con igual dentro");

    const sinProteger = aCsv(filas.slice(0, 1), columnas, { bom: false, protegerFormulas: false }).split("\r\n");
    assert.equal(sinProteger[1], `"=HYPERLINK(""http://mal"";""pincha"")"`);
  });

  it("admite otro separador y otro fin de línea; con coma entre columnas, el decimal es el punto", () => {
    const csv = aCsv([{ a: "x,y", b: 1.25 }], [{ clave: "a", cabecera: "a" }, { clave: "b", cabecera: "b" }], {
      separador: ",",
      bom: false,
      finDeLinea: "\n",
    });
    assert.equal(csv, 'a,b\n"x,y",1.25\n');
  });

  it("sin filas, solo la cabecera", () => {
    assert.equal(aCsv([], [{ clave: "a", cabecera: "A" }]), `${BOM}A\r\n`);
  });
});
