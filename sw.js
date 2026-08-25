const CACHE = 'cadoan-v8';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// The site itself (index.html, manifest.json, ...) is left alone entirely —
// the browser fetches it normally, so a refresh always gets the real
// current version instead of fighting the service worker's own caching.
// Only sheet-music PDFs go through the cache, since those are what people
// actually need to open without a signal at Mass.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (!url.pathname.endsWith('.pdf')) return;

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if (res && res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
      return res;
    }))
  );
});
