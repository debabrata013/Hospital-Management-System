"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Package, Save, X } from 'lucide-react'

const categories = [
  "Antibiotic",
  "Analgesic", 
  "Diabetes",
  "Cardiovascular",
  "Respiratory",
  "Neurological",
  "Gastrointestinal",
  "Dermatological",
  "Other"
]

const manufacturers = [
  "PharmaCorp",
  "MediLab",
  "DiabetCare", 
  "CardioMed",
  "RespiroCare",
  "NeuroPharm",
  "GastroMed",
  "DermaCare"
]

export default function AddMedicinePage() {
  const [formData, setFormData] = useState({
    name: "",
    genericName: "",
    category: "",
    manufacturer: "",
    batchNumber: "",
    expiryDate: "",
    currentStock: "",
    minStock: "",
    maxStock: "",
    unitPrice: "",
    location: "",
    description: "",
    sideEffects: "",
    dosageForm: "",
    strength: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Adding medicine:", formData)
    // Here you would typically send the data to your backend
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/pharmacy/inventory" className="flex items-center space-x-2 text-gray-600 hover:text-pink-500 transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Inventory</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-pink-500" />
                <span className="text-lg font-semibold text-gray-700">Add New Medicine</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Medicine</h1>
          <p className="text-gray-600">Enter the details of the new medicine to add to inventory</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle className="text-gray-900">Basic Information</CardTitle>
              <CardDescription>Enter the basic details of the medicine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    Medicine Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Amoxicillin 500mg"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="genericName" className="text-gray-700 font-medium">
                    Generic Name
                  </Label>
                  <Input
                    id="genericName"
                    type="text"
                    placeholder="e.g., Amoxicillin"
                    value={formData.genericName}
                    onChange={(e) => handleInputChange("genericName", e.target.value)}
                    className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-700 font-medium">
                    Category *
                  </Label>
                  <Select onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dosageForm" className="text-gray-700 font-medium">
                    Dosage Form
                  </Label>
                  <Select onValueChange={(value) => handleInputChange("dosageForm", value)}>
                    <SelectTrigger className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl">
                      <SelectValue placeholder="Select form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="capsule">Capsule</SelectItem>
                      <SelectItem value="syrup">Syrup</SelectItem>
                      <SelectItem value="injection">Injection</SelectItem>
                      <SelectItem value="cream">Cream</SelectItem>
                      <SelectItem value="drops">Drops</SelectItem>
                      <SelectItem value="inhaler">Inhaler</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="strength" className="text-gray-700 font-medium">
                    Strength
                  </Label>
                  <Input
                    id="strength"
                    type="text"
                    placeholder="e.g., 500mg"
                    value={formData.strength}
                    onChange={(e) => handleInputChange("strength", e.target.value)}
                    className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700 font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the medicine and its uses"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Manufacturer & Batch Information */}
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle className="text-gray-900">Manufacturer & Batch Information</CardTitle>
              <CardDescription>Enter manufacturer and batch details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer" className="text-gray-700 font-medium">
                    Manufacturer *
                  </Label>
                  <Select onValueChange={(value) => handleInputChange("manufacturer", value)}>
                    <SelectTrigger className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl">
                      <SelectValue placeholder="Select manufacturer" />
                    </SelectTrigger>
                    <SelectContent>
                      {manufacturers.map(manufacturer => (
                        <SelectItem key={manufacturer} value={manufacturer}>{manufacturer}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="batchNumber" className="text-gray-700 font-medium">
                    Batch Number *
                  </Label>
                  <Input
                    id="batchNumber"
                    type="text"
                    placeholder="e.g., AMX2024001"
                    value={formData.batchNumber}
                    onChange={(e) => handleInputChange("batchNumber", e.target.value)}
                    className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="text-gray-700 font-medium">
                  Expiry Date *
                </Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                  className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl w-full md:w-64"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Stock & Pricing Information */}
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle className="text-gray-900">Stock & Pricing Information</CardTitle>
              <CardDescription>Enter stock levels and pricing details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currentStock" className="text-gray-700 font-medium">
                    Current Stock *
                  </Label>
                  <Input
                    id="currentStock"
                    type="number"
                    placeholder="0"
                    value={formData.currentStock}
                    onChange={(e) => handleInputChange("currentStock", e.target.value)}
                    className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minStock" className="text-gray-700 font-medium">
                    Minimum Stock Level *
                  </Label>
                  <Input
                    id="minStock"
                    type="number"
                    placeholder="0"
                    value={formData.minStock}
                    onChange={(e) => handleInputChange("minStock", e.target.value)}
                    className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxStock" className="text-gray-700 font-medium">
                    Maximum Stock Level
                  </Label>
                  <Input
                    id="maxStock"
                    type="number"
                    placeholder="0"
                    value={formData.maxStock}
                    onChange={(e) => handleInputChange("maxStock", e.target.value)}
                    className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="unitPrice" className="text-gray-700 font-medium">
                    Unit Price (₹) *
                  </Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.unitPrice}
                    onChange={(e) => handleInputChange("unitPrice", e.target.value)}
                    className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-700 font-medium">
                    Storage Location
                  </Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="e.g., A-1-01"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle className="text-gray-900">Additional Information</CardTitle>
              <CardDescription>Optional additional details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="sideEffects" className="text-gray-700 font-medium">
                  Side Effects & Warnings
                </Label>
                <Textarea
                  id="sideEffects"
                  placeholder="List common side effects and important warnings"
                  value={formData.sideEffects}
                  onChange={(e) => handleInputChange("sideEffects", e.target.value)}
                  className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Link href="/pharmacy/inventory">
              <Button variant="outline" className="w-full sm:w-auto border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit"
              className="w-full sm:w-auto bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-xl"
            >
              <Save className="h-4 w-4 mr-2" />
              Add Medicine
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
