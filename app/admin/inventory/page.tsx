"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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
  TrendingUp,
  ShoppingCart,
  X
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

// Add Medicine Modal Component
const AddMedicineModal = ({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (medicine: any) => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    brand_name: '',
    category: '',
    manufacturer: '',
    strength: '',
    dosage_form: 'tablet',
    unit_price: '',
    mrp: '',
    current_stock: '',
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
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        onAdd(formData)
        setFormData({
          name: '',
          generic_name: '',
          brand_name: '',
          category: '',
          manufacturer: '',
          strength: '',
          dosage_form: 'tablet',
          unit_price: '',
          mrp: '',
          current_stock: '',
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
        })
        onClose()
      }
    } catch (error) {
      console.error('Error adding medicine:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Add New Medicine</h2>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Medicine Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Generic Name</label>
                <Input
                  value={formData.generic_name}
                  onChange={(e) => setFormData({...formData, generic_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Brand Name</label>
                <Input
                  value={formData.brand_name}
                  onChange={(e) => setFormData({...formData, brand_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Manufacturer</label>
                <Input
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Strength</label>
                <Input
                  value={formData.strength}
                  onChange={(e) => setFormData({...formData, strength: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dosage Form *</label>
                <select
                  value={formData.dosage_form}
                  onChange={(e) => setFormData({...formData, dosage_form: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="tablet">Tablet</option>
                  <option value="capsule">Capsule</option>
                  <option value="syrup">Syrup</option>
                  <option value="injection">Injection</option>
                  <option value="cream">Cream</option>
                  <option value="drops">Drops</option>
                  <option value="inhaler">Inhaler</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit Price (₹) *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({...formData, unit_price: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">MRP (₹)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.mrp}
                  onChange={(e) => setFormData({...formData, mrp: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current Stock *</label>
                <Input
                  type="number"
                  value={formData.current_stock}
                  onChange={(e) => setFormData({...formData, current_stock: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Minimum Stock</label>
                <Input
                  type="number"
                  value={formData.minimum_stock}
                  onChange={(e) => setFormData({...formData, minimum_stock: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Maximum Stock</label>
                <Input
                  type="number"
                  value={formData.maximum_stock}
                  onChange={(e) => setFormData({...formData, maximum_stock: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date</label>
                <Input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Batch Number</label>
                <Input
                  value={formData.batch_number}
                  onChange={(e) => setFormData({...formData, batch_number: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Supplier</label>
                <Input
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="bg-pink-500 hover:bg-pink-600">
                Add Medicine
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Create Order Modal Component
const CreateOrderModal = ({ isOpen, onClose, onOrderCreated }: { isOpen: boolean, onClose: () => void, onOrderCreated: () => void }) => {
  const [formData, setFormData] = useState({
    supplier_id: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    notes: '',
    items: [{ medicine_id: '', quantity: '', unit_price: '', total_price: '' }]
  })
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [medicines, setMedicines] = useState<{id: string | number; name: string}[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchVendors()
      fetchMedicines()
    }
  }, [isOpen])

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/admin/inventory/vendors')
      const data = await response.json()
      if (data.success) setVendors(data.data)
    } catch (error) {
      console.error('Error fetching vendors:', error)
    }
  }

  const fetchMedicines = async () => {
    try {
      const response = await fetch('/api/admin/inventory')
      const data = await response.json()
      if (data.success) setMedicines(data.data.inventory)
    } catch (error) {
      console.error('Error fetching medicines:', error)
    }
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { medicine_id: '', quantity: '', unit_price: '', total_price: '' }]
    })
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    })
  }

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = parseFloat(newItems[index].quantity) || 0
      const unitPrice = parseFloat(newItems[index].unit_price) || 0
      newItems[index].total_price = (quantity * unitPrice).toString()
    }
    
    setFormData({ ...formData, items: newItems })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const totalAmount = formData.items.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0)
      
      const orderData = {
        ...formData,
        total_amount: totalAmount,
        items: formData.items.filter(item => item.medicine_id && item.quantity)
      }

      const response = await fetch('/api/admin/inventory/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
      
      if (response.ok) {
        onOrderCreated()
        onClose()
        setFormData({
          supplier_id: '',
          order_date: new Date().toISOString().split('T')[0],
          expected_delivery_date: '',
          notes: '',
          items: [{ medicine_id: '', quantity: '', unit_price: '', total_price: '' }]
        })
      }
    } catch (error) {
      console.error('Error creating order:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Create Purchase Order</h2>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Supplier *</label>
                <select
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select Supplier</option>
                  {vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Order Date *</label>
                <Input
                  type="date"
                  value={formData.order_date}
                  onChange={(e) => setFormData({...formData, order_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expected Delivery Date</label>
                <Input
                  type="date"
                  value={formData.expected_delivery_date}
                  onChange={(e) => setFormData({...formData, expected_delivery_date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Order Items</h3>
                <Button type="button" onClick={addItem} variant="outline">
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </div>
              
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                    <div>
                      <label className="block text-sm font-medium mb-1">Medicine *</label>
                      <select
                        value={item.medicine_id}
                        onChange={(e) => updateItem(index, 'medicine_id', e.target.value)}
                        className="w-full p-2 border rounded-md"
                        required
                      >
                        <option value="">Select Medicine</option>
                        {(medicines as { id: string | number; name: string }[]).map(medicine => (
                          <option key={medicine.id} value={medicine.id}>{medicine.name}</option>
                        ))}
                      </select>
                      
                      <label className="block text-sm font-medium mt-3 mb-1">Quantity *</label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Unit Price *</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                        required
                      />
                      
                      <label className="block text-sm font-medium mt-3 mb-1">Total Price</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.total_price}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <Button 
                        type="button" 
                        onClick={() => removeItem(index)} 
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="bg-pink-500 hover:bg-pink-600">
                Create Order
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Define vendor type
interface Vendor {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gst_number?: string;
  license_number?: string;
  payment_terms?: string;
  credit_limit?: string;
  supplier_id?: string;
  created_at?: string;
  is_active?: boolean;
  medicine_count?: number;
  transaction_count?: number;
  total_purchases?: number;
}

// Vendor Management Modal Component
const VendorModal = ({ isOpen, onClose, onVendorUpdated, editingVendorProp }: { isOpen: boolean, onClose: () => void, onVendorUpdated: () => void, editingVendorProp?: Vendor | null }) => {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gst_number: '',
    license_number: '',
    payment_terms: '',
    credit_limit: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchVendors()
    }
  }, [isOpen])

  // Initialize form when a vendor is provided from parent for editing
  useEffect(() => {
    if (editingVendorProp) {
      setEditingVendor(editingVendorProp)
      setFormData({
        name: editingVendorProp.name || '',
        contact_person: editingVendorProp.contact_person || '',
        phone: editingVendorProp.phone || '',
        email: editingVendorProp.email || '',
        address: editingVendorProp.address || '',
        city: editingVendorProp.city || '',
        state: editingVendorProp.state || '',
        pincode: editingVendorProp.pincode || '',
        gst_number: editingVendorProp.gst_number || '',
        license_number: editingVendorProp.license_number || '',
        payment_terms: editingVendorProp.payment_terms || '',
        credit_limit: editingVendorProp.credit_limit || ''
      })
      setShowAddForm(true)
    }
  }, [editingVendorProp])

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/admin/inventory/vendors')
      const data = await response.json()
      if (data.success) setVendors(data.data)
    } catch (error) {
      console.error('Error fetching vendors:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingVendor ? '/api/admin/inventory/vendors' : '/api/admin/inventory/vendors'
      const method = editingVendor ? 'PUT' : 'POST'
      
      const submitData = editingVendor ? { ...formData, id: editingVendor.id } : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })
      
      if (response.ok) {
        onVendorUpdated()
        setShowAddForm(false)
        setEditingVendor(null)
        setFormData({
          name: '',
          contact_person: '',
          phone: '',
          email: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          gst_number: '',
          license_number: '',
          payment_terms: '',
          credit_limit: ''
        })
      }
    } catch (error) {
      console.error('Error saving vendor:', error)
    }
  }

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setFormData({
      name: vendor.name || '',
      contact_person: vendor.contact_person || '',
      phone: vendor.phone || '',
      email: vendor.email || '',
      address: vendor.address || '',
      city: vendor.city || '',
      state: vendor.state || '',
      pincode: vendor.pincode || '',
      gst_number: vendor.gst_number || '',
      license_number: vendor.license_number || '',
      payment_terms: vendor.payment_terms || '',
      credit_limit: vendor.credit_limit || ''
    })
    setShowAddForm(true)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    

      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Manage Vendors</h2>
            <div className="flex gap-2">
              <Button onClick={() => setShowAddForm(true)} className="bg-pink-500 hover:bg-pink-600">
                <Plus className="h-4 w-4 mr-2" /> Add Vendor
              </Button>
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showAddForm ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Vendor Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Person</label>
                  <Input
                    value={formData.contact_person}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pincode</label>
                  <Input
                    value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">GST Number</label>
                  <Input
                    value={formData.gst_number}
                    onChange={(e) => setFormData({...formData, gst_number: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">License Number</label>
                  <Input
                    value={formData.license_number}
                    onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Terms</label>
                  <Input
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Credit Limit</label>
                  <Input
                    type="number"
                    value={formData.credit_limit}
                    onChange={(e) => setFormData({...formData, credit_limit: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="bg-pink-500 hover:bg-pink-600">
                  {editingVendor ? 'Update Vendor' : 'Add Vendor'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowAddForm(false)
                  setEditingVendor(null)
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{vendor.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                        <div>Contact: {vendor.contact_person || 'N/A'}</div>
                        <div>Phone: {vendor.phone || 'N/A'}</div>
                        <div>Email: {vendor.email || 'N/A'}</div>
                        <div>City: {vendor.city || 'N/A'}</div>
                        <div>GST: {vendor.gst_number || 'N/A'}</div>
                        <div>Credit Limit: ₹{vendor.credit_limit || '0'}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleEdit(vendor)}
                        variant="outline" 
                        size="sm"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Stock Alerts Modal Component
const StockAlertsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [alerts, setAlerts] = useState({
    critical: [],
    expiring: [],
    lowStock: []
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchAlerts()
    }
  }, [isOpen])

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      // Fetch critical stock report
      const criticalResponse = await fetch('/api/admin/inventory/reports?type=critical')
      const criticalData = await criticalResponse.json()
      
      // Fetch expiring stock report
      const expiringResponse = await fetch('/api/admin/inventory/reports?type=expiring')
      const expiringData = await expiringResponse.json()
      
      // Fetch low stock items (custom filter)
      const lowStockResponse = await fetch('/api/admin/inventory')
      const lowStockData = await lowStockResponse.json()
      
      if (criticalData.success && expiringData.success && lowStockData.success) {
        setAlerts({
          critical: criticalData.data.critical || [],
          expiring: expiringData.data.expiring || [],
          lowStock: lowStockData.data.inventory.filter((item: any) => 
            item.current_stock <= item.minimum_stock && !item.is_critical
          ) || []
        })
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Stock Alerts</h2>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading alerts...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Critical Stock Alerts */}
              <div>
                <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Critical Stock ({alerts.critical.length})
                </h3>
                {alerts.critical.length > 0 ? (
                  <div className="space-y-2">
                    {alerts.critical.map((item: any) => (
                      <div key={item.id} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-red-800">{item.name}</h4>
                            <p className="text-sm text-red-600">
                              Current: {item.current_stock} | Required: {item.minimum_stock} | 
                              Shortage: {item.minimum_stock - item.current_stock}
                            </p>
                            <p className="text-sm text-red-600">Category: {item.category}</p>
                          </div>
                          <Badge className="bg-red-100 text-red-700">CRITICAL</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border border-green-200 bg-green-50 rounded-lg text-green-800">
                    ✅ No critical stock alerts
                  </div>
                )}
              </div>

              {/* Expiring Soon Alerts */}
              <div>
                <h3 className="text-lg font-semibold text-orange-600 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Expiring Soon ({alerts.expiring.length})
                </h3>
                {alerts.expiring.length > 0 ? (
                  <div className="space-y-2">
                    {alerts.expiring.map((item: any) => (
                      <div key={item.id} className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-orange-800">{item.name}</h4>
                            <p className="text-sm text-orange-600">
                              Expiry Date: {new Date(item.expiry_date).toLocaleDateString()} | 
                              Days Left: {item.days_until_expiry}
                            </p>
                            <p className="text-sm text-orange-600">
                              Stock: {item.current_stock} | Value: ₹{item.total_value}
                            </p>
                          </div>
                          <Badge className="bg-orange-100 text-orange-700">EXPIRING</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border border-green-200 bg-green-50 rounded-lg text-green-800">
                    ✅ No expiring medicines
                  </div>
                )}
              </div>

              {/* Low Stock Alerts */}
              <div>
                <h3 className="text-lg font-semibold text-yellow-600 mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Low Stock ({alerts.lowStock.length})
                </h3>
                {alerts.lowStock.length > 0 ? (
                  <div className="space-y-2">
                    {alerts.lowStock.map((item: any) => (
                      <div key={item.id} className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-yellow-800">{item.name}</h4>
                            <p className="text-sm text-yellow-600">
                              Current: {item.current_stock} | Required: {item.minimum_stock} | 
                              Reorder: {item.minimum_stock - item.current_stock}
                            </p>
                            <p className="text-sm text-yellow-600">Category: {item.category}</p>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-700">LOW STOCK</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border border-green-200 bg-green-50 rounded-lg text-green-800">
                    ✅ No low stock alerts
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Alert Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{alerts.critical.length}</div>
                    <div>Critical Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{alerts.expiring.length}</div>
                    <div>Expiring Soon</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{alerts.lowStock.length}</div>
                    <div>Low Stock</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Vendor Details List Component
const VendorDetailsList = ({ onEditVendor }: { onEditVendor: (vendor: Vendor) => void }) => {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/admin/inventory/vendors')
      const data = await response.json()
      if (data.success) {
        setVendors(data.data)
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (vendor: any) => {
    onEditVendor(vendor)
  }

  const handleDelete = async (vendorId: string) => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      try {
        const response = await fetch(`/api/admin/inventory/vendors?id=${vendorId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          fetchVendors() // Refresh the list
        }
      } catch (error) {
        console.error('Error deleting vendor:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading vendors...</p>
      </div>
    )
  }

  if (vendors.length === 0) {
    return (
      <div className="text-center py-8">
        <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No vendors found. Add your first vendor to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {vendors.map((vendor: any) => (
        <div key={vendor.id} className="p-6 border border-blue-100 rounded-lg hover:shadow-md transition-all duration-200 bg-gradient-to-r from-blue-50 to-white">
          
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            {/* Left: Vendor Info */}
            <div className="flex-1 flex gap-4">
              <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg h-16 w-16 flex items-center justify-center font-bold flex-shrink-0">
                <Truck className="h-8 w-8" />
              </div>

              <div className="flex-1">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-3">
                  <h3 className="font-bold text-xl text-gray-900">{vendor.name}</h3>
                  <div className="flex flex-wrap gap-2 items-center mt-2 lg:mt-0">
                    <Badge variant="outline" className="border-blue-200 text-blue-700">
                      {vendor.supplier_id}
                    </Badge>
                    <Badge className="bg-green-100 text-green-700">
                      Active
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="w-20 font-medium text-gray-600">Contact:</span> 
                      <span className="text-gray-900">{vendor.contact_person || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 font-medium text-gray-600">Phone:</span> 
                      <span className="text-gray-900">{vendor.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 font-medium text-gray-600">Email:</span> 
                      <span className="text-gray-900">{vendor.email || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="w-20 font-medium text-gray-600">City:</span> 
                      <span className="text-gray-900">{vendor.city || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 font-medium text-gray-600">State:</span> 
                      <span className="text-gray-900">{vendor.state || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 font-medium text-gray-600">Pincode:</span> 
                      <span className="text-gray-900">{vendor.pincode || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="w-20 font-medium text-gray-600">GST:</span> 
                      <span className="text-gray-900">{vendor.gst_number || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 font-medium text-gray-600">License:</span> 
                      <span className="text-gray-900">{vendor.license_number || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 font-medium text-gray-600">Credit:</span> 
                      <span className="text-gray-900">₹{vendor.credit_limit || '0'}</span>
                    </div>
                  </div>
                </div>

                {vendor.address && (
                  <p className="text-sm text-gray-600 mt-3">
                    <span className="font-medium">Address:</span> {vendor.address}
                  </p>
                )}

                {vendor.payment_terms && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Payment Terms:</span> {vendor.payment_terms}
                  </p>
                )}

                {/* Performance Stats */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{vendor.medicine_count || 0}</div>
                      <div className="text-xs text-gray-600">Medicines Supplied</div>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{vendor.transaction_count || 0}</div>
                      <div className="text-xs text-gray-600">Total Transactions</div>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">₹{(vendor.total_purchases || 0).toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Total Purchases</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex flex-col gap-2 lg:items-end">
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleEdit(vendor)}
                  variant="outline" 
                  size="sm" 
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  onClick={() => handleDelete(vendor.id)}
                  variant="outline" 
                  size="sm" 
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
              
              <div className="text-xs text-gray-500 mt-2">
                Created: {new Date(vendor.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Vendor Summary Stats Component
const VendorSummaryStats = () => {
  const [vendorStats, setVendorStats] = useState({
    totalVendors: 0,
    activeVendors: 0,
    totalPurchases: 0,
    topVendor: null as Vendor | null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVendorStats()
  }, [])

  const fetchVendorStats = async () => {
    try {
      const response = await fetch('/api/admin/inventory/vendors')
      const data = await response.json()
      if (data.success) {
        const vendors = data.data
        const totalPurchases = vendors.reduce((sum: number, vendor: any) => sum + (vendor.total_purchases || 0), 0)
        const topVendor = vendors.reduce((top: any, vendor: any) => 
          (vendor.total_purchases || 0) > (top?.total_purchases || 0) ? vendor : top, null
        )
        
        setVendorStats({
          totalVendors: vendors.length,
          activeVendors: vendors.filter((v: any) => v.is_active).length,
          totalPurchases,
          topVendor
        })
      }
    } catch (error) {
      console.error('Error fetching vendor stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="border-blue-100">
            <CardContent className="p-4 sm:p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <Card className="border-blue-100">
        <CardContent className="p-4 sm:p-6 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Vendors</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{vendorStats.totalVendors}</p>
          </div>
          <Truck className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500" />
        </CardContent>
      </Card>

      <Card className="border-blue-100">
        <CardContent className="p-4 sm:p-6 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Vendors</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">{vendorStats.activeVendors}</p>
          </div>
          <TrendingUp className="h-6 sm:h-8 w-6 sm:w-8 text-green-500" />
        </CardContent>
      </Card>

      <Card className="border-blue-100">
        <CardContent className="p-4 sm:p-6 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Purchases</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">₹{(vendorStats.totalPurchases / 100000).toFixed(1)}L</p>
          </div>
          <ShoppingCart className="h-6 sm:h-8 w-6 sm:w-8 text-purple-500" />
        </CardContent>
      </Card>

      <Card className="border-blue-100">
        <CardContent className="p-4 sm:p-6 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-600">Top Vendor</p>
            <p className="text-lg font-bold text-orange-600 truncate">
              {vendorStats.topVendor?.name || 'N/A'}
            </p>
            {vendorStats.topVendor && (
              <p className="text-xs text-gray-500">
                ₹{(vendorStats.topVendor.total_purchases || 0).toLocaleString()}
              </p>
            )}
          </div>
          <Package className="h-6 sm:h-8 w-6 sm:w-8 text-orange-500" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminInventoryPage() {
  const [inventoryData, setInventoryData] = useState({
    totalItems: 0,
    criticalStock: 0,
    expiringSoon: 0,
    totalValue: 0,
    inventory: []
  })
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false)
  const [showVendorModal, setShowVendorModal] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [showStockAlertsModal, setShowStockAlertsModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const fetchInventoryData = async () => {
    try {
      const response = await fetch('/api/admin/inventory')
      if (response.ok) {
        const data = await response.json()
        setInventoryData(data.data)
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMedicine = (newMedicine: any) => {
    fetchInventoryData() // Refresh data
  }

  const handleOrderCreated = () => {
    fetchInventoryData() // Refresh data
  }

  const handleVendorUpdated = () => {
    fetchInventoryData() // Refresh data
  }

  const openEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setShowVendorModal(true)
  }

  type InventoryItem = {
    name: string
    category: string
    supplier?: string
    [key: string]: any
  }

  const filteredInventory = (inventoryData.inventory as InventoryItem[]).filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (item: any) => {
    if (item.is_critical) {
      return <Badge className="bg-red-100 text-red-700">Critical</Badge>
    }
    if (item.is_expiring) {
      return <Badge className="bg-orange-100 text-orange-700">Expiring Soon</Badge>
    }
    if (item.current_stock <= item.minimum_stock) {
      return <Badge className="bg-yellow-100 text-yellow-700">Low Stock</Badge>
    }
    return <Badge className="bg-green-100 text-green-700">Good</Badge>
  }

  const getStatusColor = (item: any) => {
    if (item.is_critical) return 'border-red-200 bg-red-50'
    if (item.is_expiring) return 'border-orange-200 bg-orange-50'
    if (item.current_stock <= item.minimum_stock) return 'border-yellow-200 bg-yellow-50'
    return 'border-green-200 bg-green-50'
  }

  const getStockPercentage = (current: number, max: number) => {
    return (current / max) * 100
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4 sm:p-6 lg:p-8">
        <Link href="/admin" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
  <ArrowLeft className="h-4 w-4 mr-2" />
  Back to Dashboard
</Link>
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <Package className="h-8 w-8 mr-2 sm:mr-3 text-pink-500" />
            Inventory & Vendor Management
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Manage medicine inventory, stock levels, and vendor relationships
          </p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Medicine
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{inventoryData.totalItems.toLocaleString()}</p>
            </div>
            <Package className="h-6 sm:h-8 w-6 sm:w-8 text-pink-500" />
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Stock</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{inventoryData.criticalStock.toLocaleString()}</p>
            </div>
            <AlertTriangle className="h-6 sm:h-8 w-6 sm:w-8 text-red-500" />
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">{inventoryData.expiringSoon.toLocaleString()}</p>
            </div>
            <Calendar className="h-6 sm:h-8 w-6 sm:w-8 text-yellow-500" />
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">₹{(inventoryData.totalValue / 100000).toFixed(1)}L</p>
            </div>
            <TrendingUp className="h-6 sm:h-8 w-6 sm:w-8 text-green-500" />
          </CardContent>
        </Card>
      </div>

      {/* Vendor Summary Stats */}
      <VendorSummaryStats />

      {/* Search & Filter */}
      <Card className="border-pink-100 mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search medicines by name, category, or supplier..." 
                className="pl-10 border-pink-200 focus:border-pink-400 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 w-full md:w-auto flex items-center justify-center gap-2">
              <Filter className="h-4 w-4" /> Filter by Category
            </Button>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 w-full md:w-auto flex items-center justify-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Critical Stock
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory List */}
      <Card className="border-pink-100 mb-6">
        <CardHeader>
          <CardTitle>Medicine Inventory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredInventory.map((item) => (
            <div key={item.id} className={`p-4 rounded-lg border ${getStatusColor(item)} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
              
              {/* Left: Name + Badges */}
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-lg h-16 w-16 flex items-center justify-center">
                  <Pill className="h-8 w-8" />
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:gap-3 gap-1">
                  <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                  <Badge variant="outline">{item.medicine_id}</Badge>
                  <Badge className="bg-blue-100 text-blue-700">{item.category}</Badge>
                  {getStatusBadge(item)}
                </div>
              </div>

              {/* Right: Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Current Stock:</span> <span>{item.current_stock}</span></div>
                  <div className="flex justify-between"><span>Min Required:</span> <span>{item.minimum_stock}</span></div>
                  <div className="flex justify-between"><span>Max Capacity:</span> <span>{item.maximum_stock}</span></div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Unit Price:</span> <span>₹{item.unit_price}</span></div>
                  <div className="flex justify-between"><span>Total Value:</span> <span>₹{item.total_value}</span></div>
                  <div className="flex justify-between"><span>Supplier:</span> <span>{item.supplier || 'N/A'}</span></div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Expiry Date:</span> <span className={`${item.is_expiring ? 'text-orange-600 font-semibold' : ''}`}>{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}</span></div>
                  <div className="flex justify-between"><span>Strength:</span> <span>{item.strength || 'N/A'}</span></div>
                  <div className="flex flex-col mt-2">
                    <div className="flex justify-between text-sm mb-1"><span>Stock Level</span> <span>{item.current_stock}/{item.maximum_stock}</span></div>
                    <Progress value={getStockPercentage(item.current_stock, item.maximum_stock)} className="h-2"/>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-2 md:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-pink-200 text-pink-600 hover:bg-pink-50"
                  onClick={() => {
                    alert(`Medicine: ${item.medicine_name}\nStock: ${item.current_stock}/${item.maximum_stock}\nBatch: ${item.batch_number || '-'}\nExpiry: ${item.expiry_date || '-'}`)
                  }}
                >
                  <Eye className="h-4 w-4"/>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-pink-200 text-pink-600 hover:bg-pink-50"
                  onClick={() => {
                    setShowAddModal(true)
                    setForm({
                      id: item.id,
                      medicine_name: item.medicine_name,
                      manufacturer: item.manufacturer,
                      price: item.price,
                      current_stock: item.current_stock,
                      maximum_stock: item.maximum_stock,
                      batch_number: item.batch_number || '',
                      expiry_date: item.expiry_date || ''
                    })
                  }}
                >
                  <Edit className="h-4 w-4"/>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-200 text-green-600 hover:bg-green-50"
                  onClick={() => {
                    alert('Purchase flow coming soon')
                  }}
                >
                  <ShoppingCart className="h-4 w-4"/>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Vendor Management */}
      <Card className="border-pink-100 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Truck className="h-5 w-5 mr-2 text-blue-500" /> 
              Vendor Details
            </div>
            <Button 
              onClick={() => setShowVendorModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <VendorDetailsList onEditVendor={openEditVendor} />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-pink-100 mb-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => setShowAddModal(true)}
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2 border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              <Plus className="h-6 w-6"/> Add Medicine
            </Button>
            <Button 
              onClick={() => setShowCreateOrderModal(true)}
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2 border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              <ShoppingCart className="h-6 w-6"/> Create Order
            </Button>
            <Button 
              onClick={() => setShowVendorModal(true)}
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2 border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              <Truck className="h-6 w-6"/> Manage Vendors
            </Button>
            <Button 
              onClick={() => setShowStockAlertsModal(true)}
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2 border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              <AlertTriangle className="h-6 w-6"/> Stock Alerts
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-pink-100 text-pink-700 rounded-full">
          <Package className="h-5 w-5 mr-2" />
          <span className="font-medium">Advanced Inventory Management Features Coming Soon</span>
        </div>
      </div>

      {/* Add Medicine Modal */}
      <AddMedicineModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onAdd={handleAddMedicine}
      />

      {/* Create Order Modal */}
      <CreateOrderModal 
        isOpen={showCreateOrderModal} 
        onClose={() => setShowCreateOrderModal(false)} 
        onOrderCreated={handleOrderCreated}
      />

      {/* Vendor Management Modal */}
      <VendorModal 
        isOpen={showVendorModal} 
        onClose={() => {
          setShowVendorModal(false)
          setEditingVendor(null)
        }} 
        onVendorUpdated={handleVendorUpdated}
        editingVendorProp={editingVendor}
      />

      {/* Stock Alerts Modal */}
      <StockAlertsModal 
        isOpen={showStockAlertsModal} 
        onClose={() => setShowStockAlertsModal(false)} 
      />
    </div>
  )
}