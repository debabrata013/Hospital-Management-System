"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Wifi, WifiOff, Upload, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { pharmacyOfflineManager } from "@/lib/pharmacy-offline"
import { toast } from "sonner"

interface OfflineItem {
  id: string
  type: 'billing' | 'prescription'
  patient_name?: string
  total_amount?: number
  createdAt: string
  isOffline: boolean
}

interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  lastSyncTime: Date | null
  pendingCount: number
  syncProgress: number
}

export function EnhancedOfflineBilling() {
  // Enhanced state management
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator?.onLine || false,
    isSyncing: false,
    lastSyncTime: null,
    pendingCount: 0,
    syncProgress: 0
  })
  
  const [offlineItems, setOfflineItems] = useState<OfflineItem[]>([])
  const [syncErrors, setSyncErrors] = useState<string[]>([])

  // Load offline data
  const loadOfflineData = useCallback(async () => {
    try {
      const [bills, prescriptions] = await Promise.all([
        pharmacyOfflineManager.getOfflineData('billing'),
        pharmacyOfflineManager.getOfflineData('prescriptions')
      ])
      
      const allItems: OfflineItem[] = [
        ...(bills as any[]).map(bill => ({
          id: bill.id,
          type: 'billing' as const,
          patient_name: bill.patient_name,
          total_amount: bill.total_amount,
          createdAt: bill.createdAt,
          isOffline: bill.isOffline
        })),
        ...(prescriptions as any[]).map(prescription => ({
          id: prescription.id,
          type: 'prescription' as const,
          patient_name: prescription.patient_name,
          createdAt: prescription.createdAt,
          isOffline: prescription.isOffline
        }))
      ]
      
      setOfflineItems(allItems)
      setSyncStatus(prev => ({ ...prev, pendingCount: allItems.length }))
    } catch (error) {
      console.error('Failed to load offline data:', error)
    }
  }, [])

  // Update online status
  const updateOnlineStatus = useCallback(() => {
    const isOnline = navigator.onLine
    setSyncStatus(prev => ({ ...prev, isOnline }))
    
    // Auto-sync when coming online
    if (isOnline && offlineItems.length > 0) {
      handleAutoSync()
    }
  }, [offlineItems.length])

  // Auto-sync when coming online
  const handleAutoSync = useCallback(async () => {
    if (syncStatus.isSyncing || offlineItems.length === 0) return
    
    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncProgress: 0 }))
    setSyncErrors([])
    
    try {
      let syncedCount = 0
      const totalItems = offlineItems.length
      
      for (let i = 0; i < totalItems; i++) {
        try {
          await pharmacyOfflineManager.syncOfflineData()
          syncedCount++
          setSyncStatus(prev => ({ 
            ...prev, 
            syncProgress: Math.round((i + 1) / totalItems * 100) 
          }))
        } catch (error) {
          setSyncErrors(prev => [...prev, `Failed to sync item ${i + 1}`])
        }
      }
      
      await loadOfflineData()
      setSyncStatus(prev => ({ 
        ...prev, 
        lastSyncTime: new Date(),
        syncProgress: 100
      }))
      
      if (syncedCount > 0) {
        toast.success(`Successfully synced ${syncedCount} items`)
      }
      
    } catch (error) {
      toast.error('Sync failed')
      setSyncErrors(prev => [...prev, 'General sync error'])
    } finally {
      setSyncStatus(prev => ({ ...prev, isSyncing: false }))
    }
  }, [syncStatus.isSyncing, offlineItems.length, loadOfflineData])

  // Manual sync
  const handleManualSync = useCallback(async () => {
    if (!syncStatus.isOnline) {
      toast.error('Cannot sync while offline')
      return
    }
    
    await handleAutoSync()
  }, [syncStatus.isOnline, handleAutoSync])

  // Setup event listeners
  useEffect(() => {
    loadOfflineData()
    
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    // Periodic sync check
    const syncInterval = setInterval(() => {
      if (syncStatus.isOnline && offlineItems.length > 0 && !syncStatus.isSyncing) {
        handleAutoSync()
      }
    }, 30000) // Check every 30 seconds
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      clearInterval(syncInterval)
    }
  }, [loadOfflineData, updateOnlineStatus, handleAutoSync, syncStatus.isOnline, syncStatus.isSyncing, offlineItems.length])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {syncStatus.isOnline ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-500" />
          )}
          Offline Sync Status
          <Badge variant={syncStatus.isOnline ? "default" : "destructive"}>
            {syncStatus.isOnline ? "Online" : "Offline"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync Progress */}
        {syncStatus.isSyncing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-600">
              <Clock className="h-4 w-4 animate-spin" />
              <span>Syncing data...</span>
            </div>
            <Progress value={syncStatus.syncProgress} className="w-full" />
            <p className="text-sm text-gray-600">{syncStatus.syncProgress}% complete</p>
          </div>
        )}

        {/* Pending Items */}
        {offlineItems.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-4 w-4" />
              <span>{offlineItems.length} items pending sync</span>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {offlineItems.map((item) => (
                <div key={item.id} className="p-3 border rounded-lg bg-orange-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {item.type === 'billing' ? 'Bill' : 'Prescription'}
                        {item.patient_name && `: ${item.patient_name}`}
                      </p>
                      {item.total_amount && (
                        <p className="text-sm text-gray-600">₹{item.total_amount}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Sync Button */}
            {syncStatus.isOnline && (
              <Button 
                onClick={handleManualSync} 
                disabled={syncStatus.isSyncing} 
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {syncStatus.isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>All data synced</span>
          </div>
        )}

        {/* Last Sync Time */}
        {syncStatus.lastSyncTime && (
          <p className="text-xs text-gray-500">
            Last synced: {syncStatus.lastSyncTime.toLocaleString()}
          </p>
        )}

        {/* Sync Errors */}
        {syncErrors.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-700 mb-2">Sync Errors:</p>
            <ul className="text-xs text-red-600 space-y-1">
              {syncErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
