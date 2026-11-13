const CACHE_NAME = 'lumen-vitae-shell-v1';
const CORE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/assets/css/main.css',
  '/assets/js/pwa.js',
  '/assets/img/icon-192.png',
  '/assets/img/icon-512.png',
  '/assets/img/icon-maskable-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('lumen-vitae-') && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      const pathname = new URL(request.url).pathname;
      const isAppIcon = pathname.startsWith('/assets/img/icon-') || pathname === '/assets/img/apple-touch-icon.png';
      const isImage = (response.headers.get('content-type') || '').startsWith('image/');
      if (response.ok && response.status !== 206 && response.type === 'basic' && (!isImage || isAppIcon)) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') return (await caches.match('/')) || Response.error();
      return Response.error();
    }
  })());
});
