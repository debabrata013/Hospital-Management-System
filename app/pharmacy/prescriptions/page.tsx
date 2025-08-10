"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Heart, 
  FileText, 
  Search, 
  Filter, 
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Pill
} from 'lucide-react'
import { usePrescriptions } from "@/hooks/usePharmacy"
import { toast } from "sonner"

export default function PrescriptionsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [isDispenseDialogOpen, setIsDispenseDialogOpen] = useState(false)

  // API hooks
  const { 
    prescriptions, 
    pagination, 
    loading: prescriptionsLoading, 
    error: prescriptionsError,
    refetch: refetchPrescriptions,
    dispensePrescription 
  } = usePrescriptions({
    page,
    limit: 20,
    search: searchTerm,
    status: statusFilter
  })

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'partially_dispensed', label: 'Partially Dispensed', color: 'bg-blue-100 text-blue-700' },
    { value: 'dispensed', label: 'Dispensed', color: 'bg-green-100 text-green-700' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' }
  ]

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700' },
    { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-700' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' }
  ]

  // Handle prescription dispensing
  const handleDispensePrescription = async (prescription: any) => {
    try {
      await dispensePrescription(prescription._id, {
        dispensedBy: 'current-user', // This should come from session
        dispensingNotes: 'Dispensed as prescribed',
        medicines: prescription.medicines.map((med: any) => ({
          medicineId: med.medicineId,
          dispensedQuantity: med.quantity,
          batchNo: 'AUTO', // This should be selected from available batches
          notes: ''
        }))
      })
      setIsDispenseDialogOpen(false)
      setSelectedPrescription(null)
    } catch (error) {
      console.error('Error dispensing prescription:', error)
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status)
    return statusOption || { label: status, color: 'bg-gray-100 text-gray-700' }
  }

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    const priorityOption = priorityOptions.find(opt => opt.value === priority)
    return priorityOption || { label: priority, color: 'bg-gray-100 text-gray-700' }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'partially_dispensed':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'dispensed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/pharmacy" className="flex items-center space-x-2">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-2 rounded-xl">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-800">आरोग्य अस्पताल</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-pink-500" />
                <span className="text-lg font-semibold text-gray-700">Prescriptions</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={refetchPrescriptions}
                disabled={prescriptionsLoading}
                className="text-gray-600 hover:text-pink-500"
              >
                {prescriptionsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Prescription Management</h1>
          <p className="text-gray-600">Review and dispense patient prescriptions</p>
        </div>

        {/* Error Alert */}
        {prescriptionsError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {prescriptionsError}
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search prescriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-pink-200 focus:border-pink-400 focus:ring-pink-400">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  {statusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex justify-end">
                <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions List */}
        <div className="space-y-4">
          {prescriptionsLoading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="border-pink-100">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <Skeleton className="h-4 w-16 mb-1" />
                          <Skeleton className="h-5 w-32" />
                        </div>
                        <div>
                          <Skeleton className="h-4 w-16 mb-1" />
                          <Skeleton className="h-5 w-28" />
                        </div>
                        <div>
                          <Skeleton className="h-4 w-16 mb-1" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-16 w-full" />
                    </div>
                    <div className="ml-6">
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : prescriptions.length > 0 ? (
            prescriptions.map((prescription) => {
              const statusBadge = getStatusBadge(prescription.status)
              const priorityBadge = getPriorityBadge(prescription.priority)
              
              return (
                <Card key={prescription._id} className="border-pink-100 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {prescription.prescriptionId}
                          </h3>
                          <Badge className={statusBadge.color}>
                            {getStatusIcon(prescription.status)}
                            <span className="ml-1">{statusBadge.label}</span>
                          </Badge>
                          <Badge className={priorityBadge.color}>
                            {priorityBadge.label}
                          </Badge>
                        </div>

                        {/* Patient and Doctor Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500">Patient</p>
                              <p className="font-medium text-gray-900">{prescription.patientName}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500">Doctor</p>
                              <p className="font-medium text-gray-900">{prescription.doctorName}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500">Date</p>
                              <p className="font-medium text-gray-900">
                                {new Date(prescription.prescriptionDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Medicines */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <Pill className="h-4 w-4 text-gray-500" />
                            <p className="text-sm font-medium text-gray-700">Prescribed Medicines</p>
                          </div>
                          <div className="space-y-2">
                            {prescription.medicines.map((medicine: any, index: number) => (
                              <div key={index} className="flex items-center justify-between bg-white rounded p-3">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{medicine.medicineName}</p>
                                  <p className="text-sm text-gray-600">
                                    {medicine.dosage} • {medicine.frequency} • {medicine.duration}
                                  </p>
                                  {medicine.instructions && (
                                    <p className="text-xs text-gray-500 mt-1">{medicine.instructions}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-gray-900">Qty: {medicine.quantity}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="ml-6 flex flex-col space-y-2">
                        {prescription.status === 'pending' && (
                          <Button
                            onClick={() => {
                              setSelectedPrescription(prescription)
                              setIsDispenseDialogOpen(true)
                            }}
                            className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white"
                          >
                            Dispense
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card className="border-pink-100">
              <CardContent className="p-12">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No prescriptions found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-8">
            <p className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Dispense Dialog */}
        <Dialog open={isDispenseDialogOpen} onOpenChange={setIsDispenseDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Dispense Prescription</DialogTitle>
              <DialogDescription>
                Review and dispense prescription {selectedPrescription?.prescriptionId}
              </DialogDescription>
            </DialogHeader>
            
            {selectedPrescription && (
              <div className="space-y-6">
                {/* Patient Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Patient Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Patient Name</p>
                      <p className="font-medium">{selectedPrescription.patientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Doctor</p>
                      <p className="font-medium">{selectedPrescription.doctorName}</p>
                    </div>
                  </div>
                </div>

                {/* Medicines to Dispense */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Medicines to Dispense</h4>
                  <div className="space-y-3">
                    {selectedPrescription.medicines.map((medicine: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{medicine.medicineName}</p>
                            <p className="text-sm text-gray-600">
                              {medicine.dosage} • {medicine.frequency} • {medicine.duration}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">Qty: {medicine.quantity}</p>
                            <Badge className="bg-green-100 text-green-700 mt-1">
                              Available
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDispenseDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleDispensePrescription(selectedPrescription)}
                    className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white"
                  >
                    Confirm Dispensing
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
