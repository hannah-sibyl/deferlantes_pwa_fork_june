const CACHE = 'regatta-v1';
const CRITICAL = ['./index.html', './manifest.json', './icon.svg'];
const OPTIONAL = [
  'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Barlow+Condensed:wght@400;600;700&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      OPTIONAL.forEach(a => c.add(a).catch(() => {}));
      return c.addAll(CRITICAL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.match('./index.html')).then(response => {
      if (!response) return;
      return caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).catch(() =>
        caches.match('./index.html').then(fallback =>
          fallback || new Response(
            '<p style="font-family:sans-serif;padding:2rem">App indisponible hors-ligne — relancez quand le réseau est disponible.</p>',
            { headers: { 'Content-Type': 'text/html' } }
          )
        )
      );
    })
  );
});
