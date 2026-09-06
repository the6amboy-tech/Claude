/* Asharas service worker — offline app shell + safe pass-through.
   Bump CACHE to invalidate old shells on deploy. */
const CACHE = "asharas-v23";
const SHELL = [
  "./", "./index.html", "./style.css?v=23", "./apple-player.css?v=23", "./app.js?v=23", "./motion.js?v=23", "./manifest.webmanifest?v=23",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png", "./og-image.png", "./favicon.ico", "./favicon.svg", "./favicon-48.png", "./favicon-64.png", "./favicon-32.png",
  "./assets/logos/asharas-mark.svg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (e) => { if (e.data === "skipWaiting") self.skipWaiting(); });

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Cross-origin (music API, fonts, MQTT, lyrics) — pass straight through so
  // nothing is served stale; the app already caches API data in localStorage.
  if (url.origin !== location.origin) return;

  // Page loads: network-first, fall back to the cached shell when offline.
  if (req.mode === "navigate") {
    e.respondWith(fetch(req, { cache: "no-store" }).catch(() => caches.match("./index.html")));
    return;
  }

  // Same-origin static assets: network-first so UI fixes deploy immediately,
  // with the cached shell retained as the offline fallback.
  e.respondWith(
    fetch(req, { cache: "no-store" })
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
