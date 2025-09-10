"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  ArrowUp
} from 'lucide-react'
import Link from 'next/link'

interface QueuePatient {
  id: string
  appointment_id: string
  patient_id: string
  name: string
  appointment_time: string
  appointment_date: string
  doctor_name: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'no-show' | 'emergency'
  phone: string
  age: number
  gender: string
  appointment_type: 'scheduled' | 'walk-in' | 'emergency'
  waiting_time: number
  notes?: string
}

interface Doctor {
  id: string
  name: string
  status: 'available' | 'busy'
  active_consultations: number
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
  const [selectedPatient, setSelectedPatient] = useState<QueuePatient | null>(null)
  const [showPatientDialog, setShowPatientDialog] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)

  // Fetch queue data
  const fetchQueueData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/receptionist/queue')
      if (response.ok) {
        const data = await response.json()
        setQueueData(data.queue || [])
        setFilteredQueue(data.queue || [])
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
      const response = await fetch('/api/receptionist/queue', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, status, notes })
      })
      
      if (response.ok) {
        fetchQueueData() // Refresh data
      }
    } catch (error) {
      console.error('Failed to update patient status:', error)
    }
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
        patient.patient_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.phone.includes(searchQuery)
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(patient => patient.status === statusFilter)
    }

    setFilteredQueue(filtered)
  }, [queueData, searchQuery, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'in-progress': return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'no-show': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Waiting'
      case 'in-progress': return 'In Consultation'
      case 'emergency': return 'Emergency'
      case 'completed': return 'Completed'
      case 'no-show': return 'No Show'
      default: return status
    }
  }

  const getPriorityIcon = (appointmentType: string) => {
    switch (appointmentType) {
      case 'emergency': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'walk-in': return <ArrowUp className="h-4 w-4 text-orange-500" />
      case 'scheduled': return <Clock className="h-4 w-4 text-pink-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
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
              <p className="text-sm text-gray-600">Manage today's patient appointments and consultations</p>
            </div>
          </div>
         
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
                </div>
                <Users className="h-8 w-8 text-pink-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Waiting</p>
                  <p className="text-2xl font-bold">{stats.waiting}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">In Consultation</p>
                  <p className="text-2xl font-bold">{stats.inConsultation}</p>
                </div>
                <Stethoscope className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-200" />
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
                    placeholder="Search by name, patient ID, or phone..."
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
                  <SelectItem value="scheduled">Waiting</SelectItem>
                  <SelectItem value="in-progress">In Consultation</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Patient Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Today's Queue ({filteredQueue.length} patients)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading queue...</div>
            ) : filteredQueue.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No patients in queue</div>
            ) : (
              <div className="space-y-3">
                {filteredQueue.map((patient, index) => (
                  <div key={patient.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Queue Position */}
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-pink-100 text-pink-700 rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                        </div>

                        {/* Patient Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="flex items-center space-x-2">
                              {getPriorityIcon(patient.appointment_type)}
                              <Badge className={getStatusColor(patient.status)}>
                                {getStatusText(patient.status)}
                              </Badge>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {patient.appointment_id}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="font-semibold text-gray-900">{patient.name}</p>
                              <p className="text-xs text-gray-500">{patient.age} years, {patient.gender}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-600">Doctor: {patient.doctor_name || 'Not assigned'}</p>
                              <p className="text-sm text-gray-600">Time: {patient.appointment_time || 'Walk-in'}</p>
                              <p className="text-sm text-gray-600">Type: {patient.appointment_type}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-600">Phone: {patient.phone}</p>
                              <p className="text-sm text-gray-600">Waiting: {patient.waiting_time || 0} min</p>
                            </div>
                          </div>
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
                        
                        {patient.status === 'scheduled' && (
                          <Button
                            size="sm"
                            onClick={() => updatePatientStatus(patient.appointment_id, 'in-progress')}
                            className="bg-pink-500 hover:bg-pink-600"
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
              Complete information for the selected patient
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <h4 className="font-semibold mb-2">Personal Information</h4>
                <p><strong>Name:</strong> {selectedPatient.name}</p>
                <p><strong>Age:</strong> {selectedPatient.age} years</p>
                <p><strong>Gender:</strong> {selectedPatient.gender}</p>
                <p><strong>Phone:</strong> {selectedPatient.phone}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Appointment Details</h4>
                <p><strong>ID:</strong> {selectedPatient.appointment_id}</p>
                <p><strong>Doctor:</strong> {selectedPatient.doctor_name}</p>
                <p><strong>Time:</strong> {selectedPatient.appointment_time}</p>
                <p><strong>Status:</strong> {getStatusText(selectedPatient.status)}</p>
              </div>
              
              {selectedPatient.notes && (
                <div className="col-span-2">
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-gray-600">{selectedPatient.notes}</p>
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
    </div>
  )
}
