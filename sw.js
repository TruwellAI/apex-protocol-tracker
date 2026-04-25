/* ═══════════════════════════════════════════════════════════
   APEX SERVICE WORKER — offline support + speed + push
   - HTML: network-first, cache fallback
   - Assets: cache-first, refresh in background
   - Push notifications + background sync ready
   ═══════════════════════════════════════════════════════════ */
const CACHE_VERSION = 'apex-v3';
const STATIC_CACHE = CACHE_VERSION + '-static';
const HTML_CACHE = CACHE_VERSION + '-html';
const PRECACHE = [
  './',
  'index.html',
  'protocol-tracker.html',
  'browse.html',
  'basics.html',
  'compare.html',
  'wizard.html',
  'assets/apex-nav-pill.js',
  'assets/apex-editorial.js',
  'assets/apex-social-proof.js',
  'assets/apex-support.js',
  'assets/apex-tracking.js',
  'assets/apex-mobile.js',
  'assets/apex-input-polish.js',
  'assets/apex-a11y.js',
  'assets/apex-capacitor.js',
  'assets/apex-macro-calc.js',
  'assets/favicon.ico',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((p) => new Request(p, { cache: 'reload' }))).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.includes('webhook') || url.pathname.startsWith('/api/')) return;

  // HTML — network-first
  if (req.headers.get('accept') && req.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(HTML_CACHE).then((c) => c.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('protocol-tracker.html')))
    );
    return;
  }

  // Assets — cache-first with background refresh
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        fetch(req).then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(req, clone));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(req).then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(req, clone));
        }
        return res;
      }).catch(() => caches.match(req));
    })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'apex-event-flush') {
    self.clients.matchAll().then((clients) => clients.forEach((c) => c.postMessage({ type: 'flush-events' })));
  }
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data;
  try { data = event.data.json(); } catch(e) { return; }
  const title = data.title || 'Apex';
  const options = {
    body: data.body || '',
    icon: 'assets/icon-192.png',
    badge: 'assets/icon-128.png',
    tag: data.tag || 'apex-notification',
    data: data.url || '/protocol-tracker.html',
    vibrate: [10, 50, 10],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data || '/protocol-tracker.html'));
});
