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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Calendar as CalendarIcon,
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  ArrowLeft,
  User,
  Bed,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Users,
  Activity,
  FileText,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'
import { format } from "date-fns"

interface Admission {
  id: string
  admissionId: string
  patientName: string
  patientPhone: string
  patientAge: number
  patientGender: string
  doctorName: string
  department: string
  roomNumber: string
  bedNumber: string
  admissionDate: string
  admissionTime: string
  expectedDischargeDate?: string
  status: 'admitted' | 'discharged' | 'transferred' | 'critical'
  admissionType: 'emergency' | 'planned' | 'transfer'
  diagnosis: string
  notes?: string
  emergencyContact: string
  emergencyPhone: string
  insurance?: string
  createdAt: string
}

interface Room {
  id: string
  roomNumber: string
  roomType: 'general' | 'private' | 'icu' | 'emergency'
  totalBeds: number
  availableBeds: number
  department: string
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
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
}

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([])
  const [filteredAdmissions, setFilteredAdmissions] = useState<Admission[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [showNewAdmissionDialog, setShowNewAdmissionDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showDischargeDialog, setShowDischargeDialog] = useState(false)
  const [showBillingDialog, setShowBillingDialog] = useState(false)
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // New admission form
  const [newAdmission, setNewAdmission] = useState({
    patientId: '',
    doctorId: '',
    roomId: '',
    bedNumber: '',
    admissionDate: new Date(),
    admissionTime: '',
    expectedDischargeDate: new Date(),
    admissionType: 'planned',
    diagnosis: '',
    notes: '',
    emergencyContact: '',
    emergencyPhone: '',
    insurance: ''
  })

  // Billing form
  const [billingForm, setBillingForm] = useState({
    roomCharges: '',
    doctorFee: '',
    nursingCharges: '',
    medicationFee: '',
    testFee: '',
    procedureFee: '',
    equipmentCharges: '',
    otherCharges: '',
    discount: '',
    paymentMethod: 'cash',
    notes: ''
  })

  // Discharge form
  const [dischargeForm, setDischargeForm] = useState({
    dischargeDate: new Date(),
    dischargeTime: '',
    dischargeSummary: '',
    followUpInstructions: '',
    medications: ''
  })

  // Mock data - will be replaced with API calls
  const mockAdmissions: Admission[] = [
    {
      id: '1',
      admissionId: 'ADM001',
      patientName: 'John Smith',
      patientPhone: '+91 98765 43210',
      patientAge: 45,
      patientGender: 'Male',
      doctorName: 'Dr. Sarah Johnson',
      department: 'Cardiology',
      roomNumber: '101',
      bedNumber: 'A1',
      admissionDate: '2024-01-15',
      admissionTime: '10:00 AM',
      expectedDischargeDate: '2024-01-20',
      status: 'admitted',
      admissionType: 'emergency',
      diagnosis: 'Chest pain, suspected MI',
      notes: 'Patient stable, monitoring required',
      emergencyContact: 'Jane Smith',
      emergencyPhone: '+91 98765 43211',
      insurance: 'Health Plus',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      admissionId: 'ADM002',
      patientName: 'Emily Davis',
      patientPhone: '+91 98765 43212',
      patientAge: 32,
      patientGender: 'Female',
      doctorName: 'Dr. Michael Brown',
      department: 'Orthopedics',
      roomNumber: '205',
      bedNumber: 'B2',
      admissionDate: '2024-01-14',
      admissionTime: '2:30 PM',
      expectedDischargeDate: '2024-01-18',
      status: 'admitted',
      admissionType: 'planned',
      diagnosis: 'Knee replacement surgery',
      notes: 'Post-operative care',
      emergencyContact: 'Robert Davis',
      emergencyPhone: '+91 98765 43213',
      createdAt: '2024-01-14'
    }
  ]

  const mockRooms: Room[] = [
    { id: '1', roomNumber: '101', roomType: 'general', totalBeds: 4, availableBeds: 2, department: 'Cardiology' },
    { id: '2', roomNumber: '102', roomType: 'private', totalBeds: 1, availableBeds: 0, department: 'Cardiology' },
    { id: '3', roomNumber: '201', roomType: 'icu', totalBeds: 6, availableBeds: 3, department: 'ICU' },
    { id: '4', roomNumber: '205', roomType: 'general', totalBeds: 4, availableBeds: 1, department: 'Orthopedics' }
  ]

  const mockDoctors: Doctor[] = [
    { id: '1', name: 'Dr. Sarah Johnson', department: 'Cardiology', specialization: 'Heart Specialist' },
    { id: '2', name: 'Dr. Michael Brown', department: 'Orthopedics', specialization: 'Bone Specialist' },
    { id: '3', name: 'Dr. Lisa Wilson', department: 'Pediatrics', specialization: 'Child Specialist' }
  ]

  const mockPatients: Patient[] = [
    { id: '1', name: 'John Smith', phone: '+91 98765 43210', age: 45, gender: 'Male', emergencyContact: 'Jane Smith', emergencyPhone: '+91 98765 43211' },
    { id: '2', name: 'Emily Davis', phone: '+91 98765 43212', age: 32, gender: 'Female', emergencyContact: 'Robert Davis', emergencyPhone: '+91 98765 43213' }
  ]

  useEffect(() => {
    // Initialize with mock data
    setAdmissions(mockAdmissions)
    setFilteredAdmissions(mockAdmissions)
    setRooms(mockRooms)
    setDoctors(mockDoctors)
    setPatients(mockPatients)
    setIsLoading(false)
  }, [])

  // Filter admissions
  useEffect(() => {
    let filtered = admissions

    if (searchQuery) {
      filtered = filtered.filter(adm => 
        adm.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adm.admissionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adm.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adm.patientPhone.includes(searchQuery) ||
        adm.roomNumber.includes(searchQuery)
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(adm => adm.status === statusFilter)
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter(adm => adm.department === departmentFilter)
    }

    setFilteredAdmissions(filtered)
  }, [admissions, searchQuery, statusFilter, departmentFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'admitted': return 'bg-green-100 text-green-800 border-green-200'
      case 'discharged': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'transferred': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-100 text-red-800'
      case 'planned': return 'bg-blue-100 text-blue-800'
      case 'transfer': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'general': return 'bg-blue-100 text-blue-800'
      case 'private': return 'bg-purple-100 text-purple-800'
      case 'icu': return 'bg-red-100 text-red-800'
      case 'emergency': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCreateAdmission = () => {
    const selectedPatient = patients.find(p => p.id === newAdmission.patientId)
    const selectedDoctor = doctors.find(d => d.id === newAdmission.doctorId)
    const selectedRoom = rooms.find(r => r.id === newAdmission.roomId)

    const newAdm: Admission = {
      id: Date.now().toString(),
      admissionId: `ADM${Date.now().toString().slice(-6)}`,
      patientName: selectedPatient?.name || '',
      patientPhone: selectedPatient?.phone || '',
      patientAge: selectedPatient?.age || 0,
      patientGender: selectedPatient?.gender || '',
      doctorName: selectedDoctor?.name || '',
      department: selectedDoctor?.department || '',
      roomNumber: selectedRoom?.roomNumber || '',
      bedNumber: newAdmission.bedNumber,
      admissionDate: format(newAdmission.admissionDate, 'yyyy-MM-dd'),
      admissionTime: newAdmission.admissionTime,
      expectedDischargeDate: format(newAdmission.expectedDischargeDate, 'yyyy-MM-dd'),
      status: 'admitted',
      admissionType: newAdmission.admissionType as any,
      diagnosis: newAdmission.diagnosis,
      notes: newAdmission.notes,
      emergencyContact: newAdmission.emergencyContact,
      emergencyPhone: newAdmission.emergencyPhone,
      insurance: newAdmission.insurance,
      createdAt: new Date().toISOString()
    }

    setAdmissions([...admissions, newAdm])
    setShowNewAdmissionDialog(false)
    resetNewAdmissionForm()
  }

  const resetNewAdmissionForm = () => {
    setNewAdmission({
      patientId: '',
      doctorId: '',
      roomId: '',
      bedNumber: '',
      admissionDate: new Date(),
      admissionTime: '',
      expectedDischargeDate: new Date(),
      admissionType: 'planned',
      diagnosis: '',
      notes: '',
      emergencyContact: '',
      emergencyPhone: '',
      insurance: ''
    })
  }

  const handleDischarge = () => {
    if (selectedAdmission) {
      setAdmissions(admissions.map(adm => 
        adm.id === selectedAdmission.id ? { ...adm, status: 'discharged' } : adm
      ))
      setShowDischargeDialog(false)
      setSelectedAdmission(null)
    }
  }

  const handleUpdateStatus = (admissionId: string, newStatus: string) => {
    setAdmissions(admissions.map(adm => 
      adm.id === admissionId ? { ...adm, status: newStatus as any } : adm
    ))
  }

  const handleCreateBill = () => {
    const total = parseFloat(billingForm.roomCharges || '0') +
                 parseFloat(billingForm.doctorFee || '0') +
                 parseFloat(billingForm.nursingCharges || '0') +
                 parseFloat(billingForm.medicationFee || '0') +
                 parseFloat(billingForm.testFee || '0') +
                 parseFloat(billingForm.procedureFee || '0') +
                 parseFloat(billingForm.equipmentCharges || '0') +
                 parseFloat(billingForm.otherCharges || '0') -
                 parseFloat(billingForm.discount || '0')

    // Here you would typically save the bill to the database
    console.log('Admission bill created:', {
      admissionId: selectedAdmission?.id,
      total,
      ...billingForm
    })

    setShowBillingDialog(false)
    resetBillingForm()
  }

  const resetBillingForm = () => {
    setBillingForm({
      roomCharges: '',
      doctorFee: '',
      nursingCharges: '',
      medicationFee: '',
      testFee: '',
      procedureFee: '',
      equipmentCharges: '',
      otherCharges: '',
      discount: '',
      paymentMethod: 'cash',
      notes: ''
    })
  }

  const calculateTotal = () => {
    return parseFloat(billingForm.roomCharges || '0') +
           parseFloat(billingForm.doctorFee || '0') +
           parseFloat(billingForm.nursingCharges || '0') +
           parseFloat(billingForm.medicationFee || '0') +
           parseFloat(billingForm.testFee || '0') +
           parseFloat(billingForm.procedureFee || '0') +
           parseFloat(billingForm.equipmentCharges || '0') +
           parseFloat(billingForm.otherCharges || '0') -
           parseFloat(billingForm.discount || '0')
  }

  const stats = {
    total: admissions.length,
    admitted: admissions.filter(a => a.status === 'admitted').length,
    discharged: admissions.filter(a => a.status === 'discharged').length,
    critical: admissions.filter(a => a.status === 'critical').length,
    totalBeds: rooms.reduce((sum, room) => sum + room.totalBeds, 0),
    availableBeds: rooms.reduce((sum, room) => sum + room.availableBeds, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-green-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/receptionist">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Admissions</h1>
              <p className="text-sm text-gray-600">Manage patient admissions and discharges</p>
            </div>
          </div>
          <Button onClick={() => setShowNewAdmissionDialog(true)} className="bg-green-500 hover:bg-green-600">
            <Plus className="h-4 w-4 mr-2" />
            New Admission
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Admissions</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Currently Admitted</p>
                  <p className="text-2xl font-bold">{stats.admitted}</p>
                </div>
                <Bed className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Discharged</p>
                  <p className="text-2xl font-bold">{stats.discharged}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Critical</p>
                  <p className="text-2xl font-bold">{stats.critical}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Total Beds</p>
                  <p className="text-2xl font-bold">{stats.totalBeds}</p>
                </div>
                <Bed className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-sm">Available Beds</p>
                  <p className="text-2xl font-bold">{stats.availableBeds}</p>
                </div>
                <Activity className="h-8 w-8 text-teal-200" />
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
                    placeholder="Search by patient name, admission ID, doctor, phone, or room..."
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
                  <SelectItem value="admitted">Admitted</SelectItem>
                  <SelectItem value="discharged">Discharged</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Cardiology">Cardiology</SelectItem>
                  <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="ICU">ICU</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Admissions List */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Admissions ({filteredAdmissions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading admissions...</div>
            ) : filteredAdmissions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No admissions found</div>
            ) : (
              <div className="space-y-4">
                {filteredAdmissions.map((admission) => (
                  <div key={admission.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge className={getStatusColor(admission.status)}>
                            {admission.status.charAt(0).toUpperCase() + admission.status.slice(1)}
                          </Badge>
                          <Badge variant="outline" className={getTypeColor(admission.admissionType)}>
                            {admission.admissionType.charAt(0).toUpperCase() + admission.admissionType.slice(1)}
                          </Badge>
                          <span className="text-sm text-gray-500">#{admission.admissionId}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="font-semibold text-gray-900">{admission.patientName}</p>
                            <p className="text-sm text-gray-600">{admission.patientAge}Y, {admission.patientGender}</p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {admission.patientPhone}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600">{admission.doctorName}</p>
                            <p className="text-sm text-gray-500">{admission.department}</p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Bed className="h-3 w-3 mr-1" />
                              Room {admission.roomNumber}, Bed {admission.bedNumber}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600 flex items-center">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {format(new Date(admission.admissionDate), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {admission.admissionTime}
                            </p>
                            {admission.expectedDischargeDate && (
                              <p className="text-sm text-gray-500">
                                Expected: {format(new Date(admission.expectedDischargeDate), 'MMM dd')}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-700">Diagnosis:</p>
                            <p className="text-sm text-gray-600 truncate">{admission.diagnosis}</p>
                            {admission.insurance && (
                              <p className="text-sm text-gray-500">Insurance: {admission.insurance}</p>
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
                            setSelectedAdmission(admission)
                            setShowViewDialog(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {admission.status === 'admitted' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedAdmission(admission)
                              setShowDischargeDialog(true)
                            }}
                            className="bg-purple-500 hover:bg-purple-600"
                          >
                            Discharge
                          </Button>
                        )}
                        
                        {(admission.status === 'admitted' || admission.status === 'discharged') && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedAdmission(admission)
                              setShowBillingDialog(true)
                            }}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Create Bill
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Discharge Dialog */}
      <Dialog open={showDischargeDialog} onOpenChange={setShowDischargeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Discharge Patient</DialogTitle>
            <DialogDescription>
              Complete the discharge process for {selectedAdmission?.patientName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="dischargeDate">Discharge Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dischargeForm.dischargeDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dischargeForm.dischargeDate}
                    onSelect={(date) => date && setDischargeForm({...dischargeForm, dischargeDate: date})}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="dischargeTime">Discharge Time</Label>
              <Input
                type="time"
                value={dischargeForm.dischargeTime}
                onChange={(e) => setDischargeForm({...dischargeForm, dischargeTime: e.target.value})}
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="dischargeSummary">Discharge Summary</Label>
              <Textarea
                placeholder="Summary of treatment and patient condition..."
                value={dischargeForm.dischargeSummary}
                onChange={(e) => setDischargeForm({...dischargeForm, dischargeSummary: e.target.value})}
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="followUpInstructions">Follow-up Instructions</Label>
              <Textarea
                placeholder="Instructions for patient care after discharge..."
                value={dischargeForm.followUpInstructions}
                onChange={(e) => setDischargeForm({...dischargeForm, followUpInstructions: e.target.value})}
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="medications">Prescribed Medications</Label>
              <Textarea
                placeholder="List of medications prescribed at discharge..."
                value={dischargeForm.medications}
                onChange={(e) => setDischargeForm({...dischargeForm, medications: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDischargeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDischarge} className="bg-purple-500 hover:bg-purple-600">
              Complete Discharge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Billing Dialog */}
      <Dialog open={showBillingDialog} onOpenChange={setShowBillingDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Admission Bill</DialogTitle>
            <DialogDescription>
              Generate comprehensive bill for {selectedAdmission?.patientName}'s admission
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="roomCharges">Room Charges (₹)</Label>
              <Input
                type="number"
                placeholder="0"
                value={billingForm.roomCharges}
                onChange={(e) => setBillingForm({...billingForm, roomCharges: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="doctorFee">Doctor Fee (₹)</Label>
              <Input
                type="number"
                placeholder="0"
                value={billingForm.doctorFee}
                onChange={(e) => setBillingForm({...billingForm, doctorFee: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="nursingCharges">Nursing Charges (₹)</Label>
              <Input
                type="number"
                placeholder="0"
                value={billingForm.nursingCharges}
                onChange={(e) => setBillingForm({...billingForm, nursingCharges: e.target.value})}
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
              <Label htmlFor="procedureFee">Procedure Fee (₹)</Label>
              <Input
                type="number"
                placeholder="0"
                value={billingForm.procedureFee}
                onChange={(e) => setBillingForm({...billingForm, procedureFee: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="equipmentCharges">Equipment Charges (₹)</Label>
              <Input
                type="number"
                placeholder="0"
                value={billingForm.equipmentCharges}
                onChange={(e) => setBillingForm({...billingForm, equipmentCharges: e.target.value})}
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
            
            <div className="col-span-2">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-6 w-6 text-green-600" />
                    <Label className="text-lg font-semibold text-green-800">Total Amount</Label>
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    ₹{calculateTotal().toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="notes">Billing Notes</Label>
              <Textarea
                placeholder="Additional billing notes, insurance details, etc..."
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
