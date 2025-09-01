"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, Download, FileText, TrendingUp, 
  Calendar, Filter, Printer, Eye
} from 'lucide-react'
import { toast } from "sonner"

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("today")
  const [reportType, setReportType] = useState("sales")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const handleGenerateReport = () => {
    toast.success("Report generated successfully")
  }

  const handleExportReport = (format: string) => {
    toast.success(`Report exported as ${format.toUpperCase()}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pharmacy Reports</h1>
          <p className="text-gray-600">Generate and analyze pharmacy performance reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExportReport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Configure report parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Report</SelectItem>
                  <SelectItem value="inventory">Inventory Report</SelectItem>
                  <SelectItem value="prescriptions">Prescription Report</SelectItem>
                  <SelectItem value="vendors">Vendor Report</SelectItem>
                  <SelectItem value="expiry">Expiry Report</SelectItem>
                  <SelectItem value="stock-movement">Stock Movement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="last-week">Last Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === "custom" && (
              <>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="flex justify-end mt-4">
            <Button onClick={handleGenerateReport}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          <TabsTrigger value="charts">Charts & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid gap-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Sales</p>
                      <p className="text-3xl font-bold text-green-600">₹45,230</p>
                      <p className="text-sm text-green-600">+12% from last period</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Prescriptions</p>
                      <p className="text-3xl font-bold text-blue-600">156</p>
                      <p className="text-sm text-blue-600">+8% from last period</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Items Sold</p>
                      <p className="text-3xl font-bold text-purple-600">1,234</p>
                      <p className="text-sm text-purple-600">+15% from last period</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Sale Value</p>
                      <p className="text-3xl font-bold text-orange-600">₹290</p>
                      <p className="text-sm text-orange-600">-2% from last period</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Selling Medicines */}
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Medicines</CardTitle>
                <CardDescription>Best performing medicines in selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Paracetamol 500mg", quantity: 245, revenue: "₹12,250", growth: "+15%" },
                    { name: "Amoxicillin 250mg", quantity: 189, revenue: "₹9,450", growth: "+8%" },
                    { name: "Omeprazole 20mg", quantity: 156, revenue: "₹7,800", growth: "+22%" },
                    { name: "Metformin 500mg", quantity: 134, revenue: "₹6,700", growth: "+5%" },
                    { name: "Atorvastatin 10mg", quantity: 98, revenue: "₹4,900", growth: "-3%" }
                  ].map((medicine, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{medicine.name}</h4>
                        <p className="text-sm text-gray-600">Quantity sold: {medicine.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{medicine.revenue}</p>
                        <p className={`text-sm ${medicine.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {medicine.growth}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detailed">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Report</CardTitle>
              <CardDescription>Complete transaction details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-6 gap-4 p-3 bg-gray-50 font-medium text-sm">
                    <div>Date</div>
                    <div>Prescription ID</div>
                    <div>Patient</div>
                    <div>Items</div>
                    <div>Amount</div>
                    <div>Status</div>
                  </div>
                  {[
                    { date: "2024-01-15", id: "RX001", patient: "John Doe", items: 3, amount: "₹450", status: "Completed" },
                    { date: "2024-01-15", id: "RX002", patient: "Jane Smith", items: 2, amount: "₹320", status: "Completed" },
                    { date: "2024-01-15", id: "RX003", patient: "Bob Johnson", items: 5, amount: "₹780", status: "Completed" },
                    { date: "2024-01-14", id: "RX004", patient: "Alice Brown", items: 1, amount: "₹150", status: "Completed" },
                    { date: "2024-01-14", id: "RX005", patient: "Charlie Wilson", items: 4, amount: "₹620", status: "Completed" }
                  ].map((transaction, index) => (
                    <div key={index} className="grid grid-cols-6 gap-4 p-3 border-t text-sm">
                      <div>{transaction.date}</div>
                      <div className="font-medium">{transaction.id}</div>
                      <div>{transaction.patient}</div>
                      <div>{transaction.items}</div>
                      <div className="font-semibold">{transaction.amount}</div>
                      <div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Daily sales performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Sales chart will be displayed here</p>
                    <p className="text-sm">Integration with charting library required</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>Sales by medicine category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                      <p>Pie chart placeholder</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stock Levels</CardTitle>
                  <CardDescription>Current inventory status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                      <p>Stock chart placeholder</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
