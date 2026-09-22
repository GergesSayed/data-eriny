const CACHE_NAME = 'fleetcrm-v265-shell';

self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((k) => {
                    if (k !== CACHE_NAME) return caches.delete(k);
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Strict Network-First with Offline Fallback
// Always attempts network first so updates are NEVER delayed.
// Falls back to offline shell only when device is disconnected.
self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    const url = new URL(e.request.url);
    if (url.origin.includes('firebase') || url.origin.includes('supabase')) return;

    e.respondWith(
        fetch(e.request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
                    const cloned = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, cloned);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                return caches.match(e.request).then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;
                    if (e.request.headers.get('accept')?.includes('text/html')) {
                        return caches.match('./index.html') || caches.match('/index.html');
                    }
                });
            })
    );
});
