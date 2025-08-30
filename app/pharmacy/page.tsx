"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Package, AlertTriangle, TrendingUp, FileText, BarChart3, 
  RefreshCw, DollarSign, Building2, Wifi, WifiOff
} from 'lucide-react'
import StockAlerts from "@/components/pharmacy/StockAlerts"
import { pharmacyOfflineManager } from "@/lib/pharmacy-offline"
import { toast } from "sonner"

export default function PharmacyDashboard() {
  const [activeTab, setActiveTab] = useState("analytics")
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Initialize offline manager
    pharmacyOfflineManager.init()
    
    // Monitor online status
    const handleOnline = () => {
      setIsOnline(true)
      pharmacyOfflineManager.syncOfflineData()
      toast.success("Back online! Syncing data...")
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      toast.warning("Working offline. Data will sync when connection is restored.")
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Mock data for dashboard
  const stats = {
    totalMedicines: 1250,
    lowStock: 15,
    expiringSoon: 8,
    totalValue: 450000,
    totalPrescriptions: 45,
    activePrescriptions: 12,
    completedPrescriptions: 33,
    pendingDispensing: 5
  }

  return (
    <div className="space-y-6">
      {/* Header with Online Status */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pharmacy Dashboard</h1>
          <p className="text-gray-600">Medicine inventory and prescription management</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            {isOnline ? 'Online' : 'Offline'}
          </div>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Medicines</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalMedicines}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-3xl font-bold text-red-600">{stats.lowStock}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-3xl font-bold text-orange-600">{stats.expiringSoon}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-3xl font-bold text-green-600">₹{stats.totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common pharmacy operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/pharmacy/inventory">
              <Button className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                <Package className="h-5 w-5" />
                <span className="text-sm">Inventory</span>
              </Button>
            </Link>
            
            <Link href="/pharmacy/prescriptions">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                <FileText className="h-5 w-5" />
                <span className="text-sm">Prescriptions</span>
              </Button>
            </Link>
            
            <Link href="/pharmacy/vendors">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                <Building2 className="h-5 w-5" />
                <span className="text-sm">Vendors</span>
              </Button>
            </Link>
            
            <Link href="/pharmacy/reports">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                <BarChart3 className="h-5 w-5" />
                <span className="text-sm">Reports</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Stock Alerts</TabsTrigger>
          <TabsTrigger value="prescriptions">Recent Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Prescription Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Prescriptions</span>
                    <Badge>{stats.totalPrescriptions}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Active</span>
                    <Badge variant="secondary">{stats.activePrescriptions}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed</span>
                    <Badge variant="outline">{stats.completedPrescriptions}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Dispensing</span>
                    <Badge variant="destructive">{stats.pendingDispensing}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Items</span>
                    <span className="font-semibold">{stats.totalMedicines}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>In Stock</span>
                    <span className="font-semibold text-green-600">{stats.totalMedicines - stats.lowStock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Low Stock</span>
                    <span className="font-semibold text-red-600">{stats.lowStock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Value</span>
                    <span className="font-semibold">₹{stats.totalValue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <StockAlerts />
        </TabsContent>

        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Prescriptions</CardTitle>
              <CardDescription>Latest prescription activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">राम शर्मा</p>
                    <p className="text-sm text-gray-500">Prescription #RX-001</p>
                  </div>
                  <Badge>Pending</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">सीता देवी</p>
                    <p className="text-sm text-gray-500">Prescription #RX-002</p>
                  </div>
                  <Badge variant="secondary">Dispensed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
