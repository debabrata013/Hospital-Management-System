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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="h-8 w-8 mr-3 text-pink-500" />
              Reports & Analytics
            </h1>
            <p className="text-gray-600 mt-2">Generate and view operational reports (no financial master reports)</p>
          </div>
          <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600">
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">30</p>
              </div>
              <FileText className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Generated Today</p>
                <p className="text-2xl font-bold text-green-600">5</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Downloads</p>
                <p className="text-2xl font-bold text-blue-600">156</p>
              </div>
              <Download className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-purple-600">8</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Categories */}
      <Card className="border-pink-100 mb-6">
        <CardHeader>
          <CardTitle>Report Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {reportCategories.map((category) => (
              <div key={category.name} className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.count} reports</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card className="border-pink-100 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search reports by title, category, or date..." 
                  className="pl-10 border-pink-200 focus:border-pink-400"
                />
              </div>
            </div>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Category
            </Button>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockReports.map((report) => (
              <div key={report.id} className="p-4 border border-pink-100 rounded-lg hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-lg h-16 w-16 flex items-center justify-center font-bold">
                      <FileText className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{report.title}</h3>
                        <Badge variant="outline">{report.id}</Badge>
                        <Badge className="bg-blue-100 text-blue-700">{report.category}</Badge>
                        {getStatusBadge(report.status)}
                        {getFormatBadge(report.format)}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2 text-pink-500" />
                            <span>Generated: {new Date(report.generatedDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium w-20">By:</span>
                            <span>{report.generatedBy}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium w-20">Size:</span>
                            <span>{report.fileSize}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Download className="h-4 w-4 mr-2 text-pink-500" />
                            <span>{report.downloadCount} downloads</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
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
      <Card className="border-pink-100 mt-6">
        <CardHeader>
          <CardTitle>Quick Report Generation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Users className="h-6 w-6" />
              <span>Patient Report</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Activity className="h-6 w-6" />
              <span>Operational Report</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Package className="h-6 w-6" />
              <span>Inventory Report</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Clock className="h-6 w-6" />
              <span>Staff Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Financial Reports Notice */}
      <Card className="border-yellow-100 bg-yellow-50 mt-6">
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-800">
            <DollarSign className="h-5 w-5 mr-2" />
            Financial Reports Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-yellow-700">
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
      <div className="mt-8 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-pink-100 text-pink-700 rounded-full">
          <FileText className="h-5 w-5 mr-2" />
          <span className="font-medium">Advanced Reporting Features Coming Soon</span>
        </div>
      </div>
    </div>
  )
}
