"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, 
  User, 
  FileText, 
  Pill, 
  Utensils, 
  Brain, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Clock,
  Eye,
  Download,
  Printer,
  RefreshCw
} from 'lucide-react'

interface Patient {
  id: number
  patient_id: string
  name: string
  date_of_birth: string
  gender: string
  contact_number: string
  email?: string
  address: string
  blood_group?: string
  emergency_contact_name: string
  emergency_contact_number: string
}

interface Prescription {
  id: number
  patient_id: string
  doctor_name: string
  medications: string
  dosage: string
  instructions: string
  created_at: string
}

interface AIContent {
  id: number
  patient_id: string
  type: 'summary' | 'diet_plan'
  content: string
  doctor_notes?: string
  status: 'pending' | 'approved'
  created_at: string
}

// Mock data for testing
const mockPatients: Patient[] = [
  {
    id: 1,
    patient_id: 'P001',
    name: 'राजेश कुमार',
    date_of_birth: '1979-05-15',
    gender: 'Male',
    contact_number: '+91 98765 43210',
    email: 'rajesh.kumar@email.com',
    address: '123 Main Street, Delhi',
    blood_group: 'B+',
    emergency_contact_name: 'सुनीता कुमार',
    emergency_contact_number: '+91 98765 43211'
  },
  {
    id: 2,
    patient_id: 'P002',
    name: 'प्रिया शर्मा',
    date_of_birth: '1985-08-22',
    gender: 'Female',
    contact_number: '+91 87654 32109',
    email: 'priya.sharma@email.com',
    address: '456 Park Avenue, Mumbai',
    blood_group: 'A+',
    emergency_contact_name: 'राहुल शर्मा',
    emergency_contact_number: '+91 87654 32108'
  },
  {
    id: 3,
    patient_id: 'P003',
    name: 'अमित पटेल',
    date_of_birth: '1992-12-10',
    gender: 'Male',
    contact_number: '+91 76543 21098',
    email: 'amit.patel@email.com',
    address: '789 Garden Road, Ahmedabad',
    blood_group: 'O+',
    emergency_contact_name: 'नीता पटेल',
    emergency_contact_number: '+91 76543 21097'
  }
]

const mockPrescriptions: { [key: string]: Prescription[] } = {
  'P001': [
    {
      id: 1,
      patient_id: 'P001',
      doctor_name: 'Dr. अनिल गुप्ता',
      medications: 'Amlodipine 5mg',
      dosage: '1 tablet daily',
      instructions: 'Take with food in the morning. Monitor blood pressure regularly.',
      created_at: '2024-01-09T10:30:00Z'
    },
    {
      id: 2,
      patient_id: 'P001',
      doctor_name: 'Dr. अनिल गुप्ता',
      medications: 'Metoprolol 25mg',
      dosage: '1 tablet twice daily',
      instructions: 'Take morning and evening. Do not stop abruptly.',
      created_at: '2024-01-09T10:35:00Z'
    }
  ],
  'P002': [
    {
      id: 3,
      patient_id: 'P002',
      doctor_name: 'Dr. सुनीता वर्मा',
      medications: 'Iron Supplement',
      dosage: '1 tablet daily',
      instructions: 'Take with vitamin C for better absorption. Avoid tea/coffee for 2 hours.',
      created_at: '2024-01-08T14:20:00Z'
    }
  ],
  'P003': [
    {
      id: 4,
      patient_id: 'P003',
      doctor_name: 'Dr. राज मेहता',
      medications: 'Paracetamol 500mg',
      dosage: '1 tablet as needed',
      instructions: 'For fever and pain. Do not exceed 4 tablets in 24 hours.',
      created_at: '2024-01-07T16:45:00Z'
    }
  ]
}

const mockAIContent: { [key: string]: AIContent[] } = {
  'P001': [
    {
      id: 1,
      patient_id: 'P001',
      type: 'summary',
      content: 'Patient राजेश कुमार (P001) presented with chest discomfort during today\'s consultation. Clinical examination revealed elevated blood pressure (140/90 mmHg) but no signs of acute distress. Cardiovascular examination showed normal heart sounds, and respiratory examination revealed clear lung fields.\n\nCurrent management plan includes continuation of existing antihypertensive medications. The patient\'s symptoms appear to be related to his known hypertensive condition. No immediate intervention required, but close monitoring is recommended.\n\nRecommended follow-up appointment scheduled for one week to assess response to current treatment and monitor blood pressure control.',
      doctor_notes: '• Patient complains of chest discomfort\n• BP elevated at 140/90\n• No acute distress\n• Heart sounds normal\n• Lungs clear\n• Continue current medications\n• Follow up in 1 week',
      status: 'approved',
      created_at: '2024-01-09T10:30:00Z'
    },
    {
      id: 2,
      patient_id: 'P001',
      type: 'diet_plan',
      content: 'PERSONALIZED DIET PLAN FOR HYPERTENSION MANAGEMENT\n\nBREAKFAST (7:00-8:00 AM):\n• 1 bowl oatmeal with low-fat milk\n• 1 medium banana\n• 1 cup green tea (no sugar)\n• 4-5 almonds\n\nMID-MORNING SNACK (10:30 AM):\n• 1 small apple\n• 1 glass buttermilk (low salt)\n\nLUNCH (12:30-1:30 PM):\n• 2 rotis (whole wheat)\n• 1 cup dal (without tempering)\n• 1 cup mixed vegetables (steamed/boiled)\n• 1 small bowl brown rice\n• 1 glass water\n\nEVENING SNACK (4:00 PM):\n• 1 cup herbal tea\n• 2-3 dates\n• Handful of roasted chana\n\nDINNER (7:00-8:00 PM):\n• 2 rotis or 1 cup brown rice\n• 1 cup vegetable curry (minimal oil)\n• 1 bowl salad (cucumber, tomato, onion)\n• 1 glass warm water\n\nGENERAL GUIDELINES:\n• Limit salt intake to less than 2g per day\n• Avoid processed and packaged foods\n• Drink 8-10 glasses of water daily\n• Include 30 minutes of walking daily\n• Avoid alcohol and smoking',
      doctor_notes: '• Patient has hypertension\n• BMI slightly elevated\n• Needs low sodium diet\n• Regular exercise recommended\n• Monitor weight weekly',
      status: 'approved',
      created_at: '2024-01-09T11:00:00Z'
    }
  ],
  'P002': [
    {
      id: 3,
      patient_id: 'P002',
      type: 'summary',
      content: 'Patient प्रिया शर्मा presented for routine antenatal checkup. All vital signs are within normal limits. Fetal heart rate is regular and strong. Patient reports no complications or concerns. Iron levels slightly low, supplementation recommended.',
      doctor_notes: '• Routine antenatal visit\n• All vitals normal\n• Fetal heart rate good\n• Iron deficiency noted\n• Prescribed iron supplements',
      status: 'approved',
      created_at: '2024-01-08T14:20:00Z'
    }
  ]
}

export default function PatientInfoPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [aiContent, setAiContent] = useState<AIContent[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch patients on component mount
  useEffect(() => {
    fetchPatients()
  }, [])

  // Fetch patient-specific data when a patient is selected
  useEffect(() => {
    if (selectedPatient) {
      fetchPatientData(selectedPatient.patient_id)
    }
  }, [selectedPatient])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/doctor/patients')
      if (response.ok) {
        const data = await response.json()
        setPatients(data.patients || [])
      } else {
        // Fallback to mock data if API fails
        setPatients(mockPatients)
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      // Use mock data as fallback
      setPatients(mockPatients)
    } finally {
      setLoading(false)
    }
  }

  const fetchPatientData = async (patientId: string) => {
    try {
      setLoading(true)
      
      // Try to fetch prescriptions from API, fallback to mock data
      try {
        const prescResponse = await fetch(`/api/doctor/prescriptions?patient_id=${patientId}`)
        if (prescResponse.ok) {
          const prescData = await prescResponse.json()
          setPrescriptions(prescData.prescriptions || [])
        } else {
          setPrescriptions(mockPrescriptions[patientId] || [])
        }
      } catch {
        setPrescriptions(mockPrescriptions[patientId] || [])
      }

      // Try to fetch AI-generated content from API, fallback to mock data
      try {
        const aiResponse = await fetch(`/api/doctor/ai-content?patient_id=${patientId}`)
        if (aiResponse.ok) {
          const aiData = await aiResponse.json()
          setAiContent(aiData.content || [])
        } else {
          setAiContent(mockAIContent[patientId] || [])
        }
      } catch {
        setAiContent(mockAIContent[patientId] || [])
      }
    } catch (error) {
      console.error('Error fetching patient data:', error)
      // Fallback to mock data
      setPrescriptions(mockPrescriptions[patientId] || [])
      setAiContent(mockAIContent[patientId] || [])
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.contact_number.includes(searchTerm)
  )

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Information Center</h1>
          <p className="text-gray-600">Comprehensive patient data management with prescriptions, AI summaries, and diet plans</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Search and Selection */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Select Patient
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by name, ID, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Patient List */}
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {loading ? (
                        <div className="text-center py-4">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Loading patients...</p>
                        </div>
                      ) : filteredPatients.length === 0 ? (
                        <div className="text-center py-4">
                          <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No patients found</p>
                        </div>
                      ) : (
                        filteredPatients.map((patient) => (
                          <div
                            key={patient.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedPatient?.id === patient.id
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-white hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedPatient(patient)}
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-blue-100 text-blue-700">
                                  {patient.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{patient.name}</p>
                                <p className="text-sm text-gray-500">{patient.patient_id}</p>
                                <p className="text-xs text-gray-400">{calculateAge(patient.date_of_birth)} years</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient Information Display */}
          <div className="lg:col-span-2">
            {selectedPatient ? (
              <div className="space-y-6">
                {/* Patient Header */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xl">
                            {selectedPatient.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">{selectedPatient.name}</h2>
                          <p className="text-gray-600">Patient ID: {selectedPatient.patient_id}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {calculateAge(selectedPatient.date_of_birth)} years
                            </span>
                            <span className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {selectedPatient.gender}
                            </span>
                            {selectedPatient.blood_group && (
                              <Badge variant="outline">{selectedPatient.blood_group}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <Phone className="h-4 w-4 mr-1" />
                          {selectedPatient.contact_number}
                        </div>
                        {selectedPatient.email && (
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Mail className="h-4 w-4 mr-1" />
                            {selectedPatient.email}
                          </div>
                        )}
                        <div className="flex items-start text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1 mt-0.5" />
                          <span className="max-w-48 text-right">{selectedPatient.address}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabbed Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                    <TabsTrigger value="ai-summaries">AI Summaries</TabsTrigger>
                    <TabsTrigger value="diet-plans">Diet Plans</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <FileText className="h-5 w-5 mr-2" />
                            Recent Prescriptions
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {prescriptions.slice(0, 3).map((prescription) => (
                            <div key={prescription.id} className="mb-3 last:mb-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-sm">{prescription.medications}</p>
                                  <p className="text-xs text-gray-500">{formatDate(prescription.created_at)}</p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {prescription.dosage}
                                </Badge>
                              </div>
                              {prescription !== prescriptions.slice(0, 3)[prescriptions.slice(0, 3).length - 1] && (
                                <Separator className="mt-3" />
                              )}
                            </div>
                          ))}
                          {prescriptions.length === 0 && (
                            <p className="text-sm text-gray-500">No prescriptions found</p>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Brain className="h-5 w-5 mr-2" />
                            AI-Generated Content
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {aiContent.filter(content => content.type === 'summary').slice(0, 2).map((content) => (
                              <div key={content.id} className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-sm">Patient Summary</p>
                                  <p className="text-xs text-gray-500">{formatDate(content.created_at)}</p>
                                </div>
                                <Badge variant={content.status === 'approved' ? 'default' : 'secondary'}>
                                  {content.status}
                                </Badge>
                              </div>
                            ))}
                            {aiContent.filter(content => content.type === 'diet_plan').slice(0, 2).map((content) => (
                              <div key={content.id} className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-sm">Diet Plan</p>
                                  <p className="text-xs text-gray-500">{formatDate(content.created_at)}</p>
                                </div>
                                <Badge variant={content.status === 'approved' ? 'default' : 'secondary'}>
                                  {content.status}
                                </Badge>
                              </div>
                            ))}
                            {aiContent.length === 0 && (
                              <p className="text-sm text-gray-500">No AI content found</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="prescriptions" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Pill className="h-5 w-5 mr-2" />
                            All Prescriptions
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {prescriptions.map((prescription) => (
                            <Card key={prescription.id} className="border-l-4 border-l-blue-500">
                              <CardContent className="pt-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-semibold">{prescription.medications}</h4>
                                    <p className="text-sm text-gray-600">Dr. {prescription.doctor_name}</p>
                                  </div>
                                  <div className="text-right">
                                    <Badge variant="outline">{prescription.dosage}</Badge>
                                    <p className="text-xs text-gray-500 mt-1">{formatDate(prescription.created_at)}</p>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                  {prescription.instructions}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                          {prescriptions.length === 0 && (
                            <div className="text-center py-8">
                              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500">No prescriptions found for this patient</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="ai-summaries" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Brain className="h-5 w-5 mr-2" />
                            AI-Generated Patient Summaries
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export All
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {aiContent.filter(content => content.type === 'summary').map((content) => (
                            <Card key={content.id} className="border-l-4 border-l-purple-500">
                              <CardContent className="pt-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-semibold">Patient Summary</h4>
                                    <p className="text-sm text-gray-600">{formatDate(content.created_at)}</p>
                                  </div>
                                  <Badge variant={content.status === 'approved' ? 'default' : 'secondary'}>
                                    {content.status}
                                  </Badge>
                                </div>
                                {content.doctor_notes && (
                                  <div className="mb-3">
                                    <h5 className="text-sm font-medium mb-2">Doctor's Notes:</h5>
                                    <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded whitespace-pre-line">
                                      {content.doctor_notes}
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <h5 className="text-sm font-medium mb-2">AI-Generated Summary:</h5>
                                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-line">
                                    {content.content}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          {aiContent.filter(content => content.type === 'summary').length === 0 && (
                            <div className="text-center py-8">
                              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500">No AI-generated summaries found for this patient</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="diet-plans" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Utensils className="h-5 w-5 mr-2" />
                            AI-Generated Diet Plans
                          </div>
                          <Button variant="outline" size="sm">
                            <Printer className="h-4 w-4 mr-2" />
                            Print Plans
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {aiContent.filter(content => content.type === 'diet_plan').map((content) => (
                            <Card key={content.id} className="border-l-4 border-l-green-500">
                              <CardContent className="pt-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-semibold">Personalized Diet Plan</h4>
                                    <p className="text-sm text-gray-600">{formatDate(content.created_at)}</p>
                                  </div>
                                  <Badge variant={content.status === 'approved' ? 'default' : 'secondary'}>
                                    {content.status}
                                  </Badge>
                                </div>
                                {content.doctor_notes && (
                                  <div className="mb-3">
                                    <h5 className="text-sm font-medium mb-2">Doctor's Notes:</h5>
                                    <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded whitespace-pre-line">
                                      {content.doctor_notes}
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <h5 className="text-sm font-medium mb-2">AI-Generated Diet Plan:</h5>
                                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-line">
                                    {content.content}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          {aiContent.filter(content => content.type === 'diet_plan').length === 0 && (
                            <div className="text-center py-8">
                              <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500">No AI-generated diet plans found for this patient</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Patient</h3>
                  <p className="text-gray-500">Choose a patient from the list to view their comprehensive information</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
