// Bump CACHE_VERSION whenever index.html changes so clients pick it up.
const CACHE_VERSION = 'post-builder-v8';
const APP_SHELL = ['./', './index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((resp) => {
        if (resp && resp.status === 200) {
          const copy = resp.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        }
        return resp;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
