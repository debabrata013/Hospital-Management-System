"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { 
  Package, Plus, Search, Filter, AlertTriangle, 
  Edit, Trash2, Eye, Download, Upload
} from 'lucide-react'
import { useMedicines } from "@/hooks/usePharmacy"
import { toast } from "sonner"

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    generic_name: "",
    brand_name: "",
    category: "",
    manufacturer: "",
    composition: "",
    strength: "",
    dosage_form: "tablet",
    pack_size: "",
    unit_price: "",
    mrp: "",
    current_stock: "",
    minimum_stock: "10",
    maximum_stock: "1000",
    batch_number: "",
    expiry_date: "",
    supplier: "",
    storage_conditions: "",
    side_effects: "",
    contraindications: "",
    drug_interactions: "",
    pregnancy_category: "Unknown",
    prescription_required: true
  })

  const { medicines, loading, error, refetch, createMedicine } = useMedicines({
    search: searchTerm,
    category: categoryFilter
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMedicine(formData)
      toast.success("Medicine added successfully")
      setShowAddDialog(false)
      setFormData({
        name: "",
        generic_name: "",
        brand_name: "",
        category: "",
        manufacturer: "",
        composition: "",
        strength: "",
        dosage_form: "tablet",
        pack_size: "",
        unit_price: "",
        mrp: "",
        current_stock: "",
        minimum_stock: "10",
        maximum_stock: "1000",
        batch_number: "",
        expiry_date: "",
        supplier: "",
        storage_conditions: "",
        side_effects: "",
        contraindications: "",
        drug_interactions: "",
        pregnancy_category: "Unknown",
        prescription_required: true
      })
    } catch (error) {
      toast.error("Failed to add medicine")
    }
  }

  const getStockStatus = (current: number, minimum: number) => {
    if (current === 0) return { label: "Out of Stock", variant: "destructive" as const }
    if (current <= minimum) return { label: "Low Stock", variant: "secondary" as const }
    return { label: "In Stock", variant: "default" as const }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Medicine Inventory</h1>
          <p className="text-gray-600">Manage medicine stock and information</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Medicine</DialogTitle>
                <DialogDescription>
                  Enter medicine details to add to inventory
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Medicine Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="generic_name">Generic Name</Label>
                    <Input
                      id="generic_name"
                      value={formData.generic_name}
                      onChange={(e) => setFormData({...formData, generic_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="brand_name">Brand Name</Label>
                    <Input
                      id="brand_name"
                      value={formData.brand_name}
                      onChange={(e) => setFormData({...formData, brand_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input
                      id="manufacturer"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="strength">Strength</Label>
                    <Input
                      id="strength"
                      value={formData.strength}
                      onChange={(e) => setFormData({...formData, strength: e.target.value})}
                      placeholder="e.g., 500mg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dosage_form">Dosage Form</Label>
                    <Select value={formData.dosage_form} onValueChange={(value) => setFormData({...formData, dosage_form: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tablet">Tablet</SelectItem>
                        <SelectItem value="capsule">Capsule</SelectItem>
                        <SelectItem value="syrup">Syrup</SelectItem>
                        <SelectItem value="injection">Injection</SelectItem>
                        <SelectItem value="cream">Cream</SelectItem>
                        <SelectItem value="drops">Drops</SelectItem>
                        <SelectItem value="inhaler">Inhaler</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pack_size">Pack Size</Label>
                    <Input
                      id="pack_size"
                      value={formData.pack_size}
                      onChange={(e) => setFormData({...formData, pack_size: e.target.value})}
                      placeholder="e.g., 10 tablets"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit_price">Unit Price (₹) *</Label>
                    <Input
                      id="unit_price"
                      type="number"
                      step="0.01"
                      value={formData.unit_price}
                      onChange={(e) => setFormData({...formData, unit_price: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="mrp">MRP (₹) *</Label>
                    <Input
                      id="mrp"
                      type="number"
                      step="0.01"
                      value={formData.mrp}
                      onChange={(e) => setFormData({...formData, mrp: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="current_stock">Current Stock *</Label>
                    <Input
                      id="current_stock"
                      type="number"
                      value={formData.current_stock}
                      onChange={(e) => setFormData({...formData, current_stock: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimum_stock">Minimum Stock</Label>
                    <Input
                      id="minimum_stock"
                      type="number"
                      value={formData.minimum_stock}
                      onChange={(e) => setFormData({...formData, minimum_stock: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="batch_number">Batch Number</Label>
                    <Input
                      id="batch_number"
                      value={formData.batch_number}
                      onChange={(e) => setFormData({...formData, batch_number: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiry_date">Expiry Date</Label>
                    <Input
                      id="expiry_date"
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="composition">Composition</Label>
                  <Textarea
                    id="composition"
                    value={formData.composition}
                    onChange={(e) => setFormData({...formData, composition: e.target.value})}
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Medicine</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search medicines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                <SelectItem value="Analgesics">Analgesics</SelectItem>
                <SelectItem value="Vitamins">Vitamins</SelectItem>
                <SelectItem value="Cardiac">Cardiac</SelectItem>
                <SelectItem value="Diabetes">Diabetes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Medicine List */}
      <Card>
        <CardHeader>
          <CardTitle>Medicine Inventory</CardTitle>
          <CardDescription>
            {medicines?.length || 0} medicines in inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading medicines...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">Error: {error}</div>
          ) : (
            <div className="space-y-4">
              {medicines?.map((medicine: any) => (
                <div key={medicine.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{medicine.name}</h3>
                        {medicine.generic_name && (
                          <span className="text-sm text-gray-500">({medicine.generic_name})</span>
                        )}
                        <Badge {...getStockStatus(medicine.current_stock, medicine.minimum_stock)}>
                          {getStockStatus(medicine.current_stock, medicine.minimum_stock).label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Category:</span> {medicine.category || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Stock:</span> {medicine.current_stock}/{medicine.minimum_stock}
                        </div>
                        <div>
                          <span className="font-medium">Unit Price:</span> ₹{Number(medicine.unit_price || 0).toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">MRP:</span> ₹{Number(medicine.mrp || 0).toFixed(2)}
                        </div>
                      </div>
                      {medicine.manufacturer && (
                        <div className="text-sm text-gray-500 mt-1">
                          Manufacturer: {medicine.manufacturer}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {(!medicines || medicines.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No medicines found. Add some medicines to get started.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
