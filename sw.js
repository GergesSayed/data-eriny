/* Fleet CRM — Progressive Web App Service Worker */
const CACHE_NAME = 'fleetcrm-v42004';
const ASSETS_TO_CACHE = [
  './index.html',
  './css/style.css',
  './js/storage.js?v=42001',
  './js/app.js?v=42001',
  './js/companies.js?v=42001',
  './js/calls.js?v=42001',
  './js/pipeline.js?v=42001',
  './js/dashboard.js?v=42001',
  './js/reports.js?v=42001',
  './js/team.js?v=42001',
  './data/companies.json?v=42001',
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
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Network-First strategy: Always fetch latest from network, fallback to cache if offline
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html');
          }
        });
      })
  );
});
