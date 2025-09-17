"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Calendar, 
  Clock, 
  Search, 
  Filter,
  Eye,
  User,
  Phone,
  MapPin,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  ArrowLeft
} from 'lucide-react'

// Mock schedule data
const todaySchedule = [
  {
    id: "APT001",
    time: "09:00 AM",
    duration: "30 min",
    patientName: "राजेश कुमार",
    patientId: "P001",
    age: 45,
    type: "Follow-up",
    condition: "Hypertension",
    status: "completed",
    room: "Room 101",
    phone: "+91 98765 43210",
    notes: "Regular BP monitoring"
  },
  {
    id: "APT002",
    time: "09:30 AM",
    duration: "45 min",
    patientName: "सुनीता देवी",
    patientId: "P002",
    age: 38,
    type: "Consultation",
    condition: "Chest Pain",
    status: "in_progress",
    room: "Room 101",
    phone: "+91 87654 32109",
    notes: "New patient - chest pain investigation"
  },
  {
    id: "APT003",
    time: "10:15 AM",
    duration: "30 min",
    patientName: "मोहम्मद अली",
    patientId: "P003",
    age: 62,
    type: "Check-up",
    condition: "Post-Surgery",
    status: "waiting",
    room: "Room 101",
    phone: "+91 76543 21098",
    notes: "Post-operative cardiac surgery follow-up"
  },
  {
    id: "APT004",
    time: "11:00 AM",
    duration: "30 min",
    patientName: "अनिता सिंह",
    patientId: "P004",
    age: 52,
    type: "Consultation",
    condition: "Arrhythmia",
    status: "scheduled",
    room: "Room 101",
    phone: "+91 65432 10987",
    notes: "Irregular heartbeat complaints"
  },
  {
    id: "APT005",
    time: "02:00 PM",
    duration: "60 min",
    patientName: "विकास शर्मा",
    patientId: "P005",
    age: 35,
    type: "Emergency",
    condition: "Acute Chest Pain",
    status: "urgent",
    room: "Emergency",
    phone: "+91 54321 09876",
    notes: "Emergency consultation - acute symptoms"
  },
  {
    id: "APT006",
    time: "03:00 PM",
    duration: "30 min",
    patientName: "प्रीति गुप्ता",
    patientId: "P006",
    age: 28,
    type: "Consultation",
    condition: "Palpitations",
    status: "scheduled",
    room: "Room 101",
    phone: "+91 43210 98765",
    notes: "Young patient with palpitation complaints"
  }
]

const weeklySchedule = [
  { day: "Monday", hours: "9:00 AM - 5:00 PM", patients: 12, status: "active" },
  { day: "Tuesday", hours: "9:00 AM - 5:00 PM", patients: 10, status: "active" },
  { day: "Wednesday", hours: "9:00 AM - 1:00 PM", patients: 6, status: "half_day" },
  { day: "Thursday", hours: "9:00 AM - 5:00 PM", patients: 14, status: "active" },
  { day: "Friday", hours: "9:00 AM - 5:00 PM", patients: 11, status: "active" },
  { day: "Saturday", hours: "9:00 AM - 1:00 PM", patients: 5, status: "half_day" },
  { day: "Sunday", hours: "Off", patients: 0, status: "off" }
]

export default function DoctorSchedulePage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    urgent: 0
  })

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/doctor/appointments')
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
        calculateStats(data)
      } else {
        console.error('Failed to fetch appointments')
        setAppointments(todaySchedule) // Fallback to mock data
        calculateStats(todaySchedule)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setAppointments(todaySchedule) // Fallback to mock data
      calculateStats(todaySchedule)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (appointmentData: any[]) => {
    const total = appointmentData.length
    const completed = appointmentData.filter(apt => apt.status === 'completed').length
    const pending = appointmentData.filter(apt => ['scheduled', 'waiting', 'in_progress'].includes(apt.status)).length
    const urgent = appointmentData.filter(apt => apt.status === 'urgent').length
    
    setStats({ total, completed, pending, urgent })
  }
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
      case 'waiting':
        return <Badge className="bg-yellow-100 text-yellow-700">Waiting</Badge>
      case 'scheduled':
        return <Badge className="bg-purple-100 text-purple-700">Scheduled</Badge>
      case 'urgent':
        return <Badge className="bg-red-100 text-red-700">Urgent</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Activity className="h-4 w-4 text-blue-500" />
      case 'waiting':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Emergency':
        return 'bg-red-100 text-red-700'
      case 'Consultation':
        return 'bg-blue-100 text-blue-700'
      case 'Follow-up':
        return 'bg-green-100 text-green-700'
      case 'Check-up':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getDayStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Full Day</Badge>
      case 'half_day':
        return <Badge className="bg-yellow-100 text-yellow-700">Half Day</Badge>
      case 'off':
        return <Badge className="bg-gray-100 text-gray-700">Off</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const handleViewPatient = async (appointment: any) => {
    try {
      // Fetch detailed patient information
      const response = await fetch(`/api/admin/patients/${appointment.Patient?.id}`)
      if (response.ok) {
        const patientData = await response.json()
        setSelectedPatient({
          ...appointment,
          Patient: patientData
        })
      } else {
        setSelectedPatient(appointment)
      }
    } catch (error) {
      console.error('Error fetching patient details:', error)
      setSelectedPatient(appointment)
    }
    setShowPatientModal(true)
  }

  const closePatientModal = () => {
    setShowPatientModal(false)
    setSelectedPatient(null)
  }

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-8 w-8 mr-3 text-pink-500" />
            My Schedule
          </h1>
          <p className="text-gray-600 mt-2">View and manage your appointments and schedule</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{loading ? '...' : stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{loading ? '...' : stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{loading ? '...' : stats.urgent}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
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
                  placeholder="Search appointments by patient name or condition..." 
                  className="pl-10 border-pink-200 focus:border-pink-400"
                />
              </div>
            </div>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Status
            </Button>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              <Calendar className="h-4 w-4 mr-2" />
              Today
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <Card className="border-pink-100 mb-6">
        <CardHeader>
          <CardTitle>Today's Appointments - {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p>Loading appointments...</p>
            ) : appointments.length > 0 ? (
              appointments.map((appointment) => (
                <div key={appointment.id} className="p-4 border border-pink-100 rounded-lg hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-lg h-16 w-16 flex items-center justify-center font-bold">
                      <Clock className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{appointment.Patient ? `${appointment.Patient.firstName} ${appointment.Patient.lastName}` : 'Unknown Patient'}</h3>
                        <Badge variant="outline">{appointment.Patient?.id || appointment.id}</Badge>
                        <Badge className={getTypeColor(appointment.type || 'Consultation')}>Consultation</Badge>
                        {getStatusBadge(appointment.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2 text-pink-500" />
                            <span className="font-medium">{appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                            <span className="ml-2 text-gray-500">(30 min)</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-2 text-pink-500" />
                            <span>{appointment.Patient?.age || 'N/A'} years • {appointment.reason || 'General consultation'}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 text-pink-500" />
                            <span>Room 101</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2 text-pink-500" />
                            <span>{appointment.Patient?.phone || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Notes:</span> {appointment.reason || 'No additional notes'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <div className="flex items-center mr-4">
                      {getStatusIcon(appointment.status)}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-pink-200 text-pink-600 hover:bg-pink-50"
                      onClick={() => handleViewPatient(appointment)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {appointment.status === 'waiting' && (
                      <Button variant="outline" size="sm" className="border-green-200 text-green-600 hover:bg-green-50">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              ))
            ) : (
              <p>No appointments scheduled for today.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule Overview */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle>Weekly Schedule Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklySchedule.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-pink-100 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{day.day}</h4>
                    <p className="text-sm text-gray-600">{day.hours}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{day.patients} patients</p>
                    {getDayStatusBadge(day.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-pink-100 mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Plus className="h-6 w-6" />
              <span>Request Time Off</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Calendar className="h-6 w-6" />
              <span>View Next Week</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Clock className="h-6 w-6" />
              <span>Reschedule</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <AlertCircle className="h-6 w-6" />
              <span>Emergency Slot</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-pink-100 text-pink-700 rounded-full">
          <Calendar className="h-5 w-5 mr-2" />
          <span className="font-medium">Advanced Scheduling Features Coming Soon</span>
        </div>
      </div>

      {/* Patient Details Modal */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Patient Details</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={closePatientModal}
                  className="border-gray-300"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>

              {/* Patient Information */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-gradient-to-r from-pink-50 to-white p-4 rounded-lg border border-pink-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Patient Name</p>
                      <p className="font-medium text-gray-900">
                        {selectedPatient.Patient ? `${selectedPatient.Patient.firstName} ${selectedPatient.Patient.lastName}` : 'Unknown Patient'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Patient ID</p>
                      <p className="font-medium text-gray-900">{selectedPatient.Patient?.id || selectedPatient.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Age</p>
                      <p className="font-medium text-gray-900">{selectedPatient.Patient?.age || 'N/A'} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-medium text-gray-900">{selectedPatient.Patient?.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact Number</p>
                      <p className="font-medium text-gray-900">{selectedPatient.Patient?.contactNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Appointment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Appointment ID</p>
                      <p className="font-medium text-gray-900">{selectedPatient.appointmentId || selectedPatient.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="font-medium text-gray-900">
                        {selectedPatient.appointmentDate ? new Date(selectedPatient.appointmentDate).toLocaleDateString() : 'N/A'} at{' '}
                        {selectedPatient.appointmentTime ? selectedPatient.appointmentTime : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-medium text-gray-900">{selectedPatient.appointmentType || 'Consultation'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <div className="mt-1">
                        {getStatusBadge(selectedPatient.status)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Consultation Fee</p>
                      <p className="font-medium text-gray-900">₹{selectedPatient.consultationFee || '500'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Room</p>
                      <p className="font-medium text-gray-900">Room 101</p>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Medical Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Chief Complaint / Reason for Visit</p>
                      <p className="font-medium text-gray-900">{selectedPatient.reason || 'General consultation'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Notes</p>
                      <p className="font-medium text-gray-900">{selectedPatient.notes || selectedPatient.reason || 'No additional notes'}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <Button variant="outline" onClick={closePatientModal}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
