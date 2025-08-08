"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Package, AlertTriangle, TrendingUp, Search, Plus, Pill, FileText, BarChart3, Bell, Filter, Download } from 'lucide-react'

// Mock data
const inventoryStats = {
  totalMedicines: 1247,
  lowStock: 23,
  expiringSoon: 8,
  totalValue: 125000
}

const recentPrescriptions = [
  {
    id: "RX001",
    patientName: "Sarah Johnson",
    doctor: "Dr. Smith",
    medicines: ["Amoxicillin 500mg", "Paracetamol 650mg"],
    status: "pending",
    date: "2024-01-15",
    priority: "high"
  },
  {
    id: "RX002",
    patientName: "Michael Brown",
    doctor: "Dr. Davis",
    medicines: ["Metformin 500mg", "Lisinopril 10mg"],
    status: "fulfilled",
    date: "2024-01-15",
    priority: "normal"
  },
  {
    id: "RX003",
    patientName: "Emily Wilson",
    doctor: "Dr. Johnson",
    medicines: ["Ibuprofen 400mg"],
    status: "pending",
    date: "2024-01-14",
    priority: "normal"
  }
]

const lowStockItems = [
  { name: "Amoxicillin 500mg", currentStock: 15, minStock: 50, category: "Antibiotic" },
  { name: "Insulin Glargine", currentStock: 8, minStock: 25, category: "Diabetes" },
  { name: "Salbutamol Inhaler", currentStock: 12, minStock: 30, category: "Respiratory" },
  { name: "Paracetamol 650mg", currentStock: 45, minStock: 100, category: "Analgesic" }
]

export default function PharmacyDashboard() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-2 rounded-xl">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-800">आरोग्य अस्पताल</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Pill className="h-5 w-5 text-pink-500" />
                <span className="text-lg font-semibold text-gray-700">Pharmacy</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-600 cursor-pointer hover:text-pink-500 transition-colors" />
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {lowStockItems.length}
                </div>
              </div>
              <div className="h-8 w-8 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">JP</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pharmacy Dashboard</h1>
          <p className="text-gray-600">Manage inventory, prescriptions, and pharmacy operations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Medicines</p>
                  <p className="text-3xl font-bold text-gray-900">{inventoryStats.totalMedicines}</p>
                </div>
                <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-3 rounded-xl">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                  <p className="text-3xl font-bold text-red-600">{inventoryStats.lowStock}</p>
                </div>
                <div className="bg-red-500 p-3 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                  <p className="text-3xl font-bold text-orange-600">{inventoryStats.expiringSoon}</p>
                </div>
                <div className="bg-orange-500 p-3 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-3xl font-bold text-green-600">₹{inventoryStats.totalValue.toLocaleString()}</p>
                </div>
                <div className="bg-green-500 p-3 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-4 bg-pink-50 border border-pink-100">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-pink-600">
                Overview
              </TabsTrigger>
              <TabsTrigger value="inventory" className="data-[state=active]:bg-white data-[state=active]:text-pink-600">
                Inventory
              </TabsTrigger>
              <TabsTrigger value="prescriptions" className="data-[state=active]:bg-white data-[state=active]:text-pink-600">
                Prescriptions
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-white data-[state=active]:text-pink-600">
                Reports
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search medicines, prescriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl w-64"
                />
              </div>
              <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Prescriptions */}
              <Card className="border-pink-100">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">Recent Prescriptions</CardTitle>
                    <CardDescription>Latest prescription requests</CardDescription>
                  </div>
                  <Link href="/pharmacy/prescriptions">
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentPrescriptions.map((prescription) => (
                      <div key={prescription.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-gray-900">{prescription.id}</span>
                            <Badge 
                              variant={prescription.priority === "high" ? "destructive" : "secondary"}
                              className={prescription.priority === "high" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}
                            >
                              {prescription.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{prescription.patientName} • {prescription.doctor}</p>
                          <p className="text-xs text-gray-500">{prescription.medicines.join(", ")}</p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={prescription.status === "fulfilled" ? "default" : "secondary"}
                            className={prescription.status === "fulfilled" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}
                          >
                            {prescription.status}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{prescription.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Low Stock Alert */}
              <Card className="border-pink-100">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900 flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      Low Stock Alert
                    </CardTitle>
                    <CardDescription>Items requiring immediate attention</CardDescription>
                  </div>
                  <Link href="/pharmacy/inventory">
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      Manage Stock
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lowStockItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-red-600">
                            {item.currentStock} / {item.minStock}
                          </p>
                          <p className="text-xs text-gray-500">Current / Min</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="text-gray-900">Quick Actions</CardTitle>
                <CardDescription>Common pharmacy operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/pharmacy/inventory/add">
                    <Button className="w-full h-20 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-xl flex flex-col items-center justify-center space-y-2">
                      <Plus className="h-6 w-6" />
                      <span>Add Medicine</span>
                    </Button>
                  </Link>
                  
                  <Link href="/pharmacy/prescriptions">
                    <Button variant="outline" className="w-full h-20 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl flex flex-col items-center justify-center space-y-2">
                      <FileText className="h-6 w-6" />
                      <span>View Prescriptions</span>
                    </Button>
                  </Link>
                  
                  <Link href="/pharmacy/reports">
                    <Button variant="outline" className="w-full h-20 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl flex flex-col items-center justify-center space-y-2">
                      <BarChart3 className="h-6 w-6" />
                      <span>Generate Report</span>
                    </Button>
                  </Link>
                  
                  <Button variant="outline" className="w-full h-20 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl flex flex-col items-center justify-center space-y-2">
                    <Download className="h-6 w-6" />
                    <span>Export Data</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Inventory Management</h3>
              <p className="text-gray-600 mb-6">Detailed inventory management will be available here</p>
              <Link href="/pharmacy/inventory">
                <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-xl">
                  Go to Inventory
                </Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="prescriptions">
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Prescription Management</h3>
              <p className="text-gray-600 mb-6">Detailed prescription management will be available here</p>
              <Link href="/pharmacy/prescriptions">
                <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-xl">
                  Go to Prescriptions
                </Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports & Analytics</h3>
              <p className="text-gray-600 mb-6">Detailed reports and analytics will be available here</p>
              <Link href="/pharmacy/reports">
                <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-xl">
                  Go to Reports
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
