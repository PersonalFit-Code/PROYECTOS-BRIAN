import assert from "node:assert/strict";
import { test } from "node:test";
import { panelSinLogin } from "../panel/sinLogin";

test("panelSinLogin: solo con la variable a 1 y sin dominio propio", () => {
  assert.equal(panelSinLogin({ PANEL_SIN_LOGIN: "1" }, true), true);
  assert.equal(panelSinLogin({ PANEL_SIN_LOGIN: "1" }, false), false);
  assert.equal(panelSinLogin({ PANEL_SIN_LOGIN: "true" }, true), false);
  assert.equal(panelSinLogin({}, true), false);
});
