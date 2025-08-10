"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  LineChart,
  Download,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="h-8 w-8 mr-3 text-pink-500" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Comprehensive system analytics and insights</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </Button>
            <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <Badge className="bg-green-100 text-green-700 px-4 py-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Last updated: 5 minutes ago
        </Badge>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
              Revenue Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monthly Revenue</span>
                <span className="font-semibold">₹2,45,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Growth Rate</span>
                <span className="font-semibold text-green-600">+12.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg. per Patient</span>
                <span className="font-semibold">₹1,850</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <PieChart className="h-5 w-5 mr-2 text-green-500" />
              Patient Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">New Patients</span>
                <span className="font-semibold">156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Return Patients</span>
                <span className="font-semibold">324</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Satisfaction Rate</span>
                <span className="font-semibold text-green-600">94.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <LineChart className="h-5 w-5 mr-2 text-purple-500" />
              Operational Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg. Wait Time</span>
                <span className="font-semibold">18 mins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Bed Occupancy</span>
                <span className="font-semibold">78%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Staff Efficiency</span>
                <span className="font-semibold text-green-600">91.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Placeholder 1 */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-pink-50 to-blue-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-pink-300 mx-auto mb-4" />
                <p className="text-gray-500">Revenue Chart will be implemented here</p>
                <p className="text-sm text-gray-400 mt-2">Interactive charts with Recharts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart Placeholder 2 */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle>Patient Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-green-50 to-purple-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <PieChart className="h-16 w-16 text-green-300 mx-auto mb-4" />
                <p className="text-gray-500">Demographics Chart will be implemented here</p>
                <p className="text-sm text-gray-400 mt-2">Age groups, gender distribution, etc.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart Placeholder 3 */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-blue-50 to-pink-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <LineChart className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                <p className="text-gray-500">Performance Chart will be implemented here</p>
                <p className="text-sm text-gray-400 mt-2">Department-wise metrics and KPIs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle>Analytics Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800">Key Insights</h4>
                <ul className="text-sm text-green-700 mt-2 space-y-1">
                  <li>• Revenue increased by 12.5% this month</li>
                  <li>• Patient satisfaction at all-time high</li>
                  <li>• Operational efficiency improved</li>
                </ul>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800">Areas for Improvement</h4>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                  <li>• Reduce average wait time</li>
                  <li>• Optimize bed utilization</li>
                  <li>• Enhance staff training programs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Notice */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-pink-100 text-pink-700 rounded-full">
          <TrendingUp className="h-5 w-5 mr-2" />
          <span className="font-medium">Advanced Analytics Features Coming Soon</span>
        </div>
      </div>
    </div>
  )
}
