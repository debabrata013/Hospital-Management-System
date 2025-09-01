"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Search, 
  Filter,
  Eye,
  FileText,
  User,
  Phone,
  Mail,
  Calendar,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Zap
} from 'lucide-react'

// Mock patient data (fallback)
const mockPatients = [
  {
    id: "P001",
    name: "राजेश कुमार",
    age: 45,
    gender: "Male",
    phone: "+91 98765 43210",
    email: "rajesh.kumar@email.com",
    bloodGroup: "B+",
    condition: "Hypertension",
    status: "stable",
    lastVisit: "2024-01-09",
    nextAppointment: "2024-01-16",
    vitals: {
      bp: "140/90 mmHg",
      temp: "98.6°F",
      weight: "75 kg",
      pulse: "78 bpm"
    },
    medications: ["Amlodipine 5mg", "Metoprolol 25mg"],
    allergies: ["Penicillin"],
    admissionHistory: 2,
    totalVisits: 8
  },
  {
    id: "P002",
    name: "सुनीता देवी",
    age: 38,
    gender: "Female",
    phone: "+91 87654 32109",
    email: "sunita.devi@email.com",
    bloodGroup: "A+",
    condition: "Chest Pain Investigation",
    status: "under_observation",
    lastVisit: "2024-01-09",
    nextAppointment: "2024-01-12",
    vitals: {
      bp: "130/85 mmHg",
      temp: "99.1°F",
      weight: "62 kg",
      pulse: "85 bpm"
    },
    medications: ["Aspirin 75mg", "Atorvastatin 20mg"],
    allergies: ["None known"],
    admissionHistory: 0,
    totalVisits: 3
  },
  {
    id: "P003",
    name: "मोहम्मद अली",
    age: 62,
    gender: "Male",
    phone: "+91 76543 21098",
    email: "mohammed.ali@email.com",
    bloodGroup: "O-",
    condition: "Post-Cardiac Surgery",
    status: "improving",
    lastVisit: "2024-01-08",
    nextAppointment: "2024-01-15",
    vitals: {
      bp: "125/80 mmHg",
      temp: "98.4°F",
      weight: "68 kg",
      pulse: "72 bpm"
    },
    medications: ["Warfarin 5mg", "Carvedilol 12.5mg", "Furosemide 40mg"],
    allergies: ["Sulfa drugs"],
    admissionHistory: 3,
    totalVisits: 15
  },
  {
    id: "P004",
    name: "अनिता सिंह",
    age: 52,
    gender: "Female",
    phone: "+91 65432 10987",
    email: "anita.singh@email.com",
    bloodGroup: "AB+",
    condition: "Arrhythmia",
    status: "stable",
    lastVisit: "2024-01-07",
    nextAppointment: "2024-01-14",
    vitals: {
      bp: "135/88 mmHg",
      temp: "98.8°F",
      weight: "58 kg",
      pulse: "92 bpm (irregular)"
    },
    medications: ["Digoxin 0.25mg", "Amiodarone 200mg"],
    allergies: ["Iodine"],
    admissionHistory: 1,
    totalVisits: 6
  }
]

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/doctor/patients')
      if (response.ok) {
        const data = await response.json()
        setPatients(data)
      } else {
        console.error('Failed to fetch patients')
        setPatients(mockPatients) // Fallback to mock data
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      setPatients(mockPatients) // Fallback to mock data
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'stable':
        return <Badge className="bg-green-100 text-green-700">Stable</Badge>
      case 'under_observation':
        return <Badge className="bg-yellow-100 text-yellow-700">Under Observation</Badge>
      case 'improving':
        return <Badge className="bg-blue-100 text-blue-700">Improving</Badge>
      case 'critical':
        return <Badge className="bg-red-100 text-red-700">Critical</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getBloodGroupBadge = (bloodGroup: string) => {
    return <Badge className="bg-red-100 text-red-700 font-bold">{bloodGroup}</Badge>
  }

  const getVitalIcon = (vital: string) => {
    switch (vital) {
      case 'bp':
        return <Heart className="h-4 w-4 text-red-500" />
      case 'temp':
        return <Thermometer className="h-4 w-4 text-orange-500" />
      case 'weight':
        return <Weight className="h-4 w-4 text-blue-500" />
      case 'pulse':
        return <Zap className="h-4 w-4 text-green-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Users className="h-8 w-8 mr-3 text-pink-500" />
              My Patients
            </h1>
            <p className="text-gray-600 mt-2">View and manage your patient records and medical history</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
              </div>
              <Users className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Cases</p>
                <p className="text-2xl font-bold text-blue-600">89</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Patients</p>
                <p className="text-2xl font-bold text-red-600">3</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Follow-ups Due</p>
                <p className="text-2xl font-bold text-yellow-600">12</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
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
                  placeholder="Search patients by name, ID, condition, or phone..." 
                  className="pl-10 border-pink-200 focus:border-pink-400"
                />
              </div>
            </div>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {patients.map((patient) => (
              <div key={patient.id} className="p-6 border border-pink-100 rounded-lg hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-full h-16 w-16 flex items-center justify-center font-bold text-lg">
                      {patient.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="font-bold text-xl text-gray-900">{patient.name}</h3>
                        <Badge variant="outline">{patient.id}</Badge>
                        {patient.bloodGroup && getBloodGroupBadge(patient.bloodGroup)}
                        {patient.status && getStatusBadge(patient.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <User className="h-4 w-4" />
                          <span>{patient.age || 'N/A'} years • {patient.gender || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{patient.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{patient.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Last Visit: {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'No visits'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Activity className="h-4 w-4" />
                          <span>Total Visits: {patient.totalAppointments || 0}</span>
                        </div>
                      </div>
                      {patient.condition && (
                        <div className="text-sm text-gray-700 mb-3">
                          <span className="font-semibold">Condition:</span> {patient.condition}
                        </div>
                      )}

                      {/* Medical Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Patient Details */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 text-sm">Patient Details</h4>
                          {patient.allergies && (
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">Allergies:</span>
                              <span className="ml-2 text-gray-600">{patient.allergies.join(', ')}</span>
                            </div>
                          )}
                          {patient.admissionHistory && (
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">Admissions:</span>
                              <span className="ml-2 text-gray-600">{patient.admissionHistory}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Current Vitals - Only show if vitals exist */}
                      {patient.vitals && (
                        <div className="p-4 bg-gray-50 rounded-lg mb-4">
                          <h4 className="font-semibold text-gray-900 text-sm mb-3">Latest Vitals</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center space-x-2">
                              {getVitalIcon('bp')}
                              <div>
                                <p className="text-xs text-gray-500">Blood Pressure</p>
                                <p className="font-medium text-sm">{patient.vitals.bp}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getVitalIcon('temp')}
                              <div>
                                <p className="text-xs text-gray-500">Temperature</p>
                                <p className="font-medium text-sm">{patient.vitals.temp}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getVitalIcon('weight')}
                              <div>
                                <p className="text-xs text-gray-500">Weight</p>
                                <p className="font-medium text-sm">{patient.vitals.weight}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getVitalIcon('pulse')}
                              <div>
                                <p className="text-xs text-gray-500">Pulse</p>
                                <p className="font-medium text-sm">{patient.vitals.pulse}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Current Medications - Only show if medications exist */}
                      {patient.medications && patient.medications.length > 0 && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold text-blue-900 text-sm mb-2">Current Medications</h4>
                          <div className="flex flex-wrap gap-2">
                            {patient.medications.map((medication: string, index: number) => (
                              <Badge key={index} className="bg-blue-100 text-blue-700">
                                {medication}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      <FileText className="h-4 w-4" />
                    </Button>
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
              <FileText className="h-6 w-6" />
              <span>Medical History</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Activity className="h-6 w-6" />
              <span>Add Vitals</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Heart className="h-6 w-6" />
              <span>Critical Patients</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Calendar className="h-6 w-6" />
              <span>Schedule Follow-up</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-pink-100 text-pink-700 rounded-full">
          <Users className="h-5 w-5 mr-2" />
          <span className="font-medium">Advanced Patient Management Features Coming Soon</span>
        </div>
      </div>
    </div>
  )
}
