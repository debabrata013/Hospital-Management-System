// Offline support for pharmacy operations
export class PharmacyOfflineManager {
  private dbName = 'pharmacy_offline_db'
  private version = 1
  private db: IDBDatabase | null = null

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create stores for offline data
        if (!db.objectStoreNames.contains('prescriptions')) {
          db.createObjectStore('prescriptions', { keyPath: 'id' })
        }
        
        if (!db.objectStoreNames.contains('billing')) {
          db.createObjectStore('billing', { keyPath: 'id' })
        }
        
        if (!db.objectStoreNames.contains('inventory')) {
          db.createObjectStore('inventory', { keyPath: 'id' })
        }
      }
    })
  }

  async saveOfflineBill(billData: any) {
    if (!this.db) await this.init()
    
    const transaction = this.db!.transaction(['billing'], 'readwrite')
    const store = transaction.objectStore('billing')
    
    const offlineBill = {
      ...billData,
      id: `offline_${Date.now()}`,
      isOffline: true,
      createdAt: new Date().toISOString()
    }
    
    await store.add(offlineBill)
    this.requestBackgroundSync()
    return offlineBill
  }

  async saveOfflinePrescription(prescriptionData: any) {
    if (!this.db) await this.init()
    
    const transaction = this.db!.transaction(['prescriptions'], 'readwrite')
    const store = transaction.objectStore('prescriptions')
    
    const offlinePrescription = {
      ...prescriptionData,
      id: `offline_${Date.now()}`,
      isOffline: true,
      createdAt: new Date().toISOString()
    }
    
    await store.add(offlinePrescription)
    this.requestBackgroundSync()
    return offlinePrescription
  }

  async getOfflineData(storeName: string) {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async syncOfflineData() {
    const offlineBills = await this.getOfflineData('billing') as any[]
    const offlinePrescriptions = await this.getOfflineData('prescriptions') as any[]
    
    let syncedCount = 0
    
    // Sync bills
    for (const bill of offlineBills) {
      try {
        const response = await fetch('/api/pharmacy/billing/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bill)
        })
        
        if (response.ok) {
          await this.removeOfflineData('billing', bill.id)
          syncedCount++
        }
      } catch (error) {
        console.error('Failed to sync bill:', error)
      }
    }
    
    // Sync prescriptions
    for (const prescription of offlinePrescriptions) {
      try {
        const response = await fetch('/api/pharmacy/prescriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prescription)
        })
        
        if (response.ok) {
          await this.removeOfflineData('prescriptions', prescription.id)
          syncedCount++
        }
      } catch (error) {
        console.error('Failed to sync prescription:', error)
      }
    }
    
    return syncedCount
  }

  async removeOfflineData(storeName: string, id: string) {
    if (!this.db) await this.init()
    
    const transaction = this.db!.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    return store.delete(id)
  }

  isOnline() {
    return navigator.onLine
  }

  private requestBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        return registration.sync.register('pharmacy-sync')
      }).catch(console.error)
    }
  }

  // Auto-sync when coming back online
  setupAutoSync() {
    window.addEventListener('online', () => {
      this.syncOfflineData().then((count) => {
        if (count > 0) {
          this.showSyncNotification(count)
        }
      })
    })
  }

  private showSyncNotification(count: number) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Synced ${count} offline items`, {
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png'
      })
    }
  }
}

export const pharmacyOfflineManager = new PharmacyOfflineManager()
