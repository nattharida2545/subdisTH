
// This service worker can be customized:
// https://developers.google.com/web/tools/workbox/modules/workbox-precaching

// Declare service worker specific globals
declare const self: ServiceWorkerGlobalScope;

type ExtendableEvent = Event & {
  waitUntil(fn: Promise<unknown>): void;
};

type FetchEvent = ExtendableEvent & {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
  preloadResponse?: Promise<Response>;
};

const CACHE_NAME = 'queueconnect-pharmacy-v1.2';
const OFFLINE_URL = '/offline.html';

// Install service worker and cache the essential assets
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log('[ServiceWorker] Caching essential offline assets');
      
      // Cache essential assets individually with error handling
      const essentialAssets = [
        '/offline.html',
        '/favicon.ico'
      ];
      
      // Cache each asset individually with error handling
      for (const asset of essentialAssets) {
        try {
          await cache.add(asset);
          console.log(`[ServiceWorker] Asset cached successfully: ${asset}`);
        } catch (error) {
          console.error(`[ServiceWorker] Failed to cache asset ${asset}:`, error);
        }
      }
      
      console.log('[ServiceWorker] Essential assets caching attempted');
    })()
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Clean up old caches when new service worker activates
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    (async () => {
      // Enable navigation preload if it's supported
      if ('navigationPreload' in self.registration) {
        await self.registration.navigationPreload.enable();
      }
      
      // Clean up old cache versions
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
      console.log('[ServiceWorker] Activated and claimed clients');
    })()
  );
  // Tell the active service worker to take control of the page immediately
  self.clients.claim();
});

// Cache resources progressively as they are used
self.addEventListener('fetch', (event: FetchEvent) => {
  // Skip cross-origin requests to Supabase
  if (event.request.url.includes('supabase.co')) {
    // Let the browser handle Supabase requests directly
    return;
  }
  
  // Skip other cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // First, try to use the navigation preload response if it's supported
          const preloadResponse = await event.preloadResponse;
          
          if (preloadResponse) {
            return preloadResponse;
          }

          // Always try the network first for navigation requests
          const networkResponse = await fetch(event.request);
          
          // Add progressive caching - save successful navigation responses to cache
          const cache = await caches.open(CACHE_NAME);
          try {
            cache.put(event.request, networkResponse.clone());
            console.log('[ServiceWorker] Navigation resource cached:', event.request.url);
          } catch (error) {
            console.error('[ServiceWorker] Failed to cache navigation:', error);
          }
          
          return networkResponse;
        } catch (error) {
          // Network failed, try to serve from cache
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(event.request);
          
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If both network and cache fail, show offline page
          console.log('[ServiceWorker] Serving offline page due to network failure');
          const offlineResponse = await cache.match(OFFLINE_URL);
          return offlineResponse || new Response('You are offline and the page is not cached.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          });
        }
      })()
    );
  } else if (event.request.destination === 'image' || 
             event.request.destination === 'style' || 
             event.request.destination === 'script') {
    // Use cache-first strategy for assets
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request).then((response) => {
          // Cache important assets for offline use
          if (response.ok && (response.type === 'basic' || response.type === 'cors')) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              try {
                cache.put(event.request, responseToCache);
                console.log('[ServiceWorker] Asset cached:', event.request.url);
              } catch (error) {
                console.error('[ServiceWorker] Failed to cache asset:', error);
              }
            });
          }
          
          return response;
        }).catch(error => {
          console.error('[ServiceWorker] Fetch failed for asset:', error);
          // Return a placeholder image/empty response for failed resources
          if (event.request.destination === 'image') {
            return caches.match('/placeholder.svg');
          }
          return new Response('/* Resource temporarily unavailable */', {
            status: 503,
            headers: { 'Content-Type': 'text/css' }
          });
        });
      })
    );
  } else {
    // Use network-first for API calls
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response before using it to save in cache
          const responseToCache = response.clone();
          
          // Cache successful API responses
          if (response.ok) {
            caches.open(CACHE_NAME).then(cache => {
              try {
                cache.put(event.request, responseToCache);
              } catch (error) {
                console.error('[ServiceWorker] Failed to cache API response:', error);
              }
            });
          }
          
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});

// Listen for message events to control the service worker
self.addEventListener('message', (event: MessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

export {};
