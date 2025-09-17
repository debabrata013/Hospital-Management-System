"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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
import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts'

type DailyReg = { date: string; count: number }
type DeptLoad = { department: string; count: number }
type DeptPerf = { department: string; completed: number; scheduled: number; total: number }

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [daily, setDaily] = useState<DailyReg[]>([])
  const [deptLoad, setDeptLoad] = useState<DeptLoad[]>([])
  const [deptPerf, setDeptPerf] = useState<DeptPerf[]>([])
  const [kpis, setKpis] = useState<any>(null)
  const SHOW_OPERATIONAL_METRICS = false

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/admin/analytics?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
        if (!res.ok) throw new Error('Failed to fetch analytics')
        const data = await res.json()
        setDaily(data.dailyRegistrations || [])
        setDeptLoad(data.departmentLoad || [])
        setDeptPerf(data.departmentPerformance || [])

        const k = await fetch('/api/admin/analytics/kpis')
        if (k.ok) setKpis(await k.json())
      } catch (e: any) {
        setError(e.message || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [dateRange])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
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
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="border rounded-md px-2 py-1 text-sm"
                value={dateRange.startDate}
                onChange={(e) => setDateRange((r) => ({ ...r, startDate: e.target.value }))}
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                className="border rounded-md px-2 py-1 text-sm"
                value={dateRange.endDate}
                onChange={(e) => setDateRange((r) => ({ ...r, endDate: e.target.value }))}
              />
            </div>
            {/* Export button removed as requested */}
          </div>
        </div>
      </div>

      {/* KPI Widgets */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle>Daily Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 text-center">
                <div>
                  <div className="text-xs text-gray-500">Today</div>
                  <div className="text-xl font-bold">{kpis.dailyPatients.today}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Yesterday</div>
                  <div className="text-xl font-bold">{kpis.dailyPatients.yesterday}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Growth</div>
                  <div className="text-xl font-bold text-green-600">{kpis.dailyPatients.growthPercent}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 text-center">
                <div>
                  <div className="text-xs text-gray-500">Scheduled</div>
                  <div className="text-xl font-bold">{kpis.appointments.scheduled}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Completed</div>
                  <div className="text-xl font-bold">{kpis.appointments.completed}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Success</div>
                  <div className="text-xl font-bold text-blue-600">{kpis.appointments.successRate}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle>Daily Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 text-center">
                <div>
                  <div className="text-xs text-gray-500">Today</div>
                  <div className="text-xl font-bold">₹{Number(kpis.revenue.today).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Target</div>
                  <div className="text-xl font-bold">₹{Number(kpis.revenue.target).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Achievement</div>
                  <div className="text-xl font-bold text-purple-600">{kpis.revenue.achievement}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle>Staff Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 text-center">
                <div>
                  <div className="text-xs text-gray-500">On Duty</div>
                  <div className="text-xl font-bold">{kpis.staff.onDuty}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Avg. Utilization</div>
                  <div className="text-xl font-bold text-emerald-600">{kpis.staff.avgUtilization}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Performance</div>
                  <div className="text-sm font-semibold">{kpis.staff.performance}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Status Badge */}
      <div className="mb-6">
        <Badge className="bg-green-100 text-green-700 px-4 py-2 w-full sm:w-auto justify-center sm:justify-start">
          <RefreshCw className="h-4 w-4 mr-2" />
          Last updated: 2 minutes ago
        </Badge>
      </div>

      

      {/* Error/Loading */}
      {error && (
        <div className="mb-6 p-3 border border-red-200 bg-red-50 text-red-700 rounded">{error}</div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
        {/* Patient Trends */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle>Patient Trends (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={daily} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" name="Registrations" stroke="#ec4899" strokeWidth={2} dot={false} />
                </ReLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptPerf} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" tick={{ fontSize: 12 }} interval={0} angle={-15} height={60} textAnchor="end" />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" name="Completed" fill="#10b981" />
                  <Bar dataKey="scheduled" name="Scheduled" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient load by department */}
      <div className="mb-8">
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle>Patient Load by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptLoad} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" tick={{ fontSize: 12 }} interval={0} angle={-15} height={60} textAnchor="end" />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Patients" fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Metrics */}
      {SHOW_OPERATIONAL_METRICS && (
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
      )}

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
