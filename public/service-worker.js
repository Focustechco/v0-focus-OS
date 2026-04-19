const CACHE_NAME = 'focus-os-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

const OFFLINE_ROUTES = [
  '/',
  '/projetos',
  '/backlog',
  '/comercial',
  '/equipe',
  '/intelligence',
  '/relatorios'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([...STATIC_ASSETS, ...OFFLINE_ROUTES]);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network First for Supabase API API and Navigation (HTML)
  if (url.origin.includes('supabase.co') || event.request.mode === 'navigate' || OFFLINE_ROUTES.includes(url.pathname)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache First for static assets (_next/static, images, fonts)
  if (url.pathname.startsWith('/_next/static/') || 
      url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).then(
            (networkResponse) => {
              if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse;
              }
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
              return networkResponse;
            }
          );
        })
    );
    return;
  }

  // Generic fallback
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
