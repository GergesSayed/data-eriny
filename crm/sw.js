/* ============================================
   Fleet CRM — Full Offline PWA Service Worker
   v266.4 — Pre-cache App Shell for Offline Use
   ============================================ */

const CACHE_NAME = 'fleetcrm-v266-4-shell';
const OFFLINE_FALLBACK = './index.html';

// ── App Shell: Pre-cached on install for full offline support ──
const APP_SHELL = [
    './index.html',
    './css/style.css?v=266.4',
    './js/supabase-client.js?v=266.4',
    './js/egypt_verified_titans.js?v=266.4',
    './js/egypt_enterprises_pool.js?v=266.4',
    './js/companies-worker.js?v=266.4',
    './js/storage.js?v=266.4',
    './js/excel-handler.js?v=266.4',
    './js/dashboard.js?v=266.4',
    './js/companies.js?v=266.4',
    './js/calls.js?v=266.4',
    './js/reports.js?v=266.4',
    './js/scraper.js?v=266.4',
    './js/team.js?v=266.4',
    './js/settings.js?v=266.4',
    './js/app.js?v=266.4',
];

// ── Install: Pre-cache app shell ──
self.addEventListener('install', (e) => {
    self.skipWaiting(); // activate immediately, don't wait for old clients
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // addAll fails silently on individual errors — use Promise.allSettled pattern
            return Promise.allSettled(
                APP_SHELL.map(url =>
                    cache.add(url).catch(err => {
                        console.warn('[SW] Failed to cache:', url, err);
                    })
                )
            );
        })
    );
});

// ── Activate: Clean up old caches ──
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((k) => {
                    if (k !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', k);
                        return caches.delete(k);
                    }
                })
            );
        }).then(() => self.clients.claim()) // take control of all open tabs
    );
});

// ── Fetch: Smart caching strategy ──
self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;

    const url = new URL(e.request.url);

    // Bypass: Supabase, Firebase, SSE streams — never intercept live data
    if (
        url.origin.includes('supabase') ||
        url.origin.includes('firebase') ||
        url.pathname.endsWith('.json') ||
        url.pathname.includes('/rest/v1/') ||
        url.pathname.includes('/realtime/')
    ) return;

    const isVersionedAsset = url.search.includes('v=');
    const isCdnAsset =
        url.origin.includes('jsdelivr') ||
        url.origin.includes('cloudflare') ||
        url.origin.includes('googleapis') ||
        url.origin.includes('gstatic');
    const isStaticAsset = url.pathname.match(/\.(png|jpg|jpeg|svg|webp|woff2|woff|ttf|ico|css|js)$/i);
    const isNavigation = e.request.mode === 'navigate';

    // ── Strategy 1: Cache-First for versioned/CDN/static assets ──
    // Instant 0-1ms response from cache; revalidates in background (Stale-While-Revalidate)
    if (isVersionedAsset || isCdnAsset || isStaticAsset) {
        e.respondWith(
            caches.match(e.request).then((cachedResponse) => {
                if (cachedResponse) {
                    // Background revalidation (stale-while-revalidate)
                    fetch(e.request).then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            caches.open(CACHE_NAME).then((cache) =>
                                cache.put(e.request, networkResponse)
                            );
                        }
                    }).catch(() => {});
                    return cachedResponse; // serve immediately from cache
                }
                // Not in cache yet — fetch and store
                return fetch(e.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const cloned = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) =>
                            cache.put(e.request, cloned)
                        );
                    }
                    return networkResponse;
                }).catch(() => {
                    // Network failed and not in cache — return empty response
                    return new Response('', { status: 503, statusText: 'Offline' });
                });
            })
        );
        return;
    }

    // ── Strategy 2: Network-First with Offline Fallback for navigation ──
    // Always try network for fresh HTML; fall back to cached shell when offline
    if (isNavigation) {
        e.respondWith(
            fetch(e.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const cloned = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) =>
                            cache.put(e.request, cloned)
                        );
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // Offline: serve the cached app shell
                    return caches.match(OFFLINE_FALLBACK).then(cached => {
                        if (cached) return cached;
                        // Last resort: minimal offline page
                        return new Response(
                            `<!DOCTYPE html><html dir="rtl" lang="ar">
                            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
                            <title>Fleet CRM — غير متصل</title>
                            <style>body{font-family:'Cairo',sans-serif;background:#0b0e17;color:#f1f5f9;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center}
                            .box{padding:2rem;max-width:340px}h1{color:#6366f1;font-size:1.5rem}p{color:#94a3b8;margin:.5rem 0}
                            button{background:#6366f1;color:#fff;border:none;padding:.75rem 2rem;border-radius:10px;font-size:1rem;cursor:pointer;margin-top:1rem}</style></head>
                            <body><div class="box">
                            <h1>📡 لا يوجد اتصال</h1>
                            <p>Fleet CRM يعمل في وضع عدم الاتصال.</p>
                            <p>بياناتك محفوظة محلياً وجاهزة للعمل.</p>
                            <button onclick="location.reload()">🔄 إعادة المحاولة</button>
                            </div></body></html>`,
                            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
                        );
                    });
                })
        );
        return;
    }

    // ── Strategy 3: Network-First for everything else ──
    e.respondWith(
        fetch(e.request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 &&
                    (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
                    const cloned = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) =>
                        cache.put(e.request, cloned)
                    );
                }
                return networkResponse;
            })
            .catch(() => {
                return caches.match(e.request).then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;
                    return new Response('', { status: 503, statusText: 'Offline' });
                });
            })
    );
});

// ── Message Handler: Allow app to send control messages to SW ──
self.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (e.data && e.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME).then(() => {
            e.ports[0]?.postMessage({ success: true });
        });
    }
});
