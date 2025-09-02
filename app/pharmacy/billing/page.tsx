"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, Plus, Receipt, User, FileText, 
  ShoppingCart, Calculator, CreditCard
} from 'lucide-react'
import { toast } from "sonner"

export default function PharmacyBillingPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [billItems, setBillItems] = useState<any[]>([])
  const [showBillDialog, setShowBillDialog] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [loading, setLoading] = useState(false)

  // Load all patients on component mount
  useEffect(() => {
    loadPatients()
  }, [])

  // Filter patients when search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      searchPatients()
    } else {
      loadPatients()
    }
  }, [searchTerm])

  const loadPatients = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/pharmacy/billing/search-patients?all=true')
      const result = await response.json()
      
      if (result.success) {
        setPatients(result.data)
      }
    } catch (error) {
      console.error("Error loading patients:", error)
    } finally {
      setLoading(false)
    }
  }

  const searchPatients = async () => {
    if (!searchTerm.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/pharmacy/billing/search-patients?q=${encodeURIComponent(searchTerm)}`)
      const result = await response.json()
      
      if (result.success) {
        setPatients(result.data)
      }
    } catch (error) {
      console.error("Error searching patients:", error)
    } finally {
      setLoading(false)
    }
  }

  const selectPatient = async (patient: any) => {
    setSelectedPatient(patient)
    await loadPatientPrescriptions(patient.id)
  }

  const loadPatientPrescriptions = async (patientId: string) => {
    try {
      const response = await fetch(`/api/pharmacy/billing/prescriptions/${patientId}`)
      const result = await response.json()
      
      if (result.success) {
        setPrescriptions(result.data)
      }
    } catch (error) {
      console.error("Error loading prescriptions:", error)
    }
  }

  const addToBill = (item: any) => {
    const existingItem = billItems.find(bi => bi.medicine_id === item.medicine_id)
    
    if (existingItem) {
      setBillItems(billItems.map(bi => 
        bi.medicine_id === item.medicine_id 
          ? { ...bi, quantity: bi.quantity + item.quantity }
          : bi
      ))
    } else {
      setBillItems([...billItems, { ...item, bill_quantity: item.quantity }])
    }
    toast.success(`${item.medicine_name} added to bill`)
  }

  const updateBillQuantity = (medicineId: string, quantity: number) => {
    setBillItems(billItems.map(item => 
      item.medicine_id === medicineId 
        ? { ...item, bill_quantity: quantity }
        : item
    ))
  }

  const removeBillItem = (medicineId: string) => {
    setBillItems(billItems.filter(item => item.medicine_id !== medicineId))
  }

  const calculateTotal = () => {
    return billItems.reduce((total, item) => total + (item.unit_price * item.bill_quantity), 0)
  }

  const processBill = async () => {
    if (!selectedPatient || billItems.length === 0) return

    try {
      const response = await fetch('/api/pharmacy/billing/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          items: billItems,
          payment_method: paymentMethod,
          total_amount: calculateTotal()
        })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success("Bill created successfully")
        setBillItems([])
        setShowBillDialog(false)
        // Reload prescriptions to update dispensed status
        await loadPatientPrescriptions(selectedPatient.id)
      } else {
        toast.error("Failed to create bill")
      }
    } catch (error) {
      toast.error("Error processing bill")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pharmacy Billing</h1>
          <p className="text-gray-600">Search patients and create medicine bills</p>
        </div>
      </div>

      {/* Patient Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by patient name, ID, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Patient List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {loading ? (
              <div className="text-center py-4">Loading patients...</div>
            ) : patients.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No patients found</div>
            ) : (
              patients.map((patient: any) => (
                <div
                  key={patient.id}
                  onClick={() => selectPatient(patient)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPatient?.id === patient.id 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{patient.name}</h4>
                      <p className="text-sm text-gray-600">
                        ID: {patient.patient_id} | Phone: {patient.contact_number}
                      </p>
                    </div>
                    {selectedPatient?.id === patient.id && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedPatient && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold">Selected: {selectedPatient.name}</h3>
              <p className="text-sm text-gray-600">
                ID: {selectedPatient.patient_id} | Phone: {selectedPatient.contact_number}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prescriptions */}
      {selectedPatient && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Patient Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prescriptions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No prescriptions found</p>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((prescription: any) => (
                  <div key={prescription.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{prescription.prescription_id}</h4>
                        <p className="text-sm text-gray-600">
                          Dr. {prescription.doctor_name} | {new Date(prescription.prescription_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={prescription.status === 'completed' ? 'default' : 'destructive'}>
                        {prescription.status}
                      </Badge>
                    </div>

                    {prescription.items && prescription.items.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-medium">Medicines:</h5>
                        {prescription.items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div className="flex-1">
                              <p className="font-medium">{item.medicine_name}</p>
                              <p className="text-sm text-gray-600">
                                {item.dosage} | {item.frequency} | {item.duration} | Qty: {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">₹{Number(item.unit_price || 0).toFixed(2)}</span>
                              {!item.is_dispensed && (
                                <Button size="sm" onClick={() => addToBill(item)}>
                                  <Plus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Current Bill */}
      {billItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Current Bill
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {billItems.map((item: any) => (
                <div key={item.medicine_id} className="flex justify-between items-center p-3 border rounded">
                  <div className="flex-1">
                    <p className="font-medium">{item.medicine_name}</p>
                    <p className="text-sm text-gray-600">₹{item.unit_price} per unit</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.bill_quantity}
                      onChange={(e) => updateBillQuantity(item.medicine_id, parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                    <span className="font-semibold w-20 text-right">
                      ₹{(item.unit_price * item.bill_quantity).toFixed(2)}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => removeBillItem(item.medicine_id)}>
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button onClick={() => setShowBillDialog(true)} className="flex-1">
                <Receipt className="h-4 w-4 mr-2" />
                Process Bill
              </Button>
              <Button variant="outline" onClick={() => setBillItems([])}>
                Clear Bill
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Dialog */}
      <Dialog open={showBillDialog} onOpenChange={setShowBillDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Complete the billing process for {selectedPatient?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowBillDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={processBill} className="flex-1">
                <CreditCard className="h-4 w-4 mr-2" />
                Complete Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
