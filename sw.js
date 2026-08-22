/* Собранный Хозяин v2 — минимальный service worker для офлайн-кэша статики */
var CACHE = 'sobrannyi-v2-cache-4';
var ASSETS = [
  '/', '/index.html', '/css/styles.css', '/js/app.js', '/manifest.json',
  '/icon.svg',
  '/fonts/inter-cyrillic-ext.woff2', '/fonts/inter-cyrillic.woff2',
  '/fonts/inter-latin-ext.woff2', '/fonts/inter-latin.woff2',
  '/fonts/playfair-cyrillic.woff2', '/fonts/playfair-latin.woff2'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(ASSETS.map(function (a) {
        return c.add(a).catch(function (err) { console.warn('[SW] не удалось закэшировать', a, err); });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.indexOf('/api/') === 0) return; // никогда не кэшировать auth-эндпоинты

  e.respondWith(
    caches.match(e.request).then(function (cached) {
      var fetchPromise = fetch(e.request).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || fetchPromise;
    })
  );
});
