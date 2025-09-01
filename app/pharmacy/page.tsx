"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Package, AlertTriangle, TrendingUp, FileText, BarChart3, 
  RefreshCw, DollarSign, Building2, Loader2, Receipt
} from 'lucide-react'
import { usePharmacyStats, usePrescriptions, useStockAlerts } from "@/hooks/usePharmacy"
import { toast } from "sonner"

export default function PharmacyDashboard() {
  const [activeTab, setActiveTab] = useState("analytics")

  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = usePharmacyStats()
  const { prescriptions, loading: prescriptionsLoading, refetch: refetchPrescriptions } = usePrescriptions({ limit: 5 })
  const { alerts, loading: alertsLoading, refetch: refetchAlerts } = useStockAlerts()

  const refreshAllData = async () => {
    try {
      await Promise.all([refetchStats(), refetchPrescriptions(), refetchAlerts()])
      toast.success('Data refreshed successfully')
    } catch (error) {
      toast.error('Failed to refresh data')
    }
  }

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading pharmacy dashboard...</p>
        </div>
      </div>
    )
  }

  if (statsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Error loading dashboard: {statsError}</p>
          <Button onClick={refetchStats} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pharmacy Dashboard</h1>
          <p className="text-gray-600">Medicine inventory and prescription management</p>
        </div>
        <Button onClick={refreshAllData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Medicines</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalMedicines || 0}</p>
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
                <p className="text-3xl font-bold text-red-600">{stats?.lowStock || 0}</p>
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
                <p className="text-3xl font-bold text-orange-600">{stats?.expiringSoon || 0}</p>
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
                <p className="text-3xl font-bold text-green-600">₹{(stats?.totalValue || 0).toLocaleString()}</p>
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
            
            <Link href="/pharmacy/billing">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                <Receipt className="h-5 w-5" />
                <span className="text-sm">Billing</span>
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
                    <Badge>{stats?.totalPrescriptions || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Active</span>
                    <Badge variant="secondary">{stats?.activePrescriptions || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed</span>
                    <Badge variant="outline">{stats?.completedPrescriptions || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Dispensing</span>
                    <Badge variant="destructive">{stats?.pendingDispensing || 0}</Badge>
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
                    <span className="font-semibold">{stats?.totalMedicines || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>In Stock</span>
                    <span className="font-semibold text-green-600">{(stats?.totalMedicines || 0) - (stats?.lowStock || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Low Stock</span>
                    <span className="font-semibold text-red-600">{stats?.lowStock || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Value</span>
                    <span className="font-semibold">₹{(stats?.totalValue || 0).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Stock Alerts
              </CardTitle>
              <CardDescription>Medicines requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts?.map((alert: any) => (
                    <div key={alert.id} className={`p-3 rounded-lg border ${
                      alert.alert_type === 'out_of_stock' ? 'bg-red-50 border-red-200' :
                      alert.alert_type === 'low_stock' ? 'bg-yellow-50 border-yellow-200' :
                      alert.alert_type === 'expiring' ? 'bg-orange-50 border-orange-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{alert.name}</p>
                          <p className="text-sm opacity-75">
                            {alert.batch_number && `Batch: ${alert.batch_number}`}
                            {alert.expiry_date && ` • Expires: ${new Date(alert.expiry_date).toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{alert.current_stock}/{alert.minimum_stock}</p>
                          <p className="text-xs opacity-75">Current/Min</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!alerts || alerts.length === 0) && (
                    <p className="text-center text-gray-500 py-8">No alerts at this time</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Prescriptions</CardTitle>
              <CardDescription>Latest prescription activities</CardDescription>
            </CardHeader>
            <CardContent>
              {prescriptionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {prescriptions?.map((prescription: any) => (
                    <div key={prescription.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{prescription.patient_name}</p>
                        <p className="text-sm text-gray-500">
                          {prescription.prescription_number} • Dr. {prescription.doctor_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {prescription.item_count} items • ₹{Number(prescription.calculated_total || 0).toFixed(2)}
                        </p>
                      </div>
                      <Badge variant={
                        prescription.status === 'dispensed' ? 'default' :
                        prescription.status === 'pending' ? 'destructive' :
                        'secondary'
                      }>
                        {prescription.status}
                      </Badge>
                    </div>
                  ))}
                  {(!prescriptions || prescriptions.length === 0) && (
                    <p className="text-center text-gray-500 py-8">No prescriptions found</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
