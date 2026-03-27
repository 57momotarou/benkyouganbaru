const CACHE_NAME = 'cyber-tracker-v3';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './data/schedule.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // http/httpsのみ対象
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    // ネットワーク優先：まずサーバーから取得して最新を返す
    fetch(event.request)
      .then(response => {
        // 取得成功したらキャッシュにも保存して返す
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // オフライン時だけキャッシュから返す
        return caches.match(event.request);
      })
  );
});
