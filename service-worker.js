const CACHE_NAME = 'raselny-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/db.js',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-GET requests or non-ok responses
            if (event.request.method !== 'GET' || !response.ok) {
              return response;
            }
            
            // Cache the fetched resource
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
            
            return response;
          })
          .catch(() => {
            // If both cache and network fail, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});