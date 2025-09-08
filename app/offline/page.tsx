"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react'
import { pharmacyOfflineManager } from "@/lib/pharmacy-offline"

export default function OfflinePage() {
  const [offlineData, setOfflineData] = useState<any[]>([])
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    const checkOnlineStatus = () => setIsOnline(navigator.onLine)
    const loadOfflineData = async () => {
      const bills = await pharmacyOfflineManager.getOfflineData('billing')
      const prescriptions = await pharmacyOfflineManager.getOfflineData('prescriptions')
      setOfflineData([...bills as any[], ...prescriptions as any[]])
    }

    checkOnlineStatus()
    loadOfflineData()

    window.addEventListener('online', checkOnlineStatus)
    window.addEventListener('offline', checkOnlineStatus)

    return () => {
      window.removeEventListener('online', checkOnlineStatus)
      window.removeEventListener('offline', checkOnlineStatus)
    }
  }, [])

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.href = '/pharmacy'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
            <WifiOff className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl">You're Offline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            You're currently offline. Some features may not be available.
          </p>

          {offlineData.length > 0 && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 text-orange-700 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Pending Sync</span>
              </div>
              <p className="text-sm text-orange-600">
                {offlineData.length} items will be synced when you're back online
              </p>
            </div>
          )}

          <Button 
            onClick={handleRetry} 
            className="w-full"
            disabled={!isOnline}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {isOnline ? 'Go Back Online' : 'Waiting for Connection...'}
          </Button>

          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/pharmacy'}
              className="text-sm"
            >
              Continue Offline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
