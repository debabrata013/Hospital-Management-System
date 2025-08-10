"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CreditCard, 
  DollarSign, 
  Receipt, 
  Search, 
  Plus, 
  Eye, 
  Printer,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calculator,
  Banknote,
  Smartphone
} from 'lucide-react'
import Link from 'next/link'

interface BillItem {
  id: string
  service: string
  serviceHindi: string
  quantity: number
  rate: number
  amount: number
  discount?: number
}

interface Bill {
  id: string
  patientId: string
  patientName: string
  patientNameHindi: string
  phone: string
  billDate: string
  items: BillItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paidAmount: number
  balance: number
  status: 'pending' | 'partial' | 'paid' | 'overdue'
  paymentMethod?: string
  createdBy: string
}

const mockBills: Bill[] = [
  {
    id: "B001",
    patientId: "P001",
    patientName: "Ram Sharma",
    patientNameHindi: "राम शर्मा",
    phone: "+91 98765 43210",
    billDate: "2024-01-15",
    items: [
      { id: "I001", service: "Consultation", serviceHindi: "परामर्श", quantity: 1, rate: 500, amount: 500 },
      { id: "I002", service: "Blood Test", serviceHindi: "रक्त जांच", quantity: 1, rate: 300, amount: 300 }
    ],
    subtotal: 800,
    discount: 50,
    tax: 54,
    total: 804,
    paidAmount: 0,
    balance: 804,
    status: 'pending',
    createdBy: 'Reception-1'
  },
  {
    id: "B002",
    patientId: "P002", 
    patientName: "Sunita Devi",
    patientNameHindi: "सुनीता देवी",
    phone: "+91 98765 43211",
    billDate: "2024-01-15",
    items: [
      { id: "I003", service: "Consultation", serviceHindi: "परामर्श", quantity: 1, rate: 800, amount: 800 },
      { id: "I004", service: "Ultrasound", serviceHindi: "अल्ट्रासाउंड", quantity: 1, rate: 1200, amount: 1200 }
    ],
    subtotal: 2000,
    discount: 100,
    tax: 133,
    total: 2033,
    paidAmount: 1000,
    balance: 1033,
    status: 'partial',
    paymentMethod: 'Cash',
    createdBy: 'Reception-1'
  }
]

const servicesList = [
  { id: "S001", name: "Consultation", nameHindi: "परामर्श", rate: 500, category: "consultation" },
  { id: "S002", name: "Blood Test", nameHindi: "रक्त जांच", rate: 300, category: "lab" },
  { id: "S003", name: "X-Ray", nameHindi: "एक्स-रे", rate: 400, category: "imaging" },
  { id: "S004", name: "Ultrasound", nameHindi: "अल्ट्रासाउंड", rate: 1200, category: "imaging" },
  { id: "S005", name: "ECG", nameHindi: "ईसीजी", rate: 200, category: "test" },
  { id: "S006", name: "Medicine", nameHindi: "दवा", rate: 0, category: "pharmacy" }
]

export default function BillingManagement() {
  const [bills, setBills] = useState<Bill[]>(mockBills)
  const [filteredBills, setFilteredBills] = useState<Bill[]>(mockBills)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [showBillDialog, setShowBillDialog] = useState(false)
  const [showNewBillDialog, setShowNewBillDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  // New bill state
  const [newBill, setNewBill] = useState({
    patientName: "",
    patientNameHindi: "",
    phone: "",
    items: [] as BillItem[]
  })

  // Payment state
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'partial': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'paid': return 'bg-green-100 text-green-800 border-green-200'
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'लंबित'
      case 'partial': return 'आंशिक'
      case 'paid': return 'भुगतान'
      case 'overdue': return 'अतिदेय'
      default: return status
    }
  }

  const addItemToBill = (serviceId: string) => {
    const service = servicesList.find(s => s.id === serviceId)
    if (!service) return

    const newItem: BillItem = {
      id: `I${Date.now()}`,
      service: service.name,
      serviceHindi: service.nameHindi,
      quantity: 1,
      rate: service.rate,
      amount: service.rate
    }

    setNewBill(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setNewBill(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { ...item, quantity, amount: item.rate * quantity }
          : item
      )
    }))
  }

  const removeItem = (itemId: string) => {
    setNewBill(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }))
  }

  const calculateBillTotal = (items: BillItem[], discount = 0) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
    const discountAmount = discount
    const taxableAmount = subtotal - discountAmount
    const tax = Math.round(taxableAmount * 0.07) // 7% tax
    const total = taxableAmount + tax
    
    return { subtotal, discount: discountAmount, tax, total }
  }

  const generateBill = () => {
    if (!newBill.patientName || newBill.items.length === 0) {
      alert('कृपया मरीज़ का नाम और सेवाएं जोड़ें')
      return
    }

    const { subtotal, discount, tax, total } = calculateBillTotal(newBill.items)

    const bill: Bill = {
      id: `B${Date.now()}`,
      patientId: `P${Date.now()}`,
      patientName: newBill.patientName,
      patientNameHindi: newBill.patientNameHindi,
      phone: newBill.phone,
      billDate: new Date().toISOString().split('T')[0],
      items: newBill.items,
      subtotal,
      discount,
      tax,
      total,
      paidAmount: 0,
      balance: total,
      status: 'pending',
      createdBy: 'Reception-1'
    }

    setBills(prev => [...prev, bill])
    setFilteredBills(prev => [...prev, bill])
    setShowNewBillDialog(false)
    
    // Reset form
    setNewBill({
      patientName: "",
      patientNameHindi: "",
      phone: "",
      items: []
    })

    alert('बिल सफलतापूर्वक जेनरेट हो गया!')
  }

  const processPayment = () => {
    if (!selectedBill || !paymentAmount || !paymentMethod) {
      alert('कृपया सभी फील्ड भरें')
      return
    }

    const amount = parseFloat(paymentAmount)
    if (amount <= 0 || amount > selectedBill.balance) {
      alert('गलत राशि')
      return
    }

    const updatedBill = {
      ...selectedBill,
      paidAmount: selectedBill.paidAmount + amount,
      balance: selectedBill.balance - amount,
      paymentMethod,
      status: (selectedBill.balance - amount) === 0 ? 'paid' as const : 'partial' as const
    }

    setBills(prev => prev.map(bill => 
      bill.id === selectedBill.id ? updatedBill : bill
    ))
    setFilteredBills(prev => prev.map(bill => 
      bill.id === selectedBill.id ? updatedBill : bill
    ))

    setShowPaymentDialog(false)
    setPaymentAmount("")
    setPaymentMethod("")
    setSelectedBill(null)

    alert('भुगतान सफलतापूर्वक प्रोसेस हो गया!')
  }

  const billStats = {
    total: bills.length,
    pending: bills.filter(b => b.status === 'pending').length,
    partial: bills.filter(b => b.status === 'partial').length,
    paid: bills.filter(b => b.status === 'paid').length,
    totalAmount: bills.reduce((sum, bill) => sum + bill.total, 0),
    paidAmount: bills.reduce((sum, bill) => sum + bill.paidAmount, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      {/* Header */}
      <div className="bg-white border-b border-pink-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/receptionist">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                वापस
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">बिलिंग प्रबंधन</h1>
              <p className="text-sm text-gray-600">Billing & Payment Management</p>
            </div>
          </div>
          
          <Button onClick={() => setShowNewBillDialog(true)} className="bg-pink-600 hover:bg-pink-700">
            <Plus className="h-4 w-4 mr-2" />
            नया बिल
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Billing Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">कुल बिल</p>
                  <p className="text-2xl font-bold">{billStats.total}</p>
                </div>
                <Receipt className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">लंबित</p>
                  <p className="text-2xl font-bold">{billStats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">आंशिक</p>
                  <p className="text-2xl font-bold">{billStats.partial}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">भुगतान</p>
                  <p className="text-2xl font-bold">{billStats.paid}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">कुल राशि</p>
                  <p className="text-2xl font-bold">₹{billStats.totalAmount.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">प्राप्त राशि</p>
                  <p className="text-2xl font-bold">₹{billStats.paidAmount.toLocaleString()}</p>
                </div>
                <Banknote className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bills List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>बिल सूची</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="मरीज़ का नाम या बिल नंबर..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">सभी</SelectItem>
                    <SelectItem value="pending">लंबित</SelectItem>
                    <SelectItem value="partial">आंशिक</SelectItem>
                    <SelectItem value="paid">भुगतान</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredBills.map((bill) => (
                <div key={bill.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge className={getStatusColor(bill.status)}>
                          {getStatusText(bill.status)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          बिल #{bill.id}
                        </span>
                        <span className="text-sm text-gray-500">
                          {bill.billDate}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="font-semibold text-gray-900">{bill.patientNameHindi}</p>
                          <p className="text-sm text-gray-600">{bill.patientName}</p>
                          <p className="text-sm text-gray-600">📞 {bill.phone}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">कुल राशि: ₹{bill.total}</p>
                          <p className="text-sm text-gray-600">भुगतान: ₹{bill.paidAmount}</p>
                          <p className="text-sm font-medium text-red-600">बकाया: ₹{bill.balance}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">सेवाएं: {bill.items.length}</p>
                          {bill.paymentMethod && (
                            <p className="text-sm text-gray-600">भुगतान: {bill.paymentMethod}</p>
                          )}
                          <p className="text-sm text-gray-600">द्वारा: {bill.createdBy}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBill(bill)
                          setShowBillDialog(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert('प्रिंट फीचर जल्द आएगा')}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      
                      {bill.balance > 0 && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedBill(bill)
                            setShowPaymentDialog(true)
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          भुगतान
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredBills.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>कोई बिल नहीं मिला</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Bill Dialog */}
      <Dialog open={showNewBillDialog} onOpenChange={setShowNewBillDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>नया बिल जेनरेट करें</DialogTitle>
            <DialogDescription>
              मरीज़ की जानकारी और सेवाओं का विवरण जोड़ें
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Patient Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="patientName">मरीज़ का नाम (अंग्रेजी) *</Label>
                <Input
                  id="patientName"
                  value={newBill.patientName}
                  onChange={(e) => setNewBill(prev => ({ ...prev, patientName: e.target.value }))}
                  placeholder="Patient Name"
                />
              </div>
              
              <div>
                <Label htmlFor="patientNameHindi">मरीज़ का नाम (हिंदी)</Label>
                <Input
                  id="patientNameHindi"
                  value={newBill.patientNameHindi}
                  onChange={(e) => setNewBill(prev => ({ ...prev, patientNameHindi: e.target.value }))}
                  placeholder="मरीज़ का नाम"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">फोन नंबर</Label>
                <Input
                  id="phone"
                  value={newBill.phone}
                  onChange={(e) => setNewBill(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Add Services */}
            <div>
              <Label>सेवा जोड़ें</Label>
              <Select onValueChange={addItemToBill}>
                <SelectTrigger>
                  <SelectValue placeholder="सेवा चुनें" />
                </SelectTrigger>
                <SelectContent>
                  {servicesList.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.nameHindi} - ₹{service.rate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bill Items */}
            {newBill.items.length > 0 && (
              <div>
                <Label>बिल आइटम</Label>
                <div className="border rounded-lg">
                  <div className="grid grid-cols-5 gap-4 p-3 bg-gray-50 font-medium text-sm">
                    <div>सेवा</div>
                    <div>मात्रा</div>
                    <div>दर</div>
                    <div>राशि</div>
                    <div>कार्य</div>
                  </div>
                  {newBill.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-5 gap-4 p-3 border-t">
                      <div>
                        <p className="font-medium">{item.serviceHindi}</p>
                        <p className="text-sm text-gray-600">{item.service}</p>
                      </div>
                      <div>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                          min="1"
                          className="w-20"
                        />
                      </div>
                      <div>₹{item.rate}</div>
                      <div>₹{item.amount}</div>
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600"
                        >
                          हटाएं
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Bill Summary */}
                  <div className="border-t bg-gray-50 p-3">
                    <div className="flex justify-end">
                      <div className="w-64 space-y-2">
                        <div className="flex justify-between">
                          <span>उप-योग:</span>
                          <span>₹{calculateBillTotal(newBill.items).subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>छूट:</span>
                          <span>₹{calculateBillTotal(newBill.items).discount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>कर (7%):</span>
                          <span>₹{calculateBillTotal(newBill.items).tax}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>कुल:</span>
                          <span>₹{calculateBillTotal(newBill.items).total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewBillDialog(false)}>
              रद्द करें
            </Button>
            <Button onClick={generateBill} disabled={newBill.items.length === 0}>
              <Calculator className="h-4 w-4 mr-2" />
              बिल जेनरेट करें
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>भुगतान प्रोसेस करें</DialogTitle>
            <DialogDescription>
              {selectedBill?.patientNameHindi} के लिए भुगतान विवरण
            </DialogDescription>
          </DialogHeader>
          
          {selectedBill && (
            <div className="space-y-4">
              <Alert>
                <DollarSign className="h-4 w-4" />
                <AlertDescription>
                  कुल बकाया राशि: ₹{selectedBill.balance}
                </AlertDescription>
              </Alert>
              
              <div>
                <Label htmlFor="paymentAmount">भुगतान राशि *</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="राशि दर्ज करें"
                  max={selectedBill.balance}
                />
              </div>
              
              <div>
                <Label htmlFor="paymentMethod">भुगतान विधि *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="भुगतान विधि चुनें" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">नकद</SelectItem>
                    <SelectItem value="Card">कार्ड</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Net Banking">नेट बैंकिंग</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              रद्द करें
            </Button>
            <Button onClick={processPayment}>
              <CreditCard className="h-4 w-4 mr-2" />
              भुगतान करें
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
