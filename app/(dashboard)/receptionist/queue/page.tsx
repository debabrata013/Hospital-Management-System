"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  Phone, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  CheckCircle, 
  XCircle,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  UserCheck,
  Stethoscope,
  Calendar,
  ArrowLeft,
  Bell,
  Timer,
  Activity
} from 'lucide-react'
import Link from 'next/link'

interface QueuePatient {
  id: string
  patientId: string
  name: string
  tokenNumber: string
  appointmentTime: string
  actualArrivalTime?: string
  doctor: string
  department: string
  status: 'waiting' | 'in-consultation' | 'completed' | 'no-show' | 'emergency'
  priority: 'normal' | 'high' | 'urgent'
  phone: string
  age: number
  gender: string
  appointmentType: 'scheduled' | 'walk-in' | 'emergency'
  waitingTime: number // in minutes
  consultationStartTime?: string
  notes?: string
}

const mockQueueData: QueuePatient[] = [
  {
    id: "Q001",
    patientId: "P001",
    name: "Ram Sharma",
    tokenNumber: "T001",
    appointmentTime: "09:30 AM",
    actualArrivalTime: "09:25 AM",
    doctor: "Dr. Anil Kumar",
    department: "General Medicine",
    status: "waiting",
    priority: "normal",
    phone: "+91 98765 43210",
    age: 45,
    gender: "Male",
    appointmentType: "scheduled",
    waitingTime: 15
  },
  {
    id: "Q002",
    patientId: "P002", 
    name: "Sunita Devi",
    tokenNumber: "T002",
    appointmentTime: "10:00 AM",
    actualArrivalTime: "09:55 AM",
    doctor: "Dr. Priya Singh",
    department: "Gynecology",
    status: "in-consultation",
    priority: "normal",
    phone: "+91 98765 43211",
    age: 32,
    gender: "Female",
    appointmentType: "scheduled",
    waitingTime: 25,
    consultationStartTime: "10:15 AM"
  },
  {
    id: "Q003",
    patientId: "P003",
    name: "Ajay Kumar",
    tokenNumber: "E001",
    appointmentTime: "Emergency",
    actualArrivalTime: "10:30 AM",
    doctor: "Dr. Rajesh Gupta",
    department: "Emergency",
    status: "emergency",
    priority: "urgent",
    phone: "+91 98765 43212",
    age: 28,
    gender: "Male",
    appointmentType: "emergency",
    waitingTime: 5
  },
  {
    id: "Q004",
    patientId: "P004",
    name: "Geeta Sharma",
    tokenNumber: "T003",
    appointmentTime: "10:30 AM",
    actualArrivalTime: "10:45 AM",
    doctor: "Dr. Anil Kumar",
    department: "General Medicine",
    status: "waiting",
    priority: "high",
    phone: "+91 98765 43213",
    age: 55,
    gender: "Female",
    appointmentType: "walk-in",
    waitingTime: 30
  }
]

const mockDoctors = [
  { id: "D001", name: "Dr. Anil Kumar", department: "General Medicine", status: "available" },
  { id: "D002", name: "Dr. Priya Singh", department: "Gynecology", status: "busy" },
  { id: "D003", name: "Dr. Rajesh Gupta", department: "Emergency", status: "available" }
]

export default function PatientQueue() {
  const [queueData, setQueueData] = useState<QueuePatient[]>(mockQueueData)
  const [filteredQueue, setFilteredQueue] = useState<QueuePatient[]>(mockQueueData)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [selectedPatient, setSelectedPatient] = useState<QueuePatient | null>(null)
  const [showPatientDialog, setShowPatientDialog] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Filter queue based on search and filters
  useEffect(() => {
    let filtered = queueData

    if (searchQuery) {
      filtered = filtered.filter(patient => 
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.phone.includes(searchQuery)
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(patient => patient.status === statusFilter)
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter(patient => patient.department === departmentFilter)
    }

    setFilteredQueue(filtered)
  }, [queueData, searchQuery, statusFilter, departmentFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'in-consultation': return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'no-show': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return 'प्रतीक्षा में'
      case 'in-consultation': return 'परामर्श में'
      case 'emergency': return 'आपातकाल'
      case 'completed': return 'पूर्ण'
      case 'no-show': return 'नहीं आया'
      default: return status
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'high': return <ArrowUp className="h-4 w-4 text-orange-500" />
      case 'normal': return <Clock className="h-4 w-4 text-pink-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const updatePatientStatus = (patientId: string, newStatus: QueuePatient['status']) => {
    setQueueData(prev => prev.map(patient => 
      patient.id === patientId 
        ? { 
            ...patient, 
            status: newStatus,
            consultationStartTime: newStatus === 'in-consultation' ? new Date().toLocaleTimeString() : patient.consultationStartTime
          }
        : patient
    ))
  }

  const movePatientUp = (patientId: string) => {
    setQueueData(prev => {
      const index = prev.findIndex(p => p.id === patientId)
      if (index > 0) {
        const newQueue = [...prev]
        const temp = newQueue[index]
        newQueue[index] = newQueue[index - 1]
        newQueue[index - 1] = temp
        return newQueue
      }
      return prev
    })
  }

  const movePatientDown = (patientId: string) => {
    setQueueData(prev => {
      const index = prev.findIndex(p => p.id === patientId)
      if (index < prev.length - 1) {
        const newQueue = [...prev]
        const temp = newQueue[index]
        newQueue[index] = newQueue[index + 1]
        newQueue[index + 1] = temp
        return newQueue
      }
      return prev
    })
  }

  const callPatient = (patient: QueuePatient) => {
    // Implement patient calling system (could integrate with PA system)
    alert(`${patient.name} (${patient.tokenNumber}) has been called`)
    updatePatientStatus(patient.id, 'in-consultation')
  }

  const getWaitingTimeColor = (waitingTime: number) => {
    if (waitingTime > 45) return 'text-red-600'
    if (waitingTime > 30) return 'text-orange-600'
    if (waitingTime > 15) return 'text-yellow-600'
    return 'text-green-600'
  }

  const queueStats = {
    total: filteredQueue.length,
    waiting: filteredQueue.filter(p => p.status === 'waiting').length,
    inConsultation: filteredQueue.filter(p => p.status === 'in-consultation').length,
    emergency: filteredQueue.filter(p => p.status === 'emergency').length,
    avgWaitTime: Math.round(filteredQueue.reduce((acc, p) => acc + p.waitingTime, 0) / filteredQueue.length) || 0
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
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Queue Management</h1>
              <p className="text-sm text-gray-600">Patient Queue Management - OPD</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <p>Time: {currentTime.toLocaleTimeString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Queue Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm">Total Patients</p>
                  <p className="text-2xl font-bold">{queueStats.total}</p>
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
                  <p className="text-2xl font-bold">{queueStats.waiting}</p>
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
                  <p className="text-2xl font-bold">{queueStats.inConsultation}</p>
                </div>
                <Stethoscope className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Emergency</p>
                  <p className="text-2xl font-bold">{queueStats.emergency}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Avg Wait</p>
                  <p className="text-2xl font-bold">{queueStats.avgWaitTime}m</p>
                </div>
                <Timer className="h-8 w-8 text-purple-200" />
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
                    placeholder="नाम, टोकन नंबर, या फोन से खोजें..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="स्थिति फिल्टर" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">सभी स्थिति</SelectItem>
                  <SelectItem value="waiting">प्रतीक्षा में</SelectItem>
                  <SelectItem value="in-consultation">परामर्श में</SelectItem>
                  <SelectItem value="emergency">आपातकाल</SelectItem>
                  <SelectItem value="completed">पूर्ण</SelectItem>
                  <SelectItem value="no-show">नहीं आया</SelectItem>
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="विभाग फिल्टर" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">सभी विभाग</SelectItem>
                  <SelectItem value="सामान्य चिकित्सा">सामान्य चिकित्सा</SelectItem>
                  <SelectItem value="स्त्री रोग">स्त्री रोग</SelectItem>
                  <SelectItem value="आपातकाल">आपातकाल</SelectItem>
                  <SelectItem value="बाल रोग">बाल रोग</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Queue List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>मरीज़ क्यू - आज ({filteredQueue.length} मरीज़)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                        <div className="flex flex-col space-y-1 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => movePatientUp(patient.id)}
                            disabled={index === 0}
                            className="h-6 w-6 p-0"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => movePatientDown(patient.id)}
                            disabled={index === filteredQueue.length - 1}
                            className="h-6 w-6 p-0"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Patient Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            {getPriorityIcon(patient.priority)}
                            <Badge className={getStatusColor(patient.status)}>
                              {getStatusText(patient.status)}
                            </Badge>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {patient.tokenNumber}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="font-semibold text-gray-900">{patient.name}</p>
                            <p className="text-xs text-gray-500">{patient.age} years, {patient.gender}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600">डॉक्टर: {patient.doctor}</p>
                            <p className="text-sm text-gray-600">विभाग: {patient.department}</p>
                            <p className="text-sm text-gray-600">समय: {patient.appointmentTime}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600">फोन: {patient.phone}</p>
                            <p className={`text-sm font-medium ${getWaitingTimeColor(patient.waitingTime)}`}>
                              प्रतीक्षा: {patient.waitingTime} मिनट
                            </p>
                            <p className="text-xs text-gray-500">
                              प्रकार: {patient.appointmentType === 'scheduled' ? 'निर्धारित' : 
                                      patient.appointmentType === 'walk-in' ? 'वॉक-इन' : 'आपातकाल'}
                            </p>
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
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => callPatient(patient)}
                        disabled={patient.status === 'in-consultation'}
                      >
                        <Bell className="h-4 w-4" />
                      </Button>

                      {patient.status === 'waiting' && (
                        <Button
                          size="sm"
                          onClick={() => updatePatientStatus(patient.id, 'in-consultation')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          शुरू करें
                        </Button>
                      )}

                      {patient.status === 'in-consultation' && (
                        <Button
                          size="sm"
                          onClick={() => updatePatientStatus(patient.id, 'completed')}
                          className="bg-pink-600 hover:bg-pink-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          पूर्ण
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredQueue.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>कोई मरीज़ क्यू में नहीं है</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Details Dialog */}
      <Dialog open={showPatientDialog} onOpenChange={setShowPatientDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>
              Complete details for {selectedPatient?.name} ({selectedPatient?.tokenNumber})
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="font-medium">{selectedPatient.name}</p>
                </div>
                <div>
                  <Label>Age</Label>
                  <p>{selectedPatient.age} years</p>
                </div>
                <div>
                  <Label>लिंग</Label>
                  <p>{selectedPatient.gender}</p>
                </div>
                <div>
                  <Label>फोन</Label>
                  <p>{selectedPatient.phone}</p>
                </div>
                <div>
                  <Label>टोकन नंबर</Label>
                  <p>{selectedPatient.tokenNumber}</p>
                </div>
                <div>
                  <Label>डॉक्टर</Label>
                  <p>{selectedPatient.doctor}</p>
                </div>
                <div>
                  <Label>विभाग</Label>
                  <p>{selectedPatient.department}</p>
                </div>
                <div>
                  <Label>अपॉइंटमेंट समय</Label>
                  <p>{selectedPatient.appointmentTime}</p>
                </div>
                <div>
                  <Label>वास्तविक आगमन</Label>
                  <p>{selectedPatient.actualArrivalTime || 'N/A'}</p>
                </div>
                <div>
                  <Label>स्थिति</Label>
                  <Badge className={getStatusColor(selectedPatient.status)}>
                    {getStatusText(selectedPatient.status)}
                  </Badge>
                </div>
                <div>
                  <Label>प्राथमिकता</Label>
                  <div className="flex items-center space-x-2">
                    {getPriorityIcon(selectedPatient.priority)}
                    <span>{selectedPatient.priority}</span>
                  </div>
                </div>
              </div>
              
              {selectedPatient.notes && (
                <div>
                  <Label>टिप्पणी</Label>
                  <p className="text-sm text-gray-600">{selectedPatient.notes}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPatientDialog(false)}>
              बंद करें
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
