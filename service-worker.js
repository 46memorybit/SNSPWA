// できるだけシンプルなオフライン対応
const CACHE_NAME = 'savecopy-pwa-v1';
const APP_SHELL = [
  './',
  './index.html',
  './app.js',
  './db.js',
  './manifest.webmanifest',
  // アイコンは任意：存在すればキャッシュに含める
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// 同一オリジンは Stale-While-Revalidate、クロスオリジンはネット優先
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(e.request);
      const fetchPromise = fetch(e.request).then(res => {
        cache.put(e.request, res.clone());
        return res;
      }).catch(() => null);
      return cached || fetchPromise || new Response('オフラインです', { status: 503 });
    })());
  } else {
    e.respondWith(fetch(e.request).catch(async () => {
      // 外部はキャッシュしていないのでオフライン時は簡易応答
      return new Response('オフラインのため取得できません', { status: 504 });
    }));
  }
});
