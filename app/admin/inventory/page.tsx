"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  AlertTriangle,
  Pill,
  Truck,
  Calendar,
  TrendingDown,
  TrendingUp,
  ShoppingCart
} from 'lucide-react'

// Mock inventory data
const mockInventory = [
  {
    id: "MED001",
    name: "Amoxicillin 500mg",
    category: "Antibiotic",
    currentStock: 15,
    minRequired: 50,
    maxCapacity: 200,
    unitPrice: 12.50,
    totalValue: 187.50,
    expiryDate: "2024-06-15",
    supplier: "PharmaCorp Ltd",
    lastRestocked: "2024-01-05",
    status: "critical"
  },
  {
    id: "MED002",
    name: "Paracetamol 650mg",
    category: "Analgesic",
    currentStock: 145,
    minRequired: 100,
    maxCapacity: 300,
    unitPrice: 8.75,
    totalValue: 1268.75,
    expiryDate: "2024-08-20",
    supplier: "MediSupply Co",
    lastRestocked: "2024-01-08",
    status: "good"
  },
  {
    id: "MED003",
    name: "Insulin Glargine",
    category: "Diabetes",
    currentStock: 8,
    minRequired: 25,
    maxCapacity: 50,
    unitPrice: 450.00,
    totalValue: 3600.00,
    expiryDate: "2024-04-10",
    supplier: "DiabetesCare Inc",
    lastRestocked: "2024-01-03",
    status: "critical"
  },
  {
    id: "MED004",
    name: "Omeprazole 20mg",
    category: "Gastric",
    currentStock: 75,
    minRequired: 60,
    maxCapacity: 150,
    unitPrice: 15.25,
    totalValue: 1143.75,
    expiryDate: "2024-09-30",
    supplier: "GastroMed Ltd",
    lastRestocked: "2024-01-07",
    status: "low"
  }
]

// Mock vendor data
const mockVendors = [
  {
    id: "VEN001",
    name: "PharmaCorp Ltd",
    contact: "+91 98765 43210",
    email: "orders@pharmacorp.com",
    address: "123 Medical Street, Mumbai",
    rating: 4.8,
    totalOrders: 45,
    status: "active"
  },
  {
    id: "VEN002",
    name: "MediSupply Co",
    contact: "+91 87654 32109",
    email: "supply@medisupply.com",
    address: "456 Health Avenue, Delhi",
    rating: 4.6,
    totalOrders: 32,
    status: "active"
  }
]

export default function AdminInventoryPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-700">Critical</Badge>
      case 'low':
        return <Badge className="bg-yellow-100 text-yellow-700">Low Stock</Badge>
      case 'good':
        return <Badge className="bg-green-100 text-green-700">Good</Badge>
      case 'overstocked':
        return <Badge className="bg-blue-100 text-blue-700">Overstocked</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'good': return 'text-green-600 bg-green-50 border-green-200'
      case 'overstocked': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStockPercentage = (current: number, min: number, max: number) => {
    return (current / max) * 100
  }

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 90 // Expiring within 90 days
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Package className="h-8 w-8 mr-3 text-pink-500" />
              Inventory & Vendor Management
            </h1>
            <p className="text-gray-600 mt-2">Manage medicine inventory, stock levels, and vendor relationships</p>
          </div>
          <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Medicine
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
              <Package className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Stock</p>
                <p className="text-2xl font-bold text-red-600">23</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-yellow-600">15</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-green-600">₹2.4L</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-pink-100 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search medicines by name, category, or supplier..." 
                  className="pl-10 border-pink-200 focus:border-pink-400"
                />
              </div>
            </div>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Category
            </Button>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Critical Stock
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory List */}
      <Card className="border-pink-100 mb-6">
        <CardHeader>
          <CardTitle>Medicine Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockInventory.map((item) => (
              <div key={item.id} className={`p-4 rounded-lg border ${getStatusColor(item.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-lg h-16 w-16 flex items-center justify-center font-bold">
                      <Pill className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                        <Badge variant="outline">{item.id}</Badge>
                        <Badge className="bg-blue-100 text-blue-700">{item.category}</Badge>
                        {getStatusBadge(item.status)}
                        {isExpiringSoon(item.expiryDate) && (
                          <Badge className="bg-orange-100 text-orange-700">Expiring Soon</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Current Stock:</span>
                            <span className="font-semibold">{item.currentStock}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Min Required:</span>
                            <span className="font-semibold">{item.minRequired}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Max Capacity:</span>
                            <span className="font-semibold">{item.maxCapacity}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Unit Price:</span>
                            <span className="font-semibold">₹{item.unitPrice}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Value:</span>
                            <span className="font-semibold">₹{item.totalValue}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Supplier:</span>
                            <span className="font-semibold">{item.supplier}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Expiry Date:</span>
                            <span className={`font-semibold ${isExpiringSoon(item.expiryDate) ? 'text-orange-600' : ''}`}>
                              {new Date(item.expiryDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Last Restocked:</span>
                            <span className="font-semibold">{new Date(item.lastRestocked).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Stock Level</span>
                          <span>{item.currentStock}/{item.maxCapacity}</span>
                        </div>
                        <Progress 
                          value={getStockPercentage(item.currentStock, item.minRequired, item.maxCapacity)} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-green-200 text-green-600 hover:bg-green-50">
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vendor Management */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="h-5 w-5 mr-2 text-blue-500" />
            Vendor Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockVendors.map((vendor) => (
              <div key={vendor.id} className="p-4 border border-pink-100 rounded-lg hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg h-14 w-14 flex items-center justify-center font-bold">
                      <Truck className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{vendor.name}</h3>
                        <Badge variant="outline">{vendor.id}</Badge>
                        <Badge className="bg-green-100 text-green-700">{vendor.status}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium w-16">Contact:</span>
                            <span>{vendor.contact}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium w-16">Email:</span>
                            <span>{vendor.email}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium w-16">Rating:</span>
                            <span className="text-yellow-600 font-semibold">⭐ {vendor.rating}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium w-16">Orders:</span>
                            <span>{vendor.totalOrders} completed</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-500 mt-2">{vendor.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-pink-100 mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Plus className="h-6 w-6" />
              <span>Add Medicine</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <ShoppingCart className="h-6 w-6" />
              <span>Create Order</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Truck className="h-6 w-6" />
              <span>Manage Vendors</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <AlertTriangle className="h-6 w-6" />
              <span>Stock Alerts</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-pink-100 text-pink-700 rounded-full">
          <Package className="h-5 w-5 mr-2" />
          <span className="font-medium">Advanced Inventory Management Features Coming Soon</span>
        </div>
      </div>
    </div>
  )
}
