"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Heart, ArrowLeft, Search, Plus, Edit, Trash2, Package, AlertTriangle, Filter, Download, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock inventory data
const inventoryData = [
  {
    id: "MED001",
    name: "Amoxicillin 500mg",
    category: "Antibiotic",
    manufacturer: "Cipla Ltd",
    batchNumber: "AMX2024001",
    expiryDate: "2025-06-15",
    currentStock: 15,
    minStock: 50,
    maxStock: 200,
    unitPrice: 25.50,
    location: "A-1-01",
    status: "low_stock"
  },
  {
    id: "MED002",
    name: "Paracetamol 650mg",
    category: "Analgesic",
    manufacturer: "Sun Pharma",
    batchNumber: "PCM2024002",
    expiryDate: "2025-12-20",
    currentStock: 45,
    minStock: 100,
    maxStock: 500,
    unitPrice: 8.75,
    location: "B-2-03",
    status: "low_stock"
  },
  {
    id: "MED003",
    name: "Metformin 500mg",
    category: "Diabetes",
    manufacturer: "Dr. Reddy's",
    batchNumber: "MET2024003",
    expiryDate: "2025-09-10",
    currentStock: 150,
    minStock: 75,
    maxStock: 300,
    unitPrice: 12.25,
    location: "C-1-05",
    status: "in_stock"
  },
  {
    id: "MED004",
    name: "Lisinopril 10mg",
    category: "Cardiovascular",
    manufacturer: "Lupin Ltd",
    batchNumber: "LIS2024004",
    expiryDate: "2024-03-15",
    currentStock: 80,
    minStock: 50,
    maxStock: 200,
    unitPrice: 35.00,
    location: "D-3-02",
    status: "expiring_soon"
  },
  {
    id: "MED005",
    name: "Insulin Glargine",
    category: "Diabetes",
    manufacturer: "Biocon Ltd",
    batchNumber: "INS2024005",
    expiryDate: "2025-08-30",
    currentStock: 8,
    minStock: 25,
    maxStock: 100,
    unitPrice: 450.00,
    location: "E-1-01",
    status: "critical_low"
  }
]

const categories = ["All Categories", "Antibiotic", "Analgesic", "Diabetes", "Cardiovascular", "Respiratory"]
const statusOptions = ["All Status", "in_stock", "low_stock", "critical_low", "expiring_soon", "out_of_stock"]

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedStatus, setSelectedStatus] = useState("All Status")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_stock":
        return <Badge className="bg-green-100 text-green-700">In Stock</Badge>
      case "low_stock":
        return <Badge className="bg-yellow-100 text-yellow-700">Low Stock</Badge>
      case "critical_low":
        return <Badge className="bg-red-100 text-red-700">Critical Low</Badge>
      case "expiring_soon":
        return <Badge className="bg-orange-100 text-orange-700">Expiring Soon</Badge>
      case "out_of_stock":
        return <Badge className="bg-gray-100 text-gray-700">Out of Stock</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const filteredData = inventoryData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All Categories" || item.category === selectedCategory
    const matchesStatus = selectedStatus === "All Status" || item.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/pharmacy" className="flex items-center space-x-2 text-gray-600 hover:text-pink-500 transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Pharmacy</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-pink-500" />
                <span className="text-lg font-semibold text-gray-700">Inventory Management</span>
              </div>
            </div>
            
            <Link href="/pharmacy/inventory/add">
              <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title and Stats */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medicine Inventory</h1>
          <p className="text-gray-600 mb-6">Manage your pharmacy's medicine stock and inventory</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-pink-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900">{inventoryData.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-pink-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-pink-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Low Stock</p>
                    <p className="text-2xl font-bold text-red-600">
                      {inventoryData.filter(item => item.status === "low_stock" || item.status === "critical_low").length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-pink-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Expiring Soon</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {inventoryData.filter(item => item.status === "expiring_soon").length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-pink-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{inventoryData.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0).toLocaleString()}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="border-pink-100 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search medicines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48 border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-48 border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
                <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="text-gray-900">Medicine Inventory ({filteredData.length} items)</CardTitle>
            <CardDescription>Complete list of medicines in your pharmacy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-pink-50">
                      <TableCell>
                        <div>
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.manufacturer}</p>
                          <p className="text-xs text-gray-400">Batch: {item.batchNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-pink-200 text-pink-700">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{item.currentStock}</p>
                          <p className="text-xs text-gray-500">Min: {item.minStock} | Max: {item.maxStock}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(item.status)}
                      </TableCell>
                      <TableCell>
                        <p className={`text-sm ${new Date(item.expiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                          {new Date(item.expiryDate).toLocaleDateString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-gray-900">₹{item.unitPrice}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600">{item.location}</p>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Package className="h-4 w-4 mr-2" />
                              Update Stock
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
