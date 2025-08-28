"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Printer
} from 'lucide-react'

// Mock billing data
const mockBills = [
  {
    id: "BILL001",
    patientName: "Rajesh Kumar",
    patientId: "P001",
    billDate: "2024-01-09",
    services: [
      { name: "Consultation", amount: 500 },
      { name: "ECG Test", amount: 300 },
      { name: "Blood Test", amount: 450 }
    ],
    subtotal: 1250,
    discount: 125,
    discountPercent: 10,
    tax: 112.50,
    total: 1237.50,
    status: "paid",
    paymentMethod: "UPI",
    paidDate: "2024-01-09",
    doctorName: "Dr. Priya Sharma",
    department: "Cardiology"
  },
  {
    id: "BILL002",
    patientName: "Sunita Devi",
    patientId: "P002",
    billDate: "2024-01-09",
    services: [
      { name: "Consultation", amount: 600 },
      { name: "Ultrasound", amount: 800 },
      { name: "Lab Tests", amount: 350 }
    ],
    subtotal: 1750,
    discount: 0,
    discountPercent: 0,
    tax: 157.50,
    total: 1907.50,
    status: "pending",
    paymentMethod: null,
    paidDate: null,
    doctorName: "Dr. Amit Patel",
    department: "Gynecology"
  },
  {
    id: "BILL003",
    patientName: "Mohammed Ali",
    patientId: "P003",
    billDate: "2024-01-08",
    services: [
      { name: "Consultation", amount: 500 },
      { name: "X-Ray", amount: 400 },
      { name: "Medicines", amount: 650 }
    ],
    subtotal: 1550,
    discount: 310,
    discountPercent: 20,
    tax: 111.60,
    total: 1351.60,
    status: "discount_requested",
    paymentMethod: null,
    paidDate: null,
    doctorName: "Dr. Sarah Johnson",
    department: "Internal Medicine"
  }
]

export default function AdminBillingPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-100 text-green-700">Paid</Badge>
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
      case 'discount_requested': return <Badge className="bg-blue-100 text-blue-700">Discount Requested</Badge>
      case 'overdue': return <Badge className="bg-red-100 text-red-700">Overdue</Badge>
      default: return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'discount_requested': return <AlertTriangle className="h-4 w-4 text-blue-500" />
      case 'overdue': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getPaymentMethodBadge = (method: string | null) => {
    if (!method) return null
    const colors = {
      'UPI': 'bg-purple-100 text-purple-700',
      'Cash': 'bg-green-100 text-green-700',
      'Card': 'bg-blue-100 text-blue-700',
      'Insurance': 'bg-orange-100 text-orange-700'
    }
    return <Badge className={colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-700'}>{method}</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <CreditCard className="h-8 w-8 mr-2 sm:mr-3 text-pink-500" />
            Billing Management
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Manage patient bills, payments, and billing approvals
          </p>
        </div>
        <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 w-full sm:w-auto flex items-center justify-center gap-2">
          <Plus className="h-4 w-4" />
          Create Bill
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">₹15,420</p>
            </div>
            <DollarSign className="h-6 sm:h-8 w-6 sm:w-8 text-pink-500" />
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Bills</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">18</p>
            </div>
            <Clock className="h-6 sm:h-8 w-6 sm:w-8 text-yellow-500" />
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid Bills</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">45</p>
            </div>
            <CheckCircle className="h-6 sm:h-8 w-6 sm:w-8 text-green-500" />
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Discount Requests</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">5</p>
            </div>
            <AlertTriangle className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500" />
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-pink-100 mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search bills by patient, ID, or doctor..." className="pl-10 border-pink-200 focus:border-pink-400 w-full" />
            </div>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 w-full sm:w-auto flex items-center justify-center gap-2">
              <Filter className="h-4 w-4" />
              Filter by Status
            </Button>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 w-full sm:w-auto flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              Today
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bills List */}
      <Card className="border-pink-100 mb-6">
        <CardHeader>
          <CardTitle>Recent Bills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockBills.map((bill) => (
            <div key={bill.id} className="p-4 sm:p-5 border border-pink-100 rounded-lg hover:shadow-md flex flex-col sm:flex-row sm:justify-between gap-4">
              
              <div className="flex gap-4 sm:gap-6 flex-1">
                <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-lg h-16 w-16 flex items-center justify-center font-bold">
                  <CreditCard className="h-8 w-8" />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2 flex-wrap">
                    <h3 className="font-bold text-lg text-gray-900">{bill.patientName}</h3>
                    <div className="flex flex-wrap gap-2 items-center">
                      <Badge variant="outline">{bill.id}</Badge>
                      {getStatusBadge(bill.status)}
                      {bill.paymentMethod && getPaymentMethodBadge(bill.paymentMethod)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-sm text-gray-600">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1"><User className="h-4 w-4 text-pink-500"/><span>Patient ID: {bill.patientId}</span></div>
                      <div className="flex items-center gap-1"><Calendar className="h-4 w-4 text-pink-500"/><span>Bill Date: {new Date(bill.billDate).toLocaleDateString()}</span></div>
                      <div className="flex gap-1"><span className="font-medium">Doctor:</span> <span>{bill.doctorName} • {bill.department}</span></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between"><span>Subtotal:</span><span className="font-semibold">₹{bill.subtotal}</span></div>
                      {bill.discount>0 && <div className="flex justify-between"><span>Discount ({bill.discountPercent}%):</span><span className="font-semibold text-green-600">-₹{bill.discount}</span></div>}
                      <div className="flex justify-between"><span>Tax:</span><span className="font-semibold">₹{bill.tax}</span></div>
                      <div className="flex justify-between border-t pt-1 font-bold text-pink-600"><span>Total:</span><span>₹{bill.total}</span></div>
                    </div>
                  </div>

                  <div className="p-2 bg-gray-50 rounded-lg text-sm">
                    <h4 className="font-medium mb-1">Services:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {bill.services.map((s,i)=><div key={i} className="flex justify-between"><span className="text-gray-600">{s.name}:</span><span className="font-medium">₹{s.amount}</span></div>)}
                    </div>
                  </div>

                  {bill.paidDate && <div className="mt-1 text-sm text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4"/>Paid on {new Date(bill.paidDate).toLocaleDateString()}</div>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap sm:flex-col sm:items-end flex-shrink-0">
                <div>{getStatusIcon(bill.status)}</div>
                <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50"><Eye className="h-4 w-4"/></Button>
                <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50"><Edit className="h-4 w-4"/></Button>
                <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50"><Printer className="h-4 w-4"/></Button>
                {bill.status==='discount_requested' && <Button variant="outline" size="sm" className="border-orange-200 text-orange-600 hover:bg-orange-50"><AlertTriangle className="h-4 w-4"/></Button>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Payment Methods Overview */}
      <Card className="border-pink-100 mb-6">
        <CardHeader><CardTitle>Payment Methods Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <CreditCard className="h-8 w-8 text-purple-500 mx-auto mb-2"/>
              <h4 className="font-semibold text-purple-800">UPI Payments</h4>
              <p className="text-2xl font-bold text-purple-600">₹8,500</p>
              <p className="text-sm text-purple-600">28 transactions</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2"/>
              <h4 className="font-semibold text-green-800">Cash Payments</h4>
              <p className="text-2xl font-bold text-green-600">₹4,200</p>
              <p className="text-sm text-green-600">15 transactions</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <CreditCard className="h-8 w-8 text-blue-500 mx-auto mb-2"/>
              <h4 className="font-semibold text-blue-800">Card Payments</h4>
              <p className="text-2xl font-bold text-blue-600">₹2,720</p>
              <p className="text-sm text-blue-600">8 transactions</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg text-center">
              <FileText className="h-8 w-8 text-orange-500 mx-auto mb-2"/>
              <h4 className="font-semibold text-orange-800">Insurance</h4>
              <p className="text-2xl font-bold text-orange-600">₹1,500</p>
              <p className="text-sm text-orange-600">3 claims</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discount Requests Notice */}
      <Card className="border-blue-100 bg-blue-50 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <AlertTriangle className="h-5 w-5 mr-2"/>
            Discount Approval Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-blue-700 text-sm sm:text-base">
            <p className="mb-1"><strong>Note:</strong> Branch Admins can approve standard discounts up to 15%.</p>
            <p><strong>Above 15%:</strong> Requires Super Admin approval.</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-pink-100 mb-6">
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center gap-2">
              <Plus className="h-6 w-6"/>
              <span className="text-sm text-center">Create Bill</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center gap-2">
              <CheckCircle className="h-6 w-6"/>
              <span className="text-sm text-center">Process Payment</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center gap-2">
              <AlertTriangle className="h-6 w-6"/>
              <span className="text-sm text-center">Approve Discounts</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center gap-2">
              <FileText className="h-6 w-6"/>
              <span className="text-sm text-center">Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center px-4 sm:px-6 py-2 bg-pink-100 text-pink-700 rounded-full">
          <CreditCard className="h-5 w-5 mr-2"/>
          <span className="font-medium text-sm sm:text-base">Advanced Billing Features Coming Soon</span>
        </div>
      </div>
    </div>
  )
}
