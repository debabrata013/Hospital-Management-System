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
    
    return store.add(offlineBill)
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
    
    return store.add(offlinePrescription)
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
    
    // Sync bills
    for (const bill of offlineBills) {
      try {
        await fetch('/api/billing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bill)
        })
        await this.removeOfflineData('billing', bill.id)
      } catch (error) {
        console.error('Failed to sync bill:', error)
      }
    }
    
    // Sync prescriptions
    for (const prescription of offlinePrescriptions) {
      try {
        await fetch('/api/pharmacy/prescriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prescription)
        })
        await this.removeOfflineData('prescriptions', prescription.id)
      } catch (error) {
        console.error('Failed to sync prescription:', error)
      }
    }
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
}

export const pharmacyOfflineManager = new PharmacyOfflineManager()
