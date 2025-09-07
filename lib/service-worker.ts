// Service Worker registration and management

export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker is available
                console.log('New service worker available');
                // Optionally show update notification to user
              }
            });
          }
        });
        
        return registration;
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
        return null;
      });
  }
  
  console.log('Service Worker not supported');
  return Promise.resolve(null);
}

export function unregisterServiceWorker(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.ready
      .then((registration) => {
        return registration.unregister();
      })
      .catch((error) => {
        console.error('Service Worker unregistration failed:', error);
        return false;
      });
  }
  
  return Promise.resolve(false);
}

export function requestBackgroundSync(tag: string = 'background-sync'): Promise<void> {
  return navigator.serviceWorker.ready
    .then((registration) => {
      if ('sync' in registration) {
        return (registration as any).sync.register(tag);
      } else {
        console.warn('Background sync not supported');
        return Promise.resolve();
      }
    })
    .catch((error) => {
      console.error('Background sync registration failed:', error);
    });
}

export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

export function isBackgroundSyncSupported(): boolean {
  return 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;
}
