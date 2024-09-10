// World Clock Service Worker
// This service worker caches static assets for offline use

const CACHE_NAME = 'world-clock-v4';
const STATIC_ASSETS = [
  '/static/css/styles.css',
  '/static/js/app.js',
  '/static/js/moment.min.js',
  '/static/js/moment-timezone-with-data.min.js',
  '/static/manifest.json',
  '/static/icons/icon-192x192.png',
  '/static/icons/icon-512x512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.method === 'GET') {
    const url = new URL(event.request.url);
    const isStaticAsset = STATIC_ASSETS.includes(url.pathname) ||
                          url.pathname.match(/^\/static\/.+\.(css|js|png|jpg|jpeg|gif|svg|ico)$/);

    if (isStaticAsset) {
      event.respondWith(
        caches.match(event.request)
          .then(function(response) {
            if (response) {
              return response;
            }
            return fetch(event.request).then(function(response) {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              var responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(function(cache) {
                  cache.put(event.request, responseToCache);
                });
              return response;
            });
          })
      );
    } else {
      event.respondWith(fetch(event.request));
    }
  } else {
    event.respondWith(fetch(event.request));
  }
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName !== CACHE_NAME;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});
