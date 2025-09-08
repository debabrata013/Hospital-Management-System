// Service Worker for Hospital Management System
// Handles offline functionality and background sync for both general and pharmacy modules

const CACHE_NAME = 'hospital-pharmacy-cache-v1';
const urlsToCache = [
  '/',
  '/pharmacy',
  '/pharmacy/billing',
  '/pharmacy/prescriptions',
  '/pharmacy/inventory',
  '/offline',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/offline');
        }
      })
  );
});

// Background sync event - handles both general and pharmacy sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'pharmacy-sync') {
    event.waitUntil(syncPharmacyData());
  } else if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Pharmacy-specific sync function
async function syncPharmacyData() {
  try {
    const registration = await self.registration;
    registration.showNotification('Syncing pharmacy data...', {
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png'
    });
  } catch (error) {
    console.error('Pharmacy sync failed:', error);
  }
}

// General background sync function
async function doBackgroundSync() {
  try {
    const { syncWithServer } = await import('/lib/offline.js');
    await syncWithServer();
    console.log('Background sync completed successfully');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Activate event - clean up old caches
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
    })
  );
});
