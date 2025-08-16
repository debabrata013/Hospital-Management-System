"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DollarSign,
  Download,
  Search,
  CreditCard,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Printer,
  Eye,
  Shield,
} from "lucide-react"

export function BillingSystem() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)

  const invoices = [
    {
      id: "INV-2024-001",
      date: "2024-11-28",
      dueDate: "2024-12-28",
      description: "Annual Physical Examination",
      doctor: "Dr. Sarah Smith",
      amount: 245.0,
      status: "pending",
      services: [
        { name: "Office Visit", code: "99213", amount: 180.0 },
        { name: "Blood Work", code: "80053", amount: 65.0 },
      ],
      insurance: {
        provider: "Blue Cross Blue Shield",
        covered: 196.0,
        patientResponsibility: 49.0,
      },
    },
    {
      id: "INV-2024-002",
      date: "2024-11-15",
      dueDate: "2024-12-15",
      description: "Cardiology Consultation",
      doctor: "Dr. Michael Johnson",
      amount: 320.0,
      status: "overdue",
      services: [
        { name: "Specialist Consultation", code: "99243", amount: 250.0 },
        { name: "ECG", code: "93000", amount: 70.0 },
      ],
      insurance: {
        provider: "Blue Cross Blue Shield",
        covered: 256.0,
        patientResponsibility: 64.0,
      },
    },
    {
      id: "INV-2024-003",
      date: "2024-10-20",
      dueDate: "2024-11-20",
      description: "Dermatology Visit",
      doctor: "Dr. Emily Williams",
      amount: 180.0,
      status: "paid",
      paidDate: "2024-11-18",
      services: [
        { name: "Dermatology Consultation", code: "99213", amount: 150.0 },
        { name: "Biopsy", code: "11100", amount: 30.0 },
      ],
      insurance: {
        provider: "Blue Cross Blue Shield",
        covered: 144.0,
        patientResponsibility: 36.0,
      },
    },
    {
      id: "INV-2024-004",
      date: "2024-09-15",
      dueDate: "2024-10-15",
      description: "Lab Work - Blood Panel",
      doctor: "Dr. Robert Brown",
      amount: 125.0,
      status: "paid",
      paidDate: "2024-10-10",
      services: [
        { name: "Complete Blood Count", code: "85025", amount: 45.0 },
        { name: "Lipid Panel", code: "80061", amount: 50.0 },
        { name: "Glucose Test", code: "82947", amount: 30.0 },
      ],
      insurance: {
        provider: "Blue Cross Blue Shield",
        covered: 100.0,
        patientResponsibility: 25.0,
      },
    },
  ]

  const paymentHistory = [
    {
      id: "PAY-2024-001",
      date: "2024-11-18",
      amount: 36.0,
      method: "Credit Card",
      invoiceId: "INV-2024-003",
      status: "completed",
    },
    {
      id: "PAY-2024-002",
      date: "2024-10-10",
      amount: 25.0,
      method: "Bank Transfer",
      invoiceId: "INV-2024-004",
      status: "completed",
    },
    {
      id: "PAY-2024-003",
      date: "2024-09-22",
      amount: 150.0,
      method: "Credit Card",
      invoiceId: "INV-2024-005",
      status: "completed",
    },
  ]

  const insuranceInfo = {
    provider: "Blue Cross Blue Shield",
    policyNumber: "BCBS-123456789",
    groupNumber: "GRP-987654",
    effectiveDate: "2024-01-01",
    deductible: 1500.0,
    deductibleMet: 450.0,
    outOfPocketMax: 5000.0,
    outOfPocketMet: 450.0,
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "overdue":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDownloadInvoice = (invoiceId: string) => {
    console.log(`Downloading invoice ${invoiceId}`)
    alert("Invoice PDF download started!")
  }

  const handlePrintInvoice = (invoiceId: string) => {
    console.log(`Printing invoice ${invoiceId}`)
    alert("Invoice sent to printer!")
  }

  const handlePayInvoice = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsPaymentModalOpen(true)
  }

  const handlePaymentSubmit = () => {
    console.log("Processing payment for:", selectedInvoice)
    setIsPaymentModalOpen(false)
    setSelectedInvoice(null)
    alert("Payment processed successfully!")
  }

  const filteredInvoices = invoices
    .filter((invoice) => {
      const matchesSearch =
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.doctor.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === "all" || invoice.status === filterStatus
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let aValue, bValue
      switch (sortBy) {
        case "date":
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        case "amount":
          aValue = a.amount
          bValue = b.amount
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        default:
          aValue = a.id
          bValue = b.id
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const totalOutstanding = invoices
    .filter((invoice) => invoice.status !== "paid")
    .reduce((sum, invoice) => sum + (invoice.insurance?.patientResponsibility || invoice.amount), 0)

  const totalPaid = paymentHistory
    .filter((payment) => payment.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
          <p className="text-gray-600">Manage your medical bills, payments, and insurance information</p>
        </div>
        <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
          <CreditCard className="w-4 h-4 mr-2" />
          Make Payment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Outstanding Balance</CardTitle>
            <DollarSign className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalOutstanding.toFixed(2)}</div>
            <p className="text-xs text-gray-500">2 pending invoices</p>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Paid</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</div>
            <p className="text-xs text-gray-500">This year</p>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Deductible Met</CardTitle>
            <Shield className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${insuranceInfo.deductibleMet.toFixed(2)}</div>
            <p className="text-xs text-gray-500">of ${insuranceInfo.deductible.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Next Due Date</CardTitle>
            <Calendar className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">Dec 15</div>
            <p className="text-xs text-gray-500">$64.00 due</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invoices">Invoices & Bills</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="insurance">Insurance Info</TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          {/* Filters and Search */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="amount">Sort by Amount</SelectItem>
                    <SelectItem value="status">Sort by Status</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                  {sortOrder === "asc" ? "↑" : "↓"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Invoices Table */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle>Medical Bills & Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Patient Responsibility</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>{invoice.doctor}</TableCell>
                      <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold">
                        ${(invoice.insurance?.patientResponsibility || invoice.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>
                          {getStatusIcon(invoice.status)}
                          <span className="ml-1 capitalize">{invoice.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(invoice.id)}>
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handlePrintInvoice(invoice.id)}>
                            <Printer className="w-3 h-3" />
                          </Button>
                          {invoice.status !== "paid" && (
                            <Button
                              size="sm"
                              onClick={() => handlePayInvoice(invoice)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Pay
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>{payment.invoiceId}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3 mr-1" />
                          View Receipt
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insurance Info Tab */}
        <TabsContent value="insurance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Insurance Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Provider</Label>
                    <p className="font-semibold">{insuranceInfo.provider}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Policy Number</Label>
                    <p className="font-semibold">{insuranceInfo.policyNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Group Number</Label>
                    <p className="font-semibold">{insuranceInfo.groupNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Effective Date</Label>
                    <p className="font-semibold">{insuranceInfo.effectiveDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle>Deductible & Out-of-Pocket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium text-gray-600">Annual Deductible</Label>
                    <span className="font-semibold">
                      ${insuranceInfo.deductibleMet.toFixed(2)} / ${insuranceInfo.deductible.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(insuranceInfo.deductibleMet / insuranceInfo.deductible) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium text-gray-600">Out-of-Pocket Maximum</Label>
                    <span className="font-semibold">
                      ${insuranceInfo.outOfPocketMet.toFixed(2)} / ${insuranceInfo.outOfPocketMax.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${(insuranceInfo.outOfPocketMet / insuranceInfo.outOfPocketMax) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
            <DialogDescription>Pay your medical bill securely online</DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold">{selectedInvoice.description}</h4>
                <p className="text-sm text-gray-600">Invoice: {selectedInvoice.id}</p>
                <p className="text-lg font-bold text-green-600">
                  Amount Due: ${(selectedInvoice.insurance?.patientResponsibility || selectedInvoice.amount).toFixed(2)}
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="name">Cardholder Name</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePaymentSubmit} className="bg-green-600 hover:bg-green-700">
              <CreditCard className="w-4 h-4 mr-2" />
              Pay Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
