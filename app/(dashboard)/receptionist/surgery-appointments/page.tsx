"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Stethoscope, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  CheckCircle, 
  AlertCircle,
  UserPlus,
  CalendarDays
} from 'lucide-react'

interface SurgeryAppointment {
  id: string
  patientId?: string
  name: string
  phone: string
  email?: string
  department: string
  doctor: string
  date: string
  time: string
  surgeryType: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  isNewPatient: boolean
  createdAt: string
}

const mockSurgeryAppointments: SurgeryAppointment[] = [
  {
    id: "SA001",
    patientId: "P001",
    name: "Ram Sharma",
    phone: "+91 98765 43210",
    email: "ram@example.com",
    department: "Orthopedics",
    doctor: "Dr G K Nayak",
    date: "2024-09-20",
    time: "10:00 AM",
    surgeryType: "Knee Replacement Surgery",
    status: "pending",
    isNewPatient: false,
    createdAt: "2024-09-15T10:30:00Z"
  },
  {
    id: "SA002",
    name: "Sunita Devi",
    phone: "+91 98765 43211",
    email: "sunita@example.com",
    department: "Gynecology",
    doctor: "Dr Niharika Nayak",
    date: "2024-09-22",
    time: "02:00 PM",
    surgeryType: "Laparoscopic Surgery",
    status: "confirmed",
    isNewPatient: true,
    createdAt: "2024-09-15T11:15:00Z"
  }
]

const departments = [
  "Hydrocelectomy",
  "Vasectomy", 
  "Varicocelectomy",
  "Testicular Biopsy",
  "Orchiectomy",
  "Gynecological Surgery",
  "Laparoscopic Surgery",
  "Trauma Surgery",
  "Minimally Invasive Surgery",
  "Arthroscopic Surgery",
  "Spine Surgery",
  "Fracture Surgery"
]

const doctors = [
  { name: "Dr G K Nayak - MBBS D Orth", specialization: "Orthopedics (Founder)" },
  { name: "Dr Vinod Paliwal - MBBS D Orth", specialization: "Orthopedics" },
  { name: "Dr K D Singh - MBBS DA", specialization: "Anesthetics" },
  { name: "Dr Ramakant Dewangan - MBBS D Orth", specialization: "Orthopedics" },
  { name: "Dr Shreyansh Shukla - MBBS MS Ortho", specialization: "Joint" },
  { name: "Dr Punit Mohanty - MBBS MD Ortho", specialization: "Orthopedics" },
  { name: "Dr Niharika Nayak - MBBS DGO FMAS and FMR", specialization: "Gynecology" }
]

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM"
]

export default function SurgeryAppointments() {
  const [appointments, setAppointments] = useState<SurgeryAppointment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false)
  const [showPatientRegistrationDialog, setShowPatientRegistrationDialog] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<SurgeryAppointment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const [appointmentForm, setAppointmentForm] = useState({
    name: '',
    phone: '',
    email: '',
    department: '',
    doctor: '',
    date: '',
    time: '',
    surgeryType: '',
    isNewPatient: false
  })

  const [patientForm, setPatientForm] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    address: '',
    emergencyContact: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/receptionist/surgery-appointments')
      const data = await response.json()
      
      if (data.success) {
        setAppointments(data.appointments || [])
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.phone.includes(searchTerm) ||
                         appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreateAppointment = async () => {
    if (!appointmentForm.name || !appointmentForm.phone || !appointmentForm.department || 
        !appointmentForm.doctor || !appointmentForm.date || !appointmentForm.time) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/receptionist/surgery-appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentForm)
      })

      const result = await response.json()

      if (result.success) {
        // Refresh appointments list
        await fetchAppointments()
        
        // Reset form
        setAppointmentForm({
          name: '',
          phone: '',
          email: '',
          department: '',
          doctor: '',
          date: '',
          time: '',
          surgeryType: '',
          isNewPatient: false
        })
        
        setShowNewAppointmentDialog(false)
        
        // If new patient, show registration dialog
        if (appointmentForm.isNewPatient) {
          setPatientForm(prev => ({
            ...prev,
            firstName: appointmentForm.name.split(' ')[0] || '',
            lastName: appointmentForm.name.split(' ').slice(1).join(' ') || ''
          }))
          setShowPatientRegistrationDialog(true)
        }
      }
      
    } catch (error) {
      console.error('Failed to create appointment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegisterPatient = async () => {
    if (!patientForm.firstName || !patientForm.lastName || !patientForm.age || !patientForm.gender) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // Register patient logic here
      console.log('Registering patient:', patientForm)
      
      // Reset form
      setPatientForm({
        firstName: '',
        lastName: '',
        age: '',
        gender: '',
        address: '',
        emergencyContact: ''
      })
      
      setShowPatientRegistrationDialog(false)
      
    } catch (error) {
      console.error('Failed to register patient:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateAppointmentStatus = async (id: string, status: SurgeryAppointment['status']) => {
    try {
      const response = await fetch('/api/receptionist/surgery-appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })

      const result = await response.json()

      if (result.success) {
        setAppointments(prev => 
          prev.map(apt => apt.id === id ? { ...apt, status } : apt)
        )
      }
    } catch (error) {
      console.error('Failed to update appointment status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
         <Link href="/receptionist" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
  <ArrowLeft className="h-4 w-4 mr-2" />
  Back to Dashboard
</Link>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Surgery Appointments</h1>
          <p className="text-gray-600 mt-1">Manage surgery appointment requests from the website</p>
        </div>
        <Button 
          onClick={() => setShowNewAppointmentDialog(true)}
          className="bg-pink-500 hover:bg-pink-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Surgery Appointment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {appointments.filter(a => a.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {appointments.filter(a => a.status === 'confirmed').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Patients</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {appointments.filter(a => a.isNewPatient).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, phone, or doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading appointments...</h3>
              <p className="text-gray-600">Please wait while we fetch the surgery appointments.</p>
            </CardContent>
          </Card>
        ) : filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
          <Card key={appointment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{appointment.name}</h3>
                      <p className="text-sm text-gray-600">ID: {appointment.id}</p>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </Badge>
                    {appointment.isNewPatient && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        New Patient
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{appointment.phone}</span>
                    </div>
                    {appointment.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{appointment.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-gray-400" />
                      <span>{appointment.doctor}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(appointment.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{appointment.department}</span>
                    </div>
                  </div>
                  
                  {appointment.surgeryType && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">Surgery Type:</p>
                      <p className="text-sm text-gray-600">{appointment.surgeryType}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  {appointment.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {appointment.isNewPatient && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setPatientForm({
                          firstName: appointment.name.split(' ')[0] || '',
                          lastName: appointment.name.split(' ').slice(1).join(' ') || '',
                          age: '',
                          gender: '',
                          address: '',
                          emergencyContact: appointment.phone
                        })
                        setShowPatientRegistrationDialog(true)
                      }}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Register
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600">No surgery appointments match your current filters.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Appointment Dialog */}
      <Dialog open={showNewAppointmentDialog} onOpenChange={setShowNewAppointmentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Surgery Appointment</DialogTitle>
            <DialogDescription>
              Create a new surgery appointment request. Mark as new patient if they need registration.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={appointmentForm.name}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter patient name"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={appointmentForm.phone}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={appointmentForm.email}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="patient@example.com"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select 
                  value={appointmentForm.department} 
                  onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, department: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="doctor">Doctor *</Label>
                <Select 
                  value={appointmentForm.doctor} 
                  onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, doctor: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.name} value={doctor.name}>
                        {doctor.name} - {doctor.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Preferred Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={appointmentForm.date}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="time">Preferred Time *</Label>
                <Select 
                  value={appointmentForm.time} 
                  onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, time: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="surgeryType">Surgery Type & Details</Label>
              <Textarea
                id="surgeryType"
                value={appointmentForm.surgeryType}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, surgeryType: e.target.value }))}
                placeholder="Describe the type of surgery needed..."
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isNewPatient"
                checked={appointmentForm.isNewPatient}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, isNewPatient: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isNewPatient" className="text-sm">
                This is a new patient (needs registration)
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewAppointmentDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateAppointment}
              disabled={isSubmitting}
              className="bg-pink-500 hover:bg-pink-600"
            >
              {isSubmitting ? "Creating..." : "Create Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Patient Registration Dialog */}
      <Dialog open={showPatientRegistrationDialog} onOpenChange={setShowPatientRegistrationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Register New Patient</DialogTitle>
            <DialogDescription>
              Complete patient registration for the surgery appointment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={patientForm.firstName}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="First name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={patientForm.lastName}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Last name"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={patientForm.age}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Age"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select 
                  value={patientForm.gender} 
                  onValueChange={(value) => setPatientForm(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={patientForm.address}
                onChange={(e) => setPatientForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Complete address"
                rows={2}
              />
            </div>
            
            <div>
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                value={patientForm.emergencyContact}
                onChange={(e) => setPatientForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
                placeholder="Emergency contact number"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPatientRegistrationDialog(false)}>
              Skip Registration
            </Button>
            <Button 
              onClick={handleRegisterPatient}
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isSubmitting ? "Registering..." : "Register Patient"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
