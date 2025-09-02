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
              Comprehensive system analytics and insights
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 w-full sm:w-auto">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </Button>
            <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <Badge className="bg-green-100 text-green-700 px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base">
          <RefreshCw className="h-4 w-4 mr-2" />
          Last updated: 5 minutes ago
        </Badge>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
              Revenue Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm sm:text-base">
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Revenue</span>
                <span className="font-semibold">₹2,45,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Growth Rate</span>
                <span className="font-semibold text-green-600">+12.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg. per Patient</span>
                <span className="font-semibold">₹1,850</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <PieChart className="h-5 w-5 mr-2 text-green-500" />
              Patient Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm sm:text-base">
              <div className="flex justify-between">
                <span className="text-gray-600">New Patients</span>
                <span className="font-semibold">156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Return Patients</span>
                <span className="font-semibold">324</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Satisfaction Rate</span>
                <span className="font-semibold text-green-600">94.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <LineChart className="h-5 w-5 mr-2 text-purple-500" />
              Operational Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm sm:text-base">
              <div className="flex justify-between">
                <span className="text-gray-600">Avg. Wait Time</span>
                <span className="font-semibold">18 mins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bed Occupancy</span>
                <span className="font-semibold">78%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Staff Efficiency</span>
                <span className="font-semibold text-green-600">91.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Chart Placeholder 1 */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 sm:h-64 bg-gradient-to-br from-pink-50 to-blue-50 rounded-lg flex items-center justify-center">
              <div className="text-center px-4">
                <BarChart3 className="h-12 w-12 sm:h-16 sm:w-16 text-pink-300 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">Revenue Chart will be implemented here</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">Interactive charts with Recharts</p>
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
            <div className="h-56 sm:h-64 bg-gradient-to-br from-green-50 to-purple-50 rounded-lg flex items-center justify-center">
              <div className="text-center px-4">
                <PieChart className="h-12 w-12 sm:h-16 sm:w-16 text-green-300 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">Demographics Chart will be implemented here</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">Age groups, gender distribution, etc.</p>
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
            <div className="h-56 sm:h-64 bg-gradient-to-br from-blue-50 to-pink-50 rounded-lg flex items-center justify-center">
              <div className="text-center px-4">
                <LineChart className="h-12 w-12 sm:h-16 sm:w-16 text-blue-300 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">Performance Chart will be implemented here</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">Department-wise metrics and KPIs</p>
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
            <div className="space-y-4 text-sm sm:text-base">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800">Key Insights</h4>
                <ul className="mt-2 space-y-1 text-green-700">
                  <li>• Revenue increased by 12.5% this month</li>
                  <li>• Patient satisfaction at all-time high</li>
                  <li>• Operational efficiency improved</li>
                </ul>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800">Areas for Improvement</h4>
                <ul className="mt-2 space-y-1 text-yellow-700">
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
        <div className="inline-flex flex-wrap items-center px-4 sm:px-6 py-2 sm:py-3 bg-pink-100 text-pink-700 rounded-full text-sm sm:text-base">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          <span className="font-medium">Advanced Analytics Features Coming Soon</span>
        </div>
      </div>
    </div>
  )
}
