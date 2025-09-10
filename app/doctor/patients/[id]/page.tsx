"use client"

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  FileText,
  Clock,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Ruler
} from 'lucide-react'
import Link from 'next/link'

interface Patient {
  id: number
  name: string
  email: string
  phone: string
  age: number
  gender: string
  address: string
  dateOfBirth: string
  bloodGroup: string
  emergencyContact: string
  medicalHistory?: string
}

interface Appointment {
  id: number
  appointmentDate: string
  reason: string
  status: string
  diagnosis?: string
  prescription?: string
  notes?: string
}

interface VitalSigns {
  bloodPressure: string
  heartRate: number
  temperature: number
  weight: number
  height: number
  respiratoryRate: number
  oxygenSaturation: number
}

export default function PatientDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const patientId = params.id
  const appointmentId = searchParams.get('appointmentId')

  const [patient, setPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null)
  const [vitals, setVitals] = useState<VitalSigns | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (patientId) {
      fetchPatientData()
      fetchAppointments()
      if (appointmentId) {
        fetchAppointmentDetails()
      } else {
        setLoading(false)
      }
    }
  }, [patientId, appointmentId])

  const fetchPatientData = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}`)
      if (response.ok) {
        const data = await response.json()
        setPatient(data)
      }
    } catch (error) {
      console.error('Error fetching patient data:', error)
    } finally {
      // Set loading to false if no appointment ID to fetch
      if (!appointmentId) {
        setLoading(false)
      }
    }
  }

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}/appointments`)
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }

  const fetchAppointmentDetails = async () => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`)
      if (response.ok) {
        const data = await response.json()
        setCurrentAppointment(data)
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
      case 'scheduled':
        return <Badge className="bg-purple-100 text-purple-700">Scheduled</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <p>Loading patient details...</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <p>Patient not found.</p>
              <Link href="/doctor">
                <Button className="mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/doctor">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {patient.name}
              </h1>
              <p className="text-gray-600">Patient ID: {patient.id}</p>
            </div>
          </div>
          {currentAppointment && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Current Appointment</p>
              <p className="font-semibold">{new Date(currentAppointment.appointmentDate).toLocaleString()}</p>
              {getStatusBadge(currentAppointment.status)}
            </div>
          )}
        </div>

        {/* Patient Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-pink-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-pink-100 p-3 rounded-full">
                  <User className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Age & Gender</p>
                  <p className="font-semibold">{patient.age} years, {patient.gender}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-pink-100 p-3 rounded-full">
                  <Phone className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact</p>
                  <p className="font-semibold">{patient.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-pink-100 p-3 rounded-full">
                  <Activity className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Blood Group</p>
                  <p className="font-semibold">{patient.bloodGroup || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
            <TabsTrigger value="history">Medical History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-pink-100">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-pink-500" />
                    <span>{patient.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-pink-500" />
                    <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-pink-500" />
                    <span>{patient.address}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-pink-500" />
                    <span>Emergency: {patient.emergencyContact}</span>
                  </div>
                </CardContent>
              </Card>

              {currentAppointment && (
                <Card className="border-pink-100">
                  <CardHeader>
                    <CardTitle>Current Appointment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      {getStatusBadge(currentAppointment.status)}
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Reason:</span>
                      <p className="mt-1">{currentAppointment.reason}</p>
                    </div>
                    {currentAppointment.diagnosis && (
                      <div>
                        <span className="text-sm text-gray-600">Diagnosis:</span>
                        <p className="mt-1">{currentAppointment.diagnosis}</p>
                      </div>
                    )}
                    {currentAppointment.notes && (
                      <div>
                        <span className="text-sm text-gray-600">Notes:</span>
                        <p className="mt-1">{currentAppointment.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle>Appointment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.length > 0 ? (
                    appointments.map((appointment) => (
                      <div key={appointment.id} className="p-4 border border-pink-100 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Clock className="h-4 w-4 text-pink-500" />
                            <span className="font-medium">
                              {new Date(appointment.appointmentDate).toLocaleString()}
                            </span>
                          </div>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <p className="text-gray-700 mb-2">{appointment.reason}</p>
                        {appointment.diagnosis && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Diagnosis:</span> {appointment.diagnosis}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No appointments found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vitals" className="space-y-6">
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle>Latest Vital Signs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-pink-50 rounded-lg">
                    <Heart className="h-6 w-6 text-pink-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Blood Pressure</p>
                    <p className="font-semibold">120/80 mmHg</p>
                  </div>
                  <div className="text-center p-4 bg-pink-50 rounded-lg">
                    <Activity className="h-6 w-6 text-pink-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Heart Rate</p>
                    <p className="font-semibold">72 bpm</p>
                  </div>
                  <div className="text-center p-4 bg-pink-50 rounded-lg">
                    <Thermometer className="h-6 w-6 text-pink-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Temperature</p>
                    <p className="font-semibold">98.6°F</p>
                  </div>
                  <div className="text-center p-4 bg-pink-50 rounded-lg">
                    <Weight className="h-6 w-6 text-pink-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Weight</p>
                    <p className="font-semibold">70 kg</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle>Medical History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patient.medicalHistory ? (
                    <p className="text-gray-700">{patient.medicalHistory}</p>
                  ) : (
                    <p className="text-gray-500">No medical history available.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
