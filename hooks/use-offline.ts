import { useState, useEffect, useCallback } from 'react';
import { 
  isOnline, 
  onNetworkChange, 
  syncWithServer,
  saveRegistrationOffline,
  saveMedicalEntryOffline,
  getUnsyncedRegistrations,
  getUnsyncedMedicalEntries
} from '@/lib/offline';
import { registerServiceWorker, requestBackgroundSync } from '@/lib/service-worker';

interface UseOfflineReturn {
  isOnline: boolean;
  pendingSyncCount: number;
  saveRegistration: (data: any) => Promise<void>;
  saveMedicalEntry: (data: any) => Promise<void>;
  forcSync: () => Promise<void>;
  isInitialized: boolean;
}

export function useOffline(): UseOfflineReturn {
  const [isOnlineState, setIsOnlineState] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize offline functionality
  useEffect(() => {
    const init = async () => {
      try {
        // Register service worker
        await registerServiceWorker();
        
        // Set initial online status
        setIsOnlineState(isOnline());
        
        // Update pending sync count
        await updatePendingSyncCount();
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize offline functionality:', error);
        setIsInitialized(true); // Still mark as initialized to prevent blocking
      }
    };

    init();
  }, []);

  // Listen for network changes
  useEffect(() => {
    const cleanup = onNetworkChange(async (online) => {
      setIsOnlineState(online);
      
      if (online) {
        // When coming back online, attempt to sync
        try {
          await syncWithServer();
          await updatePendingSyncCount();
          
          // Request background sync for future offline data
          await requestBackgroundSync();
        } catch (error) {
          console.error('Auto-sync failed:', error);
        }
      }
    });

    return cleanup;
  }, []);

  const updatePendingSyncCount = useCallback(async () => {
    try {
      const [unsyncedRegistrations, unsyncedMedicalEntries] = await Promise.all([
        getUnsyncedRegistrations(),
        getUnsyncedMedicalEntries()
      ]);
      
      setPendingSyncCount(unsyncedRegistrations.length + unsyncedMedicalEntries.length);
    } catch (error) {
      console.error('Failed to update pending sync count:', error);
    }
  }, []);

  const saveRegistration = useCallback(async (data: any) => {
    try {
      if (isOnlineState) {
        // Try to save online first
        const response = await fetch('/api/receptionist/patients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error('Failed to save registration online');
        }
        
        console.log('Registration saved online successfully');
      } else {
        // Save offline
        await saveRegistrationOffline(data);
        await updatePendingSyncCount();
        console.log('Registration saved offline');
      }
    } catch (error) {
      // If online save fails, fall back to offline
      console.warn('Online save failed, saving offline:', error);
      await saveRegistrationOffline(data);
      await updatePendingSyncCount();
    }
  }, [isOnlineState]);

  const saveMedicalEntry = useCallback(async (data: any) => {
    try {
      if (isOnlineState) {
        // Try to save online first
        const response = await fetch('/api/medical-entries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error('Failed to save medical entry online');
        }
        
        console.log('Medical entry saved online successfully');
      } else {
        // Save offline
        await saveMedicalEntryOffline(data);
        await updatePendingSyncCount();
        console.log('Medical entry saved offline');
      }
    } catch (error) {
      // If online save fails, fall back to offline
      console.warn('Online save failed, saving offline:', error);
      await saveMedicalEntryOffline(data);
      await updatePendingSyncCount();
    }
  }, [isOnlineState]);

  const forceSync = useCallback(async () => {
    if (!isOnlineState) {
      throw new Error('Cannot sync while offline');
    }

    try {
      await syncWithServer();
      await updatePendingSyncCount();
      console.log('Manual sync completed successfully');
    } catch (error) {
      console.error('Manual sync failed:', error);
      throw error;
    }
  }, [isOnlineState]);

  return {
    isOnline: isOnlineState,
    pendingSyncCount,
    saveRegistration,
    saveMedicalEntry,
    forcSync: forceSync,
    isInitialized
  };
}
