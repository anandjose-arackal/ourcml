/* =========================================================================
   Cherupushpa Mission League — Service Worker
   App-shell caching for fast repeat loads + offline fallback.
   Audio requests are intentionally left untouched (see fetch handler)
   so native Range-request seeking/streaming keeps working.
   ========================================================================= */

const CACHE_VERSION = 'cml-v9';
const STATIC_CACHE = `${CACHE_VERSION}-static`;

const APP_SHELL = [
  '/',
  '/index.html',
  '/style.css?v=3',
  '/script.js',
  '/badge/badge.js?v=5',
  '/badge/badge.css?v=5',
  '/fest/fest-banner.css?v=4',
  '/badge/medal.webp',
  '/manifest.json',
  '/offline.html',
  '/icons/favicon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function isAudioRequest(request) {
  if (request.destination === 'audio') return true;
  return /\.(mp3|wav|m4a|ogg|aac)(\?.*)?$/i.test(new URL(request.url).pathname);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Let the browser handle audio streaming natively (Range requests, seeking).
  if (isAudioRequest(request)) return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  // Navigation requests: network-first, fall back to cached shell / offline page.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html').then((cached) => cached || caches.match('/offline.html')))
    );
    return;
  }

  if (!isSameOrigin) return; // don't intercept cross-origin cover images/fonts, let network handle it

  // Static assets: cache-first, refresh in background.
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
