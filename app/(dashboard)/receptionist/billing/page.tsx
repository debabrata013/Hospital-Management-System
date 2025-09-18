"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  CreditCard, 
  Search, 
  Plus, 
  Eye, 
  ArrowLeft,
  DollarSign,
  FileText,
  Calendar,
  User,
  Phone,
  Trash2,
  Edit,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface Patient {
  id: number
  patient_id: string
  name: string
  age: number
  gender: string
  contact_number: string
  address?: string
  total_bills: number
  pending_amount: number
  paid_amount: number
  recentBills?: Bill[]
}

interface Bill {
  id: number
  bill_id: string
  patient_id: number
  bill_type: string
  total_amount: number
  discount_amount: number
  tax_amount: number
  final_amount: number
  payment_status: 'pending' | 'partial' | 'paid' | 'cancelled' | 'refunded'
  payment_method?: string
  is_offline: boolean
  notes?: string
  created_at: string
  patient_name: string
  patient_phone: string
  patient_code: string
  created_by_name: string
}

interface BillItem {
  id?: number
  itemType: string
  itemName: string
  description?: string
  quantity: number
  unitPrice: number
  discountPercent?: number
}

interface BillTemplate {
  id: number
  template_name: string
  item_type: string
  item_name: string
  default_price: number
  description?: string
}

export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [templates, setTemplates] = useState<BillTemplate[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  
  // Dialog states
  const [showNewBillDialog, setShowNewBillDialog] = useState(false)
  const [showPatientSearchDialog, setShowPatientSearchDialog] = useState(false)
  const [showBillDetailsDialog, setShowBillDetailsDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
   const [allPatients, setAllPatients] = useState<Patient[]>([])
  // Form states
  const [patientSearchQuery, setPatientSearchQuery] = useState('')
  const [billItems, setBillItems] = useState<BillItem[]>([])
  const [billForm, setBillForm] = useState({
    billType: 'consultation',
    discount: 0,
    tax: 0,
    notes: ''
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchBills()
    fetchTemplates()
  }, [searchQuery, statusFilter, dateFrom, dateTo])

  // Load all patients on mount for search
  useEffect(() => {
    fetchAllPatients();
  }, [])

  const fetchBills = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      })
      
      const response = await fetch(`/api/receptionist/billing?${params}`)
      const data = await response.json()
      setBills(data.bills || [])
    } catch (error) {
      console.error('Failed to fetch bills:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch all patients (initial load)
  const fetchAllPatients = async () => {
    try {
      const response = await fetch('/api/receptionist/patients')
      const data = await response.json()
      setAllPatients(data.patients || [])
      setPatients(data.patients?.slice(0, 20) || []) // Show first 20 initially
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    }
  }
  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/receptionist/billing?action=templates')
      const data = await response.json()
      setTemplates(data.templates || [])
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  // const searchPatients = async (query: string) => {
  //   if (query.length < 2) {
  //     setPatients([])
  //     return
  //   }
    
  //   try {
  //     const response = await fetch(`/api/receptionist/billing/patients?q=${encodeURIComponent(query)}`)
  //     const data = await response.json()
  //     setPatients(data.patients || [])
  //   } catch (error) {
  //     console.error('Failed to search patients:', error)
  //   }
  // }
  // Search patients by name, phone, or patient ID
  const searchPatients = async (query: string) => {
    setPatientSearchQuery(query)
    if (query.length < 2) {
      setPatients(allPatients.slice(0, 20))
      return
    }
    // Local filter
    const filtered = allPatients.filter(patient =>
      patient.name.toLowerCase().includes(query.toLowerCase()) ||
      patient.contact_number.includes(query) ||
      patient.patient_id.toLowerCase().includes(query.toLowerCase())
    )
    if (filtered.length > 0) {
      setPatients(filtered.slice(0, 20))
    } else {
      // If not found locally, search server-side
      try {
        const response = await fetch(`/api/receptionist/patients/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setPatients(data.patients?.slice(0, 20) || [])
      } catch (error) {
        console.error('Failed to search patients:', error)
      }
    }
  }

  const addBillItem = (template?: BillTemplate) => {
    const newItem: BillItem = {
      itemType: template?.item_type || 'consultation',
      itemName: template?.item_name || '',
      description: template?.description || '',
      quantity: 1,
      unitPrice: template?.default_price || 0,
      discountPercent: 0
    }
    setBillItems([...billItems, newItem])
  }

  const updateBillItem = (index: number, field: keyof BillItem, value: any) => {
    const updatedItems = [...billItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setBillItems(updatedItems)
  }

  const removeBillItem = (index: number) => {
    setBillItems(billItems.filter((_, i) => i !== index))
  }

  const calculateTotals = () => {
    const subtotal = billItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const discountAmount = billForm.discount
    const taxAmount = billForm.tax
    const finalAmount = subtotal - discountAmount + taxAmount
    
    return { subtotal, discountAmount, taxAmount, finalAmount }
  }

  const createBill = async (paymentMethod: string, isOffline: boolean) => {
    if (!selectedPatient || billItems.length === 0) return
    
    try {
      setIsSubmitting(true)
      const { finalAmount } = calculateTotals()
      
      const response = await fetch('/api/receptionist/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          billType: billForm.billType,
          items: billItems,
          discount: billForm.discount,
          tax: billForm.tax,
          paymentMethod,
          isOffline,
          notes: billForm.notes,
          createdBy: 1 // Replace with actual user ID
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        if (!isOffline && paymentMethod === 'razorpay') {
          // Initiate Razorpay payment
          initiateRazorpayPayment(data.billId, finalAmount)
        } else {
          // Mark as paid for offline payments
          if (paymentMethod !== 'pending') {
            await updateBillStatus(data.billId, 'paid', paymentMethod)
          }
          
          alert('Bill created successfully!')
          resetBillForm()
          fetchBills()
        }
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to create bill')
      }
    } catch (error) {
      console.error('Failed to create bill:', error)
      alert('Failed to create bill')
    } finally {
      setIsSubmitting(false)
    }
  }

  const initiateRazorpayPayment = async (billId: string, amount: number) => {
    try {
      const response = await fetch('/api/receptionist/billing/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billId, amount })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Initialize Razorpay (you'll need to include Razorpay script)
        const options = {
          key: data.key,
          amount: data.order.amount,
          currency: data.order.currency,
          name: 'NMSC',
          description: `Bill Payment - ${billId}`,
          order_id: data.order.id,
          handler: async (response: any) => {
            // Verify payment
            await verifyRazorpayPayment(billId, response)
          },
          prefill: {
            name: data.bill.patient_name,
            contact: data.bill.patient_phone
          },
          theme: {
            color: '#ec4899'
          }
        }
        
        // @ts-ignore
        const rzp = new Razorpay(options)
        rzp.open()
      }
    } catch (error) {
      console.error('Failed to initiate payment:', error)
      alert('Failed to initiate payment')
    }
  }

  const verifyRazorpayPayment = async (billId: string, paymentResponse: any) => {
    try {
      const response = await fetch('/api/receptionist/billing/razorpay', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId,
          ...paymentResponse
        })
      })

      if (response.ok) {
        alert('Payment successful!')
        resetBillForm()
        fetchBills()
      } else {
        alert('Payment verification failed')
      }
    } catch (error) {
      console.error('Payment verification failed:', error)
      alert('Payment verification failed')
    }
  }

  const updateBillStatus = async (billId: string, status: string, paymentMethod?: string) => {
    try {
      const response = await fetch('/api/receptionist/billing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId,
          paymentStatus: status,
          paymentMethod
        })
      })

      if (response.ok) {
        fetchBills()
      }
    } catch (error) {
      console.error('Failed to update bill status:', error)
    }
  }

  const resetBillForm = () => {
    setSelectedPatient(null)
    setBillItems([])
    setBillForm({ billType: 'consultation', discount: 0, tax: 0, notes: '' })
    setShowNewBillDialog(false)
    setShowPatientSearchDialog(false)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      'partial': { color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
      'paid': { color: 'bg-green-100 text-green-700', icon: CheckCircle },
      'cancelled': { color: 'bg-red-100 text-red-700', icon: XCircle },
      'refunded': { color: 'bg-gray-100 text-gray-700', icon: RefreshCw }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['pending']
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.toUpperCase()}
      </Badge>
    )
  }

  const { subtotal, discountAmount, taxAmount, finalAmount } = calculateTotals()

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/receptionist">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Billing & Payment Management</h1>
            <p className="text-gray-600">Create bills, process payments, and manage billing records</p>
          </div>
        </div>
        <Button 
          className="bg-pink-500 hover:bg-pink-600"
          onClick={() => setShowPatientSearchDialog(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Bill
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Label>Search Bills</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by patient name, phone, or bill ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bills List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Bills ({bills.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-pink-500" />
              <p>Loading bills...</p>
            </div>
          ) : bills.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No bills found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bills.map((bill) => (
                <div key={bill.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-pink-100 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-pink-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{bill.bill_id}</h3>
                          {getStatusBadge(bill.payment_status)}
                          {bill.is_offline && (
                            <Badge variant="outline" className="text-xs">OFFLINE</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {bill.patient_name}
                          </span>
                          <span className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {bill.patient_phone}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(bill.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="font-bold text-lg">₹{Number(bill.final_amount).toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{bill.bill_type}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBill(bill)
                          setShowBillDetailsDialog(true)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {bill.payment_status === 'pending' && (
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => {
                            setSelectedBill(bill)
                            setShowPaymentDialog(true)
                          }}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Pay
                        </Button>
                      )}
                    </div>
                  </div>
                  {bill.notes && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <strong>Notes:</strong> {bill.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Search Dialog */}
      <Dialog open={showPatientSearchDialog} onOpenChange={setShowPatientSearchDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Select Patient for Billing</DialogTitle>
            <DialogDescription>
              Search and select a patient to create a new bill
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Search Patient</Label>
              <Input
                placeholder="Search by name, phone, or patient ID..."
                value={patientSearchQuery}
                onChange={(e) => {
                  setPatientSearchQuery(e.target.value)
                  searchPatients(e.target.value)
                }}
              />
            </div>
            {patients.length > 0 && (
              <div className="max-h-60 overflow-y-auto border rounded-lg">
                {patients.map(patient => (
                  <div
                    key={patient.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => {
                      setSelectedPatient(patient)
                      setShowPatientSearchDialog(false)
                      setShowNewBillDialog(true)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-gray-600">
                          {patient.contact_number} • {patient.age}Y {patient.gender} • #{patient.patient_id}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-gray-600">Bills: {patient.total_bills}</div>
                        {patient.pending_amount > 0 && (
                          <div className="text-red-600">Pending: ₹{Number(patient.pending_amount).toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPatientSearchDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Bill Dialog */}
      <Dialog open={showNewBillDialog} onOpenChange={setShowNewBillDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Bill</DialogTitle>
            <DialogDescription>
              Create a new bill for {selectedPatient?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Patient Info */}
            {selectedPatient && (
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p><strong>Patient:</strong> {selectedPatient.name}</p>
                      <p><strong>ID:</strong> {selectedPatient.patient_id}</p>
                      <p><strong>Phone:</strong> {selectedPatient.contact_number}</p>
                    </div>
                    <div>
                      <p><strong>Age:</strong> {selectedPatient.age} years</p>
                      <p><strong>Gender:</strong> {selectedPatient.gender}</p>
                      <p><strong>Total Bills:</strong> {selectedPatient.total_bills}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bill Type */}
            <div>
              <Label>Bill Type</Label>
              <Select value={billForm.billType} onValueChange={(value) => 
                setBillForm(prev => ({ ...prev, billType: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="lab">Laboratory</SelectItem>
                  <SelectItem value="procedure">Procedure</SelectItem>
                  <SelectItem value="admission">Admission</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bill Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Bill Items</Label>
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addBillItem()}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>
              </div>

              {/* Quick Templates removed as requested */}

              {/* Items List */}
              <div className="space-y-3">
                {billItems.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-3">
                        <Label className="text-xs">Item Name</Label>
                        <Input
                          value={item.itemName}
                          onChange={(e) => updateBillItem(index, 'itemName', e.target.value)}
                          placeholder="Item name"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Type</Label>
                        <Select 
                          value={item.itemType} 
                          onValueChange={(value) => updateBillItem(index, 'itemType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consultation">Consultation</SelectItem>
                            <SelectItem value="medicine">Medicine</SelectItem>
                            <SelectItem value="test">Test</SelectItem>
                            <SelectItem value="procedure">Procedure</SelectItem>
                            <SelectItem value="room_charge">Room Charge</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1">
                        <Label className="text-xs">Qty</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateBillItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Unit Price</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateBillItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Discount %</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discountPercent || 0}
                          onChange={(e) => updateBillItem(index, 'discountPercent', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-1">
                        <Label className="text-xs">Total</Label>
                        <div className="text-sm font-medium p-2 bg-gray-50 rounded">
                          ₹{(item.quantity * item.unitPrice).toFixed(2)}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeBillItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {item.description && (
                      <div className="mt-2">
                        <Textarea
                          placeholder="Item description..."
                          value={item.description}
                          onChange={(e) => updateBillItem(index, 'description', e.target.value)}
                          rows={2}
                        />
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {/* Totals */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Discount Amount</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={billForm.discount}
                      onChange={(e) => setBillForm(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label>Tax Amount</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={billForm.tax}
                      onChange={(e) => setBillForm(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Bill notes..."
                      value={billForm.notes}
                      onChange={(e) => setBillForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={2}
                    />
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>+₹{taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Final Amount:</span>
                      <span>₹{finalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={resetBillForm}>
              Cancel
            </Button>
            <Button 
              onClick={() => createBill('pending', true)}
              disabled={isSubmitting || billItems.length === 0}
            >
              Create Bill (Pending)
            </Button>
            <Button 
              onClick={() => createBill('cash', true)}
              disabled={isSubmitting || billItems.length === 0}
              className="bg-green-500 hover:bg-green-600"
            >
              Cash Payment
            </Button>
            <Button 
              onClick={() => createBill('razorpay', false)}
              disabled={isSubmitting || billItems.length === 0}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Online Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bill Details Dialog */}
      <Dialog open={showBillDetailsDialog} onOpenChange={setShowBillDetailsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Bill Details</DialogTitle>
            <DialogDescription>
              Complete information for bill {selectedBill?.bill_id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBill && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Bill Information</h4>
                  <p><strong>Bill ID:</strong> {selectedBill.bill_id}</p>
                  <p><strong>Type:</strong> {selectedBill.bill_type}</p>
                  <p><strong>Status:</strong> {getStatusBadge(selectedBill.payment_status)}</p>
                  <p><strong>Created:</strong> {new Date(selectedBill.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Patient Information</h4>
                  <p><strong>Name:</strong> {selectedBill.patient_name}</p>
                  <p><strong>Phone:</strong> {selectedBill.patient_phone}</p>
                  <p><strong>Patient ID:</strong> {selectedBill.patient_code}</p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span>₹{Number(selectedBill.total_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-₹{Number(selectedBill.discount_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>+₹{Number(selectedBill.tax_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Final Amount:</span>
                    <span>₹{Number(selectedBill.final_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {selectedBill.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {selectedBill.notes}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBillDetailsDialog(false)}>
              Close
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                if (!selectedBill) return;
                try {
                  const res = await fetch(`/api/receptionist/billing/${selectedBill.bill_id}?format=pdf`);
                  if (!res.ok) throw new Error('Failed to download PDF');
                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Bill_${selectedBill.bill_id}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  alert('Failed to download PDF');
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Process payment for bill {selectedBill?.bill_id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBill && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Amount to Pay</p>
                  <p className="text-2xl font-bold">₹{Number(selectedBill.final_amount).toFixed(2)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => {
                    updateBillStatus(selectedBill.bill_id, 'paid', 'cash')
                    setShowPaymentDialog(false)
                  }}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Cash Payment
                </Button>
                <Button 
                  onClick={() => {
                    initiateRazorpayPayment(selectedBill.bill_id, Number(selectedBill.final_amount))
                    setShowPaymentDialog(false)
                  }}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Online Payment
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
