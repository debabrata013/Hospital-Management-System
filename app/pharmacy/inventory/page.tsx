"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Heart, Package, AlertTriangle, Search, Plus, Filter, Download, 
  RefreshCw, Edit, Trash2, Eye, ArrowUpDown, ChevronLeft, ChevronRight,
  Pill, Calendar, DollarSign, TrendingDown, TrendingUp
} from 'lucide-react'
import { useMedicines, useStock } from "@/hooks/usePharmacy"
import { toast } from "sonner"

export default function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [stockFilter, setStockFilter] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC")
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  // API hooks
  const { 
    medicines, 
    pagination, 
    loading, 
    error,
    refetch,
    deleteMedicine
  } = useMedicines({
    page: currentPage,
    limit: 20,
    search: searchTerm,
    category: selectedCategory,
    lowStock: stockFilter === 'low',
    expiringSoon: stockFilter === 'expiring',
    sortBy,
    sortOrder
  })

  const {
    stockData,
    loading: stockLoading,
    refetch: refetchStock
  } = useStock()

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  // Handle filter changes
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? "" : value)
    setCurrentPage(1)
  }

  const handleStockFilterChange = (value: string) => {
    setStockFilter(value === "all" ? "" : value)
    setCurrentPage(1)
  }

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC")
    } else {
      setSortBy(field)
      setSortOrder("ASC")
    }
    setCurrentPage(1)
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle delete medicine
  const handleDeleteMedicine = async (medicineId: string, medicineName: string) => {
    if (confirm(`Are you sure you want to delete ${medicineName}?`)) {
      try {
        await deleteMedicine(medicineId)
        toast.success('Medicine deleted successfully')
      } catch (error) {
        console.error('Error deleting medicine:', error)
      }
    }
  }

  // Refresh all data
  const refreshData = async () => {
    try {
      await Promise.all([refetch(), refetchStock()])
      toast.success('Data refreshed successfully')
    } catch (error) {
      toast.error('Failed to refresh data')
    }
  }

  // Get stock status color
  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'good': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  // Get expiry status color
  const getExpiryStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return 'bg-red-100 text-red-700 border-red-200'
      case 'expiring_soon': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'expiring_later': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'good': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  // Get unique categories for filter
  const categories = Array.from(new Set(medicines.map(m => m.category).filter(Boolean)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/pharmacy" className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-2 rounded-xl">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-800">आरोग्य अस्पताल</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-pink-500" />
                <span className="text-lg font-semibold text-gray-700">Inventory</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshData}
                disabled={loading || stockLoading}
                className="text-gray-600 hover:text-pink-500"
              >
                <RefreshCw className={`h-4 w-4 ${(loading || stockLoading) ? 'animate-spin' : ''}`} />
              </Button>
              <Link href="/pharmacy/inventory/add">
                <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medicine
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
          <p className="text-gray-600">Manage medicine inventory, stock levels, and expiry dates</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-pink-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Medicines</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stockLoading ? '...' : stockData.overview.total_medicines.toLocaleString()}
                  </p>
                </div>
                <Package className="h-8 w-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stockLoading ? '...' : stockData.overview.low_stock_count}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stockLoading ? '...' : stockData.overview.expiring_soon_count}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{stockLoading ? '...' : stockData.overview.total_stock_value.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-pink-100 mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-gray-900">Medicine Inventory</CardTitle>
                <CardDescription>
                  {pagination.total} medicines • Page {pagination.page} of {pagination.totalPages}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search medicines..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 border-pink-200 focus:border-pink-400 focus:ring-pink-400 w-64"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-pink-200 text-pink-600 hover:bg-pink-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Filter Controls */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-pink-100">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                  <Select value={selectedCategory || "all"} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="border-pink-200">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Stock Status</label>
                  <Select value={stockFilter || "all"} onValueChange={handleStockFilterChange}>
                    <SelectTrigger className="border-pink-200">
                      <SelectValue placeholder="All Stock Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stock Levels</SelectItem>
                      <SelectItem value="low">Low Stock</SelectItem>
                      <SelectItem value="expiring">Expiring Soon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={(value) => handleSort(value)}>
                    <SelectTrigger className="border-pink-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="current_stock">Stock Level</SelectItem>
                      <SelectItem value="expiry_date">Expiry Date</SelectItem>
                      <SelectItem value="unit_price">Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {/* Medicine Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Medicine</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('current_stock')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Stock</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('unit_price')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Price</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('expiry_date')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Expiry</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 10 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                      </TableRow>
                    ))
                  ) : medicines.length > 0 ? (
                    medicines.map((medicine) => (
                      <TableRow key={medicine.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{medicine.name}</p>
                            <p className="text-sm text-gray-500">
                              {medicine.generic_name && `${medicine.generic_name} • `}
                              {medicine.strength} {medicine.dosage_form}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-gray-200">
                            {medicine.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{medicine.current_stock}</p>
                            <p className="text-xs text-gray-500">Min: {medicine.minimum_stock}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">₹{medicine.unit_price}</p>
                            <p className="text-xs text-gray-500">MRP: ₹{medicine.mrp}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {medicine.expiry_date ? (
                            <p className="text-sm">
                              {new Date(medicine.expiry_date).toLocaleDateString()}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400">Not set</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge 
                              variant="outline" 
                              className={getStockStatusColor(medicine.stock_status || 'good')}
                            >
                              {medicine.stock_status || 'good'}
                            </Badge>
                            {medicine.expiry_status && medicine.expiry_status !== 'good' && (
                              <Badge 
                                variant="outline" 
                                className={getExpiryStatusColor(medicine.expiry_status)}
                              >
                                {medicine.expiry_status.replace('_', ' ')}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Link href={`/pharmacy/inventory/${medicine.medicine_id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/pharmacy/inventory/${medicine.medicine_id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteMedicine(medicine.medicine_id, medicine.name)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-3">
                          <Pill className="h-12 w-12 text-gray-400" />
                          <p className="text-gray-500">No medicines found</p>
                          <Link href="/pharmacy/inventory/add">
                            <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white">
                              <Plus className="h-4 w-4 mr-2" />
                              Add First Medicine
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} medicines
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="border-pink-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={page === pagination.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={page === pagination.page 
                          ? "bg-pink-500 hover:bg-pink-600" 
                          : "border-pink-200 text-pink-600 hover:bg-pink-50"
                        }
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="border-pink-200"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
