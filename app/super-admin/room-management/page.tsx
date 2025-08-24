"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
// Sidebar removed for full-width layout
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Heart, AlertTriangle, UserCog, Settings, FileText, Bell, LogOut, Shield, Bed, User, Pill, Plus, CheckCircle } from 'lucide-react'

// Interfaces
interface Room {
  id: string
  name: string
  roomNumber: string
  type: 'General' | 'Semi-Private' | 'Private' | 'ICU' | 'Emergency'
  floor: number
  capacity: number
  currentOccupancy: number
  status: 'Available' | 'Occupied' | 'Under Maintenance' | 'Cleaning Required'
  hospital: string
  price: number
}

interface Patient {
  id: string
  name: string
  admissionDate: string
  expectedDischargeDate: string
  actualDischargeDate?: string
  roomId: string
  diagnosis: string
  medications: string[]
  notes: string
  status: 'Admitted' | 'Discharged' | 'Transferred'
}

// Mock data for room management across all hospitals
const hospitals = [
  { id: 1, name: 'General Hospital', location: 'Mumbai', totalRooms: 150, occupiedRooms: 120 },
  { id: 2, name: 'City Medical Center', location: 'Delhi', totalRooms: 200, occupiedRooms: 180 },
  { id: 3, name: 'Regional Healthcare', location: 'Bangalore', totalRooms: 100, occupiedRooms: 85 },
  { id: 4, name: 'Metro Hospital', location: 'Chennai', totalRooms: 120, occupiedRooms: 95 },
  { id: 5, name: 'Community Care', location: 'Kolkata', totalRooms: 80, occupiedRooms: 65 }
]

const mockRooms: Room[] = [
  { id: '1', name: 'General Ward 101', roomNumber: '101', type: 'General', floor: 1, capacity: 4, currentOccupancy: 3, status: 'Occupied', hospital: 'General Hospital', price: 500 },
  { id: '2', name: 'Private Room 102', roomNumber: '102', type: 'Private', floor: 1, capacity: 1, currentOccupancy: 0, status: 'Available', hospital: 'General Hospital', price: 2000 },
  { id: '3', name: 'ICU 201', roomNumber: '201', type: 'ICU', floor: 2, capacity: 1, currentOccupancy: 1, status: 'Occupied', hospital: 'City Medical Center', price: 5000 },
  { id: '4', name: 'Semi-Private 202', roomNumber: '202', type: 'Semi-Private', floor: 2, capacity: 2, currentOccupancy: 0, status: 'Cleaning Required', hospital: 'City Medical Center', price: 1000 },
  { id: '5', name: 'Emergency OT', roomNumber: '301', type: 'Emergency', floor: 3, capacity: 0, currentOccupancy: 0, status: 'Available', hospital: 'Regional Healthcare', price: 0 },
  { id: '6', name: 'General Ward 302', roomNumber: '302', type: 'General', floor: 3, capacity: 4, currentOccupancy: 2, status: 'Occupied', hospital: 'Regional Healthcare', price: 500 },
  { id: '7', name: 'Private Room 401', roomNumber: '401', type: 'Private', floor: 4, capacity: 1, currentOccupancy: 0, status: 'Available', hospital: 'Metro Hospital', price: 2000 },
  { id: '8', name: 'ICU 402', roomNumber: '402', type: 'ICU', floor: 4, capacity: 1, currentOccupancy: 1, status: 'Occupied', hospital: 'Metro Hospital', price: 5000 }
]

const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'John Doe',
    admissionDate: '2024-01-15',
    expectedDischargeDate: '2024-01-22',
    roomId: '1',
    diagnosis: 'Pneumonia',
    medications: ['Amoxicillin', 'Paracetamol'],
    notes: 'Patient responding well to treatment',
    status: 'Admitted'
  },
  {
    id: '2',
    name: 'Jane Smith',
    admissionDate: '2024-01-20',
    expectedDischargeDate: '2024-01-27',
    roomId: '3',
    diagnosis: 'Heart Attack',
    medications: ['Aspirin', 'Nitroglycerin'],
    notes: 'Critical condition, monitoring required',
    status: 'Admitted'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    admissionDate: '2024-01-18',
    expectedDischargeDate: '2024-01-25',
    roomId: '6',
    diagnosis: 'Diabetes Management',
    medications: ['Insulin', 'Metformin'],
    notes: 'Stable condition, regular monitoring',
    status: 'Admitted'
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    admissionDate: '2024-01-22',
    expectedDischargeDate: '2024-01-29',
    roomId: '8',
    diagnosis: 'Post-Surgery Recovery',
    medications: ['Painkillers', 'Antibiotics'],
    notes: 'Recovering well from surgery',
    status: 'Admitted'
  }
]

// Sidebar navigation removed for full-width layout

export default function RoomManagementPage() {
  // State
  const [notifications] = useState(5)
  const [searchTerm, setSearchTerm] = useState("")
  const [rooms, setRooms] = useState<Room[]>(mockRooms)
  const [patients, setPatients] = useState<Patient[]>(mockPatients)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedTab, setSelectedTab] = useState<string>('overview')
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [showAdmission, setShowAdmission] = useState(false)
  const [newRoom, setNewRoom] = useState<Room>({
    id: "",
    name: "",
    roomNumber: "",
    type: 'General',
    floor: 1,
    capacity: 1,
    currentOccupancy: 0,
    status: 'Available',
    hospital: hospitals[0].name,
    price: 0,
  })

  // Derived values
  const totalRooms = rooms.length
  const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length
  const maintenanceRooms = rooms.filter(r => r.status === 'Under Maintenance').length
  const availableRooms = rooms.filter(r => r.status === 'Available').length

  const filteredRooms = rooms.filter(r => {
    const matchesSearch = `${r.name} ${r.roomNumber} ${r.hospital} ${r.type}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || r.status === (filterStatus as Room['status'])
    const matchesType = filterType === 'all' || r.type === (filterType as Room['type'])
    return matchesSearch && matchesStatus && matchesType
  })

  // Helpers
  function getRoomOccupancy(roomId: string) {
    return patients.filter(p => p.roomId === roomId && p.status === 'Admitted')
  }

  function getStatusColor(status: Room['status']) {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-700'
      case 'Occupied':
        return 'bg-blue-100 text-blue-700'
      case 'Under Maintenance':
        return 'bg-yellow-100 text-yellow-700'
      case 'Cleaning Required':
        return 'bg-red-100 text-red-700'
      default:
        return ''
    }
  }

  function handleAddRoom() {
    if (!newRoom.name || !newRoom.roomNumber) return
    const id = `${Date.now()}`
    const room: Room = { ...newRoom, id }
    setRooms(prev => [...prev, room])
    setShowAddRoom(false)
    setNewRoom({
      id: "",
      name: "",
      roomNumber: "",
      type: 'General',
      floor: 1,
      capacity: 1,
      currentOccupancy: 0,
      status: 'Available',
      hospital: hospitals[0].name,
      price: 0,
    })
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      {/* Top Navigation (Full Width) */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-2 rounded-xl">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Room Management</h1>
              <p className="text-sm text-gray-500">Manage rooms across all hospitals</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="relative hover:bg-pink-50">
                <Bell className="h-5 w-5 text-gray-600" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>
            </div>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-pink-50">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback className="bg-pink-100 text-pink-700">SA</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Super Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserCog className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  System Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Shield className="mr-2 h-4 w-4" />
                  Security
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Full-width Content */}
      <main className="mx-auto w-full p-6 space-y-8">
        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              <Bed className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRooms}</div>
              <p className="text-xs text-muted-foreground">
                {availableRooms} available across {hospitals.length} hospitals
              </p>
            </CardContent>
          </Card>

          <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupied Rooms</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{occupiedRooms}</div>
              <p className="text-xs text-muted-foreground">
                {patients.filter(p => p.status === 'Admitted').length} patients
              </p>
            </CardContent>
          </Card>

          <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{maintenanceRooms}</div>
              <p className="text-xs text-muted-foreground">
                Temporarily unavailable
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Room Management with Tabs */}
        <Card className="border-pink-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Room Management</span>
              <Dialog open={showAddRoom} onOpenChange={setShowAddRoom}>
                <DialogTrigger asChild>
                  <Button onClick={() => setShowAddRoom(true)} className="bg-pink-500 hover:bg-pink-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Room
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Room</DialogTitle>
                    <DialogDescription>Enter details for the new room.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Input placeholder="Room Name" value={newRoom.name} onChange={e => setNewRoom({ ...newRoom, name: e.target.value })} />
                    <Input placeholder="Room Number" value={newRoom.roomNumber} onChange={e => setNewRoom({ ...newRoom, roomNumber: e.target.value })} />
                    <Select value={newRoom.type} onValueChange={val => setNewRoom({ ...newRoom, type: val as Room['type'] })}>
                      <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Semi-Private">Semi-Private</SelectItem>
                        <SelectItem value="Private">Private</SelectItem>
                        <SelectItem value="ICU">ICU</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={newRoom.hospital} onValueChange={val => setNewRoom({ ...newRoom, hospital: val })}>
                      <SelectTrigger><SelectValue placeholder="Hospital" /></SelectTrigger>
                      <SelectContent>
                        {hospitals.map(hospital => (
                          <SelectItem key={hospital.id} value={hospital.name}>
                            {hospital.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div>
                      <label className="block text-sm font-medium mb-1">Floor</label>
                      <Input type="number" placeholder="Floor" value={newRoom.floor} onChange={e => setNewRoom({ ...newRoom, floor: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Capacity</label>
                      <Input type="number" placeholder="Capacity" value={newRoom.capacity} onChange={e => setNewRoom({ ...newRoom, capacity: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Price/Day</label>
                      <Input type="number" placeholder="Price" value={newRoom.price} onChange={e => setNewRoom({ ...newRoom, price: Number(e.target.value) })} />
                    </div>
                    <Select value={newRoom.status} onValueChange={val => setNewRoom({ ...newRoom, status: val as Room['status'] })}>
                      <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Occupied">Occupied</SelectItem>
                        <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddRoom} className="w-full bg-pink-500 hover:bg-pink-600">Add Room</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="rooms">Rooms</TabsTrigger>
                <TabsTrigger value="patients">Patients</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Admissions</CardTitle>
                      <CardDescription>Latest patient admissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {patients.slice(0, 3).map(patient => (
                          <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{patient.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Room {rooms.find(r => r.id === patient.roomId)?.roomNumber} • {patient.diagnosis}
                              </p>
                            </div>
                            <Badge variant="outline">{patient.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Rooms Tab */}
              <TabsContent value="rooms" className="space-y-4">
                <div className="flex items-center flex-wrap gap-2">
                  <Input
                    placeholder="Search rooms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Occupied">Occupied</SelectItem>
                      <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                      <SelectItem value="Cleaning Required">Cleaning Required</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                      <SelectItem value="Semi-Private">Semi-Private</SelectItem>
                      <SelectItem value="ICU">ICU</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {filteredRooms.map(room => {
                    const roomPatients = getRoomOccupancy(room.id)
                    return (
                      <Card key={room.id} className="relative">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">Room {room.roomNumber}</CardTitle>
                            <Badge className={getStatusColor(room.status)}>{room.status}</Badge>
                          </div>
                          <CardDescription>
                            {room.hospital} • Floor {room.floor} • {room.type} • {room.currentOccupancy}/{room.capacity} occupied
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {roomPatients.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Current Patients:</p>
                              {roomPatients.map(patient => (
                                <div key={patient.id} className="p-2 bg-blue-50 rounded border">
                                  <p className="font-medium text-sm">{patient.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {patient.diagnosis} • Admitted {patient.admissionDate}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex space-x-2">
                            {room.status === 'Available' && (
                              <Button size="sm" variant="outline">
                                <User className="mr-1 h-3 w-3" />
                                Admit Patient
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <FileText className="mr-1 h-3 w-3" />
                              Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              {/* Patients Tab */}
              <TabsContent value="patients" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Patient Admissions</h3>
                  <Dialog open={showAdmission} onOpenChange={setShowAdmission}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setShowAdmission(true)}>
                        <User className="mr-2 h-4 w-4" />
                        New Admission
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>New Patient Admission</DialogTitle>
                        <DialogDescription>Admit a new patient to a room.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3">
                        <Input placeholder="Patient Name" />
                        <Input placeholder="Diagnosis" />
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Room" />
                          </SelectTrigger>
                          <SelectContent>
                            {rooms.filter(r => r.status === 'Available').map(room => (
                              <SelectItem key={room.id} value={room.id}>
                                Room {room.roomNumber} - {room.hospital}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Textarea placeholder="Notes" />
                        <Button className="w-full">Admit Patient</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-4">
                  {patients.map(patient => {
                    const room = rooms.find(r => r.id === patient.roomId)
                    return (
                      <Card key={patient.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <h4 className="text-lg font-medium">{patient.name}</h4>
                                <Badge variant={patient.status === 'Admitted' ? 'default' : 'secondary'}>
                                  {patient.status}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground">
                                Room {room?.roomNumber} • {room?.hospital} • {patient.diagnosis}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>Admitted: {patient.admissionDate}</span>
                                <span>Expected Discharge: {patient.expectedDischargeDate}</span>
                                {patient.actualDischargeDate && (
                                  <span>Actual Discharge: {patient.actualDischargeDate}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {patient.status === 'Admitted' && (
                                <Button size="sm" variant="outline">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Discharge
                                </Button>
                              )}
                              <Button size="sm" variant="outline">
                                <FileText className="mr-1 h-3 w-3" />
                                View Details
                              </Button>
                            </div>
                          </div>

                          {patient.medications.length > 0 && (
                            <div className="mt-4 p-3 bg-yellow-50 rounded border">
                              <p className="text-sm font-medium mb-2">Medications:</p>
                              <div className="flex flex-wrap gap-2">
                                {patient.medications.map((med, index) => (
                                  <Badge key={index} variant="outline" className="bg-white">
                                    <Pill className="mr-1 h-3 w-3" />
                                    {med}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {patient.notes && (
                            <div className="mt-4 p-3 bg-blue-50 rounded border">
                              <p className="text-sm font-medium mb-1">Notes:</p>
                              <p className="text-sm text-muted-foreground">{patient.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
