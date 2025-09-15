"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  TrendingUp, 
  Download,
  Calendar,
  Filter,
  RefreshCw,
  CreditCard,
  Banknote,
  DollarSign
} from 'lucide-react'

interface BillingAnalytics {
  cashCollection: number
  onlineCollection: number
  totalCollection: number
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<BillingAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchBillingAnalytics()
  }, [selectedDate])

  const fetchBillingAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/super-admin/billing-analytics?date=${selectedDate}`)
      
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

  const exportReport = () => {
    if (!analytics) {
      alert('No data to export')
      return
    }

    const csvContent = [
      ['Hospital Billing Report'],
      [`Date: ${selectedDate}`],
      [`Generated: ${new Date().toLocaleString()}`],
      [''],
      ['Cash Collection', analytics.cashCollection],
      ['Online Collection', analytics.onlineCollection],
      ['Total Collection', analytics.totalCollection]
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `billing-report-${selectedDate}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
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
              Daily billing collections
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
            <Button 
              className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600"
              onClick={exportReport}
              disabled={!analytics}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <Card className="mb-6 border-pink-100">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <Label htmlFor="selectedDate">Select Date</Label>
              <Input
                id="selectedDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Button 
              onClick={fetchBillingAnalytics}
              disabled={loading}
              className="bg-pink-500 hover:bg-pink-600"
            >
              <Filter className="h-4 w-4 mr-2" />
              Load Data
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
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-pink-500" />
            Billing Collections - {new Date(selectedDate).toLocaleDateString()}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="border-green-100 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cash Collection</p>
                    <p className="text-3xl font-bold text-green-700">{formatCurrency(analytics.cashCollection)}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-400 to-green-500 p-3 rounded-xl">
                    <Banknote className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Online Collection</p>
                    <p className="text-3xl font-bold text-blue-700">{formatCurrency(analytics.onlineCollection)}</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-3 rounded-xl">
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-100 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Collection</p>
                    <p className="text-3xl font-bold text-purple-700">{formatCurrency(analytics.totalCollection)}</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-3 rounded-xl">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
