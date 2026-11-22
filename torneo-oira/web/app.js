(function () {
  var C = window.TORNEO, $ = function (id) { return document.getElementById(id); };
  var MIN = 9, MAX = 14;
  var demo = !C.SUPABASE_URL;
  var db = demo ? null : window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY);

  $("t-nombre").textContent = C.nombre; document.title = C.nombre + " — Fútbol 8";
  $("t-fechas").textContent = C.fechas; $("t-lugar").textContent = C.lugar;
  $("t-contacto").textContent = C.contacto; $("t-resp").textContent = C.responsableDatos;
  $("demo").hidden = !demo;

  // ---- backend (real o demo) ----
  var api = demo ? {
    _all: function () { try { return JSON.parse(localStorage.getItem("demo_equipos") || "[]"); } catch (e) { return []; } },
    plazas: function () {
      var o = this._all().filter(function (e) { return e.estado !== "espera"; }).length;
      return Promise.resolve({ total: 32, ocupadas: Math.min(o, 32), libres: Math.max(32 - o, 0), precio: o < 10 ? 150 : 180, early_restantes: Math.max(10 - o, 0) });
    },
    inscribir: function (d) {
      var all = this._all(), o = all.filter(function (e) { return e.estado !== "espera"; }).length;
      if (all.some(function (e) { return e.nombre.trim().toLowerCase() === d.nombre.trim().toLowerCase(); }))
        return Promise.reject(new Error("Ya hay un equipo inscrito con ese nombre"));
      var r = { id: all.length + 1, estado: o >= 32 ? "espera" : "pendiente", precio: o < 10 ? 150 : 180, horas_reserva: 72 };
      all.push({ nombre: d.nombre, estado: r.estado });
      try { localStorage.setItem("demo_equipos", JSON.stringify(all)); } catch (e) {}
      return Promise.resolve(r);
    }
  } : {
    plazas: function () { return db.rpc("plazas").then(function (r) { if (r.error) throw r.error; return r.data; }); },
    inscribir: function (d) { return db.rpc("inscribir", { datos: d }).then(function (r) { if (r.error) throw r.error; return r.data; }); }
  };

  // ---- contador ----
  function pintar(p) {
    $("libres").textContent = p.libres; $("total").textContent = p.total;
    $("libres-txt").textContent = p.libres === 1 ? "plaza libre" : "plazas libres";
    $("barra").style.width = (100 * p.ocupadas / p.total) + "%";
    $("precio-txt").innerHTML = p.libres === 0
      ? "<b>Plazas completas.</b> Puedes apuntarte a la lista de espera: te avisamos si queda un hueco."
      : "Inscripción: <b>" + p.precio + " € por equipo</b>" +
        (p.early_restantes > 0 ? " — precio reducido para los próximos " + p.early_restantes + " equipos (después, 180 €)." : ".");
    $("form-title").textContent = p.libres === 0 ? "Lista de espera" : "Inscribe a tu equipo";
    $("enviar").textContent = p.libres === 0 ? "Apuntarme a la lista de espera" : "Inscribir equipo";
  }
  function refrescar() {
    return api.plazas().then(pintar).catch(function () { $("precio-txt").textContent = "No se pudo cargar el número de plazas. Recarga la página."; });
  }
  refrescar(); setInterval(refrescar, 30000);

  if (!C.inscripcionesAbiertas) {
    $("form").hidden = true; $("form-title").textContent = "Inscripciones cerradas";
  }

  // ---- jugadores ----
  var box = $("players");
  function fila() {
    var n = box.children.length + 1, d = document.createElement("div");
    d.className = "player";
    d.innerHTML = "<span>" + n + "</span>" +
      '<input placeholder="Nombre y apellidos" aria-label="Jugador ' + n + ': nombre" data-k="nombre" required>' +
      '<input placeholder="DNI / NIE" aria-label="Jugador ' + n + ': DNI" data-k="dni" maxlength="12" required>' +
      '<input type="date" aria-label="Jugador ' + n + ': fecha de nacimiento" data-k="nacimiento" max="2010-12-26" required>';
    box.appendChild(d); cuenta();
  }
  function cuenta() {
    var n = box.children.length;
    $("njug").textContent = n; $("add").disabled = n >= MAX; $("del").disabled = n <= MIN;
  }
  for (var i = 0; i < MIN; i++) fila();
  $("add").onclick = function () { if (box.children.length < MAX) fila(); };
  $("del").onclick = function () { if (box.children.length > MIN) { box.lastChild.remove(); cuenta(); } };

  // ---- envío ----
  function error(t) { var e = $("err"); e.textContent = t; e.className = "msg" + (t ? " err" : ""); if (t) e.scrollIntoView({ block: "center", behavior: "smooth" }); }
  function v(id) { return $(id).value.trim(); }

  $("form").addEventListener("submit", function (ev) {
    ev.preventDefault(); error("");
    var jug = [].map.call(box.children, function (f) {
      var o = {}; [].forEach.call(f.querySelectorAll("input"), function (i) { o[i.dataset.k] = i.value.trim(); }); return o;
    });
    if (v("nombre").length < 2) return error("Escribe el nombre del equipo.");
    if (v("cnombre").length < 3 || v("cdni").length < 8) return error("Completa el nombre y el DNI del capitán.");
    if (v("ctel").replace(/\D/g, "").length < 9) return error("El teléfono del capitán no es válido.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v("cmail"))) return error("El email del capitán no es válido.");
    for (var k = 0; k < jug.length; k++) {
      if (jug[k].nombre.length < 3 || jug[k].dni.length < 8 || !jug[k].nacimiento)
        return error("Completa nombre, DNI y fecha de nacimiento del jugador " + (k + 1) + ".");
      if (jug[k].nacimiento > "2010-12-26") return error("El jugador " + (k + 1) + " no tiene 16 años cumplidos el día del torneo.");
    }
    var dnis = jug.map(function (j) { return j.dni.toUpperCase(); });
    if (new Set(dnis).size !== dnis.length) return error("Hay un DNI repetido entre los jugadores.");
    if (!$("c1").checked || !$("c2").checked || !$("c3").checked) return error("Tienes que marcar las tres casillas.");

    var btn = $("enviar"); btn.disabled = true; btn.textContent = "Enviando…";
    api.inscribir({
      nombre: v("nombre"), color: v("color"), capitan_nombre: v("cnombre"), capitan_dni: v("cdni"),
      capitan_telefono: v("ctel"), capitan_email: v("cmail"), jugadores: jug
    }).then(function (r) {
      var equipo = v("nombre"), d = $("done"), h = document.createElement("h2"), p = document.createElement("p");
      d.textContent = "";
      if (r.estado === "espera") {
        h.textContent = "Estás en la lista de espera";
        p.textContent = "Las 32 plazas están ocupadas. Hemos guardado a " + equipo + " y te avisaremos por WhatsApp si se libera una. No hagas ningún pago todavía.";
        d.appendChild(h); d.appendChild(p);
      } else {
        h.textContent = "Plaza reservada para " + equipo;
        p.textContent = "Tienes " + r.horas_reserva + " horas para hacer el pago de " + r.precio + " €. Pasado ese plazo la plaza vuelve a quedar libre.";
        var pay = document.createElement("div"); pay.className = "pay";
        [["Importe", r.precio + " €"], ["Bizum", C.bizum], ["Transferencia", C.iban + " — " + C.titular], ["Concepto", "TORNEO " + equipo.toUpperCase() + " (" + r.id + ")"]]
          .forEach(function (x) { var l = document.createElement("div"), b = document.createElement("b"); b.textContent = x[0] + ": "; l.appendChild(b); l.appendChild(document.createTextNode(x[1])); pay.appendChild(l); });
        var p2 = document.createElement("p"); p2.className = "small";
        p2.textContent = "Te confirmaremos la plaza por WhatsApp al recibir el pago. Guarda una captura de esta pantalla. Dudas: " + C.contacto;
        d.appendChild(h); d.appendChild(p); d.appendChild(pay); d.appendChild(p2);
      }
      $("form").hidden = true; d.hidden = false; d.scrollIntoView({ block: "start", behavior: "smooth" });
      refrescar();
    }).catch(function (e) {
      btn.disabled = false; refrescar().then(function () {});
      btn.textContent = "Inscribir equipo";
      error((e && e.message) || "No se pudo enviar la inscripción. Inténtalo de nuevo.");
    });
  });
})();
