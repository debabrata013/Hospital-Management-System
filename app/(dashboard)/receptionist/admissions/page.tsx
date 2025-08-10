"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  Bed,
  UserPlus,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Stethoscope,
  Activity,
  Heart,
  Thermometer
} from 'lucide-react'

// Mock data for admissions
const currentAdmissions = [
  {
    id: "ADM001",
    patientId: "P001",
    patientName: "Ram Sharma",
    age: 45,
    gender: "Male",
    roomNumber: "101",
    bedNumber: "A1",
    ward: "General Ward",
    admissionDate: "2024-01-08",
    admissionTime: "10:30 AM",
    doctor: "Dr. Anil Kumar",
    department: "General Medicine",
    condition: "Stable",
    status: "admitted",
    emergencyContact: "+91 98765 43210",
    diagnosis: "Hypertension monitoring",
    estimatedDischarge: "2024-01-10"
  },
  {
    id: "ADM002",
    patientId: "P002",
    patientName: "Sunita Devi",
    age: 32,
    gender: "Female",
    roomNumber: "205",
    bedNumber: "B2",
    ward: "Maternity Ward",
    admissionDate: "2024-01-07",
    admissionTime: "08:15 AM",
    doctor: "Dr. Priya Singh",
    department: "Gynecology",
    condition: "Good",
    status: "admitted",
    emergencyContact: "+91 98765 43211",
    diagnosis: "Post-delivery care",
    estimatedDischarge: "2024-01-09"
  },
  {
    id: "ADM003",
    patientId: "P003",
    patientName: "Ajay Kumar",
    age: 28,
    gender: "Male",
    roomNumber: "ICU-1",
    bedNumber: "I1",
    ward: "ICU",
    admissionDate: "2024-01-08",
    admissionTime: "02:45 PM",
    doctor: "Dr. Rajesh Gupta",
    department: "Emergency",
    condition: "Critical",
    status: "admitted",
    emergencyContact: "+91 98765 43212",
    diagnosis: "Accident trauma",
    estimatedDischarge: "TBD"
  }
]

const availableRooms = [
  { roomNumber: "102", ward: "General Ward", bedCount: 4, availableBeds: 2, type: "Shared" },
  { roomNumber: "103", ward: "General Ward", bedCount: 2, availableBeds: 1, type: "Semi-Private" },
  { roomNumber: "201", ward: "Private Ward", bedCount: 1, availableBeds: 1, type: "Private" },
  { roomNumber: "301", ward: "ICU", bedCount: 1, availableBeds: 0, type: "ICU" },
  { roomNumber: "401", ward: "Pediatric Ward", bedCount: 6, availableBeds: 3, type: "Pediatric" }
]

const dischargeRequests = [
  {
    id: "DIS001",
    patientName: "Mohan Lal",
    roomNumber: "104",
    doctor: "Dr. Anil Kumar",
    admissionDate: "2024-01-05",
    requestedBy: "Dr. Anil Kumar",
    requestTime: "11:30 AM",
    status: "pending",
    finalBill: 15000,
    clearances: {
      medical: true,
      billing: false,
      pharmacy: true,
      nursing: true
    }
  },
  {
    id: "DIS002",
    patientName: "Kavita Singh",
    roomNumber: "206",
    doctor: "Dr. Priya Singh",
    admissionDate: "2024-01-06",
    requestedBy: "Dr. Priya Singh",
    requestTime: "09:15 AM",
    status: "ready",
    finalBill: 8500,
    clearances: {
      medical: true,
      billing: true,
      pharmacy: true,
      nursing: true
    }
  }
]

export default function AdmissionsPage() {
  const [activeTab, setActiveTab] = useState("current")
  const [newAdmissionDialog, setNewAdmissionDialog] = useState(false)
  const [dischargeDialog, setDischargeDialog] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'admitted':
        return <Badge className="bg-green-100 text-green-700">Admitted</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
      case 'ready':
        return <Badge className="bg-blue-100 text-blue-700">Ready for Discharge</Badge>
      case 'discharged':
        return <Badge className="bg-gray-100 text-gray-700">Discharged</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

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

  const getClearanceIcon = (cleared: boolean) => {
    return cleared ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/receptionist" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Patient Admissions</h1>
              <p className="text-sm text-gray-500">Manage patient admissions and discharges</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              size="sm" 
              className="bg-blue-500 hover:bg-blue-600"
              onClick={() => setNewAdmissionDialog(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              New Admission
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Admissions</p>
                  <p className="text-3xl font-bold text-gray-900">{currentAdmissions.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Bed className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Beds</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {availableRooms.reduce((sum, room) => sum + room.availableBeds, 0)}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Discharges</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dischargeRequests.filter(d => d.status === 'pending').length}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-xl">
                  <Clock className="h-8 w-8 text-yellow-600" />
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
                    {currentAdmissions.filter(a => a.condition === 'Critical').length}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-xl">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="current">Current Admissions</TabsTrigger>
            <TabsTrigger value="rooms">Room Management</TabsTrigger>
            <TabsTrigger value="discharge">Discharge Requests</TabsTrigger>
            <TabsTrigger value="history">Admission History</TabsTrigger>
          </TabsList>

          {/* Current Admissions Tab */}
          <TabsContent value="current" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Current Patient Admissions</CardTitle>
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
                <div className="space-y-4">
                  {currentAdmissions.map((admission) => (
                    <div key={admission.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {admission.patientName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">{admission.patientName}</h3>
                            <p className="text-sm text-gray-600">
                              {admission.age}Y • {admission.gender} • ID: {admission.patientId}
                            </p>
                            <p className="text-sm text-gray-500">
                              Room {admission.roomNumber} • Bed {admission.bedNumber} • {admission.ward}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Doctor</p>
                            <p className="text-sm">{admission.doctor}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Admitted</p>
                            <p className="text-sm">{admission.admissionDate}</p>
                            <p className="text-xs text-gray-500">{admission.admissionTime}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Condition</p>
                            {getConditionBadge(admission.condition)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedPatient(admission)
                                setDischargeDialog(true)
                              }}
                            >
                              Discharge
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Diagnosis: </span>
                            <span>{admission.diagnosis}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Emergency Contact: </span>
                            <span>{admission.emergencyContact}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Est. Discharge: </span>
                            <span>{admission.estimatedDischarge}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Room Management Tab */}
          <TabsContent value="rooms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Room & Bed Availability</CardTitle>
                <CardDescription>Current room occupancy and availability status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableRooms.map((room) => (
                    <Card key={room.roomNumber} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">Room {room.roomNumber}</h3>
                          <Badge className={room.availableBeds > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                            {room.availableBeds > 0 ? 'Available' : 'Full'}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Ward:</span> {room.ward}</p>
                          <p><span className="font-medium">Type:</span> {room.type}</p>
                          <p><span className="font-medium">Beds:</span> {room.availableBeds}/{room.bedCount} available</p>
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(room.availableBeds / room.bedCount) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discharge Requests Tab */}
          <TabsContent value="discharge" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Discharge Requests</CardTitle>
                <CardDescription>Patients ready for discharge processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dischargeRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{request.patientName}</h3>
                          <p className="text-sm text-gray-600">
                            Room {request.roomNumber} • {request.doctor}
                          </p>
                          <p className="text-sm text-gray-500">
                            Admitted: {request.admissionDate} • Requested: {request.requestTime}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">₹{request.finalBill.toLocaleString()}</p>
                          {getStatusBadge(request.status)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          {getClearanceIcon(request.clearances.medical)}
                          <span className="text-sm">Medical Clearance</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getClearanceIcon(request.clearances.billing)}
                          <span className="text-sm">Billing Clearance</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getClearanceIcon(request.clearances.pharmacy)}
                          <span className="text-sm">Pharmacy Clearance</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getClearanceIcon(request.clearances.nursing)}
                          <span className="text-sm">Nursing Clearance</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {request.status === 'ready' && (
                          <Button size="sm" className="bg-green-500 hover:bg-green-600">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Process Discharge
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admission History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admission History</CardTitle>
                <CardDescription>Historical admission and discharge records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Admission history will be displayed here</p>
                  <p className="text-sm text-gray-500 mt-2">Search and filter past admissions and discharges</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* New Admission Dialog */}
      <Dialog open={newAdmissionDialog} onOpenChange={setNewAdmissionDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>New Patient Admission</DialogTitle>
            <DialogDescription>
              Admit a patient to the hospital and assign room/bed
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientSearch">Search Patient</Label>
                <Input id="patientSearch" placeholder="Search by name or ID" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admissionType">Admission Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select admission type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctor">Attending Doctor</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dr-anil">Dr. Anil Kumar</SelectItem>
                    <SelectItem value="dr-priya">Dr. Priya Singh</SelectItem>
                    <SelectItem value="dr-rajesh">Dr. Rajesh Gupta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Medicine</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="gynecology">Gynecology</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ward">Ward</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Ward</SelectItem>
                    <SelectItem value="private">Private Ward</SelectItem>
                    <SelectItem value="icu">ICU</SelectItem>
                    <SelectItem value="maternity">Maternity Ward</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">Room Number</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="101">Room 101</SelectItem>
                    <SelectItem value="102">Room 102</SelectItem>
                    <SelectItem value="201">Room 201</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bed">Bed Number</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A1">Bed A1</SelectItem>
                    <SelectItem value="A2">Bed A2</SelectItem>
                    <SelectItem value="B1">Bed B1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis">Initial Diagnosis</Label>
              <Textarea id="diagnosis" placeholder="Enter initial diagnosis or reason for admission" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Admission Notes</Label>
              <Textarea id="notes" placeholder="Additional notes or special instructions" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewAdmissionDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600">
              Admit Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discharge Dialog */}
      <Dialog open={dischargeDialog} onOpenChange={setDischargeDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Patient Discharge</DialogTitle>
            <DialogDescription>
              Process patient discharge and complete all clearances
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold">{selectedPatient.patientName}</h3>
                <p className="text-sm text-gray-600">
                  Room {selectedPatient.roomNumber} • {selectedPatient.doctor}
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Discharge Clearances</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span>Medical Clearance</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span>Billing Clearance</span>
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span>Pharmacy Clearance</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span>Nursing Clearance</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dischargeNotes">Discharge Notes</Label>
                <Textarea id="dischargeNotes" placeholder="Enter discharge summary and instructions" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDischargeDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-red-500 hover:bg-red-600">
              Process Discharge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
