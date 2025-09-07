import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'hospital-db';
const DB_VERSION = 1;
const REGISTRATION_STORE = 'registrations';
const MEDICAL_ENTRIES_STORE = 'medical_entries';
const SYNC_QUEUE_STORE = 'sync_queue';
const SESSION_STORE = 'sessions';

interface OfflineRegistration {
  id?: number;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  phone: string;
  address?: string;
  emergencyContact?: string;
  timestamp: number;
  synced: boolean;
}

interface MedicalEntry {
  id?: number;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  timestamp: number;
  synced: boolean;
}

interface SyncQueueItem {
  id?: number;
  type: 'registration' | 'medical_entry' | 'appointment';
  data: any;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  timestamp: number;
  retryCount: number;
}

interface OfflineSession {
  id?: number;
  userId: string;
  token: string;
  role: string;
  expiresAt: number;
  isActive: boolean;
}

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Registrations store
      if (!db.objectStoreNames.contains(REGISTRATION_STORE)) {
        const registrationStore = db.createObjectStore(REGISTRATION_STORE, { keyPath: 'id', autoIncrement: true });
        registrationStore.createIndex('synced', 'synced');
        registrationStore.createIndex('timestamp', 'timestamp');
      }
      
      // Medical entries store
      if (!db.objectStoreNames.contains(MEDICAL_ENTRIES_STORE)) {
        const medicalStore = db.createObjectStore(MEDICAL_ENTRIES_STORE, { keyPath: 'id', autoIncrement: true });
        medicalStore.createIndex('synced', 'synced');
        medicalStore.createIndex('patientId', 'patientId');
        medicalStore.createIndex('timestamp', 'timestamp');
      }
      
      // Sync queue store
      if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
        const syncStore = db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
        syncStore.createIndex('type', 'type');
        syncStore.createIndex('timestamp', 'timestamp');
      }
      
      // Sessions store
      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        const sessionStore = db.createObjectStore(SESSION_STORE, { keyPath: 'id', autoIncrement: true });
        sessionStore.createIndex('userId', 'userId');
        sessionStore.createIndex('isActive', 'isActive');
      }
    },
  });
}

// Registration functions
export async function saveRegistrationOffline(data: Omit<OfflineRegistration, 'id' | 'timestamp' | 'synced'>): Promise<number> {
  const db = await getDB();
  const registration: OfflineRegistration = {
    ...data,
    timestamp: Date.now(),
    synced: false
  };
  
  const tx = db.transaction(REGISTRATION_STORE, 'readwrite');
  const id = await tx.store.add(registration);
  await tx.done;
  
  // Add to sync queue
  await addToSyncQueue('registration', registration, '/api/auth/register', 'POST');
  
  return id as number;
}

export async function getOfflineRegistrations(): Promise<OfflineRegistration[]> {
  const db = await getDB();
  return db.getAll(REGISTRATION_STORE);
}

export async function getUnsyncedRegistrations(): Promise<OfflineRegistration[]> {
  const db = await getDB();
  const tx = db.transaction(REGISTRATION_STORE, 'readonly');
  const index = tx.store.index('synced');
  return index.getAll(IDBKeyRange.only(false));
}

// Medical entry functions
export async function saveMedicalEntryOffline(data: Omit<MedicalEntry, 'id' | 'timestamp' | 'synced'>): Promise<number> {
  const db = await getDB();
  const entry: MedicalEntry = {
    ...data,
    timestamp: Date.now(),
    synced: false
  };
  
  const tx = db.transaction(MEDICAL_ENTRIES_STORE, 'readwrite');
  const id = await tx.store.add(entry);
  await tx.done;
  
  // Add to sync queue
  await addToSyncQueue('medical_entry', entry, '/api/medical-entries', 'POST');
  
  return id as number;
}

export async function getUnsyncedMedicalEntries(): Promise<MedicalEntry[]> {
  const db = await getDB();
  const tx = db.transaction(MEDICAL_ENTRIES_STORE, 'readonly');
  const index = tx.store.index('synced');
  return index.getAll(IDBKeyRange.only(false));
}

// Sync queue functions
export async function addToSyncQueue(type: SyncQueueItem['type'], data: any, endpoint: string, method: SyncQueueItem['method']): Promise<void> {
  const db = await getDB();
  const item: SyncQueueItem = {
    type,
    data,
    endpoint,
    method,
    timestamp: Date.now(),
    retryCount: 0
  };
  
  const tx = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
  await tx.store.add(item);
  await tx.done;
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  return db.getAll(SYNC_QUEUE_STORE);
}

export async function removeSyncQueueItem(id: number): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
  await tx.store.delete(id);
  await tx.done;
}

export async function updateSyncQueueItemRetryCount(id: number, retryCount: number): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
  const item = await tx.store.get(id);
  if (item) {
    item.retryCount = retryCount;
    await tx.store.put(item);
  }
  await tx.done;
}

// Session management functions
export async function saveSessionOffline(session: Omit<OfflineSession, 'id'>): Promise<number> {
  const db = await getDB();
  const tx = db.transaction(SESSION_STORE, 'readwrite');
  
  // Deactivate all existing sessions for this user
  const existingSessions = await tx.store.index('userId').getAll(session.userId);
  for (const existingSession of existingSessions) {
    existingSession.isActive = false;
    await tx.store.put(existingSession);
  }
  
  // Add new active session
  const id = await tx.store.add(session);
  await tx.done;
  
  return id as number;
}

export async function getActiveSession(userId: string): Promise<OfflineSession | null> {
  const db = await getDB();
  const tx = db.transaction(SESSION_STORE, 'readonly');
  const sessions = await tx.store.index('userId').getAll(userId);
  
  const activeSession = sessions.find(s => s.isActive && s.expiresAt > Date.now());
  return activeSession || null;
}

export async function clearExpiredSessions(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(SESSION_STORE, 'readwrite');
  const allSessions = await tx.store.getAll();
  
  for (const session of allSessions) {
    if (session.expiresAt <= Date.now()) {
      await tx.store.delete(session.id!);
    }
  }
  
  await tx.done;
}

// Network status detection
export function isOnline(): boolean {
  return navigator.onLine;
}

export function onNetworkChange(callback: (isOnline: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// Sync functions
export async function syncWithServer(): Promise<void> {
  if (!isOnline()) {
    console.log('Cannot sync: device is offline');
    return;
  }
  
  const syncQueue = await getSyncQueue();
  
  for (const item of syncQueue) {
    try {
      const response = await fetch(item.endpoint, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item.data)
      });
      
      if (response.ok) {
        // Mark as synced in the original store
        await markAsSynced(item.type, item.data);
        // Remove from sync queue
        await removeSyncQueueItem(item.id!);
        console.log(`Successfully synced ${item.type}:`, item.data);
      } else {
        // Increment retry count
        await updateSyncQueueItemRetryCount(item.id!, item.retryCount + 1);
        console.error(`Failed to sync ${item.type}:`, response.statusText);
      }
    } catch (error) {
      // Increment retry count
      await updateSyncQueueItemRetryCount(item.id!, item.retryCount + 1);
      console.error(`Error syncing ${item.type}:`, error);
    }
  }
}

async function markAsSynced(type: string, data: any): Promise<void> {
  const db = await getDB();
  
  if (type === 'registration') {
    const tx = db.transaction(REGISTRATION_STORE, 'readwrite');
    const registrations = await tx.store.getAll();
    const registration = registrations.find(r => 
      r.firstName === data.firstName && 
      r.lastName === data.lastName && 
      r.phone === data.phone &&
      r.timestamp === data.timestamp
    );
    
    if (registration) {
      registration.synced = true;
      await tx.store.put(registration);
    }
    await tx.done;
  } else if (type === 'medical_entry') {
    const tx = db.transaction(MEDICAL_ENTRIES_STORE, 'readwrite');
    const entries = await tx.store.getAll();
    const entry = entries.find(e => 
      e.patientId === data.patientId && 
      e.timestamp === data.timestamp
    );
    
    if (entry) {
      entry.synced = true;
      await tx.store.put(entry);
    }
    await tx.done;
  }
}
