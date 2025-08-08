"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Package, 
  FileText, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Settings,
  Download,
  Upload,
  MessageSquare,
  Shield,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'

interface KPIData {
  dailyStats: {
    patientsToday: number
    appointmentsToday: number
    revenueToday: number
    reportsCount: number
  }
  overallStats: {
    totalPatients: number
    totalAppointments: number
    pendingBills: number
    lowStockMedicines: number
  }
  inventoryStatus: {
    total: number
    lowStock: number
    outOfStock: number
    status: 'good' | 'warning' | 'critical'
  }
  appointmentBreakdown: Record<string, number>
  trends: {
    weeklyPatients: Array<{ _id: string; count: number }>
    weeklyRevenue: Array<{ _id: string; revenue: number }>
  }
}

export default function SuperAdminDashboard() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchKPIData()
  }, [])

  const fetchKPIData = async () => {
    try {
      const response = await fetch('/api/admin/kpis')
      if (response.ok) {
        const result = await response.json()
        setKpiData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch KPI data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const getInventoryStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'critical': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600">Arogya Hospital - Hospital Management System</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Activity className="h-4 w-4 mr-1" />
                System Online
              </Badge>
              <Button variant="outline" onClick={fetchKPIData}>
                <Activity className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Patients Today */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patients Today</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {kpiData?.dailyStats.patientsToday || 0}
              </div>
              <p className="text-xs text-gray-600">
                Total: {kpiData?.overallStats.totalPatients || 0}
              </p>
            </CardContent>
          </Card>

          {/* Appointments Today */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {kpiData?.dailyStats.appointmentsToday || 0}
              </div>
              <p className="text-xs text-gray-600">
                This month: {kpiData?.overallStats.totalAppointments || 0}
              </p>
            </CardContent>
          </Card>

          {/* Revenue Today */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(kpiData?.dailyStats.revenueToday || 0)}
              </div>
              <p className="text-xs text-gray-600">
                Pending bills: {kpiData?.overallStats.pendingBills || 0}
              </p>
            </CardContent>
          </Card>

          {/* Inventory Status */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory</CardTitle>
              <Package className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-orange-600">
                  {kpiData?.inventoryStatus.total || 0}
                </div>
                <Badge 
                  className={getInventoryStatusColor(kpiData?.inventoryStatus.status || 'good')}
                >
                  {kpiData?.inventoryStatus.status || 'Good'}
                </Badge>
              </div>
              <p className="text-xs text-gray-600">
                Low stock: {kpiData?.inventoryStatus.lowStock || 0} | 
                Out of stock: {kpiData?.inventoryStatus.outOfStock || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="discounts">Discounts</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
            <TabsTrigger value="ai">AI Review</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Appointment Status Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Today's Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(kpiData?.appointmentBreakdown || {}).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center">
                        <span className="capitalize text-sm">{status.replace('-', ' ')}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Reports
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Backup Database
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Internal Messages
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Weekly Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Patient Registration Trend */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Patient Registrations</h4>
                    <div className="space-y-2">
                      {kpiData?.trends.weeklyPatients.map((day, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{new Date(day._id).toLocaleDateString()}</span>
                          <span className="font-medium">{day.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Revenue Trend */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Daily Revenue</h4>
                    <div className="space-y-2">
                      {kpiData?.trends.weeklyRevenue.map((day, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{new Date(day._id).toLocaleDateString()}</span>
                          <span className="font-medium">{formatCurrency(day.revenue)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs will be implemented in subsequent components */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">User management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discounts">
            <Card>
              <CardHeader>
                <CardTitle>Discount Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Discount approval interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add other tab contents as needed */}
        </Tabs>
      </div>
    </div>
  )
}
