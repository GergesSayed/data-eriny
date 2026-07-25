/* Fleet CRM — Progressive Web App Service Worker */
const CACHE_NAME = 'fleetcrm-v22.0.0';
const ASSETS_TO_CACHE = [
  './index.html',
  './css/style.css',
  './js/storage.js?v=22.0.0',
  './js/app.js?v=22.0.0',
  './js/companies.js?v=22.0.0',
  './js/calls.js?v=22.0.0',
  './js/pipeline.js?v=22.0.0',
  './js/dashboard.js?v=22.0.0',
  './js/reports.js?v=22.0.0',
  './js/team.js?v=22.0.0',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
