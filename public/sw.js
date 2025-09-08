const CACHE_NAME = 'pharmacy-offline-v1'
const urlsToCache = [
  '/',
  '/pharmacy',
  '/pharmacy/billing',
  '/pharmacy/prescriptions',
  '/pharmacy/inventory',
  '/offline'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/offline')
        }
      })
  )
})

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'pharmacy-sync') {
    event.waitUntil(syncOfflineData())
  }
})

async function syncOfflineData() {
  // This will be handled by the pharmacy offline manager
  const registration = await self.registration
  registration.showNotification('Syncing offline data...', {
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png'
  })
}
