// service-worker.js
const CACHE = 'request-helper-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './db.js',
  './app.js',
  // アイコン（存在する場合）
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)));
    self.clients.claim();
  })());
});

// ネット優先 + フォールバックでキャッシュ
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 同一オリジンのみキャッシュ（外部サイトは素通し）
  const url = new URL(req.url);
  if (url.origin !== location.origin) {
    return; // そのままネットに任せる
  }

  event.respondWith((async () => {
    try {
      const net = await fetch(req);
      // 成功時はキャッシュを更新（壊れたレスポンスは除外）
      const cache = await caches.open(CACHE);
      if (net && net.status === 200 && req.method === 'GET') {
        cache.put(req, net.clone());
      }
      return net;
    } catch (e) {
      // オフライン時はキャッシュから
      const cached = await caches.match(req);
      if (cached) return cached;
      // 最後の手段：トップを返す
      return caches.match('./index.html');
    }
  })());
});
