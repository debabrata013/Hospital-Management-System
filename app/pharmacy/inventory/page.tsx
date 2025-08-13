"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Heart, 
  Package, 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Loader2,
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { useMedicines, useInventory } from "@/hooks/usePharmacy"
import { toast } from "sonner"

export default function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null)
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false)
  const [isStockMovementOpen, setIsStockMovementOpen] = useState(false)
  const [page, setPage] = useState(1)

  // Form states
  const [batchForm, setBatchForm] = useState({
    batchNo: '',
    quantity: '',
    expiryDate: '',
    costPrice: '',
    sellingPrice: '',
    mrp: ''
  })

  const [stockMovementForm, setStockMovementForm] = useState({
    movementType: '',
    quantity: '',
    batchNo: '',
    reason: '',
    notes: ''
  })

  // API hooks
  const { 
    medicines, 
    pagination, 
    loading: medicinesLoading, 
    error: medicinesError,
    refetch: refetchMedicines 
  } = useMedicines({
    page,
    limit: 20,
    search: searchTerm,
    ...(categoryFilter !== "all" && { category: categoryFilter }),
    ...(stockFilter !== "all" && { stockStatus: stockFilter })
  })

  const { 
    loading: inventoryLoading, 
    error: inventoryError,
    addBatch,
    recordStockMovement 
  } = useInventory()

  // Categories for filter
  const categories = [
    'Analgesic', 'Antibiotic', 'Antiviral', 'Antifungal', 'Antihistamine',
    'Antacid', 'Antidiabetic', 'Antihypertensive', 'Cardiac', 'Respiratory',
    'Neurological', 'Psychiatric', 'Dermatological', 'Ophthalmological',
    'ENT', 'Gynecological', 'Pediatric', 'Surgical', 'Emergency', 'Vitamin',
    'Supplement', 'Vaccine', 'Other'
  ]

  const stockStatuses = [
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
    { value: 'overstocked', label: 'Overstocked' }
  ]

  const movementTypes = [
    { value: 'IN', label: 'Stock In' },
    { value: 'OUT', label: 'Stock Out' },
    { value: 'ADJUSTMENT', label: 'Adjustment' },
    { value: 'TRANSFER', label: 'Transfer' },
    { value: 'RETURN', label: 'Return' },
    { value: 'DAMAGE', label: 'Damage' },
    { value: 'EXPIRED', label: 'Expired' }
  ]

  // Handle add batch
  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMedicine) return

    try {
      await addBatch({
        medicineId: selectedMedicine._id,
        batchNo: batchForm.batchNo,
        quantity: parseInt(batchForm.quantity),
        expiryDate: batchForm.expiryDate,
        costPrice: parseFloat(batchForm.costPrice),
        sellingPrice: parseFloat(batchForm.sellingPrice),
        mrp: parseFloat(batchForm.mrp)
      })

      setBatchForm({
        batchNo: '',
        quantity: '',
        expiryDate: '',
        costPrice: '',
        sellingPrice: '',
        mrp: ''
      })
      setIsAddBatchOpen(false)
      setSelectedMedicine(null)
      refetchMedicines()
    } catch (error) {
      console.error('Error adding batch:', error)
    }
  }

  // Handle stock movement
  const handleStockMovement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMedicine) return

    try {
      await recordStockMovement({
        medicineId: selectedMedicine._id,
        movementType: stockMovementForm.movementType as any,
        quantity: parseInt(stockMovementForm.quantity),
        batchNo: stockMovementForm.batchNo || undefined,
        reason: stockMovementForm.reason,
        notes: stockMovementForm.notes || undefined
      })

      setStockMovementForm({
        movementType: '',
        quantity: '',
        batchNo: '',
        reason: '',
        notes: ''
      })
      setIsStockMovementOpen(false)
      setSelectedMedicine(null)
      refetchMedicines()
    } catch (error) {
      console.error('Error recording stock movement:', error)
    }
  }

  // Get stock status
  const getStockStatus = (medicine: any) => {
    const { currentStock, reorderLevel, maximumStock } = medicine.inventory
    
    if (currentStock === 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-700' }
    if (currentStock <= reorderLevel) return { status: 'Low Stock', color: 'bg-orange-100 text-orange-700' }
    if (currentStock >= maximumStock) return { status: 'Overstocked', color: 'bg-blue-100 text-blue-700' }
    return { status: 'In Stock', color: 'bg-green-100 text-green-700' }
  }

  // Get expiry status
  const getExpiryStatus = (batches: any[]) => {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    const expiringSoon = batches.filter(batch => 
      new Date(batch.expiryDate) <= thirtyDaysFromNow && 
      new Date(batch.expiryDate) > now &&
      batch.quantity > 0
    )
    
    const expired = batches.filter(batch => 
      new Date(batch.expiryDate) <= now && 
      batch.quantity > 0
    )

    if (expired.length > 0) return { status: 'Expired', color: 'bg-red-100 text-red-700' }
    if (expiringSoon.length > 0) return { status: 'Expiring Soon', color: 'bg-yellow-100 text-yellow-700' }
    return { status: 'Good', color: 'bg-green-100 text-green-700' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/pharmacy" className="flex items-center space-x-2">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-2 rounded-xl">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-800">आरोग्य अस्पताल</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-pink-500" />
                <span className="text-lg font-semibold text-gray-700">Inventory Management</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={refetchMedicines}
                disabled={medicinesLoading}
                className="text-gray-600 hover:text-pink-500"
              >
                {medicinesLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
          <p className="text-gray-600">Manage medicine stock, batches, and inventory movements</p>
        </div>

        {/* Error Alert */}
        {(medicinesError || inventoryError) && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {medicinesError || inventoryError}
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search medicines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="border-pink-200 focus:border-pink-400 focus:ring-pink-400">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="border-pink-200 focus:border-pink-400 focus:ring-pink-400">
                  <SelectValue placeholder="Filter by stock status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Status</SelectItem>
                  {stockStatuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex space-x-2">
                <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Medicine Inventory</CardTitle>
            <CardDescription>
              Showing {pagination.total} medicines • Page {pagination.page} of {pagination.totalPages}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {medicinesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            ) : medicines.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Stock Status</TableHead>
                      <TableHead>Expiry Status</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicines.map((medicine) => {
                      const stockStatus = getStockStatus(medicine)
                      const expiryStatus = getExpiryStatus(medicine.batches || [])
                      const totalValue = medicine.inventory.currentStock * medicine.pricing.sellingPrice

                      return (
                        <TableRow key={medicine._id}>
                          <TableCell>
                            <div>
                              <p className="font-semibold text-gray-900">{medicine.medicineName}</p>
                              <p className="text-sm text-gray-500">{medicine.manufacturer}</p>
                              <p className="text-xs text-gray-400">{medicine.strength} • {medicine.dosageForm}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {medicine.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <p className="font-semibold">{medicine.inventory.currentStock}</p>
                              <p className="text-xs text-gray-500">
                                Min: {medicine.inventory.reorderLevel} • Max: {medicine.inventory.maximumStock}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={stockStatus.color}>
                              {stockStatus.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={expiryStatus.color}>
                              {expiryStatus.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <p className="font-semibold">₹{totalValue.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">@₹{medicine.pricing.sellingPrice}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedMedicine(medicine)
                                  setIsAddBatchOpen(true)
                                }}
                                className="text-xs"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Batch
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedMedicine(medicine)
                                  setIsStockMovementOpen(true)
                                }}
                                className="text-xs"
                              >
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Move
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No medicines found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <p className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Batch Dialog */}
        <Dialog open={isAddBatchOpen} onOpenChange={setIsAddBatchOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Batch</DialogTitle>
              <DialogDescription>
                Add a new batch for {selectedMedicine?.medicineName}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddBatch} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="batchNo">Batch Number</Label>
                  <Input
                    id="batchNo"
                    value={batchForm.batchNo}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, batchNo: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={batchForm.quantity}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, quantity: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={batchForm.expiryDate}
                  onChange={(e) => setBatchForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="costPrice">Cost Price</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    value={batchForm.costPrice}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, costPrice: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sellingPrice">Selling Price</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    value={batchForm.sellingPrice}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, sellingPrice: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mrp">MRP</Label>
                  <Input
                    id="mrp"
                    type="number"
                    step="0.01"
                    value={batchForm.mrp}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, mrp: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddBatchOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={inventoryLoading}>
                  {inventoryLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Batch'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Stock Movement Dialog */}
        <Dialog open={isStockMovementOpen} onOpenChange={setIsStockMovementOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Record Stock Movement</DialogTitle>
              <DialogDescription>
                Record stock movement for {selectedMedicine?.medicineName}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleStockMovement} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="movementType">Movement Type</Label>
                  <Select 
                    value={stockMovementForm.movementType} 
                    onValueChange={(value) => setStockMovementForm(prev => ({ ...prev, movementType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {movementTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={stockMovementForm.quantity}
                    onChange={(e) => setStockMovementForm(prev => ({ ...prev, quantity: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="batchNo">Batch Number (Optional)</Label>
                <Input
                  id="batchNo"
                  value={stockMovementForm.batchNo}
                  onChange={(e) => setStockMovementForm(prev => ({ ...prev, batchNo: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  value={stockMovementForm.reason}
                  onChange={(e) => setStockMovementForm(prev => ({ ...prev, reason: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={stockMovementForm.notes}
                  onChange={(e) => setStockMovementForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsStockMovementOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={inventoryLoading}>
                  {inventoryLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    'Record Movement'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
