"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { 
  FileText, Search, Eye, CheckCircle, Clock, 
  AlertTriangle, Pill, User, Calendar, RefreshCw
} from 'lucide-react'
import { usePrescriptions, useMedicines } from "@/hooks/usePharmacy"
import { toast } from "sonner"

export default function PrescriptionsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("viewer")

  const { 
    prescriptions, 
    loading, 
    error,
    refetch,
    dispenseAllMedications
  } = usePrescriptions({
    search: searchTerm,
    status: 'active'
  })

  const { medicines } = useMedicines({})

  const checkMedicineAvailability = (medicineName: string, requiredQuantity: number) => {
    const medicine = medicines?.find(m => 
      m.name.toLowerCase().includes(medicineName.toLowerCase()) ||
      m.generic_name?.toLowerCase().includes(medicineName.toLowerCase())
    )
    
    if (!medicine) return { available: false, stock: 0, suggestion: null }
    
    const available = medicine.current_stock >= requiredQuantity
    const suggestion = !available && medicine.current_stock > 0 
      ? `Only ${medicine.current_stock} available` 
      : null
    
    return { available, stock: medicine.current_stock, suggestion, medicine }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
      case 'partially_dispensed':
        return <Badge className="bg-blue-100 text-blue-700">Partial</Badge>
      case 'dispensed':
        return <Badge className="bg-green-100 text-green-700">Dispensed</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const handleDispense = async (prescriptionId: string, notes: string) => {
    try {
      await dispenseAllMedications(prescriptionId, notes)
      toast.success('Prescription dispensed successfully')
      refetch()
      setSelectedPrescription(null)
    } catch (error) {
      toast.error('Failed to dispense prescription')
    }
  }

  return (
    <main className="w-full min-h-screen p-6">
      {/* Search */}
      <div className="w-full mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search prescriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-pink-200 focus:border-pink-400"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="w-full grid grid-cols-2 lg:grid-cols-4 bg-pink-50 border border-pink-100">
          <TabsTrigger value="viewer">Digital Viewer</TabsTrigger>
          <TabsTrigger value="availability">Medicine Availability</TabsTrigger>
          <TabsTrigger value="fulfillment">Fulfillment Status</TabsTrigger>
          <TabsTrigger value="dosage">Dosage Confirmation</TabsTrigger>
        </TabsList>

        {/* Digital Prescription Viewer */}
        <TabsContent value="viewer" className="w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Digital Prescription Viewer</CardTitle>
              <CardDescription>View prescriptions linked to doctors' modules</CardDescription>
            </CardHeader>
            <CardContent className="w-full">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prescription ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescriptions?.map((prescription) => (
                      <TableRow key={prescription.id}>
                        <TableCell className="font-medium">{prescription.prescription_id}</TableCell>
                        <TableCell>{prescription.patient_name}</TableCell>
                        <TableCell>{prescription.doctor_name}</TableCell>
                        <TableCell>{new Date(prescription.prescription_date).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(prescription.dispensing_status)}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedPrescription(prescription)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Prescription Details</DialogTitle>
                                <DialogDescription>
                                  {prescription.prescription_id} - {prescription.patient_name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <Label>Patient</Label>
                                    <p className="font-medium">{prescription.patient_name}</p>
                                  </div>
                                  <div>
                                    <Label>Doctor</Label>
                                    <p className="font-medium">{prescription.doctor_name}</p>
                                  </div>
                                </div>
                                <div>
                                  <Label>Medications</Label>
                                  <div className="mt-2 space-y-2">
                                    {prescription.medications?.map((med: any, index: number) => (
                                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                        <p className="font-medium">{med.medicine_name}</p>
                                        <p className="text-sm text-gray-600">
                                          {med.dosage} - {med.frequency} - {med.duration}
                                        </p>
                                        <p className="text-sm">Quantity: {med.quantity}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                {prescription.dispensing_status === 'pending' && (
                                  <div className="flex space-x-2">
                                    <Button 
                                      onClick={() => handleDispense(prescription.prescription_id, 'Dispensed from pharmacy')}
                                      className="bg-green-500 hover:bg-green-600"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Dispense All
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medicine Availability */}
        <TabsContent value="availability">
          <Card>
            <CardHeader>
              <CardTitle>Auto-suggest Medicine Availability</CardTitle>
              <CardDescription>Check stock availability for prescribed medicines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescriptions?.map((prescription) => (
                  <div key={prescription.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{prescription.prescription_id}</h4>
                      <Badge>{prescription.patient_name}</Badge>
                    </div>
                    <div className="space-y-2">
                      {prescription.medications?.map((med: any, index: number) => {
                        const availability = checkMedicineAvailability(med.medicine_name, med.quantity)
                        return (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium">{med.medicine_name}</p>
                              <p className="text-sm text-gray-600">Required: {med.quantity}</p>
                            </div>
                            <div className="text-right">
                              {availability.available ? (
                                <Badge className="bg-green-100 text-green-700">Available</Badge>
                              ) : (
                                <div>
                                  <Badge className="bg-red-100 text-red-700">
                                    {availability.stock === 0 ? 'Out of Stock' : 'Insufficient'}
                                  </Badge>
                                  {availability.suggestion && (
                                    <p className="text-xs text-orange-600 mt-1">{availability.suggestion}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fulfillment Status */}
        <TabsContent value="fulfillment">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Prescription Fulfillment Status</CardTitle>
              <CardDescription>Track prescription processing status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {prescriptions?.map((prescription) => (
                  <div key={prescription.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{prescription.prescription_id}</h4>
                        <p className="text-sm text-gray-600">{prescription.patient_name}</p>
                      </div>
                      {getStatusBadge(prescription.dispensing_status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {new Date(prescription.prescription_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Pill className="h-4 w-4 mr-1 text-gray-400" />
                        {prescription.total_medications} medicines
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                        {prescription.dispensing_status === 'pending' ? 'Awaiting dispensing' : 'Completed'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dosage Confirmation */}
        <TabsContent value="dosage">
          <Card>
            <CardHeader>
              <CardTitle>Dosage, Frequency & Quantity Confirmation</CardTitle>
              <CardDescription>Verify medication details before dispensing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {prescriptions?.filter(p => p.dispensing_status === 'pending').map((prescription) => (
                  <div key={prescription.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">{prescription.prescription_id}</h4>
                      <Badge className="bg-yellow-100 text-yellow-700">Pending Confirmation</Badge>
                    </div>
                    <div className="space-y-3">
                      {prescription.medications?.map((med: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <Label className="text-xs text-gray-500">Medicine</Label>
                              <p className="font-medium">{med.medicine_name}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Dosage</Label>
                              <p className="font-medium">{med.dosage}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Frequency</Label>
                              <p className="font-medium">{med.frequency}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Quantity</Label>
                              <p className="font-medium">{med.quantity}</p>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t">
                            <Label className="text-xs text-gray-500">Duration & Instructions</Label>
                            <p className="text-sm">{med.duration}</p>
                            {med.instructions && (
                              <p className="text-sm text-gray-600 mt-1">{med.instructions}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button 
                        onClick={() => handleDispense(prescription.prescription_id, 'Confirmed and dispensed')}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirm & Dispense
                      </Button>
                      <Button variant="outline">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Query Doctor
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
