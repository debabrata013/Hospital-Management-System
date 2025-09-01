"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  FileText, 
  Search, 
  Filter,
  Eye,
  User,
  Calendar,
  Clock,
  Stethoscope,
  Pill,
  Activity,
  Heart,
  TrendingUp,
  Download,
  History
} from 'lucide-react'

// Mock medical history data
const mockPatientHistory = [
  {
    patientId: "P001",
    patientName: "राजेश कुमार",
    age: 45,
    totalVisits: 8,
    firstVisit: "2023-03-15",
    lastVisit: "2024-01-09",
    chronicConditions: ["Hypertension", "Type 2 Diabetes"],
    allergies: ["Penicillin"],
    bloodGroup: "B+",
    consultations: [
      {
        date: "2024-01-09",
        type: "Follow-up",
        diagnosis: "Hypertensive heart disease - stable",
        vitals: { bp: "140/90", temp: "98.6", pulse: "78" },
        medications: ["Amlodipine 5mg", "Metoprolol 25mg"],
        notes: "Patient reports improved symptoms. Continue current medications."
      },
      {
        date: "2023-12-15",
        type: "Regular Check-up",
        diagnosis: "Hypertension with good control",
        vitals: { bp: "135/85", temp: "98.4", pulse: "75" },
        medications: ["Amlodipine 5mg", "Metoprolol 25mg"],
        notes: "Blood pressure well controlled. Patient compliant with medications."
      },
      {
        date: "2023-11-10",
        type: "Follow-up",
        diagnosis: "Hypertension - medication adjustment",
        vitals: { bp: "150/95", temp: "98.8", pulse: "82" },
        medications: ["Amlodipine 10mg", "Metoprolol 50mg"],
        notes: "Increased medication dosage due to elevated BP readings."
      }
    ],
    labResults: [
      {
        date: "2024-01-08",
        test: "Lipid Profile",
        results: "Total Cholesterol: 180 mg/dL, LDL: 110 mg/dL, HDL: 45 mg/dL",
        status: "normal"
      },
      {
        date: "2024-01-08",
        test: "HbA1c",
        results: "6.8%",
        status: "elevated"
      },
      {
        date: "2023-12-10",
        test: "ECG",
        results: "Normal sinus rhythm, no acute changes",
        status: "normal"
      }
    ],
    admissions: [
      {
        date: "2023-08-20",
        reason: "Hypertensive crisis",
        duration: "3 days",
        outcome: "Stabilized and discharged"
      }
    ]
  },
  {
    patientId: "P002",
    patientName: "सुनीता देवी",
    age: 38,
    totalVisits: 3,
    firstVisit: "2024-01-05",
    lastVisit: "2024-01-09",
    chronicConditions: ["None"],
    allergies: ["None known"],
    bloodGroup: "A+",
    consultations: [
      {
        date: "2024-01-09",
        type: "New Consultation",
        diagnosis: "Chest pain - under investigation",
        vitals: { bp: "130/85", temp: "99.1", pulse: "85" },
        medications: ["Aspirin 75mg", "Atorvastatin 20mg"],
        notes: "New patient with chest pain. ECG shows non-specific changes."
      },
      {
        date: "2024-01-07",
        type: "Emergency",
        diagnosis: "Acute chest pain - rule out ACS",
        vitals: { bp: "135/90", temp: "98.9", pulse: "88" },
        medications: ["Aspirin 300mg", "Clopidogrel 75mg"],
        notes: "Emergency presentation with chest pain. Cardiac enzymes ordered."
      }
    ],
    labResults: [
      {
        date: "2024-01-07",
        test: "Cardiac Enzymes",
        results: "Troponin I: 0.02 ng/mL (Normal), CK-MB: 3.2 ng/mL",
        status: "normal"
      },
      {
        date: "2024-01-07",
        test: "ECG",
        results: "Non-specific T-wave changes in leads V4-V6",
        status: "abnormal"
      }
    ],
    admissions: []
  }
]

export default function DoctorHistoryPage() {
  const [patientHistory, setPatientHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPatientHistory()
  }, [])

  const fetchPatientHistory = async () => {
    try {
      const response = await fetch('/api/doctor/consultations')
      if (response.ok) {
        const consultations = await response.json()
        console.log('Consultations data:', consultations) // Debug log
        
        if (Array.isArray(consultations) && consultations.length > 0) {
          // Group consultations by patient
          const groupedHistory = groupConsultationsByPatient(consultations)
          console.log('Grouped history:', groupedHistory) // Debug log
          setPatientHistory(groupedHistory)
        } else {
          console.log('No consultations found, using mock data')
          setPatientHistory(mockPatientHistory)
        }
      } else {
        console.error('Failed to fetch patient history')
        setPatientHistory(mockPatientHistory) // Fallback to mock data
      }
    } catch (error) {
      console.error('Error fetching patient history:', error)
      setPatientHistory(mockPatientHistory) // Fallback to mock data
    } finally {
      setLoading(false)
    }
  }

  const groupConsultationsByPatient = (consultations: any[]) => {
    const grouped = consultations.reduce((acc: any, consultation: any) => {
      const patientId = consultation.patientId
      if (!acc[patientId]) {
        acc[patientId] = {
          patientId: consultation.patientId,
          patientName: consultation.name || 'Unknown Patient',
          age: consultation.age || 'N/A',
          totalVisits: 0,
          firstVisit: consultation.date,
          lastVisit: consultation.date,
          chronicConditions: [],
          allergies: ['Not specified'],
          bloodGroup: 'Not specified',
          consultations: [],
          labResults: [],
          admissions: []
        }
      }
      
      acc[patientId].totalVisits += 1
      acc[patientId].consultations.push({
        date: consultation.date,
        type: consultation.status === 'completed' ? 'Follow-up' : 'New Consultation',
        diagnosis: consultation.diagnosis || 'Not specified',
        vitals: parseVitals(consultation.notes),
        medications: [],
        notes: consultation.reason || consultation.notes || 'No notes available'
      })
      
      // Update first and last visit dates
      if (new Date(consultation.date) < new Date(acc[patientId].firstVisit)) {
        acc[patientId].firstVisit = consultation.date
      }
      if (new Date(consultation.date) > new Date(acc[patientId].lastVisit)) {
        acc[patientId].lastVisit = consultation.date
      }
      
      return acc
    }, {})
    
    return Object.values(grouped)
  }

  const parseVitals = (notes: string) => {
    try {
      const vitalsMatch = notes?.match(/"vitals":\s*({[^}]+})/)
      if (vitalsMatch) {
        const vitals = JSON.parse(vitalsMatch[1])
        return {
          bp: vitals.bloodPressure || 'N/A',
          temp: vitals.temperature || 'N/A',
          pulse: vitals.heartRate || 'N/A'
        }
      }
    } catch (error) {
      // Ignore parsing errors
    }
    return { bp: 'N/A', temp: 'N/A', pulse: 'N/A' }
  }
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal':
        return <Badge className="bg-green-100 text-green-700">Normal</Badge>
      case 'abnormal':
        return <Badge className="bg-red-100 text-red-700">Abnormal</Badge>
      case 'elevated':
        return <Badge className="bg-yellow-100 text-yellow-700">Elevated</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Emergency':
        return 'bg-red-100 text-red-700'
      case 'New Consultation':
        return 'bg-blue-100 text-blue-700'
      case 'Follow-up':
        return 'bg-green-100 text-green-700'
      case 'Regular Check-up':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="h-8 w-8 mr-3 text-pink-500" />
              Medical History
            </h1>
            <p className="text-gray-600 mt-2">Access complete medical history of patients</p>
          </div>
          <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600">
            <Download className="h-4 w-4 mr-2" />
            Export History
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
              </div>
              <FileText className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chronic Patients</p>
                <p className="text-2xl font-bold text-blue-600">45</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Updates</p>
                <p className="text-2xl font-bold text-green-600">12</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lab Reports</p>
                <p className="text-2xl font-bold text-purple-600">89</p>
              </div>
              <History className="h-8 w-8 text-purple-500" />
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
                  placeholder="Search patient history by name, ID, or condition..." 
                  className="pl-10 border-pink-200 focus:border-pink-400"
                />
              </div>
            </div>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Condition
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patient History Records */}
      <div className="space-y-8">
        {patientHistory.map((patient) => (
          <Card key={patient.patientId} className="border-pink-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-full h-12 w-12 flex items-center justify-center font-bold">
                    {patient.patientName ? patient.patientName.split(' ').map((n: string) => n[0]).join('') : 'N/A'}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{patient.patientName || 'Unknown Patient'}</CardTitle>
                    <p className="text-gray-600">
                      {patient.age} years • {patient.bloodGroup} • {patient.totalVisits} visits
                    </p>
                  </div>
                </div>
                <Badge variant="outline">{patient.patientId}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Patient Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Patient Overview</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">First Visit:</span>
                      <span className="ml-2 text-gray-600">{new Date(patient.firstVisit).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="font-medium">Last Visit:</span>
                      <span className="ml-2 text-gray-600">{new Date(patient.lastVisit).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="font-medium">Total Visits:</span>
                      <span className="ml-2 text-gray-600">{patient.totalVisits}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-3">Chronic Conditions</h4>
                  <div className="space-y-1">
                    {patient.chronicConditions.map((condition: string, index: number) => (
                      <Badge key={index} className="bg-red-100 text-red-700 mr-2 mb-1">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-3">Allergies</h4>
                  <div className="space-y-1">
                    {patient.allergies.map((allergy: string, index: number) => (
                      <Badge key={index} className="bg-yellow-100 text-yellow-700 mr-2 mb-1">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Consultation History */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Consultation History
                </h4>
                <div className="space-y-4">
                  {patient.consultations.map((consultation: any, index: number) => (
                    <div key={index} className="p-4 border border-pink-100 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge className={getTypeColor(consultation.type)}>{consultation.type}</Badge>
                          <span className="text-sm text-gray-600">{new Date(consultation.date).toLocaleDateString()}</span>
                        </div>
                        <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Diagnosis & Notes</h5>
                          <p className="text-sm text-gray-600 mb-2">{consultation.diagnosis}</p>
                          <p className="text-sm text-gray-600">{consultation.notes}</p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Vitals & Medications</h5>
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Vitals:</span> BP: {consultation.vitals.bp}, 
                            Temp: {consultation.vitals.temp}°F, Pulse: {consultation.vitals.pulse}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {consultation.medications.map((med: string, medIndex: number) => (
                              <Badge key={medIndex} className="bg-green-100 text-green-700 text-xs">
                                {med}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lab Results */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Lab Results
                </h4>
                <div className="space-y-3">
                  {patient.labResults.map((lab: any, index: number) => (
                    <div key={index} className="p-3 border border-pink-100 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-3 mb-1">
                            <span className="font-medium text-gray-900">{lab.test}</span>
                            {getStatusBadge(lab.status)}
                          </div>
                          <p className="text-sm text-gray-600">{lab.results}</p>
                        </div>
                        <span className="text-sm text-gray-500">{new Date(lab.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admission History */}
              {patient.admissions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    Admission History
                  </h4>
                  <div className="space-y-3">
                    {patient.admissions.map((admission: any, index: number) => (
                      <div key={index} className="p-3 border border-pink-100 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-900">{admission.reason}</span>
                            <p className="text-sm text-gray-600">Duration: {admission.duration} • {admission.outcome}</p>
                          </div>
                          <span className="text-sm text-gray-500">{new Date(admission.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-pink-100 mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Search className="h-6 w-6" />
              <span>Search Records</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Activity className="h-6 w-6" />
              <span>Lab Reports</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Heart className="h-6 w-6" />
              <span>Chronic Patients</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Download className="h-6 w-6" />
              <span>Export History</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-pink-100 text-pink-700 rounded-full">
          <FileText className="h-5 w-5 mr-2" />
          <span className="font-medium">Advanced Medical History Features Coming Soon</span>
        </div>
      </div>
    </div>
  )
}
