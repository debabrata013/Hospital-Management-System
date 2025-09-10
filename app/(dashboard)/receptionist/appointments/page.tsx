"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Calendar as CalendarIcon,
  Clock, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  ArrowLeft,
  User,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { format } from "date-fns"

interface Appointment {
  id: string
  appointmentId: string
  patientName: string
  patientPhone: string
  doctorName: string
  department: string
  appointmentDate: string
  appointmentTime: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine'
  notes?: string
  createdAt: string
}

interface Doctor {
  id: string
  name: string
  department: string
  specialization: string
}

interface Patient {
  id: string
  name: string
  phone: string
  email?: string
  age: number
  gender: string
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("today")
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showBillingDialog, setShowBillingDialog] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Billing form
  const [billingForm, setBillingForm] = useState({
    consultationFee: '',
    procedureFee: '',
    medicationFee: '',
    testFee: '',
    otherCharges: '',
    discount: '',
    paymentMethod: 'cash',
    notes: ''
  })

  // New appointment form
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: new Date(),
    appointmentTime: '',
    type: 'consultation',
    notes: ''
  })

  // Mock data - will be replaced with API calls
  const mockAppointments: Appointment[] = [
    {
      id: '1',
      appointmentId: 'APT001',
      patientName: 'John Smith',
      patientPhone: '+91 98765 43210',
      doctorName: 'Dr. Sarah Johnson',
      department: 'Cardiology',
      appointmentDate: '2024-01-15',
      appointmentTime: '10:00 AM',
      status: 'scheduled',
      type: 'consultation',
      notes: 'Regular checkup',
      createdAt: '2024-01-10'
    },
    {
      id: '2',
      appointmentId: 'APT002',
      patientName: 'Emily Davis',
      patientPhone: '+91 98765 43211',
      doctorName: 'Dr. Michael Brown',
      department: 'Orthopedics',
      appointmentDate: '2024-01-15',
      appointmentTime: '11:30 AM',
      status: 'confirmed',
      type: 'follow-up',
      notes: 'Post-surgery follow-up',
      createdAt: '2024-01-12'
    }
  ]

  const mockDoctors: Doctor[] = [
    { id: '1', name: 'Dr. Sarah Johnson', department: 'Cardiology', specialization: 'Heart Specialist' },
    { id: '2', name: 'Dr. Michael Brown', department: 'Orthopedics', specialization: 'Bone Specialist' },
    { id: '3', name: 'Dr. Lisa Wilson', department: 'Pediatrics', specialization: 'Child Specialist' }
  ]

  const mockPatients: Patient[] = [
    { id: '1', name: 'John Smith', phone: '+91 98765 43210', email: 'john@email.com', age: 45, gender: 'Male' },
    { id: '2', name: 'Emily Davis', phone: '+91 98765 43211', email: 'emily@email.com', age: 32, gender: 'Female' }
  ]

  useEffect(() => {
    // Initialize with mock data
    setAppointments(mockAppointments)
    setFilteredAppointments(mockAppointments)
    setDoctors(mockDoctors)
    setPatients(mockPatients)
    setIsLoading(false)
  }, [])

  // Filter appointments
  useEffect(() => {
    let filtered = appointments

    if (searchQuery) {
      filtered = filtered.filter(apt => 
        apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.appointmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.patientPhone.includes(searchQuery)
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    if (dateFilter === "today") {
      const today = new Date().toISOString().split('T')[0]
      filtered = filtered.filter(apt => apt.appointmentDate === today)
    } else if (dateFilter === "week") {
      const weekFromNow = new Date()
      weekFromNow.setDate(weekFromNow.getDate() + 7)
      filtered = filtered.filter(apt => new Date(apt.appointmentDate) <= weekFromNow)
    }

    setFilteredAppointments(filtered)
  }, [appointments, searchQuery, statusFilter, dateFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'no-show': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-purple-100 text-purple-800'
      case 'follow-up': return 'bg-yellow-100 text-yellow-800'
      case 'emergency': return 'bg-red-100 text-red-800'
      case 'routine': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCreateAppointment = () => {
    const newApt: Appointment = {
      id: Date.now().toString(),
      appointmentId: `APT${Date.now().toString().slice(-6)}`,
      patientName: patients.find(p => p.id === newAppointment.patientId)?.name || '',
      patientPhone: patients.find(p => p.id === newAppointment.patientId)?.phone || '',
      doctorName: doctors.find(d => d.id === newAppointment.doctorId)?.name || '',
      department: doctors.find(d => d.id === newAppointment.doctorId)?.department || '',
      appointmentDate: format(newAppointment.appointmentDate, 'yyyy-MM-dd'),
      appointmentTime: newAppointment.appointmentTime,
      status: 'scheduled',
      type: newAppointment.type as any,
      notes: newAppointment.notes,
      createdAt: new Date().toISOString()
    }

    setAppointments([...appointments, newApt])
    setShowNewAppointmentDialog(false)
    setNewAppointment({
      patientId: '',
      doctorId: '',
      appointmentDate: new Date(),
      appointmentTime: '',
      type: 'consultation',
      notes: ''
    })
  }

  const handleUpdateStatus = (appointmentId: string, newStatus: string) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus as any } : apt
    ))
  }

  const handleDeleteAppointment = (appointmentId: string) => {
    setAppointments(appointments.filter(apt => apt.id !== appointmentId))
  }

  const handleCreateBill = () => {
    const total = parseFloat(billingForm.consultationFee || '0') +
                 parseFloat(billingForm.procedureFee || '0') +
                 parseFloat(billingForm.medicationFee || '0') +
                 parseFloat(billingForm.testFee || '0') +
                 parseFloat(billingForm.otherCharges || '0') -
                 parseFloat(billingForm.discount || '0')

    // Here you would typically save the bill to the database
    console.log('Bill created:', {
      appointmentId: selectedAppointment?.id,
      total,
      ...billingForm
    })

    setShowBillingDialog(false)
    resetBillingForm()
  }

  const resetBillingForm = () => {
    setBillingForm({
      consultationFee: '',
      procedureFee: '',
      medicationFee: '',
      testFee: '',
      otherCharges: '',
      discount: '',
      paymentMethod: 'cash',
      notes: ''
    })
  }

  const calculateTotal = () => {
    return parseFloat(billingForm.consultationFee || '0') +
           parseFloat(billingForm.procedureFee || '0') +
           parseFloat(billingForm.medicationFee || '0') +
           parseFloat(billingForm.testFee || '0') +
           parseFloat(billingForm.otherCharges || '0') -
           parseFloat(billingForm.discount || '0')
  }

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-blue-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/receptionist">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Appointments Management</h1>
              <p className="text-sm text-gray-600">Schedule and manage patient appointments</p>
            </div>
          </div>
          <Button onClick={() => setShowNewAppointmentDialog(true)} className="bg-blue-500 hover:bg-blue-600">
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Scheduled</p>
                  <p className="text-2xl font-bold">{stats.scheduled}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Confirmed</p>
                  <p className="text-2xl font-bold">{stats.confirmed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <Stethoscope className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Cancelled</p>
                  <p className="text-2xl font-bold">{stats.cancelled}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by patient name, appointment ID, doctor, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle>Appointments ({filteredAppointments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading appointments...</div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No appointments found</div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Badge>
                          <Badge variant="outline" className={getTypeColor(appointment.type)}>
                            {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                          </Badge>
                          <span className="text-sm text-gray-500">#{appointment.appointmentId}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="font-semibold text-gray-900">{appointment.patientName}</p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {appointment.patientPhone}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Stethoscope className="h-3 w-3 mr-1" />
                              {appointment.doctorName}
                            </p>
                            <p className="text-sm text-gray-500">{appointment.department}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600 flex items-center">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {appointment.appointmentTime}
                            </p>
                          </div>
                          
                          <div>
                            {appointment.notes && (
                              <p className="text-sm text-gray-600 truncate">{appointment.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAppointment(appointment)
                            setShowViewDialog(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAppointment(appointment)
                            setShowEditDialog(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {appointment.status === 'scheduled' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Confirm
                          </Button>
                        )}
                        
                        {appointment.status === 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            Complete
                          </Button>
                        )}
                        
                        {(appointment.status === 'completed' || appointment.status === 'confirmed') && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedAppointment(appointment)
                              setShowBillingDialog(true)
                            }}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Create Bill
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Appointment Dialog */}
      <Dialog open={showNewAppointmentDialog} onOpenChange={setShowNewAppointmentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Create a new appointment for a patient
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="patient">Patient</Label>
              <Select value={newAppointment.patientId} onValueChange={(value) => 
                setNewAppointment({...newAppointment, patientId: value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} - {patient.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="doctor">Doctor</Label>
              <Select value={newAppointment.doctorId} onValueChange={(value) => 
                setNewAppointment({...newAppointment, doctorId: value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date">Appointment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(newAppointment.appointmentDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newAppointment.appointmentDate}
                    onSelect={(date) => date && setNewAppointment({...newAppointment, appointmentDate: date})}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="time">Appointment Time</Label>
              <Input
                type="time"
                value={newAppointment.appointmentTime}
                onChange={(e) => setNewAppointment({...newAppointment, appointmentTime: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="type">Appointment Type</Label>
              <Select value={newAppointment.type} onValueChange={(value) => 
                setNewAppointment({...newAppointment, type: value})
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                placeholder="Additional notes or instructions..."
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewAppointmentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAppointment} className="bg-blue-500 hover:bg-blue-600">
              Schedule Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Appointment Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Complete information for appointment #{selectedAppointment?.appointmentId}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <h4 className="font-semibold mb-2">Patient Information</h4>
                <p><strong>Name:</strong> {selectedAppointment.patientName}</p>
                <p><strong>Phone:</strong> {selectedAppointment.patientPhone}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Doctor Information</h4>
                <p><strong>Doctor:</strong> {selectedAppointment.doctorName}</p>
                <p><strong>Department:</strong> {selectedAppointment.department}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Appointment Details</h4>
                <p><strong>Date:</strong> {format(new Date(selectedAppointment.appointmentDate), 'PPP')}</p>
                <p><strong>Time:</strong> {selectedAppointment.appointmentTime}</p>
                <p><strong>Type:</strong> {selectedAppointment.type}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Status</h4>
                <Badge className={getStatusColor(selectedAppointment.status)}>
                  {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                </Badge>
              </div>
              
              {selectedAppointment.notes && (
                <div className="col-span-2">
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-gray-600">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Billing Dialog */}
      <Dialog open={showBillingDialog} onOpenChange={setShowBillingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Bill</DialogTitle>
            <DialogDescription>
              Generate bill for {selectedAppointment?.patientName}'s appointment
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
              <Input
                type="number"
                placeholder="0"
                value={billingForm.consultationFee}
                onChange={(e) => setBillingForm({...billingForm, consultationFee: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="procedureFee">Procedure Fee (₹)</Label>
              <Input
                type="number"
                placeholder="0"
                value={billingForm.procedureFee}
                onChange={(e) => setBillingForm({...billingForm, procedureFee: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="medicationFee">Medication Fee (₹)</Label>
              <Input
                type="number"
                placeholder="0"
                value={billingForm.medicationFee}
                onChange={(e) => setBillingForm({...billingForm, medicationFee: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="testFee">Test/Lab Fee (₹)</Label>
              <Input
                type="number"
                placeholder="0"
                value={billingForm.testFee}
                onChange={(e) => setBillingForm({...billingForm, testFee: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="otherCharges">Other Charges (₹)</Label>
              <Input
                type="number"
                placeholder="0"
                value={billingForm.otherCharges}
                onChange={(e) => setBillingForm({...billingForm, otherCharges: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="discount">Discount (₹)</Label>
              <Input
                type="number"
                placeholder="0"
                value={billingForm.discount}
                onChange={(e) => setBillingForm({...billingForm, discount: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={billingForm.paymentMethod} onValueChange={(value) => 
                setBillingForm({...billingForm, paymentMethod: value})
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-lg font-semibold">Total Amount</Label>
              <div className="text-2xl font-bold text-green-600">
                ₹{calculateTotal().toFixed(2)}
              </div>
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="notes">Billing Notes</Label>
              <Textarea
                placeholder="Additional billing notes..."
                value={billingForm.notes}
                onChange={(e) => setBillingForm({...billingForm, notes: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBillingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBill} className="bg-green-500 hover:bg-green-600">
              Generate Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
