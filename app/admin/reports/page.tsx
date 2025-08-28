"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  FileText, 
  Download, 
  Search, 
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Activity,
  Clock,
  Eye,
  Printer
} from 'lucide-react'

// Mock reports data
const mockReports = [
  {
    id: "RPT001",
    title: "Daily Patient Report",
    description: "Summary of patient registrations, appointments, and treatments",
    category: "Patient Reports",
    generatedDate: "2024-01-09",
    generatedBy: "System Auto",
    fileSize: "2.4 MB",
    format: "PDF",
    status: "ready",
    downloadCount: 15
  },
  {
    id: "RPT002",
    title: "Weekly Appointment Summary",
    description: "Appointment statistics, completion rates, and doctor performance",
    category: "Operational Reports",
    generatedDate: "2024-01-08",
    generatedBy: "Admin Sarah",
    fileSize: "1.8 MB",
    format: "Excel",
    status: "ready",
    downloadCount: 8
  },
  {
    id: "RPT003",
    title: "Medicine Inventory Report",
    description: "Stock levels, expiry alerts, and vendor performance",
    category: "Inventory Reports",
    generatedDate: "2024-01-09",
    generatedBy: "System Auto",
    fileSize: "3.2 MB",
    format: "PDF",
    status: "generating",
    downloadCount: 0
  },
  {
    id: "RPT004",
    title: "Staff Attendance Report",
    description: "Staff duty hours, attendance patterns, and shift coverage",
    category: "HR Reports",
    generatedDate: "2024-01-07",
    generatedBy: "Admin Sarah",
    fileSize: "1.5 MB",
    format: "Excel",
    status: "ready",
    downloadCount: 12
  }
]

const reportCategories = [
  {
    name: "Patient Reports",
    count: 8,
    icon: Users,
    color: "bg-blue-100 text-blue-700"
  },
  {
    name: "Operational Reports",
    count: 12,
    icon: Activity,
    color: "bg-green-100 text-green-700"
  },
  {
    name: "Inventory Reports",
    count: 6,
    icon: Package,
    color: "bg-purple-100 text-purple-700"
  },
  {
    name: "HR Reports",
    count: 4,
    icon: Clock,
    color: "bg-orange-100 text-orange-700"
  }
]

export default function AdminReportsPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-100 text-green-700">Ready</Badge>
      case 'generating':
        return <Badge className="bg-yellow-100 text-yellow-700">Generating</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-700">Failed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getFormatBadge = (format: string) => {
    const colors = {
      'PDF': 'bg-red-100 text-red-700',
      'Excel': 'bg-green-100 text-green-700',
      'CSV': 'bg-blue-100 text-blue-700'
    }
    
    return <Badge className={colors[format as keyof typeof colors] || 'bg-gray-100 text-gray-700'}>{format}</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center flex-wrap">
              <FileText className="h-8 w-8 mr-2 md:mr-3 text-pink-500" />
              Reports & Analytics
            </h1>
            <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">
              Generate and view operational reports (no financial master reports)
            </p>
          </div>
          <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 flex-shrink-0">
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {[
          { title: "Total Reports", value: "30", icon: FileText, color: "text-pink-500" },
          { title: "Generated Today", value: "5", icon: TrendingUp, color: "text-green-500", valueColor: "text-green-600" },
          { title: "Downloads", value: "156", icon: Download, color: "text-blue-500", valueColor: "text-blue-600" },
          { title: "Scheduled", value: "8", icon: Clock, color: "text-purple-500", valueColor: "text-purple-600" }
        ].map((stat, idx) => (
          <Card key={idx} className="border-pink-100">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-xl md:text-2xl font-bold ${stat.valueColor || 'text-gray-900'}`}>{stat.value}</p>
                </div>
                <stat.icon className={`h-6 md:h-8 w-6 md:w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Categories */}
      <Card className="border-pink-100 mb-4 md:mb-6">
        <CardHeader>
          <CardTitle>Report Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {reportCategories.map((category) => (
              <div key={category.name} className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-3">
                <div className={`p-2 rounded-lg ${category.color} flex items-center justify-center`}>
                  <category.icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{category.name}</h4>
                  <p className="text-sm text-gray-600">{category.count} reports</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card className="border-pink-100 mb-4 md:mb-6">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search reports by title, category, or date..." 
                className="pl-10 border-pink-200 focus:border-pink-400 w-full"
              />
            </div>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 flex-shrink-0">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Category
            </Button>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 flex-shrink-0">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card className="border-pink-100 mb-4 md:mb-6">
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockReports.map((report) => (
              <div key={report.id} className="p-4 border border-pink-100 rounded-lg hover:shadow-md transition-all duration-200 flex flex-col md:flex-row gap-4 md:gap-6">
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-lg h-16 w-16 flex items-center justify-center font-bold">
                    <FileText className="h-8 w-8" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col md:flex-row justify-between gap-4 md:gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg text-gray-900">{report.title}</h3>
                      <Badge variant="outline">{report.id}</Badge>
                      <Badge className="bg-blue-100 text-blue-700">{report.category}</Badge>
                      {getStatusBadge(report.status)}
                      {getFormatBadge(report.format)}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-pink-500" />
                          <span>Generated: {new Date(report.generatedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium w-20">By:</span>
                          <span>{report.generatedBy}</span>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="font-medium w-20">Size:</span>
                          <span>{report.fileSize}</span>
                        </div>
                        <div className="flex items-center">
                          <Download className="h-4 w-4 mr-2 text-pink-500" />
                          <span>{report.downloadCount} downloads</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap md:flex-col">
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {report.status === 'ready' && (
                      <>
                        <Button variant="outline" size="sm" className="border-green-200 text-green-600 hover:bg-green-50">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                          <Printer className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Report Generation */}
      <Card className="border-pink-100 mb-4 md:mb-6">
        <CardHeader>
          <CardTitle>Quick Report Generation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4">
            {[
              { icon: Users, label: "Patient Report" },
              { icon: Activity, label: "Operational Report" },
              { icon: Package, label: "Inventory Report" },
              { icon: Clock, label: "Staff Report" }
            ].map((report, idx) => (
              <Button key={idx} variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-1">
                <report.icon className="h-5 w-5 md:h-6 md:w-6" />
                <span className="text-xs md:text-sm text-center">{report.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financial Reports Notice */}
      <Card className="border-yellow-100 bg-yellow-50 mb-4 md:mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-800">
            <DollarSign className="h-5 w-5 mr-2" />
            Financial Reports Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-yellow-700 text-sm md:text-base">
            <p className="mb-2">
              <strong>Note:</strong> As a Branch Admin, you have access to operational reports relevant to daily operations.
            </p>
            <p>
              <strong>Financial Master Reports:</strong> Comprehensive financial reports and master data analysis are available only to Super Admin users for security and compliance reasons.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="mt-6 md:mt-8 text-center">
        <div className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 bg-pink-100 text-pink-700 rounded-full">
          <FileText className="h-5 w-5 mr-2" />
          <span className="font-medium text-sm md:text-base">Advanced Reporting Features Coming Soon</span>
        </div>
      </div>
    </div>
  )
}
