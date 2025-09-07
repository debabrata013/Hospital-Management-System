# Offline Functionality Implementation

This document describes the comprehensive offline functionality implemented for the Hospital Management System, enabling seamless operation even without internet connectivity.

## Overview

The offline functionality provides:
- **IndexedDB/Local Storage**: Patient registrations and medical entries are stored locally when offline
- **Background Data Sync**: Automatic synchronization when connection is restored
- **Secure Offline Session Support**: Maintains user sessions during offline periods

## Architecture

### Core Components

1. **`lib/offline.ts`** - Main offline data management module
2. **`lib/service-worker.ts`** - Service worker registration and management
3. **`lib/auth-offline.ts`** - Offline authentication and session management
4. **`hooks/use-offline.ts`** - React hook for offline functionality
5. **`public/sw.js`** - Service worker for caching and background sync
6. **`components/OfflineMedicalEntry.tsx`** - Offline-capable medical entry form

### Data Storage Strategy

The system uses IndexedDB with the following stores:

- **`registrations`** - Patient registration data
- **`medical_entries`** - Medical records and prescriptions
- **`sync_queue`** - Queue of items waiting to be synchronized
- **`sessions`** - Offline user session management

## Features

### 1. Offline Patient Registration

**Location**: `app/(dashboard)/receptionist/page.tsx`

- Detects network status automatically
- Saves registration data to IndexedDB when offline
- Shows visual indicators for offline mode
- Queues data for background sync when connection returns

**Usage**:
```typescript
const { isOnline, saveRegistration } = useOffline();

await saveRegistration({
  firstName: "John",
  lastName: "Doe",
  age: 30,
  gender: "male",
  phone: "+91 9876543210"
});
```

### 2. Offline Medical Entries

**Location**: `components/OfflineMedicalEntry.tsx`

- Allows doctors to record diagnoses and prescriptions offline
- Automatically syncs when connection is restored
- Provides real-time sync status indicators

**Usage**:
```typescript
const { saveMedicalEntry } = useOffline();

await saveMedicalEntry({
  patientId: "P001",
  doctorId: "D001",
  diagnosis: "Common cold",
  prescription: "Rest and fluids"
});
```

### 3. Background Synchronization

**Service Worker**: `public/sw.js`

- Registers for background sync events
- Automatically syncs queued data when online
- Handles retry logic for failed sync attempts

**Manual Sync**:
```typescript
const { forceSync } = useOffline();
await forceSync(); // Manually trigger sync
```

### 4. Network Status Detection

**Real-time monitoring**:
```typescript
const { isOnline, pendingSyncCount } = useOffline();

// isOnline - boolean indicating current network status
// pendingSyncCount - number of items waiting to sync
```

### 5. Offline Session Management

**Location**: `lib/auth-offline.ts`

- Maintains user sessions during offline periods
- Generates offline-compatible JWT tokens
- Handles session expiration and cleanup

**Usage**:
```typescript
import { loginOffline, getCurrentOfflineSession } from '@/lib/auth-offline';

const session = await loginOffline({
  email: "user@hospital.com",
  password: "password"
});
```

## Implementation Details

### IndexedDB Schema

```typescript
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
```

### Sync Queue Management

All offline operations are queued for synchronization:

```typescript
interface SyncQueueItem {
  id?: number;
  type: 'registration' | 'medical_entry' | 'appointment';
  data: any;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  timestamp: number;
  retryCount: number;
}
```

## User Experience

### Visual Indicators

1. **Network Status**: Green (Online) / Red (Offline) indicators in the header
2. **Pending Sync**: Yellow badge showing number of items waiting to sync
3. **Offline Warnings**: Alert messages in forms when operating offline
4. **Loading States**: Different messages for online vs offline operations

### Error Handling

- Graceful fallback to offline mode when network requests fail
- Retry logic with exponential backoff for sync operations
- User-friendly error messages and status updates

## Installation & Setup

### 1. Install Dependencies

The offline functionality requires the `idb` library:

```bash
npm install idb
```

### 2. Service Worker Registration

The service worker is automatically registered via the `useOffline` hook. No manual setup required.

### 3. Integration

Import and use the offline hook in your components:

```typescript
import { useOffline } from '@/hooks/use-offline';

function MyComponent() {
  const { isOnline, saveRegistration, pendingSyncCount } = useOffline();
  // ... component logic
}
```

## API Compatibility

The offline system is designed to work with existing API endpoints:

- **Registration**: `POST /api/auth/register`
- **Medical Entries**: `POST /api/medical-entries`

Data is automatically formatted to match the expected API schema during synchronization.

## Security Considerations

1. **Offline Sessions**: Use secure token generation with expiration
2. **Data Encryption**: Consider encrypting sensitive data in IndexedDB
3. **Sync Validation**: Server-side validation of synchronized data
4. **Access Control**: Maintain role-based access even offline

## Testing

### Manual Testing

1. **Offline Registration**:
   - Disconnect network
   - Fill out registration form
   - Verify data is saved locally
   - Reconnect and verify sync

2. **Background Sync**:
   - Create offline data
   - Close browser tab
   - Reconnect network
   - Verify automatic sync occurs

### Browser Developer Tools

- Use Network tab to simulate offline conditions
- Check Application > Storage > IndexedDB for stored data
- Monitor Console for sync events and errors

## Browser Support

- **Chrome/Edge**: Full support including background sync
- **Firefox**: IndexedDB and service workers supported
- **Safari**: Basic offline functionality (limited background sync)

## Future Enhancements

1. **Conflict Resolution**: Handle data conflicts during sync
2. **Partial Sync**: Sync only modified fields
3. **Offline Search**: Enable searching through cached data
4. **Data Compression**: Compress stored data to save space
5. **Sync Prioritization**: Priority-based sync queue

## Troubleshooting

### Common Issues

1. **Service Worker Not Registering**:
   - Check HTTPS requirement (localhost is exempt)
   - Verify service worker file path

2. **IndexedDB Errors**:
   - Check browser storage quotas
   - Clear browser data if corrupted

3. **Sync Not Working**:
   - Verify network connectivity
   - Check browser console for errors
   - Ensure API endpoints are accessible

### Debug Mode

Enable debug logging by setting:
```typescript
localStorage.setItem('offline-debug', 'true');
```

This will provide detailed console logs for all offline operations.
