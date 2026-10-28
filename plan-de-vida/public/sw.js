/*
 * Service worker de Plan de vida.
 *  · Notificaciones push (recordatorio de hábitos, revisión del domingo, informe de inversión).
 *  · Sin conexión: los estáticos de Next se sirven de caché y las páginas muestran un aviso en vez
 *    del dinosaurio. Los datos NO se cachean: son personales y cambian a cada rato.
 */
const CACHE = "pdv-v1";
const OFFLINE_HTML =
  '<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<title>Sin conexión</title><body style="font-family:system-ui;display:grid;place-items:center;min-height:100vh;margin:0;background:#191919;color:#e6e5e3">' +
  '<div style="text-align:center;padding:24px"><div style="font-size:48px">📡</div><h1 style="font-size:20px">Sin conexión</h1>' +
  '<p style="color:#9b9a97">Tu plan de vida vuelve en cuanto tengas internet.</p></div></body></html>';

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copia = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copia));
            return res;
          }),
      ),
    );
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => new Response(OFFLINE_HTML, { headers: { "content-type": "text/html; charset=utf-8" } })));
  }
});

self.addEventListener("push", (event) => {
  let data = { title: "Plan de vida", body: "", url: "/" };
  try {
    data = { ...data, ...event.data.json() };
  } catch {
    if (event.data) data.body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ventanas) => {
      for (const v of ventanas) {
        if ("focus" in v) {
          v.navigate(url);
          return v.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
