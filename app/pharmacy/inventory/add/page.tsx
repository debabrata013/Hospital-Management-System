"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, Package, ArrowLeft, Save, AlertTriangle, Loader2 } from 'lucide-react'
import { useMedicines } from "@/hooks/usePharmacy"
import { toast } from "sonner"

interface MedicineFormData {
  name: string;
  generic_name: string;
  brand_name: string;
  category: string;
  manufacturer: string;
  composition: string;
  strength: string;
  dosage_form: string;
  pack_size: string;
  unit_price: string;
  mrp: string;
  current_stock: string;
  minimum_stock: string;
  maximum_stock: string;
  expiry_date: string;
  batch_number: string;
  supplier: string;
  storage_conditions: string;
  side_effects: string;
  contraindications: string;
  drug_interactions: string;
  pregnancy_category: string;
  prescription_required: boolean;
}

const initialFormData: MedicineFormData = {
  name: '',
  generic_name: '',
  brand_name: '',
  category: '',
  manufacturer: '',
  composition: '',
  strength: '',
  dosage_form: '',
  pack_size: '',
  unit_price: '',
  mrp: '',
  current_stock: '0',
  minimum_stock: '10',
  maximum_stock: '1000',
  expiry_date: '',
  batch_number: '',
  supplier: '',
  storage_conditions: '',
  side_effects: '',
  contraindications: '',
  drug_interactions: '',
  pregnancy_category: 'Unknown',
  prescription_required: true
}

const dosageForms = [
  'tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'other'
]

const categories = [
  'Analgesic', 'Antibiotic', 'Antacid', 'Antihistamine', 'Antihypertensive',
  'Antidiabetic', 'Cardiovascular', 'Respiratory', 'Gastrointestinal', 'Neurological',
  'Dermatological', 'Ophthalmological', 'Gynecological', 'Pediatric', 'Other'
]

const pregnancyCategories = ['A', 'B', 'C', 'D', 'X', 'Unknown']

export default function AddMedicine() {
  const router = useRouter()
  const [formData, setFormData] = useState<MedicineFormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<MedicineFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { createMedicine } = useMedicines()

  // Handle input changes
  const handleInputChange = (field: keyof MedicineFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<MedicineFormData> = {}

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Medicine name is required'
    if (!formData.dosage_form) newErrors.dosage_form = 'Dosage form is required'
    if (!formData.unit_price || parseFloat(formData.unit_price) <= 0) {
      newErrors.unit_price = 'Valid unit price is required'
    }
    if (!formData.mrp || parseFloat(formData.mrp) <= 0) {
      newErrors.mrp = 'Valid MRP is required'
    }

    // Validate price relationship
    if (formData.unit_price && formData.mrp) {
      const unitPrice = parseFloat(formData.unit_price)
      const mrp = parseFloat(formData.mrp)
      if (unitPrice > mrp) {
        newErrors.unit_price = 'Unit price cannot be greater than MRP'
      }
    }

    // Validate stock levels
    if (formData.minimum_stock && formData.maximum_stock) {
      const minStock = parseInt(formData.minimum_stock)
      const maxStock = parseInt(formData.maximum_stock)
      if (minStock >= maxStock) {
        newErrors.minimum_stock = 'Minimum stock must be less than maximum stock'
      }
    }

    // Validate expiry date
    if (formData.expiry_date) {
      const expiryDate = new Date(formData.expiry_date)
      const today = new Date()
      if (expiryDate <= today) {
        newErrors.expiry_date = 'Expiry date must be in the future'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare data for API
      const medicineData = {
        name: formData.name.trim(),
        generic_name: formData.generic_name.trim() || undefined,
        brand_name: formData.brand_name.trim() || undefined,
        category: formData.category || undefined,
        manufacturer: formData.manufacturer.trim() || undefined,
        composition: formData.composition.trim() || undefined,
        strength: formData.strength.trim() || undefined,
        dosage_form: formData.dosage_form,
        pack_size: formData.pack_size.trim() || undefined,
        unit_price: parseFloat(formData.unit_price),
        mrp: parseFloat(formData.mrp),
        current_stock: parseInt(formData.current_stock) || 0,
        minimum_stock: parseInt(formData.minimum_stock) || 10,
        maximum_stock: parseInt(formData.maximum_stock) || 1000,
        expiry_date: formData.expiry_date || undefined,
        batch_number: formData.batch_number.trim() || undefined,
        supplier: formData.supplier.trim() || undefined,
        storage_conditions: formData.storage_conditions.trim() || undefined,
        side_effects: formData.side_effects.trim() || undefined,
        contraindications: formData.contraindications.trim() || undefined,
        drug_interactions: formData.drug_interactions.trim() || undefined,
        pregnancy_category: formData.pregnancy_category,
        prescription_required: formData.prescription_required
      }

      await createMedicine(medicineData)
      toast.success('Medicine added successfully')
      router.push('/pharmacy/inventory')
    } catch (error) {
      console.error('Error adding medicine:', error)
      toast.error('Failed to add medicine')
    } finally {
      setIsSubmitting(false)
    }
  }

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
                <span className="text-xl font-bold text-gray-800">NMSC</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-pink-500" />
                <span className="text-lg font-semibold text-gray-700">Add Medicine</span>
              </div>
            </div>
            
            <Link href="/pharmacy/inventory">
              <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Inventory
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Medicine</h1>
          <p className="text-gray-600">Enter medicine details to add to inventory</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle className="text-gray-900">Basic Information</CardTitle>
              <CardDescription>Essential medicine details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Medicine Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter medicine name"
                    className={errors.name ? 'border-red-300' : 'border-pink-200'}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="generic_name">Generic Name</Label>
                  <Input
                    id="generic_name"
                    value={formData.generic_name}
                    onChange={(e) => handleInputChange('generic_name', e.target.value)}
                    placeholder="Enter generic name"
                    className="border-pink-200"
                  />
                </div>

                <div>
                  <Label htmlFor="brand_name">Brand Name</Label>
                  <Input
                    id="brand_name"
                    value={formData.brand_name}
                    onChange={(e) => handleInputChange('brand_name', e.target.value)}
                    placeholder="Enter brand name"
                    className="border-pink-200"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="border-pink-200">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                    placeholder="Enter manufacturer"
                    className="border-pink-200"
                  />
                </div>

                <div>
                  <Label htmlFor="dosage_form">Dosage Form *</Label>
                  <Select 
                    value={formData.dosage_form} 
                    onValueChange={(value) => handleInputChange('dosage_form', value)}
                  >
                    <SelectTrigger className={errors.dosage_form ? 'border-red-300' : 'border-pink-200'}>
                      <SelectValue placeholder="Select dosage form" />
                    </SelectTrigger>
                    <SelectContent>
                      {dosageForms.map(form => (
                        <SelectItem key={form} value={form}>
                          {form.charAt(0).toUpperCase() + form.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.dosage_form && (
                    <p className="text-sm text-red-600 mt-1">{errors.dosage_form}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="strength">Strength</Label>
                  <Input
                    id="strength"
                    value={formData.strength}
                    onChange={(e) => handleInputChange('strength', e.target.value)}
                    placeholder="e.g., 500mg, 10ml"
                    className="border-pink-200"
                  />
                </div>

                <div>
                  <Label htmlFor="pack_size">Pack Size</Label>
                  <Input
                    id="pack_size"
                    value={formData.pack_size}
                    onChange={(e) => handleInputChange('pack_size', e.target.value)}
                    placeholder="e.g., 10 tablets, 100ml bottle"
                    className="border-pink-200"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="composition">Composition</Label>
                <Textarea
                  id="composition"
                  value={formData.composition}
                  onChange={(e) => handleInputChange('composition', e.target.value)}
                  placeholder="Enter medicine composition"
                  className="border-pink-200"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Stock */}
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle className="text-gray-900">Pricing & Stock</CardTitle>
              <CardDescription>Price and inventory details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="unit_price">Unit Price (₹) *</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unit_price}
                    onChange={(e) => handleInputChange('unit_price', e.target.value)}
                    placeholder="0.00"
                    className={errors.unit_price ? 'border-red-300' : 'border-pink-200'}
                  />
                  {errors.unit_price && (
                    <p className="text-sm text-red-600 mt-1">{errors.unit_price}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="mrp">MRP (₹) *</Label>
                  <Input
                    id="mrp"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.mrp}
                    onChange={(e) => handleInputChange('mrp', e.target.value)}
                    placeholder="0.00"
                    className={errors.mrp ? 'border-red-300' : 'border-pink-200'}
                  />
                  {errors.mrp && (
                    <p className="text-sm text-red-600 mt-1">{errors.mrp}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="current_stock">Current Stock</Label>
                  <Input
                    id="current_stock"
                    type="number"
                    min="0"
                    value={formData.current_stock}
                    onChange={(e) => handleInputChange('current_stock', e.target.value)}
                    placeholder="0"
                    className="border-pink-200"
                  />
                </div>

                <div>
                  <Label htmlFor="minimum_stock">Minimum Stock</Label>
                  <Input
                    id="minimum_stock"
                    type="number"
                    min="0"
                    value={formData.minimum_stock}
                    onChange={(e) => handleInputChange('minimum_stock', e.target.value)}
                    placeholder="10"
                    className={errors.minimum_stock ? 'border-red-300' : 'border-pink-200'}
                  />
                  {errors.minimum_stock && (
                    <p className="text-sm text-red-600 mt-1">{errors.minimum_stock}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="maximum_stock">Maximum Stock</Label>
                  <Input
                    id="maximum_stock"
                    type="number"
                    min="0"
                    value={formData.maximum_stock}
                    onChange={(e) => handleInputChange('maximum_stock', e.target.value)}
                    placeholder="1000"
                    className="border-pink-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Batch & Expiry */}
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle className="text-gray-900">Batch & Expiry Information</CardTitle>
              <CardDescription>Batch details and expiry information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="batch_number">Batch Number</Label>
                  <Input
                    id="batch_number"
                    value={formData.batch_number}
                    onChange={(e) => handleInputChange('batch_number', e.target.value)}
                    placeholder="Enter batch number"
                    className="border-pink-200"
                  />
                </div>

                <div>
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                    className={errors.expiry_date ? 'border-red-300' : 'border-pink-200'}
                  />
                  {errors.expiry_date && (
                    <p className="text-sm text-red-600 mt-1">{errors.expiry_date}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                    placeholder="Enter supplier name"
                    className="border-pink-200"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="storage_conditions">Storage Conditions</Label>
                <Textarea
                  id="storage_conditions"
                  value={formData.storage_conditions}
                  onChange={(e) => handleInputChange('storage_conditions', e.target.value)}
                  placeholder="e.g., Store in cool, dry place below 25°C"
                  className="border-pink-200"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle className="text-gray-900">Medical Information</CardTitle>
              <CardDescription>Clinical and safety information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="pregnancy_category">Pregnancy Category</Label>
                  <Select 
                    value={formData.pregnancy_category} 
                    onValueChange={(value) => handleInputChange('pregnancy_category', value)}
                  >
                    <SelectTrigger className="border-pink-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pregnancyCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="prescription_required"
                    checked={formData.prescription_required}
                    onCheckedChange={(checked) => handleInputChange('prescription_required', checked as boolean)}
                  />
                  <Label htmlFor="prescription_required">Prescription Required</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="side_effects">Side Effects</Label>
                <Textarea
                  id="side_effects"
                  value={formData.side_effects}
                  onChange={(e) => handleInputChange('side_effects', e.target.value)}
                  placeholder="List common side effects"
                  className="border-pink-200"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="contraindications">Contraindications</Label>
                <Textarea
                  id="contraindications"
                  value={formData.contraindications}
                  onChange={(e) => handleInputChange('contraindications', e.target.value)}
                  placeholder="List contraindications"
                  className="border-pink-200"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="drug_interactions">Drug Interactions</Label>
                <Textarea
                  id="drug_interactions"
                  value={formData.drug_interactions}
                  onChange={(e) => handleInputChange('drug_interactions', e.target.value)}
                  placeholder="List known drug interactions"
                  className="border-pink-200"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Link href="/pharmacy/inventory">
              <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding Medicine...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Add Medicine
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
