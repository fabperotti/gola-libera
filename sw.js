// Offline support: app files are precached; fonts are cached the first time they load.
const VERSION = "gola-libera-v3";
const APP_FILES = [
  "./",
  "index.html",
  "app.css",
  "app.js",
  "anim.js",
  "manifest.webmanifest",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Fonts: cache first, they never change
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(
      caches.open(VERSION).then(cache => cache.match(req).then(hit => hit || fetch(req).then(res => {
        cache.put(req, res.clone());
        return res;
      })))
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // App files: network first so updates arrive, cache when offline
  event.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(cache => cache.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match("index.html")))
  );
});
