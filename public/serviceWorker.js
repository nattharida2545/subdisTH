
// This is the main service worker file
// Service worker specific globals
const CACHE_NAME = 'queueconnect-pharmacy-v1.3';
const OFFLINE_URL = '/offline.html';

// Install service worker and cache the essential assets
self.addEventListener('install', (event) => {
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
          await cache.add(new Request(asset, { cache: 'reload' }));
          console.log(`[ServiceWorker] Asset cached successfully: ${asset}`);
        } catch (error) {
          console.error(`[ServiceWorker] Failed to cache asset ${asset}:`, error);
          // Continue despite errors - don't block installation
        }
      }
      
      console.log('[ServiceWorker] Essential assets caching attempted');
    })()
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Clean up old caches when new service worker activates
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    (async () => {
      // Enable navigation preload if it's supported
      if ('navigationPreload' in self.registration) {
        try {
          await self.registration.navigationPreload.enable();
          console.log('[ServiceWorker] Navigation preload enabled');
        } catch (error) {
          console.error('[ServiceWorker] Navigation preload error:', error);
        }
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

// Handle fetch events with proper preload handling
self.addEventListener('fetch', (event) => {
  // Skip Supabase API requests - let the browser handle them directly
  if (event.request.url.includes('supabase.co')) {
    return;
  }
  
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Try to use the preloaded response first if available
        const preloadResponse = await event.preloadResponse;
        if (preloadResponse) {
          console.log('[ServiceWorker] Using preloaded response for:', event.request.url);
          return preloadResponse;
        }

        // Otherwise, try the cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If not in cache, try the network
        const networkResponse = await fetch(event.request);
        
        // Cache successful responses for future use
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const cache = await caches.open('runtime-cache');
          cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        console.log('[ServiceWorker] Fetch failed, serving offline page for:', event.request.url);
        
        // If it's a navigation request, return the offline page
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        
        // Otherwise, just propagate the error
        throw error;
      }
    })()
  );
});

// Listen for message events
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
