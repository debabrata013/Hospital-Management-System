"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Upload, AlertCircle } from 'lucide-react'
import { pharmacyOfflineManager } from "@/lib/pharmacy-offline"
import { toast } from "sonner"

export function OfflineBilling() {
  const [isOnline, setIsOnline] = useState(true)
  const [offlineData, setOfflineData] = useState<any[]>([])
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
    const loadOfflineData = async () => {
      const data = await pharmacyOfflineManager.getOfflineData('billing')
      setOfflineData(data as any[])
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    loadOfflineData()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const handleSync = async () => {
    setSyncing(true)
    try {
      await pharmacyOfflineManager.syncOfflineData()
      const data = await pharmacyOfflineManager.getOfflineData('billing')
      setOfflineData(data as any[])
      toast.success('Offline data synced successfully')
    } catch (error) {
      toast.error('Failed to sync offline data')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isOnline ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
          Offline Billing Status
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {offlineData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-4 w-4" />
              <span>{offlineData.length} pending bills to sync</span>
            </div>
            
            <div className="space-y-2">
              {offlineData.map((bill) => (
                <div key={bill.id} className="p-3 border rounded-lg bg-orange-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Patient: {bill.patient_name}</p>
                      <p className="text-sm text-gray-600">₹{bill.total_amount}</p>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                </div>
              ))}
            </div>

            {isOnline && (
              <Button onClick={handleSync} disabled={syncing} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                {syncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            )}
          </div>
        )}

        {offlineData.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No offline data to sync
          </p>
        )}
      </CardContent>
    </Card>
  )
}
