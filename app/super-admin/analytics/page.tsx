"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  LineChart,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  CreditCard,
  Banknote,
  DollarSign,
  TrendingDown
} from 'lucide-react'
import { LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts'

interface BillingAnalytics {
  totalCashCollection: number
  totalOnlineCollection: number
  totalCollection: number
  dailyCollections: Array<{
    date: string
    cash: number
    online: number
    total: number
  }>
  monthlyTrend: Array<{
    month: string
    cash: number
    online: number
  }>
  paymentMethodBreakdown: Array<{
    method: string
    amount: number
    percentage: number
  }>
}

const COLORS = ['#ec4899', '#10b981', '#3b82f6', '#f59e0b']

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<BillingAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchBillingAnalytics()
  }, [dateRange])

  const fetchBillingAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/super-admin/billing-analytics?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to fetch billing analytics:', error)
      // Show error message to user
      alert('Failed to load billing analytics. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="h-7 w-7 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-pink-500" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Comprehensive billing analytics and financial insights
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
              onClick={fetchBillingAnalytics}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className="mb-6 border-pink-100">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-40"
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-40"
              />
            </div>
            <Button 
              onClick={fetchBillingAnalytics}
              disabled={loading}
              className="bg-pink-500 hover:bg-pink-600"
            >
              Apply Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-pink-500" />
          <p>Loading analytics...</p>
        </div>
      ) : analytics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Collection</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalCollection)}</p>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +12.5% from last period
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-3 rounded-xl">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cash Collection</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalCashCollection)}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {((analytics.totalCashCollection / analytics.totalCollection) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-green-400 to-green-500 p-3 rounded-xl">
                    <Banknote className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Online Collection</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalOnlineCollection)}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {((analytics.totalOnlineCollection / analytics.totalCollection) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-3 rounded-xl">
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Daily Average</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(analytics.dailyCollections.reduce((sum, day) => sum + day.total, 0) / analytics.dailyCollections.length)}
                    </p>
                    <p className="text-sm text-blue-600 flex items-center mt-1">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Last 7 days average
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-3 rounded-xl">
                    <LineChart className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Daily Collections Trend */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle>Daily Collections Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.dailyCollections}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Area type="monotone" dataKey="cash" stackId="1" stroke="#10b981" fill="#10b981" name="Cash" />
                      <Area type="monotone" dataKey="online" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Online" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Breakdown */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle>Payment Method Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={analytics.paymentMethodBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ method, percentage }) => `${method} (${percentage}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {analytics.paymentMethodBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trend */}
          <Card className="border-pink-100 mb-8">
            <CardHeader>
              <CardTitle>Monthly Collection Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="cash" fill="#10b981" name="Cash Collection" />
                    <Bar dataKey="online" fill="#3b82f6" name="Online Collection" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Breakdown Table */}
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle>Daily Collection Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-right p-2">Cash Collection</th>
                      <th className="text-right p-2">Online Collection</th>
                      <th className="text-right p-2">Total Collection</th>
                      <th className="text-right p-2">Cash %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.dailyCollections.map((day, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">{new Date(day.date).toLocaleDateString()}</td>
                        <td className="text-right p-2">{formatCurrency(day.cash)}</td>
                        <td className="text-right p-2">{formatCurrency(day.online)}</td>
                        <td className="text-right p-2 font-semibold">{formatCurrency(day.total)}</td>
                        <td className="text-right p-2">{((day.cash / day.total) * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
