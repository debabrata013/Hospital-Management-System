"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  Search, 
  Eye, 
  CheckCircle, 
  ArrowLeft,
  Stethoscope,
  UserCheck,
  ArrowUp,
  RefreshCw,
  Phone,
  Edit,
  XCircle,
  AlertCircle,
  Timer,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

interface QueuePatient {
  id: number
  appointment_id: string
  patient_id: string
  name: string
  appointment_time: string
  appointment_date: string
  doctor_name: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'no-show' | 'cancelled'
  phone: string
  age: number
  gender: string
  appointment_type: string
  waiting_time: number
  notes?: string
  patient_code: string
}

interface Doctor {
  id: number
  name: string
  status: 'available' | 'busy'
  active_consultations: number
  pending_appointments: number
}

interface QueueStats {
  total: number
  waiting: number
  inConsultation: number
  completed: number
}

export default function PatientQueue() {
  const [queueData, setQueueData] = useState<QueuePatient[]>([])
  const [filteredQueue, setFilteredQueue] = useState<QueuePatient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [stats, setStats] = useState<QueueStats>({ total: 0, waiting: 0, inConsultation: 0, completed: 0 })
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [doctorFilter, setDoctorFilter] = useState("all")
  const [selectedPatient, setSelectedPatient] = useState<QueuePatient | null>(null)
  const [showPatientDialog, setShowPatientDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Status update form
  const [statusForm, setStatusForm] = useState({
    status: '',
    notes: ''
  })

  // Fetch queue data
  const fetchQueueData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/receptionist/queue')
      if (response.ok) {
        const data = await response.json()
        setQueueData(data.queue || [])
        setDoctors(data.doctors || [])
        setStats(data.stats || { total: 0, waiting: 0, inConsultation: 0, completed: 0 })
      }
    } catch (error) {
      console.error('Failed to fetch queue data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Update patient status
  const updatePatientStatus = async (appointmentId: string, status: string, notes?: string) => {
    try {
      setIsUpdating(true)
      const response = await fetch('/api/receptionist/queue', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, status, notes })
      })
      
      if (response.ok) {
        await fetchQueueData() // Refresh data
        alert('Status updated successfully!')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Failed to update patient status:', error)
      alert('Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle status update with notes
  const handleStatusUpdate = async () => {
    if (!selectedPatient) return
    
    await updatePatientStatus(selectedPatient.appointment_id, statusForm.status, statusForm.notes)
    setShowStatusDialog(false)
    setStatusForm({ status: '', notes: '' })
    setSelectedPatient(null)
  }

  // Initial data fetch
  useEffect(() => {
    fetchQueueData()
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchQueueData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Filter queue data
  useEffect(() => {
    let filtered = queueData

    if (searchQuery) {
      filtered = filtered.filter(patient => 
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.patient_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.phone.includes(searchQuery)
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(patient => patient.status === statusFilter)
    }

    if (doctorFilter !== "all") {
      filtered = filtered.filter(patient => patient.doctor_name.includes(doctorFilter))
    }

    // Sort by priority: emergency first, then by appointment time
    filtered.sort((a, b) => {
      if (a.appointment_type === 'emergency' && b.appointment_type !== 'emergency') return -1
      if (b.appointment_type === 'emergency' && a.appointment_type !== 'emergency') return 1
      if (a.status === 'in-progress' && b.status !== 'in-progress') return -1
      if (b.status === 'in-progress' && a.status !== 'in-progress') return 1
      return (a.appointment_time || '').localeCompare(b.appointment_time || '')
    })

    setFilteredQueue(filtered)
  }, [queueData, searchQuery, statusFilter, doctorFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'no-show': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Waiting'
      case 'in-progress': return 'In Consultation'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      case 'no-show': return 'No Show'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-3 w-3" />
      case 'in-progress': return <Stethoscope className="h-3 w-3" />
      case 'completed': return <CheckCircle className="h-3 w-3" />
      case 'cancelled': return <XCircle className="h-3 w-3" />
      case 'no-show': return <AlertCircle className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  const getPriorityIcon = (appointmentType: string) => {
    switch (appointmentType) {
      case 'emergency': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'walk-in': return <ArrowUp className="h-4 w-4 text-orange-500" />
      case 'consultation': return <Stethoscope className="h-4 w-4 text-pink-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getWaitingTime = (appointmentTime: string) => {
    if (!appointmentTime) return 0
    const now = new Date()
    const scheduled = new Date(`${now.toDateString()} ${appointmentTime}`)
    const diffMs = now.getTime() - scheduled.getTime()
    return Math.max(0, Math.floor(diffMs / (1000 * 60)))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      {/* Header */}
      <div className="bg-white border-b border-pink-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/receptionist">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Queue</h1>
              <p className="text-sm text-gray-600">
                Manage today's patient appointments and consultations • Last updated: {currentTime.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <Button onClick={fetchQueueData} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Queue Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm">Total Patients</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-pink-200">Today's queue</p>
                </div>
                <Users className="h-8 w-8 text-pink-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Waiting</p>
                  <p className="text-2xl font-bold">{stats.waiting}</p>
                  <p className="text-xs text-blue-200">Ready for consultation</p>
                </div>
                <Clock className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">In Consultation</p>
                  <p className="text-2xl font-bold">{stats.inConsultation}</p>
                  <p className="text-xs text-yellow-200">Currently with doctor</p>
                </div>
                <Stethoscope className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-xs text-green-200">Consultation done</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label>Search Patient</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name, patient ID, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label>Status Filter</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Waiting</SelectItem>
                    <SelectItem value="in-progress">In Consultation</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no-show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Doctor Filter</Label>
                <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Doctors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    {doctors.map(doctor => (
                      <SelectItem key={doctor.id} value={doctor.name}>
                        Dr. {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Queue */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Today's Queue ({filteredQueue.length} patients)</span>
              </CardTitle>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-pink-500" />
                <p>Loading queue...</p>
              </div>
            ) : filteredQueue.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No patients in queue matching your criteria</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQueue.map((patient, index) => (
                  <div key={patient.id} className={`border rounded-lg p-4 transition-all duration-200 ${
                    patient.appointment_type === 'emergency' ? 'border-red-200 bg-red-50' :
                    patient.status === 'in-progress' ? 'border-yellow-200 bg-yellow-50' :
                    'bg-white hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Queue Position */}
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            patient.appointment_type === 'emergency' ? 'bg-red-100 text-red-700' :
                            patient.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-pink-100 text-pink-700'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="text-xs text-gray-500 mt-1">Queue</span>
                        </div>

                        {/* Patient Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="flex items-center space-x-2">
                              {getPriorityIcon(patient.appointment_type)}
                              <Badge className={`${getStatusColor(patient.status)} flex items-center space-x-1`}>
                                {getStatusIcon(patient.status)}
                                <span>{getStatusText(patient.status)}</span>
                              </Badge>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              #{patient.patient_code}
                            </Badge>
                            {patient.appointment_type === 'emergency' && (
                              <Badge className="bg-red-100 text-red-700 text-xs">EMERGENCY</Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="font-semibold text-gray-900">{patient.name}</p>
                              <p className="text-sm text-gray-600">{patient.age}Y • {patient.gender}</p>
                              <p className="text-sm text-gray-600 flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {patient.phone}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-600">
                                <strong>Doctor:</strong> {patient.doctor_name || 'Not assigned'}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Time:</strong> {patient.appointment_time || 'Walk-in'}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Type:</strong> {patient.appointment_type}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-600 flex items-center">
                                <Timer className="h-3 w-3 mr-1" />
                                Waiting: {getWaitingTime(patient.appointment_time)} min
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>ID:</strong> {patient.appointment_id}
                              </p>
                            </div>
                          </div>

                          {patient.notes && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                              <strong>Notes:</strong> {patient.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPatient(patient)
                            setShowPatientDialog(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPatient(patient)
                            setStatusForm({ status: patient.status, notes: patient.notes || '' })
                            setShowStatusDialog(true)
                          }}
                          disabled={isUpdating}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Update Status
                        </Button>
                        
                        {/* Quick Action Buttons */}
                        {patient.status === 'scheduled' && (
                          <Button
                            size="sm"
                            onClick={() => updatePatientStatus(patient.appointment_id, 'in-progress')}
                            className="bg-yellow-500 hover:bg-yellow-600"
                            disabled={isUpdating}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                        
                        {patient.status === 'in-progress' && (
                          <Button
                            size="sm"
                            onClick={() => updatePatientStatus(patient.appointment_id, 'completed')}
                            className="bg-green-500 hover:bg-green-600"
                            disabled={isUpdating}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
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

      {/* Patient Details Dialog */}
      <Dialog open={showPatientDialog} onOpenChange={setShowPatientDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedPatient?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="grid grid-cols-2 gap-6 py-4">
              <div>
                <h4 className="font-semibold mb-3 text-pink-700">Personal Information</h4>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {selectedPatient.name}</p>
                  <p><strong>Patient ID:</strong> {selectedPatient.patient_code}</p>
                  <p><strong>Age:</strong> {selectedPatient.age} years</p>
                  <p><strong>Gender:</strong> {selectedPatient.gender}</p>
                  <p><strong>Phone:</strong> {selectedPatient.phone}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-pink-700">Appointment Details</h4>
                <div className="space-y-2">
                  <p><strong>Appointment ID:</strong> {selectedPatient.appointment_id}</p>
                  <p><strong>Doctor:</strong> {selectedPatient.doctor_name}</p>
                  <p><strong>Scheduled Time:</strong> {selectedPatient.appointment_time || 'Walk-in'}</p>
                  <p><strong>Type:</strong> {selectedPatient.appointment_type}</p>
                  <p><strong>Status:</strong> 
                    <Badge className={`ml-2 ${getStatusColor(selectedPatient.status)}`}>
                      {getStatusText(selectedPatient.status)}
                    </Badge>
                  </p>
                  <p><strong>Waiting Time:</strong> {getWaitingTime(selectedPatient.appointment_time)} minutes</p>
                </div>
              </div>
              
              {selectedPatient.notes && (
                <div className="col-span-2">
                  <h4 className="font-semibold mb-2 text-pink-700">Notes</h4>
                  <div className="p-3 bg-gray-50 rounded text-sm text-gray-600">
                    {selectedPatient.notes}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPatientDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Patient Status</DialogTitle>
            <DialogDescription>
              Update status for {selectedPatient?.name}'s appointment
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Status</Label>
              <Select value={statusForm.status} onValueChange={(value) => 
                setStatusForm(prev => ({ ...prev, status: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Waiting</SelectItem>
                  <SelectItem value="in-progress">In Consultation</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes about the status change..."
                value={statusForm.notes}
                onChange={(e) => setStatusForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleStatusUpdate}
              disabled={!statusForm.status || isUpdating}
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
