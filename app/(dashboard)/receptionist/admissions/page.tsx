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
  Search, 
  Plus, 
  Edit, 
  Eye, 
  ArrowLeft,
  User,
  Bed,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Users,
  Activity,
  FileText,
  DollarSign,
  RefreshCw,
  Calendar,
  Stethoscope
} from 'lucide-react'
import Link from 'next/link'

interface Admission {
  id: number
  admission_id: string
  patient_name: string
  patient_phone: string
  age: number
  gender: string
  doctor_name: string
  room_number: string
  room_type: string
  admission_date: string
  admission_type: string
  status: 'active' | 'discharged' | 'transferred' | 'cancelled'
  diagnosis?: string
  chief_complaint?: string
  estimated_stay_days?: number
  total_charges: number
  emergency_contact_name?: string
  emergency_contact_phone?: string
}

interface Room {
  id: number
  room_number: string
  room_name: string
  room_type: string
  floor: number
  capacity: number
  current_occupancy: number
  status: string
  daily_rate: number
  description: string
}

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
  specialization?: string
}

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [allPatients, setAllPatients] = useState<Patient[]>([])
  const [patientSearchQuery, setPatientSearchQuery] = useState('')
  const [doctors, setDoctors] = useState<Doctor[]>([])
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roomTypeFilter, setRoomTypeFilter] = useState('all')
  const [doctorFilter, setDoctorFilter] = useState('all')
  
  // Dialog states
  const [showNewAdmissionDialog, setShowNewAdmissionDialog] = useState(false)
  const [showAdmissionDetailsDialog, setShowAdmissionDetailsDialog] = useState(false)
  const [showDischargeDialog, setShowDischargeDialog] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form states
  const [admissionForm, setAdmissionForm] = useState({
    patientId: '',
    roomId: '',
    doctorId: '',
    admissionType: 'planned',
    diagnosis: '',
    chiefComplaint: '',
    admissionNotes: '',
    estimatedStayDays: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: ''
  })
  
  const [dischargeForm, setDischargeForm] = useState({
    dischargeNotes: '',
    dischargeSummary: '',
    dischargeInstructions: ''
  })
  
  const [transferForm, setTransferForm] = useState({
    newRoomId: '',
    transferReason: ''
  })

  useEffect(() => {
    fetchAdmissions()
    fetchRooms()
    fetchDoctors()
    fetchAllPatients()
  }, [searchQuery, statusFilter, roomTypeFilter, doctorFilter])

  const fetchAdmissions = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(roomTypeFilter !== 'all' && { roomType: roomTypeFilter }),
        ...(doctorFilter !== 'all' && { doctorId: doctorFilter })
      })
      
      const response = await fetch(`/api/receptionist/admissions?${params}`)
      const data = await response.json()
      setAdmissions(data.admissions || [])
    } catch (error) {
      console.error('Failed to fetch admissions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/receptionist/rooms')
      const data = await response.json()
      if (data.success) {
        setRooms(data.rooms || [])
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error)
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

  const fetchAllPatients = async () => {
    try {
      const response = await fetch('/api/receptionist/patients')
      const data = await response.json()
      setAllPatients(data.patients || [])
      setPatients(data.patients?.slice(0, 20) || []) // Show first 20 initially
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    }
  }

  const searchPatients = async (query: string) => {
    setPatientSearchQuery(query)
    
    if (query.length < 2) {
      setPatients(allPatients.slice(0, 20)) // Show first 20 when no search
      return
    }
    
    // Filter from all patients first (instant search)
    const filtered = allPatients.filter(patient => 
      patient.name.toLowerCase().includes(query.toLowerCase()) ||
      patient.contact_number.includes(query) ||
      (patient.patient_id && patient.patient_id.toLowerCase().includes(query.toLowerCase()))
    )
    
    setPatients(filtered.slice(0, 20))
    
    // Also search from API for more results
    try {
      const response = await fetch(`/api/receptionist/patients/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      if (data.patients && data.patients.length > 0) {
        // Merge and deduplicate results
        const merged = [...filtered, ...data.patients]
        const unique = merged.filter((patient, index, self) => 
          index === self.findIndex(p => p.patient_id === patient.patient_id)
        )
        setPatients(unique.slice(0, 20))
      }
    } catch (error) {
      console.error('Failed to search patients:', error)
    }
  }

  const createAdmission = async () => {
    if (!admissionForm.patientId || !admissionForm.roomId || !admissionForm.doctorId) {
      alert('Please fill in all required fields')
      return
    }
    
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/receptionist/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...admissionForm,
          estimatedStayDays: admissionForm.estimatedStayDays ? parseInt(admissionForm.estimatedStayDays) : null,
          admittedBy: 1 // Replace with actual user ID
        })
      })

      if (response.ok) {
        alert('Patient admitted successfully!')
        resetAdmissionForm()
        fetchAdmissions()
        fetchRooms() // Refresh available rooms
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to admit patient')
      }
    } catch (error) {
      console.error('Failed to create admission:', error)
      alert('Failed to admit patient')
    } finally {
      setIsSubmitting(false)
    }
  }

  const dischargePatient = async () => {
    if (!selectedAdmission) return
    
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/receptionist/admissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admissionId: selectedAdmission.admission_id,
          action: 'discharge',
          ...dischargeForm,
          dischargedBy: 1 // Replace with actual user ID
        })
      })

      if (response.ok) {
        const result = await response.json()
        const confirmBilling = confirm(`Patient discharged successfully!\n\nBill Generated:\nBill ID: ${result.billId}\nTotal Amount: ₹${result.totalAmount.toLocaleString()}\nStay Duration: ${result.stayDays} days\n\nBill has been added to the billing system.\n\nWould you like to go to the billing section to process payment?`)
        
        setShowDischargeDialog(false)
        setDischargeForm({ dischargeNotes: '', dischargeSummary: '', dischargeInstructions: '' })
        fetchAdmissions()
        fetchRooms()
        
        if (confirmBilling) {
          window.open('/receptionist/billing', '_blank')
        }
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to discharge patient')
      }
    } catch (error) {
      console.error('Failed to discharge patient:', error)
      alert('Failed to discharge patient')
    } finally {
      setIsSubmitting(false)
    }
  }

  const transferPatient = async () => {
    if (!selectedAdmission || !transferForm.newRoomId) return
    
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/receptionist/admissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admissionId: selectedAdmission.admission_id,
          action: 'transfer',
          ...transferForm,
          dischargedBy: 1 // Replace with actual user ID
        })
      })

      if (response.ok) {
        alert('Patient transferred successfully!')
        setShowTransferDialog(false)
        setTransferForm({ newRoomId: '', transferReason: '' })
        fetchAdmissions()
        fetchRooms()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to transfer patient')
      }
    } catch (error) {
      console.error('Failed to transfer patient:', error)
      alert('Failed to transfer patient')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetAdmissionForm = () => {
    setAdmissionForm({
      patientId: '',
      roomId: '',
      doctorId: '',
      admissionType: 'planned',
      diagnosis: '',
      chiefComplaint: '',
      admissionNotes: '',
      estimatedStayDays: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: ''
    })
    setPatients([])
    setShowNewAdmissionDialog(false)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'active': { color: 'bg-green-100 text-green-700', icon: Activity },
      'discharged': { color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
      'transferred': { color: 'bg-yellow-100 text-yellow-700', icon: RefreshCw },
      'cancelled': { color: 'bg-red-100 text-red-700', icon: XCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['active']
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.toUpperCase()}
      </Badge>
    )
  }

  const getAdmissionTypeBadge = (type: string) => {
    const typeConfig = {
      'emergency': { color: 'bg-red-100 text-red-700', icon: AlertCircle },
      'planned': { color: 'bg-blue-100 text-blue-700', icon: Calendar },
      'transfer': { color: 'bg-yellow-100 text-yellow-700', icon: RefreshCw },
      'observation': { color: 'bg-purple-100 text-purple-700', icon: Eye }
    }
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig['planned']
    const Icon = config.icon
    
    return (
      <Badge variant="outline" className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {type.toUpperCase()}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4 lg:p-6">
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
            <h1 className="text-2xl font-bold text-gray-900">Patient Admissions</h1>
            <p className="text-gray-600">Manage patient admissions and discharges</p>
          </div>
        </div>
        <Button 
          className="bg-pink-500 hover:bg-pink-600"
          onClick={() => {
            setShowNewAdmissionDialog(true)
            setPatientSearchQuery('')
            setAdmissionForm({
              patientId: '',
              roomId: '',
              doctorId: '',
              admissionType: 'planned',
              chiefComplaint: '',
              diagnosis: '',
              estimatedStayDays: '',
              emergencyContactName: '',
              emergencyContactPhone: '',
              emergencyContactRelation: ''
            })
            // Load initial patients when dialog opens
            if (allPatients.length > 0) {
              setPatients(allPatients.slice(0, 20))
            }
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Admission
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Admissions</p>
                <p className="text-2xl font-bold">{admissions.filter(a => a.status === 'active').length}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Rooms</p>
                <p className="text-2xl font-bold">{rooms.length}</p>
              </div>
              <Bed className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Discharges</p>
                <p className="text-2xl font-bold">
                  {admissions.filter(a => 
                    a.status === 'discharged' && 
                    new Date(a.admission_date).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Emergency Admissions</p>
                <p className="text-2xl font-bold">
                  {admissions.filter(a => a.admission_type === 'emergency' && a.status === 'active').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Label>Search Admissions</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by patient name, admission ID, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="discharged">Discharged</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Room Type</Label>
              <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Room Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Room Types</SelectItem>
                  <SelectItem value="General Ward">General Ward</SelectItem>
                  <SelectItem value="Private Room">Private Room</SelectItem>
                  <SelectItem value="ICU">ICU</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Doctor</Label>
              <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Doctors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {doctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      Dr. {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admissions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Admissions ({admissions.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-pink-500" />
              <p>Loading admissions...</p>
            </div>
          ) : admissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No admissions found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {admissions.map((admission) => (
                <div key={admission.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-pink-100 p-2 rounded-lg">
                        <Bed className="h-5 w-5 text-pink-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{admission.admission_id}</h3>
                          {getStatusBadge(admission.status)}
                          {getAdmissionTypeBadge(admission.admission_type)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {admission.patient_name} ({admission.age}Y, {admission.gender})
                            </p>
                            <p className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {admission.patient_phone}
                            </p>
                          </div>
                          <div>
                            <p className="flex items-center">
                              <Stethoscope className="h-3 w-3 mr-1" />
                              Dr. {admission.doctor_name}
                            </p>
                            <p className="flex items-center">
                              <Bed className="h-3 w-3 mr-1" />
                              {admission.room_number} ({admission.room_type})
                            </p>
                          </div>
                          <div>
                            <p className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(admission.admission_date).toLocaleDateString()}
                            </p>
                            <p className="flex items-center">
                              <DollarSign className="h-3 w-3 mr-1" />
                              ₹{admission.total_charges.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {admission.diagnosis && (
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Diagnosis:</strong> {admission.diagnosis}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAdmission(admission)
                          setShowAdmissionDetailsDialog(true)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      {admission.status === 'active' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAdmission(admission)
                              setShowTransferDialog(true)
                            }}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Transfer
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => {
                              setSelectedAdmission(admission)
                              setShowDischargeDialog(true)
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Discharge
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Admission Dialog */}
      <Dialog open={showNewAdmissionDialog} onOpenChange={setShowNewAdmissionDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Patient Admission</DialogTitle>
            <DialogDescription>
              Admit a patient to the hospital and assign a room
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Patient Selection */}
            <div>
              <Label>Search Patient *</Label>
              <Input
                placeholder="Search by name, phone, or patient ID..."
                value={patientSearchQuery}
                onChange={(e) => {
                  searchPatients(e.target.value)
                  if (!e.target.value) setAdmissionForm(prev => ({ ...prev, patientId: '' }))
                }}
              />
              {patients.length > 0 && (
                <div className="mt-2 max-h-60 overflow-y-auto border rounded-lg">
                  <div className="p-2 bg-gray-50 text-sm text-gray-600 border-b">
                    {patientSearchQuery ? `Found ${patients.length} patients` : `Showing ${patients.length} recent patients`}
                  </div>
                  {patients.map(patient => (
                    <div
                      key={patient.id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${
                        admissionForm.patientId === patient.id.toString() ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => {
                        setAdmissionForm(prev => ({ ...prev, patientId: patient.id.toString() }))
                      }}
                    >
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-sm text-gray-600">
                        📞 {patient.contact_number} • {patient.age}Y {patient.gender}
                        {patient.patient_id && ` • ID: ${patient.patient_id}`}
                      </div>
                      {patient.address && (
                        <div className="text-xs text-gray-500 mt-1">📍 {patient.address}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {admissionForm.patientId && (
                <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm font-medium text-green-800">Selected Patient:</div>
                  <div className="text-sm text-green-700">
                    {patients.find(p => p.id.toString() === admissionForm.patientId)?.name || 'Patient selected'}
                  </div>
                </div>
              )}
              {patients.length === 0 && patientSearchQuery.length >= 2 && (
                <div className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
                  <div className="text-sm text-yellow-800">No patients found matching "{patientSearchQuery}"</div>
                  <div className="text-xs text-yellow-600 mt-1">Try searching by name, phone number, or patient ID</div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Room Selection */}
              <div>
                <Label>Room *</Label>
                <Select value={admissionForm.roomId} onValueChange={(value) => 
                  setAdmissionForm(prev => ({ ...prev, roomId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map(room => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        {room.room_number} - {room.room_type} (₹{room.daily_rate}/day) - Floor {room.floor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Doctor Selection */}
              <div>
                <Label>Attending Doctor *</Label>
                <Select value={admissionForm.doctorId} onValueChange={(value) => 
                  setAdmissionForm(prev => ({ ...prev, doctorId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map(doctor => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        Dr. {doctor.name} {doctor.specialization && `(${doctor.specialization})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Admission Type */}
              <div>
                <Label>Admission Type</Label>
                <Select value={admissionForm.admissionType} onValueChange={(value) => 
                  setAdmissionForm(prev => ({ ...prev, admissionType: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="observation">Observation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Estimated Stay */}
              <div>
                <Label>Estimated Stay (Days)</Label>
                <Input
                  type="number"
                  placeholder="Enter estimated days"
                  value={admissionForm.estimatedStayDays}
                  onChange={(e) => setAdmissionForm(prev => ({ ...prev, estimatedStayDays: e.target.value }))}
                />
              </div>
            </div>

            {/* Medical Information */}
            <div>
              <Label>Chief Complaint</Label>
              <Textarea
                placeholder="Enter chief complaint..."
                value={admissionForm.chiefComplaint}
                onChange={(e) => setAdmissionForm(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                rows={2}
              />
            </div>

            <div>
              <Label>Diagnosis</Label>
              <Textarea
                placeholder="Enter diagnosis..."
                value={admissionForm.diagnosis}
                onChange={(e) => setAdmissionForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                rows={2}
              />
            </div>

            <div>
              <Label>Admission Notes</Label>
              <Textarea
                placeholder="Enter admission notes..."
                value={admissionForm.admissionNotes}
                onChange={(e) => setAdmissionForm(prev => ({ ...prev, admissionNotes: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h4 className="font-semibold">Emergency Contact</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    placeholder="Contact name"
                    value={admissionForm.emergencyContactName}
                    onChange={(e) => setAdmissionForm(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    placeholder="Contact phone"
                    value={admissionForm.emergencyContactPhone}
                    onChange={(e) => setAdmissionForm(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Relation</Label>
                  <Input
                    placeholder="Relation"
                    value={admissionForm.emergencyContactRelation}
                    onChange={(e) => setAdmissionForm(prev => ({ ...prev, emergencyContactRelation: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={resetAdmissionForm}>
              Cancel
            </Button>
            <Button 
              onClick={createAdmission}
              disabled={isSubmitting || !admissionForm.patientId || !admissionForm.roomId || !admissionForm.doctorId}
              className="bg-pink-500 hover:bg-pink-600"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Admitting...
                </>
              ) : (
                'Admit Patient'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discharge Dialog */}
      <Dialog open={showDischargeDialog} onOpenChange={setShowDischargeDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Discharge Patient</DialogTitle>
            <DialogDescription>
              Complete the discharge process for {selectedAdmission?.patient_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Discharge Notes</Label>
              <Textarea
                placeholder="Enter discharge notes..."
                value={dischargeForm.dischargeNotes}
                onChange={(e) => setDischargeForm(prev => ({ ...prev, dischargeNotes: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div>
              <Label>Discharge Summary</Label>
              <Textarea
                placeholder="Enter discharge summary..."
                value={dischargeForm.dischargeSummary}
                onChange={(e) => setDischargeForm(prev => ({ ...prev, dischargeSummary: e.target.value }))}
                rows={4}
              />
            </div>
            
            <div>
              <Label>Discharge Instructions</Label>
              <Textarea
                placeholder="Enter discharge instructions for patient..."
                value={dischargeForm.dischargeInstructions}
                onChange={(e) => setDischargeForm(prev => ({ ...prev, dischargeInstructions: e.target.value }))}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDischargeDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={dischargePatient}
              disabled={isSubmitting}
              className="bg-green-500 hover:bg-green-600"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Discharging...
                </>
              ) : (
                'Discharge Patient'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Patient</DialogTitle>
            <DialogDescription>
              Transfer {selectedAdmission?.patient_name} to a different room
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>New Room *</Label>
              <Select value={transferForm.newRoomId} onValueChange={(value) => 
                setTransferForm(prev => ({ ...prev, newRoomId: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select new room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map(room => (
                    <SelectItem key={room.id} value={room.id.toString()}>
                      {room.room_number} - {room.room_type} (₹{room.daily_rate}/day) - Floor {room.floor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Transfer Reason</Label>
              <Textarea
                placeholder="Enter reason for transfer..."
                value={transferForm.transferReason}
                onChange={(e) => setTransferForm(prev => ({ ...prev, transferReason: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransferDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={transferPatient}
              disabled={isSubmitting || !transferForm.newRoomId}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Transferring...
                </>
              ) : (
                'Transfer Patient'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admission Details Dialog */}
      <Dialog open={showAdmissionDetailsDialog} onOpenChange={setShowAdmissionDetailsDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Admission Details</DialogTitle>
            <DialogDescription>
              Complete information for admission {selectedAdmission?.admission_id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAdmission && (
            <div className="space-y-6">
              {/* Patient Information */}
              <div>
                <h4 className="font-semibold mb-3">Patient Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Name:</strong> {selectedAdmission.patient_name}</p>
                    <p><strong>Age:</strong> {selectedAdmission.age} years</p>
                    <p><strong>Gender:</strong> {selectedAdmission.gender}</p>
                  </div>
                  <div>
                    <p><strong>Phone:</strong> {selectedAdmission.patient_phone}</p>
                    <p><strong>Emergency Contact:</strong> {selectedAdmission.emergency_contact_name || 'Not provided'}</p>
                    <p><strong>Emergency Phone:</strong> {selectedAdmission.emergency_contact_phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Admission Information */}
              <div>
                <h4 className="font-semibold mb-3">Admission Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Admission ID:</strong> {selectedAdmission.admission_id}</p>
                    <p><strong>Admission Date:</strong> {new Date(selectedAdmission.admission_date).toLocaleString()}</p>
                    <p><strong>Type:</strong> {getAdmissionTypeBadge(selectedAdmission.admission_type)}</p>
                    <p><strong>Status:</strong> {getStatusBadge(selectedAdmission.status)}</p>
                  </div>
                  <div>
                    <p><strong>Doctor:</strong> Dr. {selectedAdmission.doctor_name}</p>
                    <p><strong>Room:</strong> {selectedAdmission.room_number} ({selectedAdmission.room_type})</p>
                    <p><strong>Estimated Stay:</strong> {selectedAdmission.estimated_stay_days || 'Not specified'} days</p>
                    <p><strong>Total Charges:</strong> ₹{selectedAdmission.total_charges.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              {(selectedAdmission.diagnosis || selectedAdmission.chief_complaint) && (
                <div>
                  <h4 className="font-semibold mb-3">Medical Information</h4>
                  {selectedAdmission.chief_complaint && (
                    <div className="mb-2">
                      <p className="text-sm"><strong>Chief Complaint:</strong></p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{selectedAdmission.chief_complaint}</p>
                    </div>
                  )}
                  {selectedAdmission.diagnosis && (
                    <div>
                      <p className="text-sm"><strong>Diagnosis:</strong></p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{selectedAdmission.diagnosis}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdmissionDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
