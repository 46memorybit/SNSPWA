// service-worker.js
const CACHE_NAME = 'sns-pwa-v1';
const APP_SHELL = [
  './',
  './index.html',
  './app.js',
  './db.js',
  './manifest.webmanifest',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // 同一オリジンのみキャッシュ（外部は素通し）
  if (new URL(request.url).origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      try {
        const fresh = await fetch(request);
        if (request.method === 'GET' && fresh && fresh.status === 200) {
          cache.put(request, fresh.clone());
        }
        return fresh;
      } catch {
        return cached || Response.error();
      }
    })());
  }
});
