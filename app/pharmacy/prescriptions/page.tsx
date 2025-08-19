"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Heart, FileText, Search, Filter, Download, RefreshCw, Eye, 
  CheckCircle, Clock, AlertTriangle, User, Calendar, Pill,
  ChevronLeft, ChevronRight, ArrowUpDown
} from 'lucide-react'
import { usePrescriptions } from "@/hooks/usePharmacy"
import { toast } from "sonner"

export default function PrescriptionsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  // API hooks
  const { 
    prescriptions, 
    pagination, 
    statistics,
    loading, 
    error,
    refetch,
    dispenseAllMedications
  } = usePrescriptions({
    page: currentPage,
    limit: 20,
    search: searchTerm,
    status: statusFilter || undefined,
    dateFrom: dateFilter ? new Date(dateFilter).toISOString().split('T')[0] : undefined,
    dateTo: dateFilter ? new Date(dateFilter).toISOString().split('T')[0] : undefined
  })

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  // Handle filter changes
  const handleStatusChange = (value: string) => {
    setStatusFilter(value === "all" ? "" : value)
    setCurrentPage(1)
  }

  const handleDateChange = (value: string) => {
    setDateFilter(value)
    setCurrentPage(1)
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle prescription dispensing
  const handleDispensePrescription = async (prescriptionId: string, prescriptionNumber: string) => {
    if (confirm(`Are you sure you want to dispense all medications for prescription ${prescriptionNumber}?`)) {
      try {
        await dispenseAllMedications(prescriptionId, 'Dispensed from prescriptions management')
        toast.success('Prescription dispensed successfully')
      } catch (error) {
        console.error('Error dispensing prescription:', error)
      }
    }
  }

  // Refresh data
  const refreshData = async () => {
    try {
      await refetch()
      toast.success('Data refreshed successfully')
    } catch (error) {
      toast.error('Failed to refresh data')
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      case 'expired': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  // Get dispensing status color
  const getDispensingStatusColor = (status: string) => {
    switch (status) {
      case 'fully_dispensed': return 'bg-green-100 text-green-700 border-green-200'
      case 'partially_dispensed': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
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
                onClick={refreshData}
                disabled={loading}
                className="text-gray-600 hover:text-pink-500"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Prescription Management</h1>
          <p className="text-gray-600">Manage and dispense patient prescriptions</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-pink-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : statistics.total_prescriptions.toLocaleString()}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {loading ? '...' : statistics.active_prescriptions}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {loading ? '...' : statistics.completed_prescriptions}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Dispensing</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {loading ? '...' : statistics.pending_dispensing}
                  </p>
                </div>
                <Pill className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prescriptions Table */}
        <Card className="border-pink-100">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-gray-900">Prescriptions</CardTitle>
                <CardDescription>
                  {pagination.total} prescriptions • Page {pagination.page} of {pagination.totalPages}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search prescriptions..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 border-pink-200 focus:border-pink-400 focus:ring-pink-400 w-64"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-pink-200 text-pink-600 hover:bg-pink-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Filter Controls */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-pink-100">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                  <Select value={statusFilter || "all"} onValueChange={handleStatusChange}>
                    <SelectTrigger className="border-pink-200">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Date</label>
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="border-pink-200"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStatusFilter("")
                      setDateFilter("")
                      setSearchTerm("")
                      setCurrentPage(1)
                    }}
                    className="border-pink-200 text-pink-600 hover:bg-pink-50"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prescription</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Medications</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dispensing</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 10 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                      </TableRow>
                    ))
                  ) : prescriptions.length > 0 ? (
                    prescriptions.map((prescription) => (
                      <TableRow key={prescription.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{prescription.prescription_id}</p>
                            <p className="text-sm text-gray-500">ID: {prescription.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{prescription.patient_name}</p>
                            <p className="text-sm text-gray-500">{prescription.patient_code}</p>
                            {prescription.patient_phone && (
                              <p className="text-sm text-gray-500">{prescription.patient_phone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{prescription.doctor_name}</p>
                            {prescription.specialization && (
                              <p className="text-sm text-gray-500">{prescription.specialization}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {new Date(prescription.prescription_date).toLocaleDateString()}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{prescription.total_medications}</p>
                            <p className="text-sm text-gray-500">
                              {prescription.dispensed_medications} dispensed
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">₹{prescription.total_amount.toLocaleString()}</p>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={getStatusColor(prescription.status)}
                          >
                            {prescription.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={getDispensingStatusColor(prescription.dispensing_status)}
                          >
                            {prescription.dispensing_status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Link href={`/pharmacy/prescriptions/${prescription.prescription_id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {prescription.dispensing_status === 'pending' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDispensePrescription(
                                  prescription.prescription_id, 
                                  prescription.prescription_id
                                )}
                                className="text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Dispense
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-3">
                          <FileText className="h-12 w-12 text-gray-400" />
                          <p className="text-gray-500">No prescriptions found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} prescriptions
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="border-pink-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={page === pagination.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={page === pagination.page 
                          ? "bg-pink-500 hover:bg-pink-600" 
                          : "border-pink-200 text-pink-600 hover:bg-pink-50"
                        }
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="border-pink-200"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
