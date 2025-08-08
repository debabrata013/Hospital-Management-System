"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Heart, ArrowLeft, Search, FileText, Eye, Check, X, Clock, User, Stethoscope, Calendar, AlertCircle } from 'lucide-react'

// Mock prescription data
const prescriptionData = [
  {
    id: "RX001",
    patientName: "Sarah Johnson",
    patientId: "P001",
    doctorName: "Dr. Michael Smith",
    department: "Internal Medicine",
    prescriptionDate: "2024-01-15",
    status: "pending",
    priority: "high",
    medicines: [
      { name: "Amoxicillin 500mg", dosage: "1 tablet", frequency: "3 times daily", duration: "7 days", quantity: 21 },
      { name: "Paracetamol 650mg", dosage: "1 tablet", frequency: "as needed", duration: "5 days", quantity: 10 }
    ],
    notes: "Patient has mild fever and throat infection. Monitor for allergic reactions.",
    totalAmount: 455.50
  },
  {
    id: "RX002",
    patientName: "Michael Brown",
    patientId: "P002",
    doctorName: "Dr. Emily Davis",
    department: "Endocrinology",
    prescriptionDate: "2024-01-15",
    status: "fulfilled",
    priority: "normal",
    medicines: [
      { name: "Metformin 500mg", dosage: "1 tablet", frequency: "2 times daily", duration: "30 days", quantity: 60 },
      { name: "Lisinopril 10mg", dosage: "1 tablet", frequency: "once daily", duration: "30 days", quantity: 30 }
    ],
    notes: "Regular diabetes and hypertension management. Patient education provided.",
    totalAmount: 1250.00,
    fulfilledDate: "2024-01-15",
    fulfilledBy: "John Pharmacist"
  },
  {
    id: "RX003",
    patientName: "Emily Wilson",
    patientId: "P003",
    doctorName: "Dr. Robert Johnson",
    department: "Orthopedics",
    prescriptionDate: "2024-01-14",
    status: "pending",
    priority: "normal",
    medicines: [
      { name: "Ibuprofen 400mg", dosage: "1 tablet", frequency: "3 times daily", duration: "5 days", quantity: 15 }
    ],
    notes: "Post-surgery pain management. Take with food to avoid stomach upset.",
    totalAmount: 225.50
  },
  {
    id: "RX004",
    patientName: "David Lee",
    patientId: "P004",
    doctorName: "Dr. Lisa Chen",
    department: "Cardiology",
    prescriptionDate: "2024-01-14",
    status: "partially_fulfilled",
    priority: "high",
    medicines: [
      { name: "Atorvastatin 20mg", dosage: "1 tablet", frequency: "once daily", duration: "30 days", quantity: 30 },
      { name: "Aspirin 75mg", dosage: "1 tablet", frequency: "once daily", duration: "30 days", quantity: 30 }
    ],
    notes: "Cardiovascular risk management. Regular monitoring required.",
    totalAmount: 850.00
  }
]

const statusOptions = ["All Status", "pending", "fulfilled", "partially_fulfilled", "cancelled"]
const priorityOptions = ["All Priority", "high", "normal", "low"]

export default function PrescriptionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All Status")
  const [selectedPriority, setSelectedPriority] = useState("All Priority")
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [fulfillmentNotes, setFulfillmentNotes] = useState("")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
      case "fulfilled":
        return <Badge className="bg-green-100 text-green-700">Fulfilled</Badge>
      case "partially_fulfilled":
        return <Badge className="bg-blue-100 text-blue-700">Partially Fulfilled</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-700">High</Badge>
      case "normal":
        return <Badge className="bg-gray-100 text-gray-700">Normal</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-700">Low</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{priority}</Badge>
    }
  }

  const filteredData = prescriptionData.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "All Status" || prescription.status === selectedStatus
    const matchesPriority = selectedPriority === "All Priority" || prescription.priority === selectedPriority
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleFulfillPrescription = (prescriptionId: string) => {
    // Handle prescription fulfillment logic
    console.log("Fulfilling prescription:", prescriptionId, "Notes:", fulfillmentNotes)
    setFulfillmentNotes("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/pharmacy" className="flex items-center space-x-2 text-gray-600 hover:text-pink-500 transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Pharmacy</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-pink-500" />
                <span className="text-lg font-semibold text-gray-700">Prescription Management</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title and Stats */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Prescription Management</h1>
          <p className="text-gray-600 mb-6">Review and fulfill patient prescriptions</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-pink-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Prescriptions</p>
                    <p className="text-2xl font-bold text-gray-900">{prescriptionData.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-pink-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-pink-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {prescriptionData.filter(p => p.status === "pending").length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-pink-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">High Priority</p>
                    <p className="text-2xl font-bold text-red-600">
                      {prescriptionData.filter(p => p.priority === "high").length}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-pink-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Today's Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{prescriptionData.filter(p => p.status === "fulfilled").reduce((sum, p) => sum + p.totalAmount, 0).toFixed(2)}
                    </p>
                  </div>
                  <Check className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="border-pink-100 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search prescriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
                  />
                </div>
                
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-48 border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="w-full sm:w-48 border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map(priority => (
                      <SelectItem key={priority} value={priority}>
                        {priority.replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions Table */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="text-gray-900">Prescriptions ({filteredData.length})</CardTitle>
            <CardDescription>Review and manage patient prescriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prescription ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((prescription) => (
                    <TableRow key={prescription.id} className="hover:bg-pink-50">
                      <TableCell>
                        <p className="font-semibold text-gray-900">{prescription.id}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{prescription.patientName}</p>
                            <p className="text-sm text-gray-500">{prescription.patientId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{prescription.doctorName}</p>
                            <p className="text-sm text-gray-500">{prescription.department}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            {new Date(prescription.prescriptionDate).toLocaleDateString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(prescription.status)}
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(prescription.priority)}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-gray-900">₹{prescription.totalAmount.toFixed(2)}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-pink-200 text-pink-600 hover:bg-pink-50"
                                onClick={() => setSelectedPrescription(prescription)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Prescription Details - {selectedPrescription?.id}</DialogTitle>
                                <DialogDescription>
                                  Review prescription details and fulfill if needed
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedPrescription && (
                                <div className="space-y-6">
                                  {/* Patient and Doctor Info */}
                                  <div className="grid md:grid-cols-2 gap-6">
                                    <Card className="border-pink-100">
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center">
                                          <User className="h-5 w-5 mr-2 text-pink-500" />
                                          Patient Information
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="space-y-2">
                                          <p><span className="font-medium">Name:</span> {selectedPrescription.patientName}</p>
                                          <p><span className="font-medium">Patient ID:</span> {selectedPrescription.patientId}</p>
                                        </div>
                                      </CardContent>
                                    </Card>
                                    
                                    <Card className="border-pink-100">
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center">
                                          <Stethoscope className="h-5 w-5 mr-2 text-pink-500" />
                                          Doctor Information
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="space-y-2">
                                          <p><span className="font-medium">Doctor:</span> {selectedPrescription.doctorName}</p>
                                          <p><span className="font-medium">Department:</span> {selectedPrescription.department}</p>
                                          <p><span className="font-medium">Date:</span> {new Date(selectedPrescription.prescriptionDate).toLocaleDateString()}</p>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                  
                                  {/* Medicines */}
                                  <Card className="border-pink-100">
                                    <CardHeader>
                                      <CardTitle className="text-lg">Prescribed Medicines</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="overflow-x-auto">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>Medicine</TableHead>
                                              <TableHead>Dosage</TableHead>
                                              <TableHead>Frequency</TableHead>
                                              <TableHead>Duration</TableHead>
                                              <TableHead>Quantity</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {selectedPrescription.medicines.map((medicine: any, index: number) => (
                                              <TableRow key={index}>
                                                <TableCell className="font-medium">{medicine.name}</TableCell>
                                                <TableCell>{medicine.dosage}</TableCell>
                                                <TableCell>{medicine.frequency}</TableCell>
                                                <TableCell>{medicine.duration}</TableCell>
                                                <TableCell>{medicine.quantity}</TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </CardContent>
                                  </Card>
                                  
                                  {/* Notes */}
                                  <Card className="border-pink-100">
                                    <CardHeader>
                                      <CardTitle className="text-lg">Doctor's Notes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <p className="text-gray-700">{selectedPrescription.notes}</p>
                                    </CardContent>
                                  </Card>
                                  
                                  {/* Fulfillment Section */}
                                  {selectedPrescription.status === "pending" && (
                                    <Card className="border-pink-100">
                                      <CardHeader>
                                        <CardTitle className="text-lg">Fulfill Prescription</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-4">
                                        <Textarea
                                          placeholder="Add fulfillment notes..."
                                          value={fulfillmentNotes}
                                          onChange={(e) => setFulfillmentNotes(e.target.value)}
                                          className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                                        />
                                        <div className="flex space-x-3">
                                          <Button 
                                            className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white"
                                            onClick={() => handleFulfillPrescription(selectedPrescription.id)}
                                          >
                                            <Check className="h-4 w-4 mr-2" />
                                            Fulfill Prescription
                                          </Button>
                                          <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                                            <X className="h-4 w-4 mr-2" />
                                            Cancel Prescription
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                  
                                  {/* Fulfillment Info for completed prescriptions */}
                                  {selectedPrescription.status === "fulfilled" && (
                                    <Card className="border-green-100 bg-green-50">
                                      <CardHeader>
                                        <CardTitle className="text-lg text-green-800">Fulfillment Information</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="space-y-2">
                                          <p><span className="font-medium">Fulfilled Date:</span> {selectedPrescription.fulfilledDate}</p>
                                          <p><span className="font-medium">Fulfilled By:</span> {selectedPrescription.fulfilledBy}</p>
                                          <p><span className="font-medium">Total Amount:</span> ₹{selectedPrescription.totalAmount.toFixed(2)}</p>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          {prescription.status === "pending" && (
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Fulfill
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
