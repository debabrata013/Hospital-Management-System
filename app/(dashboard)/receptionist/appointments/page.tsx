"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { 
  Calendar as CalendarIcon,
  Clock, 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  ArrowLeft,
  User,
  Stethoscope,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

interface Patient {
  id: number
  patient_id: string
  name: string
  age: number
  gender: string
  contact_number: string
  address?: string
}

interface Doctor {
  id: number
  name: string
  department?: string
  specialization?: string
  status: 'available' | 'busy'
  active_consultations: number
  pending_appointments: number
}

interface Appointment {
  id: number
  appointment_id: string
  patient_id: string
  doctor_id: number
  appointment_date: string
  appointment_time: string
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  appointment_type?: string
  patient_name: string
  patient_phone: string
  patient_code: string
  doctor_name: string
  department?: string
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState('')
  const [doctorFilter, setDoctorFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  // Dialog states
  const [newAppointmentDialog, setNewAppointmentDialog] = useState(false)
  const [editStatusDialog, setEditStatusDialog] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  
  // Form states
  const [appointmentForm, setAppointmentForm] = useState({
    patientId: '',
    doctorId: '',
    appointmentTime: '',
    appointmentType: 'consultation',
    notes: ''
  })
  
  const [statusForm, setStatusForm] = useState({
    status: '',
    notes: ''
  })

  useEffect(() => {
    fetchAppointments()
    fetchDoctors()
  }, [selectedDate, statusFilter, doctorFilter])

  const fetchAppointments = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        date: selectedDate,
        ...(statusFilter && { status: statusFilter }),
        ...(doctorFilter && { doctorId: doctorFilter })
      })
      
      const response = await fetch(`/api/receptionist/appointments?${params}`)
      const data = await response.json()
      setAppointments(data.appointments || [])
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/receptionist/doctors')
      const data = await response.json()
      setDoctors(data.doctors || [])
    } catch (error) {
      console.error('Failed to fetch doctors:', error)
    }
  }

  const searchPatients = async (query: string) => {
    if (query.length < 2) {
      setPatients([])
      return
    }
    
    try {
      const response = await fetch(`/api/receptionist/patients/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setPatients(data.patients || [])
    } catch (error) {
      console.error('Failed to search patients:', error)
    }
  }

  const handleCreateAppointment = async () => {
    try {
      const response = await fetch('/api/receptionist/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: appointmentForm.patientId,
          doctorId: appointmentForm.doctorId,
          appointmentDate: selectedDate,
          appointmentTime: appointmentForm.appointmentTime,
          appointmentType: appointmentForm.appointmentType,
          notes: appointmentForm.notes
        })
      })

      if (response.ok) {
        setNewAppointmentDialog(false)
        setAppointmentForm({
          patientId: '',
          doctorId: '',
          appointmentTime: '',
          appointmentType: 'consultation',
          notes: ''
        })
        fetchAppointments()
        alert('Appointment scheduled successfully!')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to schedule appointment')
      }
    } catch (error) {
      console.error('Failed to create appointment:', error)
      alert('Failed to schedule appointment')
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedAppointment) return
    
    try {
      const response = await fetch('/api/receptionist/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedAppointment.appointment_id,
          status: statusForm.status,
          notes: statusForm.notes
        })
      })

      if (response.ok) {
        setEditStatusDialog(false)
        setSelectedAppointment(null)
        setStatusForm({ status: '', notes: '' })
        fetchAppointments()
        alert('Appointment status updated successfully!')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update status')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'scheduled': { color: 'bg-blue-100 text-blue-700', icon: Clock },
      'confirmed': { color: 'bg-green-100 text-green-700', icon: CheckCircle },
      'in-progress': { color: 'bg-yellow-100 text-yellow-700', icon: RefreshCw },
      'completed': { color: 'bg-green-100 text-green-700', icon: CheckCircle },
      'cancelled': { color: 'bg-red-100 text-red-700', icon: XCircle },
      'no-show': { color: 'bg-gray-100 text-gray-700', icon: AlertCircle }
    }
    
    const config = statusConfig[status] || statusConfig['scheduled']
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('-', ' ').toUpperCase()}
      </Badge>
    )
  }

  const getDoctorStatusBadge = (doctor: Doctor) => {
    return doctor.status === 'available' ? (
      <Badge className="bg-green-100 text-green-700">Available</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-700">Busy ({doctor.active_consultations})</Badge>
    )
  }

  const filteredAppointments = appointments.filter(apt => 
    apt.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.patient_phone.includes(searchQuery) ||
    apt.doctor_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/receptionist">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointments Management</h1>
            <p className="text-gray-600">Schedule and manage patient appointments</p>
          </div>
        </div>
        <Button 
          className="bg-pink-500 hover:bg-pink-600"
          onClick={() => setNewAppointmentDialog(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Doctor</Label>
              <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All doctors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All doctors</SelectItem>
                  {doctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Patient name, phone, doctor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={fetchAppointments}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle>Appointments for {new Date(selectedDate).toLocaleDateString()}</CardTitle>
          <CardDescription>
            {filteredAppointments.length} appointments found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading appointments...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No appointments found for the selected criteria
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-pink-100 p-2 rounded-lg">
                        <User className="h-5 w-5 text-pink-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{appointment.patient_name}</h3>
                          <span className="text-sm text-gray-500">#{appointment.patient_code}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {appointment.patient_phone}
                          </span>
                          <span className="flex items-center">
                            <Stethoscope className="h-3 w-3 mr-1" />
                            Dr. {appointment.doctor_name}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {appointment.appointment_time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(appointment.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAppointment(appointment)
                          setStatusForm({
                            status: appointment.status,
                            notes: appointment.notes || ''
                          })
                          setEditStatusDialog(true)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Update Status
                      </Button>
                    </div>
                  </div>
                  {appointment.notes && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <strong>Notes:</strong> {appointment.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Appointment Dialog */}
      <Dialog open={newAppointmentDialog} onOpenChange={setNewAppointmentDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Create a new appointment for {new Date(selectedDate).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Search Patient</Label>
              <Input
                placeholder="Search by name, phone, or patient ID..."
                onChange={(e) => {
                  searchPatients(e.target.value)
                  setAppointmentForm(prev => ({ ...prev, patientId: '' }))
                }}
              />
              {patients.length > 0 && (
                <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
                  {patients.map(patient => (
                    <div
                      key={patient.id}
                      className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => {
                        setAppointmentForm(prev => ({ ...prev, patientId: patient.patient_id }))
                        setPatients([])
                      }}
                    >
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-sm text-gray-600">
                        {patient.contact_number} • {patient.age}Y {patient.gender} • #{patient.patient_id}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {appointmentForm.patientId && (
                <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                  Selected: {patients.find(p => p.patient_id === appointmentForm.patientId)?.name || appointmentForm.patientId}
                </div>
              )}
            </div>
            
            <div>
              <Label>Doctor</Label>
              <Select value={appointmentForm.doctorId} onValueChange={(value) => 
                setAppointmentForm(prev => ({ ...prev, doctorId: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>Dr. {doctor.name}</span>
                        {getDoctorStatusBadge(doctor)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={appointmentForm.appointmentTime}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, appointmentTime: e.target.value }))}
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={appointmentForm.appointmentType} onValueChange={(value) => 
                  setAppointmentForm(prev => ({ ...prev, appointmentType: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="routine-checkup">Routine Checkup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes..."
                value={appointmentForm.notes}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewAppointmentDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateAppointment}
              disabled={!appointmentForm.patientId || !appointmentForm.doctorId || !appointmentForm.appointmentTime}
            >
              Schedule Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog open={editStatusDialog} onOpenChange={setEditStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Appointment Status</DialogTitle>
            <DialogDescription>
              Update status for {selectedAppointment?.patient_name}'s appointment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Status</Label>
              <Select value={statusForm.status} onValueChange={(value) => 
                setStatusForm(prev => ({ ...prev, status: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="Update notes..."
                value={statusForm.notes}
                onChange={(e) => setStatusForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
