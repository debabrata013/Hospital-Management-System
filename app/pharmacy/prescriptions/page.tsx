"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Search, Eye, CheckCircle, Filter, Calendar, User, 
  Clock, AlertCircle, Printer, Download, FileText
} from 'lucide-react'
import { usePrescriptions } from "@/hooks/usePharmacy"
import { toast } from "sonner"
import { printPrescription, downloadPrescriptionPDF } from "@/lib/pdf-generator"

export default function PrescriptionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const { prescriptions, loading, error, refetch, dispensePrescription } = usePrescriptions({
    search: searchTerm,
    status: statusFilter === "all" ? "" : statusFilter
  })

  const handleDispense = async (prescriptionId: string, items: any[]) => {
    try {
      await dispensePrescription(prescriptionId, items)
      toast.success("Prescription dispensed successfully")
      setShowDetailsDialog(false)
    } catch (error) {
      toast.error("Failed to dispense prescription")
    }
  }

  const handlePrint = (prescription: any) => {
    try {
      printPrescription({
        prescription_id: prescription.prescription_id || prescription.prescription_number,
        patient_name: prescription.patient_name,
        patient_id: prescription.patient_id,
        doctor_name: prescription.doctor_name,
        prescription_date: prescription.prescription_date || prescription.created_at,
        items: prescription.items || [],
        total_amount: prescription.total_amount || 0,
        notes: prescription.notes
      })
      toast.success("Prescription sent to printer")
    } catch (error) {
      toast.error("Failed to print prescription")
    }
  }

  const handleDownloadPDF = (prescription: any) => {
    try {
      downloadPrescriptionPDF({
        prescription_id: prescription.prescription_id || prescription.prescription_number,
        patient_name: prescription.patient_name,
        patient_id: prescription.patient_id,
        doctor_name: prescription.doctor_name,
        prescription_date: prescription.prescription_date || prescription.created_at,
        items: prescription.items || [],
        total_amount: prescription.total_amount || 0,
        notes: prescription.notes
      })
      toast.success("PDF downloaded successfully")
    } catch (error) {
      toast.error("Failed to download PDF")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Pending</Badge>
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-200">Completed</Badge>
      case 'dispensed':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Dispensed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Prescriptions</h1>
          <p className="text-gray-600">Manage and dispense prescriptions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <Calendar className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by patient name, doctor, or prescription number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prescription Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Prescriptions</TabsTrigger>
          <TabsTrigger value="pending">Pending ({prescriptions?.filter(p => p.status === 'pending').length || 0})</TabsTrigger>
          <TabsTrigger value="today">Today's Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Prescriptions</CardTitle>
              <CardDescription>
                {prescriptions?.length || 0} prescriptions found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PrescriptionList 
                prescriptions={prescriptions} 
                loading={loading} 
                error={error}
                onViewDetails={(prescription) => {
                  setSelectedPrescription(prescription)
                  setShowDetailsDialog(true)
                }}
                onDispense={handleDispense}
                onPrint={handlePrint}
                onDownloadPDF={handleDownloadPDF}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Prescriptions</CardTitle>
              <CardDescription>
                Prescriptions waiting to be dispensed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PrescriptionList 
                prescriptions={prescriptions?.filter(p => p.status === 'pending')} 
                loading={loading} 
                error={error}
                onViewDetails={(prescription) => {
                  setSelectedPrescription(prescription)
                  setShowDetailsDialog(true)
                }}
                onDispense={handleDispense}
                onPrint={handlePrint}
                onDownloadPDF={handleDownloadPDF}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today">
          <Card>
            <CardHeader>
              <CardTitle>Today's Prescriptions</CardTitle>
              <CardDescription>
                Prescriptions created today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PrescriptionList 
                prescriptions={prescriptions?.filter(p => {
                  const today = new Date().toDateString()
                  const prescriptionDate = new Date(p.created_at || p.prescription_date).toDateString()
                  return prescriptionDate === today
                })} 
                loading={loading} 
                error={error}
                onViewDetails={(prescription) => {
                  setSelectedPrescription(prescription)
                  setShowDetailsDialog(true)
                }}
                onDispense={handleDispense}
                onPrint={handlePrint}
                onDownloadPDF={handleDownloadPDF}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Prescription Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>
              {selectedPrescription?.prescription_id || selectedPrescription?.prescription_number}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrescription && (
            <div className="space-y-6">
              {/* Patient & Doctor Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Patient Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedPrescription.patient_name}</p>
                    <p><span className="font-medium">ID:</span> {selectedPrescription.patient_id}</p>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Doctor Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> Dr. {selectedPrescription.doctor_name}</p>
                    <p><span className="font-medium">Date:</span> {new Date(selectedPrescription.prescription_date || selectedPrescription.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Prescription Items */}
              <div>
                <h3 className="font-semibold mb-2">Prescribed Medicines</h3>
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-6 gap-4 p-3 bg-gray-50 font-medium text-sm">
                    <div>Medicine</div>
                    <div>Dosage</div>
                    <div>Frequency</div>
                    <div>Duration</div>
                    <div>Quantity</div>
                    <div>Amount</div>
                  </div>
                  {selectedPrescription.items?.map((item: any, index: number) => (
                    <div key={index} className="grid grid-cols-6 gap-4 p-3 border-t text-sm">
                      <div className="font-medium">{item.medicine_name}</div>
                      <div>{item.dosage}</div>
                      <div>{item.frequency}</div>
                      <div>{item.duration}</div>
                      <div>{item.quantity}</div>
                      <div>₹{(item.unit_price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-xl font-bold">₹{Number(selectedPrescription.total_amount || 0).toFixed(2)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => handlePrint(selectedPrescription)}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" onClick={() => handleDownloadPDF(selectedPrescription)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                {selectedPrescription.status === 'pending' && (
                  <Button onClick={() => handleDispense(selectedPrescription.id, selectedPrescription.items || [])}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Dispensed
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PrescriptionList({ 
  prescriptions, 
  loading, 
  error, 
  onViewDetails, 
  onDispense,
  onPrint,
  onDownloadPDF
}: {
  prescriptions: any[]
  loading: boolean
  error: string | null
  onViewDetails: (prescription: any) => void
  onDispense: (id: string, items: any[]) => void
  onPrint: (prescription: any) => void
  onDownloadPDF: (prescription: any) => void
}) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Pending</Badge>
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-200">Completed</Badge>
      case 'dispensed':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Dispensed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading prescriptions...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>
  }

  if (!prescriptions || prescriptions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No prescriptions found
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {prescriptions.map((prescription: any) => (
        <div key={prescription.id} className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold">
                  {prescription.prescription_id || prescription.prescription_number}
                </h3>
                {getStatusBadge(prescription.status)}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Patient:</span> {prescription.patient_name}
                </div>
                <div>
                  <span className="font-medium">Doctor:</span> Dr. {prescription.doctor_name}
                </div>
                <div>
                  <span className="font-medium">Date:</span> {new Date(prescription.prescription_date || prescription.created_at).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Amount:</span> ₹{Number(prescription.total_amount || prescription.calculated_total || 0).toFixed(2)}
                </div>
              </div>
              {prescription.item_count && (
                <div className="text-sm text-gray-500 mt-1">
                  {prescription.item_count} items prescribed
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onViewDetails(prescription)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onPrint(prescription)}>
                <Printer className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDownloadPDF(prescription)}>
                <Download className="h-4 w-4" />
              </Button>
              {prescription.status === 'pending' && (
                <Button 
                  size="sm" 
                  onClick={() => onDispense(prescription.id, prescription.items || [])}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Dispense
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
