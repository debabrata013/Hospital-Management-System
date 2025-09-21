"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Plus, Search, Filter, Edit, Trash2, Eye,
  Calendar, Clock, User, Phone,
  ArrowLeft, ChevronLeft, ChevronRight,
  Stethoscope, FileText
} from 'lucide-react'

interface Appointment {
  id: number
  appointmentDate: string
  appointmentTime: string | null
  appointmentType: string
  status: string
  notes?: string
  patient: {
    id: number
    name: string
    patientId: string
    contactNumber: string
  }
  doctor: {
    id: number
    name: string
    department: string
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AppointmentsPage() {
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [expandedAppointmentId, setExpandedAppointmentId] = useState<number | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Scheduled')
  const [dateFilter, setDateFilter] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [patients, setPatients] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    appointment_type: '',
    notes: ''
  })

  useEffect(() => {
    fetchAppointments()
    fetchFormData()
  }, [pagination.page, search, statusFilter, dateFilter])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        ...(dateFilter && { date: dateFilter })
      })

      const response = await fetch(`/api/admin/appointments?${params}`)
      if (!response.ok) throw new Error('Failed to fetch appointments')

      const data = await response.json()
      setAppointments(data.appointments)
      setPagination(data.pagination)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchFormData = async () => {
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        fetch('/api/admin/patients-list'),
        fetch('/api/admin/appointment-data')
      ])

      if (patientsRes.ok) {
        const patientsData = await patientsRes.json()
        if (Array.isArray(patientsData) && patientsData.length > 0) {
          setPatients(patientsData)
        } else {
          // Fallback: pull from paginated patients API and normalize
          const fallbackRes = await fetch('/api/admin/patients?status=active&limit=100')
          if (fallbackRes.ok) {
            const fb = await fallbackRes.json()
            const normalized = (fb.patients || []).map((p: any) => ({
              id: p.id,
              name: p.name,
              patient_id: p.patient_id || p.patientId,
              contact_number: p.contact_number || p.phone,
            }))
            setPatients(normalized)
          }
        }
      }

      if (doctorsRes.ok) {
        const doctorsData = await doctorsRes.json()
        const list = Array.isArray(doctorsData.doctors)
          ? doctorsData.doctors
          : Array.isArray(doctorsData) ? doctorsData : []
        setDoctors(list)
      }
    } catch (error) {
      console.error('Error fetching form data:', error)
    }
  }

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Basic client-side validation and normalization
      if (!formData.patient_id || !formData.doctor_id || !formData.appointment_date || !formData.appointment_time || !formData.appointment_type) {
        throw new Error('Please fill all required fields')
      }
      const payload = {
        patient_id: Number(formData.patient_id),
        doctor_id: Number(formData.doctor_id),
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        appointment_type: formData.appointment_type,
        notes: formData.notes?.trim() || undefined,
      }

      const response = await fetch('/api/admin/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || `Failed to create appointment`)
      }

      toast({
        title: "Success",
        description: "Appointment created successfully"
      })

      setIsAddDialogOpen(false)
      resetForm()
      fetchAppointments()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create appointment',
        variant: "destructive"
      })
    }
  }

  const handleEditAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAppointment) return

    try {
      const response = await fetch('/api/admin/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedAppointment.id, ...formData })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update appointment')
      }

      toast({
        title: "Success",
        description: "Appointment updated successfully"
      })

      setIsEditDialogOpen(false)
      setSelectedAppointment(null)
      resetForm()
      fetchAppointments()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update appointment',
        variant: "destructive"
      })
    }
  }

  const handleDeleteAppointment = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return

    try {
      const response = await fetch(`/api/admin/appointments?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel appointment')
      }

      toast({
        title: "Success",
        description: "Appointment cancelled successfully"
      })

      fetchAppointments()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to cancel appointment',
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      patient_id: '',
      doctor_id: '',
      appointment_date: '',
      appointment_time: '',
      appointment_type: '',
      notes: ''
    })
  }

  const openEditDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setFormData({
      patient_id: appointment.patient.id.toString(),
      doctor_id: appointment.doctor.id.toString(),
      appointment_date: appointment.appointmentDate,
      appointment_time: appointment.appointmentTime || '',
      appointment_type: appointment.appointmentType,
      notes: appointment.notes || ''
    })
    setIsEditDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-700">Scheduled</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>
      case 'no show':
        return <Badge className="bg-yellow-100 text-yellow-700">No Show</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getAge = (dob?: string) => {
    if (!dob) return undefined
    const birth = new Date(dob)
    if (isNaN(birth.getTime())) return undefined
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  const formatTime = (timeString: string | null | undefined) => {
    // Handle null, undefined, or empty timeString
    if (!timeString) {
      return 'Time not set'
    }
    
    // Ensure timeString is a string and has the expected format
    if (typeof timeString !== 'string' || !timeString.includes(':')) {
      return 'Invalid time'
    }
    
    try {
      const [hours, minutes] = timeString.split(':')
      const hour = parseInt(hours, 10)
      
      // Validate hour and minutes
      if (isNaN(hour) || !minutes) {
        return 'Invalid time'
      }
      
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const formattedHour = hour % 12 || 12
      return `${formattedHour}:${minutes} ${ampm}`
    } catch (error) {
      return 'Invalid time'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Appointment Management</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage all patient appointments and schedules</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
                <DialogDescription>Create a new appointment for a patient</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAppointment} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patient_id">Patient *</Label>
                    <Select value={formData.patient_id || undefined} onValueChange={(value) => setFormData({ ...formData, patient_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((p: any) => {
                          const age = getAge(p.date_of_birth)
                          const label = [
                            p.name,
                            p.patient_id || p.patientId ? `(${p.patient_id || p.patientId})` : undefined,
                            p.contact_number || p.contactNumber,
                            age !== undefined ? `${age} yrs` : undefined,
                            p.gender
                          ].filter(Boolean).join(' • ')
                          return (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {label}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    {/* Selected patient quick summary */}
                    {formData.patient_id && (() => {
                      const p = patients.find((x: any) => String(x.id) === String(formData.patient_id))
                      if (!p) return null
                      const age = getAge(p.date_of_birth)
                      return (
                        <div className="mt-3 rounded-lg border border-pink-100 bg-white p-3 text-sm text-gray-700">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div><span className="font-medium">Name:</span> {p.name}</div>
                            <div><span className="font-medium">Patient ID:</span> {p.patient_id || p.patientId || '-'}</div>
                            <div><span className="font-medium">Phone:</span> {p.contact_number || p.contactNumber || '-'}</div>
                            <div><span className="font-medium">Age/Gender:</span> {age !== undefined ? `${age}` : '-'}{p.gender ? ` / ${p.gender}` : ''}</div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                  <div>
                    <Label htmlFor="doctor_id">Doctor *</Label>
                    <Select value={formData.doctor_id || undefined} onValueChange={(value) => setFormData({ ...formData, doctor_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id.toString()}>
                            {doctor.name} ({doctor.department})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="appointment_date">Appointment Date *</Label>
                    <Input
                      id="appointment_date"
                      type="date"
                      value={formData.appointment_date}
                      onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="appointment_time">Appointment Time *</Label>
                    <Input
                      id="appointment_time"
                      type="time"
                      value={formData.appointment_time}
                      onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="appointment_type">Appointment Type *</Label>
                  <Select value={formData.appointment_type || undefined} onValueChange={(value) => setFormData({ ...formData, appointment_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Consultation">General Consultation</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="Surgery">Surgery</SelectItem>
                      <SelectItem value="Lab Test">Lab Test</SelectItem>
                      <SelectItem value="X-Ray">X-Ray</SelectItem>
                      <SelectItem value="Specialist Consultation">Specialist Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes about the appointment..."
                  />
                </div>
                <div className="flex flex-col sm:flex-row-reverse sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                  <Button type="submit" className="w-full sm:w-auto">Schedule Appointment</Button>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search appointments by patient, doctor, or type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select value={statusFilter || undefined} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="No Show">No Show</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full sm:w-40"
              />
              <Button variant="outline" onClick={() => { setSearch(''); setStatusFilter('all'); setDateFilter(''); }} className="w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Calendar className="h-5 w-5 mr-2" />
            Appointments ({pagination.total})
          </CardTitle>
          <CardDescription className="text-sm">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-4 animate-pulse">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No appointments found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start space-x-4 mb-4 sm:mb-0">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarFallback className="bg-pink-100 text-pink-700">
                          {appointment.patient.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <h3 className="font-semibold text-gray-900">{appointment.patient.name}</h3>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {appointment.patient.patientId}
                          </span>
                          <span className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {appointment.patient.contactNumber}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(appointment.appointmentDate)}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(appointment.appointmentTime)}
                          </span>
                          <span className="flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            {appointment.appointmentType}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                          <span className="flex items-center">
                            <Stethoscope className="h-3 w-3 mr-1" />
                            Dr. {appointment.doctor.name} ({appointment.doctor.department})
                          </span>
                        </div>
                        {appointment.notes && (
                          <div className="text-sm text-gray-500 mt-1">
                            <span className="font-medium">Notes:</span> {appointment.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedAppointmentId(expandedAppointmentId === appointment.id ? null : appointment.id)}
                        className="w-1/2 sm:w-auto"
                      >
                        <Eye className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(appointment)}
                        className="w-1/2 sm:w-auto"
                      >
                        <Edit className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="text-red-600 hover:text-red-700 w-1/2 sm:w-auto"
                      >
                        <Trash2 className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Cancel</span>
                      </Button>
                    </div>
                  </div>
                  {expandedAppointmentId === appointment.id && (
                    <div className="mt-3 rounded-lg border border-pink-100 bg-white p-4 text-sm text-gray-700">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="font-medium">Patient ID:</span> {appointment.patient.patientId}
                        </div>
                        <div>
                          <span className="font-medium">Doctor:</span> Dr. {appointment.doctor.name}
                        </div>
                        <div>
                          <span className="font-medium">Department:</span> {appointment.doctor.department}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span> {appointment.status}
                        </div>
                        <div className="sm:col-span-2">
                          <span className="font-medium">Notes:</span> {appointment.notes || '—'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 space-y-4 sm:space-y-0">
              <p className="text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Appointment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>Update appointment information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditAppointment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-patient_id">Patient *</Label>
                <Select value={formData.patient_id || undefined} onValueChange={(value) => setFormData({ ...formData, patient_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.name} ({patient.patient_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-doctor_id">Doctor *</Label>
                <Select value={formData.doctor_id || undefined} onValueChange={(value) => setFormData({ ...formData, doctor_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        {doctor.name} ({doctor.department})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-appointment_date">Appointment Date *</Label>
                <Input
                  id="edit-appointment_date"
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-appointment_time">Appointment Time *</Label>
                <Input
                  id="edit-appointment_time"
                  type="time"
                  value={formData.appointment_time}
                  onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-appointment_type">Appointment Type *</Label>
              <Select value={formData.appointment_type || undefined} onValueChange={(value) => setFormData({ ...formData, appointment_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select appointment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General Consultation">General Consultation</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Surgery">Surgery</SelectItem>
                  <SelectItem value="Lab Test">Lab Test</SelectItem>
                  <SelectItem value="X-Ray">X-Ray</SelectItem>
                  <SelectItem value="Specialist Consultation">Specialist Consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about the appointment..."
              />
            </div>
            <div className="flex flex-col sm:flex-row-reverse sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
              <Button type="submit" className="w-full sm:w-auto">Update Appointment</Button>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}