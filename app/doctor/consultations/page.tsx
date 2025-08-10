"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Stethoscope, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  User,
  Calendar,
  Clock,
  FileText,
  Pill,
  Heart,
  Thermometer,
  Weight,
  Zap,
  Save,
  Brain
} from 'lucide-react'

// Mock consultation data
const mockConsultations = [
  {
    id: "CONS001",
    patientName: "राजेश कुमार",
    patientId: "P001",
    date: "2024-01-09",
    time: "09:30 AM",
    type: "Follow-up",
    status: "completed",
    chiefComplaint: "Chest discomfort and shortness of breath",
    diagnosis: "Hypertensive heart disease with mild symptoms",
    vitals: {
      bp: "140/90",
      temp: "98.6",
      weight: "75",
      pulse: "78",
      respiration: "16",
      oxygen: "98"
    },
    notes: "Patient reports improved symptoms since last visit. Blood pressure still elevated. Continue current medications with lifestyle modifications.",
    prescriptions: [
      { medicine: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "30 days" },
      { medicine: "Metoprolol", dosage: "25mg", frequency: "Twice daily", duration: "30 days" }
    ],
    followUp: "2024-01-16"
  },
  {
    id: "CONS002",
    patientName: "सुनीता देवी",
    patientId: "P002",
    date: "2024-01-09",
    time: "10:15 AM",
    type: "New Consultation",
    status: "in_progress",
    chiefComplaint: "Acute chest pain radiating to left arm",
    diagnosis: "Rule out acute coronary syndrome - under investigation",
    vitals: {
      bp: "130/85",
      temp: "99.1",
      weight: "62",
      pulse: "85",
      respiration: "18",
      oxygen: "97"
    },
    notes: "New patient presenting with chest pain. ECG shows non-specific changes. Ordered cardiac enzymes and chest X-ray.",
    prescriptions: [
      { medicine: "Aspirin", dosage: "75mg", frequency: "Once daily", duration: "Ongoing" },
      { medicine: "Atorvastatin", dosage: "20mg", frequency: "Once daily", duration: "30 days" }
    ],
    followUp: "2024-01-12"
  }
]

// Mock new consultation form data
const newConsultation = {
  patientName: "मोहम्मद अली",
  patientId: "P003",
  age: 62,
  gender: "Male",
  appointmentTime: "11:00 AM"
}

export default function DoctorConsultationsPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'New Consultation':
        return 'bg-blue-100 text-blue-700'
      case 'Follow-up':
        return 'bg-green-100 text-green-700'
      case 'Emergency':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
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
        return <Stethoscope className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Stethoscope className="h-8 w-8 mr-3 text-pink-500" />
              Consultations
            </h1>
            <p className="text-gray-600 mt-2">Add consultation notes, diagnosis, prescriptions, and vitals</p>
          </div>
          <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600">
            <Plus className="h-4 w-4 mr-2" />
            New Consultation
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Consultations</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <Stethoscope className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">6</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">1</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">1</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Consultation Form */}
      <Card className="border-pink-100 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2 text-pink-500" />
            Current Consultation - {newConsultation.patientName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Info & Vitals */}
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Patient Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name: <span className="font-medium">{newConsultation.patientName}</span></p>
                    <p className="text-sm text-gray-600">ID: <span className="font-medium">{newConsultation.patientId}</span></p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age: <span className="font-medium">{newConsultation.age} years</span></p>
                    <p className="text-sm text-gray-600">Time: <span className="font-medium">{newConsultation.appointmentTime}</span></p>
                  </div>
                </div>
              </div>

              {/* Vitals Entry */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">Enter Vitals (Required for every consultation)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Blood Pressure</label>
                    <Input placeholder="120/80" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Temperature (°F)</label>
                    <Input placeholder="98.6" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Weight (kg)</label>
                    <Input placeholder="70" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Pulse (bpm)</label>
                    <Input placeholder="72" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Respiration</label>
                    <Input placeholder="16" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Oxygen Saturation (%)</label>
                    <Input placeholder="98" className="mt-1" />
                  </div>
                </div>
              </div>
            </div>

            {/* Consultation Notes */}
            <div className="space-y-6">
              {/* Chief Complaint */}
              <div>
                <label className="text-sm font-medium text-gray-700">Chief Complaint</label>
                <Textarea 
                  placeholder="Patient's main concern or symptoms..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Clinical Notes */}
              <div>
                <label className="text-sm font-medium text-gray-700">Clinical Notes</label>
                <Textarea 
                  placeholder="Examination findings, observations, and clinical assessment..."
                  className="mt-1"
                  rows={4}
                />
              </div>

              {/* Diagnosis */}
              <div>
                <label className="text-sm font-medium text-gray-700">Diagnosis</label>
                <Textarea 
                  placeholder="Primary and secondary diagnosis..."
                  className="mt-1"
                  rows={2}
                />
              </div>

              {/* AI Assistant */}
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-purple-900 flex items-center">
                    <Brain className="h-4 w-4 mr-2" />
                    AI Assistant
                  </h4>
                  <Button variant="outline" size="sm" className="border-purple-200 text-purple-600 hover:bg-purple-100">
                    Generate Summary
                  </Button>
                </div>
                <p className="text-sm text-purple-700">
                  Use AI to generate patient summary and diet plans. All AI recommendations require your approval before saving.
                </p>
              </div>
            </div>
          </div>

          {/* Prescription Section */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-3 flex items-center">
              <Pill className="h-4 w-4 mr-2" />
              Prescription
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Input placeholder="Medicine name" />
              <Input placeholder="Dosage" />
              <Input placeholder="Frequency" />
              <Input placeholder="Duration" />
            </div>
            <Button variant="outline" size="sm" className="border-green-200 text-green-600 hover:bg-green-100">
              <Plus className="h-4 w-4 mr-2" />
              Add Medicine
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                <Brain className="h-4 w-4 mr-2" />
                AI Diet Plan
              </Button>
              <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                <FileText className="h-4 w-4 mr-2" />
                View History
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                Save Draft
              </Button>
              <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600">
                <Save className="h-4 w-4 mr-2" />
                Complete Consultation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Consultations */}
      <Card className="border-pink-100">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Consultations</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search consultations..." 
                className="pl-10 w-64 border-pink-200 focus:border-pink-400"
              />
            </div>
            <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mockConsultations.map((consultation) => (
              <div key={consultation.id} className="p-4 border border-pink-100 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-bold text-lg text-gray-900">{consultation.patientName}</h3>
                    <Badge variant="outline">{consultation.patientId}</Badge>
                    <Badge className={getTypeColor(consultation.type)}>{consultation.type}</Badge>
                    {getStatusBadge(consultation.status)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{consultation.date} • {consultation.time}</span>
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Clinical Information */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">Chief Complaint</h4>
                      <p className="text-sm text-gray-600">{consultation.chiefComplaint}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">Diagnosis</h4>
                      <p className="text-sm text-gray-600">{consultation.diagnosis}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">Clinical Notes</h4>
                      <p className="text-sm text-gray-600">{consultation.notes}</p>
                    </div>
                  </div>

                  {/* Vitals and Prescription */}
                  <div className="space-y-4">
                    {/* Vitals */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 text-sm mb-3">Recorded Vitals</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                          {getVitalIcon('bp')}
                          <div>
                            <p className="text-xs text-gray-500">BP</p>
                            <p className="font-medium text-sm">{consultation.vitals.bp}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getVitalIcon('temp')}
                          <div>
                            <p className="text-xs text-gray-500">Temp</p>
                            <p className="font-medium text-sm">{consultation.vitals.temp}°F</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getVitalIcon('pulse')}
                          <div>
                            <p className="text-xs text-gray-500">Pulse</p>
                            <p className="font-medium text-sm">{consultation.vitals.pulse}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getVitalIcon('weight')}
                          <div>
                            <p className="text-xs text-gray-500">Weight</p>
                            <p className="font-medium text-sm">{consultation.vitals.weight}kg</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Prescriptions */}
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900 text-sm mb-3">Prescribed Medications</h4>
                      <div className="space-y-2">
                        {consultation.prescriptions.map((prescription, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">{prescription.medicine}</span>
                            <span className="text-gray-600 ml-2">
                              {prescription.dosage} • {prescription.frequency} • {prescription.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Follow-up:</span> {new Date(consultation.followUp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-pink-100 text-pink-700 rounded-full">
          <Stethoscope className="h-5 w-5 mr-2" />
          <span className="font-medium">Advanced Consultation Features Coming Soon</span>
        </div>
      </div>
    </div>
  )
}
