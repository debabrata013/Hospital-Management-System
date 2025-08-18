"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  Users,
  Search,
  Filter,
  Eye,
  Activity,
  Clock,
  Heart,
  Thermometer,
  Stethoscope,
  Pill,
  FileText,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Phone
} from 'lucide-react'

// Mock data for assigned patients
const assignedPatients = [
  {
    id: "P001",
    name: "Ram Sharma",
    age: 45,
    gender: "Male",
    roomNumber: "101",
    bedNumber: "A1",
    condition: "Stable",
    diagnosis: "Hypertension monitoring",
    doctor: "Dr. Anil Kumar",
    admissionDate: "2024-01-08",
    lastVitals: {
      time: "2 hours ago",
      bp: "130/85",
      pulse: "78",
      temp: "98.6°F",
      oxygen: "98%"
    },
    nextMedicine: "14:30",
    allergies: "None known",
    emergencyContact: "+91 98765 43210",
    notes: "Patient responding well to medication"
  },
  {
    id: "P002",
    name: "Sunita Devi",
    age: 32,
    gender: "Female",
    roomNumber: "205",
    bedNumber: "B2",
    condition: "Good",
    diagnosis: "Post-delivery care",
    doctor: "Dr. Priya Singh",
    admissionDate: "2024-01-07",
    lastVitals: {
      time: "1 hour ago",
      bp: "120/80",
      pulse: "72",
      temp: "98.4°F",
      oxygen: "99%"
    },
    nextMedicine: "15:00",
    allergies: "Penicillin",
    emergencyContact: "+91 98765 43211",
    notes: "Recovery progressing normally"
  },
  {
    id: "P003",
    name: "Ajay Kumar",
    age: 28,
    gender: "Male",
    roomNumber: "ICU-1",
    bedNumber: "I1",
    condition: "Critical",
    diagnosis: "Accident trauma",
    doctor: "Dr. Rajesh Gupta",
    admissionDate: "2024-01-08",
    lastVitals: {
      time: "30 minutes ago",
      bp: "110/70",
      pulse: "95",
      temp: "99.2°F",
      oxygen: "95%"
    },
    nextMedicine: "Every 2 hours",
    allergies: "None known",
    emergencyContact: "+91 98765 43212",
    notes: "Requires continuous monitoring"
  },
  {
    id: "P004",
    name: "Geeta Sharma",
    age: 55,
    gender: "Female",
    roomNumber: "102",
    bedNumber: "A2",
    condition: "Stable",
    diagnosis: "Diabetes management",
    doctor: "Dr. Anil Kumar",
    admissionDate: "2024-01-06",
    lastVitals: {
      time: "3 hours ago",
      bp: "140/90",
      pulse: "80",
      temp: "98.8°F",
      oxygen: "97%"
    },
    nextMedicine: "16:00",
    allergies: "Sulfa drugs",
    emergencyContact: "+91 98765 43213",
    notes: "Blood sugar levels stabilizing"
  }
]

export default function StaffPatientsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<any>(null)

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'Critical':
        return <Badge className="bg-red-100 text-red-700">Critical</Badge>
      case 'Stable':
        return <Badge className="bg-green-100 text-green-700">Stable</Badge>
      case 'Good':
        return <Badge className="bg-blue-100 text-blue-700">Good</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{condition}</Badge>
    }
  }

  const filteredPatients = assignedPatients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.roomNumber.includes(searchQuery) ||
                         patient.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "critical") return matchesSearch && patient.condition === "Critical"
    if (activeTab === "stable") return matchesSearch && patient.condition === "Stable"
    if (activeTab === "good") return matchesSearch && patient.condition === "Good"
    
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/staff" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Patients</h1>
              <p className="text-sm text-gray-500">Patients assigned to your care</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {assignedPatients.length} Patients Assigned
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-900">{assignedPatients.length}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Patients</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {assignedPatients.filter(p => p.condition === 'Critical').length}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-xl">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Stable Patients</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {assignedPatients.filter(p => p.condition === 'Stable').length}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vitals Due</p>
                  <p className="text-3xl font-bold text-gray-900">5</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-xl">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Patient List</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Patients</TabsTrigger>
                <TabsTrigger value="critical">Critical</TabsTrigger>
                <TabsTrigger value="stable">Stable</TabsTrigger>
                <TabsTrigger value="good">Good</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                <div className="space-y-4">
                  {filteredPatients.map((patient) => (
                    <Card key={patient.id} className="border hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-16 w-16">
                              <AvatarFallback className="bg-green-100 text-green-700 text-lg">
                                {patient.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-xl font-semibold">{patient.name}</h3>
                              <p className="text-gray-600">
                                {patient.age}Y • {patient.gender} • Room {patient.roomNumber}
                              </p>
                              <p className="text-sm text-gray-500">
                                {patient.diagnosis} • Dr. {patient.doctor}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-600">Condition</p>
                              {getConditionBadge(patient.condition)}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Activity className="h-4 w-4 mr-2" />
                                Vitals
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                Details
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <Heart className="h-4 w-4 text-red-500" />
                              <span className="text-sm font-medium">Blood Pressure</span>
                            </div>
                            <p className="text-lg font-semibold">{patient.lastVitals.bp}</p>
                            <p className="text-xs text-gray-500">{patient.lastVitals.time}</p>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <Activity className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium">Pulse</span>
                            </div>
                            <p className="text-lg font-semibold">{patient.lastVitals.pulse} bpm</p>
                            <p className="text-xs text-gray-500">{patient.lastVitals.time}</p>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <Thermometer className="h-4 w-4 text-orange-500" />
                              <span className="text-sm font-medium">Temperature</span>
                            </div>
                            <p className="text-lg font-semibold">{patient.lastVitals.temp}</p>
                            <p className="text-xs text-gray-500">{patient.lastVitals.time}</p>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <Stethoscope className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium">Oxygen</span>
                            </div>
                            <p className="text-lg font-semibold">{patient.lastVitals.oxygen}</p>
                            <p className="text-xs text-gray-500">{patient.lastVitals.time}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Next Medicine: </span>
                            <span className="flex items-center">
                              <Pill className="h-4 w-4 mr-1 text-purple-500" />
                              {patient.nextMedicine}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Allergies: </span>
                            <span>{patient.allergies}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Emergency Contact: </span>
                            <span className="flex items-center">
                              <Phone className="h-4 w-4 mr-1 text-blue-500" />
                              {patient.emergencyContact}
                            </span>
                          </div>
                        </div>
                        
                        {patient.notes && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex items-start space-x-2">
                              <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                              <div>
                                <span className="font-medium text-gray-600">Notes: </span>
                                <span className="text-gray-700">{patient.notes}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
