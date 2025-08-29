"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts'
import { 
  Package, AlertTriangle, TrendingUp, FileText, BarChart3, 
  RefreshCw, Loader2, DollarSign, Download
} from 'lucide-react'
import { usePharmacyStats, usePrescriptions, usePharmacyAlerts } from "@/hooks/usePharmacy"
import { toast } from "sonner"

export default function PharmacyDashboard() {
  const [activeTab, setActiveTab] = useState("analytics")

  const { 
    totalMedicines = 0,
    lowStock = 0,
    expiringSoon = 0,
    totalValue = 0,
    loading: statsLoading = true,
    error: statsError,
    refetch: refetchStats
  } = usePharmacyStats()

  const { 
    prescriptions = [],
    statistics = {
      total_prescriptions: 0,
      active_prescriptions: 0,
      completed_prescriptions: 0,
      pending_dispensing: 0
    },
    loading: prescriptionsLoading = true,
    error: prescriptionsError,
    refetch: refetchPrescriptions
  } = usePrescriptions({ 
    limit: 10,
    status: 'active'
  })

  const { 
    alerts = {
      lowStock: [],
      outOfStock: [],
      expiringSoon: [],
      expired: [],
      newPrescriptions: [],
      refillReminders: []
    }, 
    summary: alertSummary = {
      lowStockCount: 0,
      outOfStockCount: 0,
      expiringSoonCount: 0,
      expiredCount: 0,
      newPrescriptionsCount: 0,
      refillRemindersCount: 0,
      totalAlerts: 0
    }, 
    loading: alertsLoading = true, 
    error: alertsError,
    refetch: refetchAlerts
  } = usePharmacyAlerts()

  // Mock analytics data
  const analyticsData = {
    stockConsumption: {
      daily: [
        { date: '2024-01-01', consumed: 120, restocked: 200 },
        { date: '2024-01-02', consumed: 150, restocked: 100 },
        { date: '2024-01-03', consumed: 180, restocked: 300 },
        { date: '2024-01-04', consumed: 140, restocked: 150 },
        { date: '2024-01-05', consumed: 160, restocked: 250 },
      ]
    },
    fastSlowMoving: [
      { name: 'Paracetamol', type: 'Fast', sales: 450, category: 'Analgesic' },
      { name: 'Amoxicillin', type: 'Fast', sales: 320, category: 'Antibiotic' },
      { name: 'Vitamin D', type: 'Slow', sales: 45, category: 'Supplement' },
      { name: 'Insulin', type: 'Medium', sales: 180, category: 'Diabetes' },
    ],
    stockAging: [
      { ageGroup: '0-30 days', value: 45, color: '#10B981' },
      { ageGroup: '31-90 days', value: 30, color: '#F59E0B' },
      { ageGroup: '91-180 days', value: 15, color: '#EF4444' },
      { ageGroup: '180+ days', value: 10, color: '#6B7280' },
    ],
    profitAnalysis: [
      { medicine: 'Paracetamol', cost: 2.5, selling: 5.0, profit: 2.5, margin: 50 },
      { medicine: 'Amoxicillin', cost: 15.0, selling: 25.0, profit: 10.0, margin: 40 },
      { medicine: 'Vitamin D', cost: 8.0, selling: 12.0, profit: 4.0, margin: 33 },
    ],
    dailySales: {
      today: { total: 15420, transactions: 45, avgTransaction: 342 },
      yesterday: { total: 12800, transactions: 38, avgTransaction: 337 },
      growth: 20.4
    }
  }

  const refreshAllData = async () => {
    try {
      const promises = []
      if (refetchStats) promises.push(refetchStats())
      if (refetchPrescriptions) promises.push(refetchPrescriptions())
      if (refetchAlerts) promises.push(refetchAlerts())
      
      await Promise.all(promises)
      toast.success('Data refreshed successfully')
    } catch (error) {
      console.error('Error refreshing data:', error)
      toast.error('Failed to refresh data')
    }
  }

  return (
    <main className="w-full min-h-screen p-6">
      {/* Quick Stats */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Sales</p>
                <p className="text-3xl font-bold text-green-600">₹{analyticsData.dailySales.today.total.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +{analyticsData.dailySales.growth}%
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-400 to-green-500 p-3 rounded-xl">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Medicines</p>
                <p className="text-3xl font-bold text-gray-900">{totalMedicines.toLocaleString()}</p>
                <p className="text-sm text-gray-600">In inventory</p>
              </div>
              <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-3 rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Prescriptions</p>
                <p className="text-3xl font-bold text-blue-600">{statistics.active_prescriptions}</p>
                <p className="text-sm text-blue-600">{statistics.pending_dispensing} pending</p>
              </div>
              <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-3 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-3xl font-bold text-red-600">{alertSummary.totalAlerts}</p>
                <p className="text-sm text-red-600">Require attention</p>
              </div>
              <div className="bg-gradient-to-r from-red-400 to-red-500 p-3 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="w-full grid grid-cols-2 bg-pink-50 border border-pink-100">
          <TabsTrigger value="analytics">Analytics & Reports</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Notifications</TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="w-full space-y-6">
          {/* Stock Consumption Trends */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Stock Consumption Trends</CardTitle>
              <CardDescription>Daily consumption patterns</CardDescription>
            </CardHeader>
            <CardContent className="w-full">
              <div className="w-full h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.stockConsumption.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="consumed" stroke="#EF4444" name="Consumed" />
                    <Line type="monotone" dataKey="restocked" stroke="#10B981" name="Restocked" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="w-full grid lg:grid-cols-2 gap-6">
            {/* Fast vs Slow Moving */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Fast-moving vs Slow-moving Medicines</CardTitle>
                <CardDescription>Medicine performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.fastSlowMoving.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={
                          item.type === 'Fast' ? 'bg-green-100 text-green-700' :
                          item.type === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }>
                          {item.type}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">{item.sales} units</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Daily Sales Summary */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Daily Sales Summary</CardTitle>
                <CardDescription>Today's sales performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">₹{analyticsData.dailySales.today.total.toLocaleString()}</p>
                    <p className="text-gray-600">Total Sales Today</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{analyticsData.dailySales.today.transactions}</p>
                      <p className="text-sm text-blue-600">Transactions</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">₹{analyticsData.dailySales.today.avgTransaction}</p>
                      <p className="text-sm text-purple-600">Avg Transaction</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">+{analyticsData.dailySales.growth}% vs yesterday</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="w-full space-y-6">
          <div className="w-full grid lg:grid-cols-2 gap-6">
            {/* Low Stock & Expiry Alerts */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  Stock & Expiry Alerts
                </CardTitle>
                <CardDescription>Low stock and near-expiry warnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-red-600 mb-2">Low Stock Alerts ({alertSummary.lowStockCount})</h4>
                    <div className="space-y-2">
                      {alerts.lowStock?.slice(0, 3).map((item: any, index: number) => (
                        <div key={index} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">{item.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-red-600">{item.current_stock} left</p>
                              <p className="text-xs text-gray-500">Min: {item.minimum_stock}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prescription & Refill Alerts */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-500 mr-2" />
                  Prescription & Refill Alerts
                </CardTitle>
                <CardDescription>New prescriptions and refill reminders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-blue-600 mb-2">New Prescriptions Received ({alertSummary.newPrescriptionsCount})</h4>
                    <div className="space-y-2">
                      {alerts.newPrescriptions?.slice(0, 3).map((item: any, index: number) => (
                        <div key={index} className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{item.prescription_id}</p>
                              <p className="text-sm text-gray-600">{item.patient_name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-blue-600">{item.doctor_name}</p>
                              <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="w-full border-pink-100 mt-6">
        <CardHeader>
          <CardTitle className="text-gray-900">Quick Actions</CardTitle>
          <CardDescription>Common pharmacy operations</CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/pharmacy/inventory">
              <Button className="w-full h-20 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-xl flex flex-col items-center justify-center space-y-2">
                <Package className="h-6 w-6" />
                <span className="text-sm">Inventory</span>
              </Button>
            </Link>
            
            <Link href="/pharmacy/prescriptions">
              <Button variant="outline" className="w-full h-20 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl flex flex-col items-center justify-center space-y-2">
                <FileText className="h-6 w-6" />
                <span className="text-sm">Prescriptions</span>
              </Button>
            </Link>
            
            <Link href="/pharmacy/reports">
              <Button variant="outline" className="w-full h-20 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl flex flex-col items-center justify-center space-y-2">
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">Reports</span>
              </Button>
            </Link>
            
            <Button variant="outline" className="w-full h-20 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl flex flex-col items-center justify-center space-y-2">
              <Download className="h-6 w-6" />
              <span className="text-sm">Export Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
