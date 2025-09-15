"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  Plus
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
    </div>
  )
}
