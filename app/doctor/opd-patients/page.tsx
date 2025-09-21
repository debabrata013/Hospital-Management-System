"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { 
  Stethoscope, 
  Search, 
  Filter,
  Eye,
  FileText,
  User,
  Phone,
  Calendar,
  Clock,
  Activity,
  RefreshCw,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Heart,
  Pill,
  ArrowLeft
} from 'lucide-react'

interface OPDPatient {
  id: number
  appointmentId: string
  appointmentDate: string
  appointmentTime: string
  reason: string
  status: string
  appointmentType: string
  consultationFee: number
  createdAt: string
  createdBy: {
    name: string
    role: string
  }
  Patient: {
    id: number
    firstName: string
    lastName: string
    contactNumber: string
    age: number
    gender: string
  }
}

interface OPDStats {
  totalToday: number
  completed: number
  pending: number
  inProgress: number
}

export default function OPDPatientsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [patients, setPatients] = useState<OPDPatient[]>([])
  const [stats, setStats] = useState<OPDStats>({
    totalToday: 0,
    completed: 0,
    pending: 0,
    inProgress: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedPatient, setSelectedPatient] = useState<OPDPatient | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isVitalsDialogOpen, setIsVitalsDialogOpen] = useState(false)
  const [isPrescriptionDialogOpen, setIsPrescriptionDialogOpen] = useState(false)
  const [patientVitals, setPatientVitals] = useState<any[]>([])
  const [prescriptionForm, setPrescriptionForm] = useState({
    vitals: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: ''
    },
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    remarks: ''
  })
  const [savingPrescription, setSavingPrescription] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchOPDPatients()
  }, [selectedDate, statusFilter])

  const fetchOPDPatients = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        date: selectedDate,
        ...(statusFilter !== 'all' && { status: statusFilter })
      })
      
      const response = await fetch(`/api/doctor/opd-patients?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPatients(data || [])
        
        // Calculate stats for the selected date
        setStats({
          totalToday: data.length,
          completed: data.filter((p: OPDPatient) => p.status === 'completed').length,
          pending: data.filter((p: OPDPatient) => p.status === 'scheduled').length,
          inProgress: data.filter((p: OPDPatient) => p.status === 'in-progress').length
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch OPD patients",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching OPD patients:', error)
      toast({
        title: "Error",
        description: "Failed to fetch OPD patients",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/receptionist/appointments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId,
          status: newStatus
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Appointment status updated to ${newStatus}`,
        })
        fetchOPDPatients() // Refresh the list
      } else {
        toast({
          title: "Error",
          description: "Failed to update appointment status",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating appointment status:', error)
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive"
      })
    }
  }

  const handleViewPatient = (patient: OPDPatient) => {
    setSelectedPatient(patient)
    setIsDetailsDialogOpen(true)
  }

  const handleViewVitals = async (patient: OPDPatient) => {
    try {
      setSelectedPatient(patient)
      const response = await fetch(`/api/doctor/vitals?patientId=${patient.Patient.id}`)
      if (response.ok) {
        const data = await response.json()
        setPatientVitals(data.vitals || [])
      } else {
        setPatientVitals([])
        toast({
          title: "Info",
          description: "No vitals found for this patient",
        })
      }
      setIsVitalsDialogOpen(true)
    } catch (error) {
      console.error('Error fetching vitals:', error)
      toast({
        title: "Error",
        description: "Failed to fetch patient vitals",
        variant: "destructive"
      })
    }
  }

  const handleCreatePrescription = (patient: OPDPatient) => {
    setSelectedPatient(patient)
    // Reset form when opening
    setPrescriptionForm({
      vitals: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        weight: '',
        height: ''
      },
      medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
      remarks: ''
    })
    setIsPrescriptionDialogOpen(true)
  }

  const addMedicine = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }))
  }

  const removeMedicine = (index: number) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }))
  }

  const updateMedicine = (index: number, field: string, value: string) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: prev.medicines.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }))
  }

  const updateVitals = (field: string, value: string) => {
    setPrescriptionForm(prev => ({
      ...prev,
      vitals: { ...prev.vitals, [field]: value }
    }))
  }

  const savePrescription = async () => {
    if (!selectedPatient) return

    try {
      setSavingPrescription(true)
      
      // Validate required fields
      const validMedicines = prescriptionForm.medicines.filter(med => med.name.trim())
      if (validMedicines.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one medicine",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('/api/doctor/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: selectedPatient.appointmentId,
          patientId: selectedPatient.Patient.id,
          vitals: prescriptionForm.vitals,
          medicines: validMedicines,
          remarks: prescriptionForm.remarks
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description: `Prescription created successfully (ID: ${data.prescriptionId})`,
        })
        setIsPrescriptionDialogOpen(false)
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to create prescription",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving prescription:', error)
      toast({
        title: "Error",
        description: "Failed to save prescription",
        variant: "destructive"
      })
    } finally {
      setSavingPrescription(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-700"><Activity className="h-3 w-3 mr-1" />In Progress</Badge>
      case 'scheduled':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      case 'no-show':
        return <Badge className="bg-gray-100 text-gray-700"><AlertCircle className="h-3 w-3 mr-1" />No Show</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getStatusActions = (patient: OPDPatient) => {
    switch (patient.status) {
      case 'scheduled':
        return (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => updateAppointmentStatus(patient.appointmentId, 'in-progress')}
            >
              Start Consultation
            </Button>
          </div>
        )
      case 'in-progress':
        return (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => updateAppointmentStatus(patient.appointmentId, 'completed')}
            >
              Mark Complete
            </Button>
          </div>
        )
      case 'completed':
        return (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => router.push(`/doctor/patients/${patient.Patient.id}`)}
          >
            View Records
          </Button>
        )
      default:
        return null
    }
  }

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      `${patient.Patient.firstName} ${patient.Patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.Patient.contactNumber.includes(searchTerm) ||
      patient.appointmentId.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/doctor"
          className="inline-flex items-center text-gray-600 hover:text-pink-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Stethoscope className="h-8 w-8 mr-3 text-pink-500" />
              OPD Patients
            </h1>
            <p className="text-gray-600 mt-2">Manage your outpatient department appointments and consultations</p>
          </div>
          <Button onClick={() => fetchOPDPatients()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalToday}</p>
              </div>
              <Users className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-pink-100 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search by patient name, phone, or appointment ID..." 
                  className="pl-10 border-pink-200 focus:border-pink-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-48 border-pink-200"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 border-pink-200">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>OPD Appointments</span>
            <span className="text-sm text-gray-500">
              {filteredPatients.length} appointments for {new Date(selectedDate).toLocaleDateString()}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-6 animate-pulse">
                  <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No OPD appointments found for the selected date and filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="p-6 border border-pink-100 rounded-lg hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-gradient-to-r from-pink-400 to-pink-500 text-white text-lg font-bold">
                          {patient.Patient.firstName?.charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="font-bold text-xl text-gray-900">
                            {`${patient.Patient.firstName} ${patient.Patient.lastName}`.trim() || 'Unknown Patient'}
                          </h3>
                          <Badge variant="outline">{patient.appointmentId}</Badge>
                          {getStatusBadge(patient.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <User className="h-4 w-4" />
                            <span>{patient.Patient.age} years • {patient.Patient.gender}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{patient.Patient.contactNumber}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(`2000-01-01T${patient.appointmentTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(patient.appointmentDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-blue-50 rounded-lg mb-3">
                          <h4 className="font-semibold text-blue-900 text-sm mb-1">Reason for Visit</h4>
                          <p className="text-sm text-blue-700">{patient.reason || 'General Consultation'}</p>
                          {patient.appointmentType && (
                            <p className="text-xs text-blue-600 mt-1">Type: {patient.appointmentType}</p>
                          )}
                        </div>

                        {patient.createdBy?.name && (
                          <div className="text-xs text-gray-500">
                            Scheduled by {patient.createdBy.name} ({patient.createdBy.role})
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          onClick={() => handleViewVitals(patient)}
                          title="View Patient Vitals"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-green-200 text-green-600 hover:bg-green-50"
                          onClick={() => handleCreatePrescription(patient)}
                          title="Create Prescription"
                        >
                          <Pill className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-pink-200 text-pink-600 hover:bg-pink-50"
                          onClick={() => handleViewPatient(patient)}
                          title="View Patient Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-pink-200 text-pink-600 hover:bg-pink-50"
                          onClick={() => router.push(`/doctor/patients/${patient.Patient.id}`)}
                          title="View Patient Records"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                      {getStatusActions(patient)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-to-r from-pink-400 to-pink-500 text-white">
                  {selectedPatient?.Patient.firstName?.charAt(0) || 'P'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">
                  {selectedPatient ? `${selectedPatient.Patient.firstName} ${selectedPatient.Patient.lastName}`.trim() : 'Unknown Patient'}
                </h2>
                <p className="text-sm text-gray-500">Appointment ID: {selectedPatient?.appointmentId}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Age:</span>
                      <span>{selectedPatient.Patient.age} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Gender:</span>
                      <span>{selectedPatient.Patient.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Contact:</span>
                      <span>{selectedPatient.Patient.contactNumber}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Appointment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Date:</span>
                      <span>{new Date(selectedPatient.appointmentDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Time:</span>
                      <span>{new Date(`2000-01-01T${selectedPatient.appointmentTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      {getStatusBadge(selectedPatient.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Type:</span>
                      <span className="capitalize">{selectedPatient.appointmentType || 'consultation'}</span>
                    </div>
                    {selectedPatient.consultationFee && (
                      <div className="flex justify-between">
                        <span className="font-medium">Fee:</span>
                        <span>₹{selectedPatient.consultationFee}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Reason for Visit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{selectedPatient.reason || 'General Consultation'}</p>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => router.push(`/doctor/patients/${selectedPatient.Patient.id}`)}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Full Records
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Vitals Dialog */}
      <Dialog open={isVitalsDialogOpen} onOpenChange={setIsVitalsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Heart className="h-6 w-6 text-red-500" />
              <div>
                <h2 className="text-xl font-bold">Patient Vitals</h2>
                <p className="text-sm text-gray-500">
                  {selectedPatient ? `${selectedPatient.Patient.firstName} ${selectedPatient.Patient.lastName}`.trim() : 'Unknown Patient'}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-6">
              {patientVitals.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No vitals recorded for this patient</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {patientVitals.map((vital, index) => (
                    <Card key={index} className="border-blue-100">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span>Vitals Record #{patientVitals.length - index}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(vital.recorded_at).toLocaleDateString()} at {new Date(vital.recorded_at).toLocaleTimeString()}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {vital.blood_pressure && (
                            <div className="p-3 bg-red-50 rounded-lg">
                              <p className="text-sm font-medium text-red-700">Blood Pressure</p>
                              <p className="text-lg font-bold text-red-800">{vital.blood_pressure}</p>
                            </div>
                          )}
                          {vital.heart_rate && (
                            <div className="p-3 bg-pink-50 rounded-lg">
                              <p className="text-sm font-medium text-pink-700">Heart Rate</p>
                              <p className="text-lg font-bold text-pink-800">{vital.heart_rate} bpm</p>
                            </div>
                          )}
                          {vital.temperature && (
                            <div className="p-3 bg-orange-50 rounded-lg">
                              <p className="text-sm font-medium text-orange-700">Temperature</p>
                              <p className="text-lg font-bold text-orange-800">{vital.temperature}°F</p>
                            </div>
                          )}
                          {vital.respiratory_rate && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm font-medium text-blue-700">Respiratory Rate</p>
                              <p className="text-lg font-bold text-blue-800">{vital.respiratory_rate} /min</p>
                            </div>
                          )}
                          {vital.oxygen_saturation && (
                            <div className="p-3 bg-green-50 rounded-lg">
                              <p className="text-sm font-medium text-green-700">Oxygen Saturation</p>
                              <p className="text-lg font-bold text-green-800">{vital.oxygen_saturation}%</p>
                            </div>
                          )}
                          {vital.weight && (
                            <div className="p-3 bg-purple-50 rounded-lg">
                              <p className="text-sm font-medium text-purple-700">Weight</p>
                              <p className="text-lg font-bold text-purple-800">{vital.weight} kg</p>
                            </div>
                          )}
                          {vital.height && (
                            <div className="p-3 bg-indigo-50 rounded-lg">
                              <p className="text-sm font-medium text-indigo-700">Height</p>
                              <p className="text-lg font-bold text-indigo-800">{vital.height} cm</p>
                            </div>
                          )}
                          {vital.bmi && (
                            <div className="p-3 bg-yellow-50 rounded-lg">
                              <p className="text-sm font-medium text-yellow-700">BMI</p>
                              <p className="text-lg font-bold text-yellow-800">{vital.bmi}</p>
                            </div>
                          )}
                        </div>
                        {vital.notes && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                            <p className="text-gray-600">{vital.notes}</p>
                          </div>
                        )}
                        <div className="mt-3 text-xs text-gray-500">
                          Recorded by: {vital.recorded_by || vital.recorded_by_name || 'Staff'}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsVitalsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Prescription Dialog */}
      <Dialog open={isPrescriptionDialogOpen} onOpenChange={setIsPrescriptionDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Pill className="h-6 w-6 text-green-500" />
              <div>
                <h2 className="text-xl font-bold">Create Prescription</h2>
                <p className="text-sm text-gray-500">
                  {selectedPatient ? `${selectedPatient.Patient.firstName} ${selectedPatient.Patient.lastName}`.trim() : 'Unknown Patient'}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-6">
              {/* Patient Info */}
              <Card className="border-green-100">
                <CardHeader>
                  <CardTitle className="text-lg">Patient Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Age</p>
                      <p className="text-lg">{selectedPatient.Patient.age} years</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Gender</p>
                      <p className="text-lg">{selectedPatient.Patient.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Contact</p>
                      <p className="text-lg">{selectedPatient.Patient.contactNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Appointment ID</p>
                      <p className="text-lg">{selectedPatient.appointmentId}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vitals Section */}
              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-red-500" />
                    Vitals (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Blood Pressure</label>
                      <Input
                        placeholder="120/80"
                        value={prescriptionForm.vitals.bloodPressure}
                        onChange={(e) => updateVitals('bloodPressure', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Heart Rate</label>
                      <Input
                        placeholder="72 bpm"
                        value={prescriptionForm.vitals.heartRate}
                        onChange={(e) => updateVitals('heartRate', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Temperature</label>
                      <Input
                        placeholder="98.6°F"
                        value={prescriptionForm.vitals.temperature}
                        onChange={(e) => updateVitals('temperature', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Weight</label>
                      <Input
                        placeholder="70 kg"
                        value={prescriptionForm.vitals.weight}
                        onChange={(e) => updateVitals('weight', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Height</label>
                      <Input
                        placeholder="170 cm"
                        value={prescriptionForm.vitals.height}
                        onChange={(e) => updateVitals('height', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medicines Section */}
              <Card className="border-green-100">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="flex items-center">
                      <Pill className="h-5 w-5 mr-2 text-green-500" />
                      Medicines
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      onClick={addMedicine}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Medicine
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {prescriptionForm.medicines.map((medicine, index) => (
                      <div key={index} className="p-4 border border-green-100 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Medicine #{index + 1}</h4>
                          {prescriptionForm.medicines.length > 1 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => removeMedicine(index)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Medicine Name *</label>
                            <Input
                              placeholder="e.g., Paracetamol"
                              value={medicine.name}
                              onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                              className="mt-1"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Dosage</label>
                            <Input
                              placeholder="e.g., 500mg"
                              value={medicine.dosage}
                              onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Frequency</label>
                            <Input
                              placeholder="e.g., 3 times daily"
                              value={medicine.frequency}
                              onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Duration</label>
                            <Input
                              placeholder="e.g., 7 days"
                              value={medicine.duration}
                              onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Instructions</label>
                            <Input
                              placeholder="e.g., After meals"
                              value={medicine.instructions}
                              onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Remarks Section */}
              <Card className="border-gray-100">
                <CardHeader>
                  <CardTitle className="text-lg">Doctor's Remarks</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    placeholder="Additional notes, recommendations, or instructions for the patient..."
                    value={prescriptionForm.remarks}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, remarks: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    rows={4}
                  />
                </CardContent>
              </Card>
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsPrescriptionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={savePrescription}
                  disabled={savingPrescription}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {savingPrescription ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Pill className="h-4 w-4 mr-2" />
                      Save Prescription
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
