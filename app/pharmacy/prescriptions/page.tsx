"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  FileText, Search, Filter, Eye, CheckCircle, 
  Clock, AlertCircle, Printer, Download
} from 'lucide-react'
import { usePrescriptions } from "@/hooks/usePharmacy"
import { toast } from "sonner"

export default function PrescriptionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const { prescriptions, loading, error, refetch, dispensePrescription } = usePrescriptions({
    search: searchTerm,
    status: statusFilter
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="destructive"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'partially_dispensed':
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Partial</Badge>
      case 'dispensed':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Dispensed</Badge>
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>
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
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print Queue
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by patient name, doctor, or prescription number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partially_dispensed">Partially Dispensed</SelectItem>
                <SelectItem value="dispensed">Dispensed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
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
                <div>
                  <h3 className="font-semibold mb-2">Patient Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedPrescription.patient_name}</p>
                    <p><span className="font-medium">ID:</span> {selectedPrescription.patient_id}</p>
                  </div>
                </div>
                <div>
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
                <div className="border rounded-lg">
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
                      <div>₹{Number(item.total_price || 0).toFixed(2)}</div>
                    </div>
                  )) || (
                    <div className="p-4 text-center text-gray-500">
                      No items available
                    </div>
                  )}
                </div>
              </div>

              {/* Total Amount */}
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-xl font-bold">₹{Number(selectedPrescription.total_amount || 0).toFixed(2)}</span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
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
  onDispense 
}: {
  prescriptions: any[]
  loading: boolean
  error: string | null
  onViewDetails: (prescription: any) => void
  onDispense: (id: string, items: any[]) => void
}) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="destructive"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'partially_dispensed':
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Partial</Badge>
      case 'dispensed':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Dispensed</Badge>
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading prescriptions...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>
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
