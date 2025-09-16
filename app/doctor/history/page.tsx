"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Search, 
  RefreshCw, 
  User, 
  Phone, 
  Calendar, 
  Eye, 
  Heart, 
  Activity, 
  Stethoscope, 
  FileText, 
  Download,
  Brain,
  Apple,
  Pill
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Patient {
  id: number
  name: string
  age: number
  gender: string
  contactNumber: string
  totalVisits: number
  lastVisit: string
  firstVisit: string
}

interface PatientDetail {
  patient: Patient
  appointments: any[]
  prescriptions: any[]
  vitals: any[]
  aiSummary?: string
  dietPlan?: string
}

export default function DoctorHistoryPage() {
  const { toast } = useToast()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<PatientDetail | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState<number | null>(null)
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalVisits: 0,
    totalPrescriptions: 0,
    totalVitals: 0
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/doctor/patients')
      if (response.ok) {
        const data = await response.json()
        if (data.patients) {
          // Transform the data to include age and visit counts
          const transformedPatients = data.patients.map((patient: any) => ({
            ...patient,
            age: patient.date_of_birth ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : 'N/A',
            contactNumber: patient.contact_number,
            totalVisits: 0, // Will be calculated separately if needed
            lastVisit: null, // Will be fetched separately if needed
            firstVisit: patient.registration_date
          }))
          
          setPatients(transformedPatients)
          // Calculate stats
          setStats({
            totalPatients: transformedPatients.length,
            totalVisits: 0, // Will be updated when we fetch visit data
            totalPrescriptions: 0, // Will be updated when we fetch prescriptions
            totalVitals: 0 // Will be updated when we fetch vitals
          })
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch patients",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPatientDetail = async (patientId: number) => {
    try {
      setLoadingDetail(patientId)
      
      // Fetch patient prescriptions
      const prescriptionsResponse = await fetch(`/api/doctor/prescriptions?patient_id=${patientId}`)
      const prescriptions = prescriptionsResponse.ok ? (await prescriptionsResponse.json()).prescriptions || [] : []
      
      // Fetch patient vitals
      const vitalsResponse = await fetch(`/api/doctor/vitals?patientId=${patientId}`)
      const vitals = vitalsResponse.ok ? (await vitalsResponse.json()).vitals || [] : []
      
      // Fetch AI approvals from database
      const aiApprovalsResponse = await fetch(`/api/doctor/ai-approvals?patientId=${patientId}`)
      const aiApprovals = aiApprovalsResponse.ok ? (await aiApprovalsResponse.json()).approvals || [] : []
      
      // Find existing AI summary and diet plan
      const aiSummary = aiApprovals.find((approval: any) => approval.type === 'patient_summary')?.content || null
      const dietPlan = aiApprovals.find((approval: any) => approval.type === 'diet_plan')?.content || null
      
      const patient = patients.find(p => p.id === patientId)
      if (patient) {
        setSelectedPatient({
          patient,
          appointments: [], // Removed appointments
          prescriptions,
          vitals,
          aiSummary,
          dietPlan
        })
        setIsDetailDialogOpen(true)
      }
    } catch (error) {
      console.error('Error fetching patient detail:', error)
      toast({
        title: "Error",
        description: "Failed to fetch patient details",
        variant: "destructive"
      })
    } finally {
      setLoadingDetail(null)
    }
  }

  const generateAISummary = async (patientId: number) => {
    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientData: {
            appointments: selectedPatient?.appointments || [],
            prescriptions: selectedPatient?.prescriptions || [],
            vitals: selectedPatient?.vitals || []
          }
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setSelectedPatient(prev => prev ? { ...prev, aiSummary: data.summary } : null)
      }
    } catch (error) {
      console.error('Error generating AI summary:', error)
    }
  }
  
  const exportHistory = async () => {
    try {
      // Create CSV content
      const csvHeaders = ['Patient ID', 'Name', 'Age', 'Gender', 'Contact', 'Total Visits', 'Registration Date']
      const csvRows = patients.map(patient => [
        patient.id,
        patient.name || 'N/A',
        patient.age || 'N/A',
        patient.gender || 'N/A',
        patient.contactNumber || 'N/A',
        patient.totalVisits || 0,
        patient.firstVisit ? new Date(patient.firstVisit).toLocaleDateString() : 'N/A'
      ])
      
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n')
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `medical_history_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Success",
        description: "Medical history exported successfully",
      })
    } catch (error) {
      console.error('Error exporting history:', error)
      toast({
        title: "Error",
        description: "Failed to export medical history",
        variant: "destructive"
      })
    }
  }

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.contactNumber?.includes(searchTerm) ||
      patient.id.toString().includes(searchTerm)
    
    return matchesSearch
  })
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
          <Button 
            onClick={exportHistory}
            className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600"
          >
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
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
              <User className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Visits</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalVisits}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prescriptions</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalPrescriptions}</p>
              </div>
              <Pill className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vitals Records</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalVitals}</p>
              </div>
              <Heart className="h-8 w-8 text-purple-500" />
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
                  placeholder="Search patients by name, phone, or ID..." 
                  className="pl-10 border-pink-200 focus:border-pink-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={() => fetchPatients()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Patient Medical History</span>
            <span className="text-sm text-gray-500">
              {filteredPatients.length} patients
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
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No patients found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="p-6 border border-pink-100 rounded-lg hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-gradient-to-r from-pink-400 to-pink-500 text-white text-lg font-bold">
                          {patient.name?.charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="font-bold text-xl text-gray-900">
                            {patient.name || 'Unknown Patient'}
                          </h3>
                          <Badge variant="outline">ID: {patient.id}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <User className="h-4 w-4" />
                            <span>{patient.age} years • {patient.gender}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{patient.contactNumber}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{patient.totalVisits || 0} visits</span>
                          </div>
                        </div>
                        
                        {patient.lastVisit && (
                          <div className="p-3 bg-blue-50 rounded-lg mb-3">
                            <h4 className="font-semibold text-blue-900 text-sm mb-1">Last Visit</h4>
                            <p className="text-sm text-blue-700">{new Date(patient.lastVisit).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <Button 
                        onClick={() => fetchPatientDetail(patient.id)}
                        disabled={loadingDetail === patient.id}
                        className="bg-pink-500 hover:bg-pink-600 text-white"
                      >
                        {loadingDetail === patient.id ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Eye className="h-4 w-4 mr-2" />
                        )}
                        View History
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>


      {/* Patient Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-to-r from-pink-400 to-pink-500 text-white">
                  {selectedPatient?.patient.name?.charAt(0) || 'P'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{selectedPatient?.patient.name || 'Unknown Patient'}</h2>
                <p className="text-sm text-gray-500">
                  {selectedPatient?.patient.age} years • {selectedPatient?.patient.gender} • ID: {selectedPatient?.patient.id}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-6">
              {/* Patient Overview */}
              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="text-lg">Patient Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Contact</p>
                      <p className="text-lg">{selectedPatient.patient.contactNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Visits</p>
                      <p className="text-lg">0</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Prescriptions</p>
                      <p className="text-lg">{selectedPatient.prescriptions.length}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Vitals Records</p>
                      <p className="text-lg">{selectedPatient.vitals.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>


              {/* Prescriptions */}
              <Card className="border-purple-100">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Pill className="h-5 w-5 mr-2 text-purple-500" />
                    Past Prescriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPatient.prescriptions.length === 0 ? (
                    <p className="text-gray-500">No prescriptions found</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedPatient.prescriptions.slice(0, 5).map((prescription, index) => (
                        <div key={index} className="p-3 border border-purple-100 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">Prescription #{prescription.prescription_id}</p>
                            <p className="text-sm text-gray-500">{new Date(prescription.prescription_date).toLocaleDateString()}</p>
                          </div>
                          {prescription.medicines && (
                            <div className="flex flex-wrap gap-1">
                              {JSON.parse(prescription.medicines).map((med: any, medIndex: number) => (
                                <Badge key={medIndex} className="bg-purple-100 text-purple-700 text-xs">
                                  {med.name} - {med.dosage}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {prescription.remarks && (
                            <p className="text-sm text-gray-600 mt-2">{prescription.remarks}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Vitals Records */}
              <Card className="border-red-100">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-red-500" />
                    Vitals History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPatient.vitals.length === 0 ? (
                    <p className="text-gray-500">No vitals records found</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedPatient.vitals.slice(0, 3).map((vital, index) => (
                        <div key={index} className="p-3 border border-red-100 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">Vitals Record</p>
                            <p className="text-sm text-gray-500">{new Date(vital.recorded_at).toLocaleDateString()}</p>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {vital.blood_pressure && (
                              <div className="text-sm">
                                <span className="font-medium">BP:</span> {vital.blood_pressure}
                              </div>
                            )}
                            {vital.pulse && (
                              <div className="text-sm">
                                <span className="font-medium">Pulse:</span> {vital.pulse} bpm
                              </div>
                            )}
                            {vital.temperature && (
                              <div className="text-sm">
                                <span className="font-medium">Temp:</span> {vital.temperature}°F
                              </div>
                            )}
                            {vital.weight && (
                              <div className="text-sm">
                                <span className="font-medium">Weight:</span> {vital.weight} kg
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Generated Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Patient Summary */}
                <Card className="border-blue-100">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center">
                        <Brain className="h-5 w-5 mr-2 text-blue-500" />
                        AI Patient Summary
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPatient.aiSummary ? (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">{selectedPatient.aiSummary}</p>
                        <div className="mt-2 text-xs text-blue-600">
                          <span className="font-medium">Status:</span> Approved by Doctor
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">No content generated</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* AI Diet Plan */}
                <Card className="border-green-100">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center">
                        <Apple className="h-5 w-5 mr-2 text-green-500" />
                        AI Diet Plan
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPatient.dietPlan ? (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">{selectedPatient.dietPlan}</p>
                        <div className="mt-2 text-xs text-green-600">
                          <span className="font-medium">Status:</span> Approved by Doctor
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">No content generated</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
