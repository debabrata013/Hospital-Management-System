"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Package, AlertTriangle, Search, Plus, RefreshCw, 
  Calendar, TrendingDown, Clock, Truck, Loader2
} from 'lucide-react'
import { useMedicines } from "@/hooks/usePharmacy"
import { toast } from "sonner"
import Link from "next/link"

export default function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  
  const { medicines, loading, error, refetch } = useMedicines({
    search: searchTerm || undefined
  })

  const refreshData = async () => {
    try {
      await refetch()
      toast.success('Inventory data refreshed')
    } catch (error) {
      toast.error('Failed to refresh data')
    }
  }

  const getStockStatus = (current: number, minimum: number) => {
    if (current === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-700" }
    if (current <= minimum) return { label: "Low Stock", color: "bg-orange-100 text-orange-700" }
    if (current <= minimum * 2) return { label: "Medium", color: "bg-yellow-100 text-yellow-700" }
    return { label: "Good", color: "bg-green-100 text-green-700" }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading inventory...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Error loading inventory: {error}</p>
          <Button onClick={refetch} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-gray-600">Manage medicine stock and inventory</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/pharmacy/inventory/add">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Medicine
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Medicine Inventory</CardTitle>
              <CardDescription>Current stock levels and medicine details</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Batches</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicines?.map((medicine: any) => {
                const status = getStockStatus(medicine.current_stock, medicine.minimum_stock)
                return (
                  <TableRow key={medicine.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{medicine.name}</p>
                        {medicine.generic_name && (
                          <p className="text-sm text-gray-500">{medicine.generic_name}</p>
                        )}
                        {medicine.manufacturer && (
                          <p className="text-xs text-gray-400">{medicine.manufacturer}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{medicine.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{medicine.current_stock} {medicine.unit}</p>
                        <p className="text-xs text-gray-500">Min: {medicine.minimum_stock}</p>
                      </div>
                    </TableCell>
                    <TableCell>₹{Number(medicine.unit_price || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={status.color}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{medicine.batch_count || 0}</span>
                        {medicine.expiring_stock > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {medicine.expiring_stock} expiring
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          View Batches
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {(!medicines || medicines.length === 0) && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No medicines found</p>
              {searchTerm && (
                <p className="text-sm text-gray-400">Try adjusting your search terms</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-xl font-bold">{medicines?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-xl font-bold">
                  {medicines?.filter((m: any) => m.current_stock <= m.minimum_stock).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-xl font-bold">
                  {medicines?.filter((m: any) => m.expiring_stock > 0).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-xl font-bold">
                  {medicines?.filter((m: any) => m.current_stock === 0).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
