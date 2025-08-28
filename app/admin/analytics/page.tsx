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
  RefreshCw,
  Users,
  DollarSign,
  Activity,
} from 'lucide-react'

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="h-7 w-7 md:h-8 md:w-8 mr-2 text-pink-500" />
              Branch Analytics
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              Operational insights and performance metrics for your branch
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 w-full sm:w-auto">
              <Calendar className="h-4 w-4 mr-2" />
              This Month
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
        <Badge className="bg-green-100 text-green-700 px-4 py-2 w-full sm:w-auto justify-center sm:justify-start">
          <RefreshCw className="h-4 w-4 mr-2" />
          Last updated: 2 minutes ago
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {/* Daily Patients */}
        <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base md:text-lg">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              Daily Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm md:text-base">
              <div className="flex justify-between">
                <span className="text-gray-600">Today</span>
                <span className="font-semibold text-xl md:text-2xl">45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Yesterday</span>
                <span className="font-semibold">38</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Growth</span>
                <span className="font-semibold text-green-600">+18.4%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments */}
        <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base md:text-lg">
              <Calendar className="h-5 w-5 mr-2 text-green-500" />
              Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm md:text-base">
              <div className="flex justify-between">
                <span className="text-gray-600">Scheduled</span>
                <span className="font-semibold text-xl md:text-2xl">52</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold">38</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-semibold text-green-600">73%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base md:text-lg">
              <DollarSign className="h-5 w-5 mr-2 text-purple-500" />
              Daily Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm md:text-base">
              <div className="flex justify-between">
                <span className="text-gray-600">Today</span>
                <span className="font-semibold text-xl md:text-2xl">₹15,420</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Target</span>
                <span className="font-semibold">₹18,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Achievement</span>
                <span className="font-semibold text-yellow-600">85.7%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff Efficiency */}
        <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base md:text-lg">
              <Activity className="h-5 w-5 mr-2 text-orange-500" />
              Staff Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm md:text-base">
              <div className="flex justify-between">
                <span className="text-gray-600">On Duty</span>
                <span className="font-semibold text-xl md:text-2xl">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg. Utilization</span>
                <span className="font-semibold">87%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Performance</span>
                <span className="font-semibold text-green-600">Excellent</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
        {/* Patient Trends */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle>Patient Trends (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 md:h-64 bg-gradient-to-br from-pink-50 to-blue-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <LineChart className="h-12 w-12 md:h-16 md:w-16 text-pink-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm md:text-base">Patient trend chart will be implemented here</p>
                <p className="text-xs md:text-sm text-gray-400 mt-2">Daily patient registration patterns</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 md:h-64 bg-gradient-to-br from-green-50 to-purple-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 md:h-16 md:w-16 text-green-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm md:text-base">Department performance chart will be implemented here</p>
                <p className="text-xs md:text-sm text-gray-400 mt-2">Patient load by department</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        {/* Staff Performance */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle>Staff Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg text-sm md:text-base">
                <span className="font-medium">Doctors</span>
                <span className="text-green-600 font-bold">92%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg text-sm md:text-base">
                <span className="font-medium">Nurses</span>
                <span className="text-blue-600 font-bold">88%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg text-sm md:text-base">
                <span className="font-medium">Support Staff</span>
                <span className="text-purple-600 font-bold">85%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Analytics */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle>Appointment Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg text-sm md:text-base">
                <span className="font-medium">Completed</span>
                <span className="text-green-600 font-bold">38</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg text-sm md:text-base">
                <span className="font-medium">Pending</span>
                <span className="text-yellow-600 font-bold">14</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg text-sm md:text-base">
                <span className="font-medium">Cancelled</span>
                <span className="text-red-600 font-bold">3</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg text-sm md:text-base">
                <span className="font-medium">Consultations</span>
                <span className="text-blue-600 font-bold">₹8,500</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg text-sm md:text-base">
                <span className="font-medium">Procedures</span>
                <span className="text-green-600 font-bold">₹4,200</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg text-sm md:text-base">
                <span className="font-medium">Pharmacy</span>
                <span className="text-purple-600 font-bold">₹2,720</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Insights */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle>Operational Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 text-sm md:text-base">Key Achievements</h4>
              <ul className="text-xs md:text-sm text-green-700 mt-2 space-y-1">
                <li>• Patient satisfaction increased by 15%</li>
                <li>• Average wait time reduced to 18 minutes</li>
                <li>• Staff efficiency improved by 12%</li>
                <li>• Revenue target achieved 85.7%</li>
              </ul>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800 text-sm md:text-base">Areas for Improvement</h4>
              <ul className="text-xs md:text-sm text-yellow-700 mt-2 space-y-1">
                <li>• Reduce appointment cancellations</li>
                <li>• Optimize doctor schedules</li>
                <li>• Improve inventory turnover</li>
                <li>• Enhance staff training programs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="mt-8 text-center">
        <div className="inline-flex flex-wrap items-center px-4 py-2 md:px-6 md:py-3 bg-pink-100 text-pink-700 rounded-full text-sm md:text-base">
          <TrendingUp className="h-4 w-4 md:h-5 md:w-5 mr-2" />
          <span className="font-medium">Advanced Analytics Features Coming Soon</span>
        </div>
      </div>
    </div>
  )
}
