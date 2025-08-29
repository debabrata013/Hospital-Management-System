"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Package, AlertTriangle, Search, Plus, RefreshCw, 
  Calendar, TrendingDown, Clock, Truck
} from 'lucide-react'
import { useMedicines, useStock } from "@/hooks/usePharmacy"
import { toast } from "sonner"

export default function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("stock-levels")

  const { 
    medicines, 
    loading, 
    error,
    refetch
  } = useMedicines({
    search: searchTerm,
    sortBy: "name",
    sortOrder: "ASC"
  })

  const {
    stockData,
    loading: stockLoading,
    error: stockError,
    refetch: refetchStock
  } = useStock()

  const refreshData = async () => {
    const promises = [refetch()]
    if (refetchStock) promises.push(refetchStock())
    await Promise.all(promises)
    toast.success('Data refreshed')
  }

  const getStockStatus = (current: number, minimum: number) => {
    if (current === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-700" }
    if (current <= minimum) return { label: "Low Stock", color: "bg-orange-100 text-orange-700" }
    if (current <= minimum * 2) return { label: "Medium", color: "bg-yellow-100 text-yellow-700" }
    return { label: "Good", color: "bg-green-100 text-green-700" }
  }

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysToExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysToExpiry < 0) return { label: "Expired", color: "bg-red-100 text-red-700" }
    if (daysToExpiry <= 30) return { label: "Expiring Soon", color: "bg-orange-100 text-orange-700" }
    if (daysToExpiry <= 90) return { label: "Expiring Later", color: "bg-yellow-100 text-yellow-700" }
    return { label: "Good", color: "bg-green-100 text-green-700" }
  }

  const needsReorder = (current: number, minimum: number) => current <= minimum

  return (
    <main className="w-full min-h-screen p-6">
      {/* Search */}
      <div className="w-full mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-pink-200 focus:border-pink-400"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="w-full grid grid-cols-2 lg:grid-cols-4 bg-pink-50 border border-pink-100">
          <TabsTrigger value="stock-levels">Real-time Stock</TabsTrigger>
          <TabsTrigger value="batch-tracking">Batch & Expiry</TabsTrigger>
          <TabsTrigger value="reorder-alerts">Auto Reorder</TabsTrigger>
          <TabsTrigger value="stock-logs">Stock Logs</TabsTrigger>
        </TabsList>

        {/* Real-time Stock Levels */}
        <TabsContent value="stock-levels" className="w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Real-time Stock Levels</CardTitle>
              <CardDescription>Current stock status of all medicines</CardDescription>
            </CardHeader>
            <CardContent className="w-full">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Min Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Unit Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicines?.map((medicine) => {
                      const stockStatus = getStockStatus(medicine.current_stock, medicine.minimum_stock)
                      return (
                        <TableRow key={medicine.id}>
                          <TableCell className="font-medium">{medicine.name}</TableCell>
                          <TableCell>{medicine.category}</TableCell>
                          <TableCell>{medicine.current_stock}</TableCell>
                          <TableCell>{medicine.minimum_stock}</TableCell>
                          <TableCell>
                            <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                          </TableCell>
                          <TableCell>₹{medicine.unit_price}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Batch Tracking & Expiry */}
        <TabsContent value="batch-tracking">
          <Card>
            <CardHeader>
              <CardTitle>Batch Number Tracking & Expiry Alerts</CardTitle>
              <CardDescription>Monitor batch numbers and expiry dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine Name</TableHead>
                      <TableHead>Batch Number</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Expiry Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicines?.filter(m => m.batch_number && m.expiry_date).map((medicine) => {
                      const expiryStatus = getExpiryStatus(medicine.expiry_date!)
                      return (
                        <TableRow key={medicine.id}>
                          <TableCell className="font-medium">{medicine.name}</TableCell>
                          <TableCell>{medicine.batch_number}</TableCell>
                          <TableCell>{new Date(medicine.expiry_date!).toLocaleDateString()}</TableCell>
                          <TableCell>{medicine.current_stock}</TableCell>
                          <TableCell>
                            <Badge className={expiryStatus.color}>{expiryStatus.label}</Badge>
                          </TableCell>
                          <TableCell>
                            {expiryStatus.label === "Expired" || expiryStatus.label === "Expiring Soon" ? (
                              <Button size="sm" variant="outline" className="text-red-600">
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Alert
                              </Button>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auto Reorder */}
        <TabsContent value="reorder-alerts">
          <Card>
            <CardHeader>
              <CardTitle>Automated Reordering</CardTitle>
              <CardDescription>Medicines requiring reorder based on thresholds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine Name</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Min Threshold</TableHead>
                      <TableHead>Suggested Order</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicines?.filter(m => needsReorder(m.current_stock, m.minimum_stock)).map((medicine) => {
                      const suggestedOrder = medicine.maximum_stock - medicine.current_stock
                      return (
                        <TableRow key={medicine.id}>
                          <TableCell className="font-medium">{medicine.name}</TableCell>
                          <TableCell className="text-red-600">{medicine.current_stock}</TableCell>
                          <TableCell>{medicine.minimum_stock}</TableCell>
                          <TableCell className="font-semibold">{suggestedOrder}</TableCell>
                          <TableCell>{medicine.supplier || "Not specified"}</TableCell>
                          <TableCell>
                            <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
                              <Truck className="h-4 w-4 mr-1" />
                              Reorder
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Logs */}
        <TabsContent value="stock-logs">
          <Card>
            <CardHeader>
              <CardTitle>Stock Inward/Outward Logs</CardTitle>
              <CardDescription>Track all stock movements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stockData?.recent_transactions?.map((log: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${log.type === 'inward' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {log.type === 'inward' ? (
                          <TrendingDown className="h-4 w-4 text-green-600 rotate-180" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{log.medicine_name}</p>
                        <p className="text-sm text-gray-600">{log.type === 'inward' ? 'Stock In' : 'Stock Out'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{log.quantity} units</p>
                      <p className="text-sm text-gray-500">{new Date(log.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No stock movements recorded</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
