"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Clock, User, Bed, Sparkles, Pill, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import PatientAdmissionForm from '@/components/admin/PatientAdmissionForm'
import PatientDischargeForm from '@/components/admin/PatientDischargeForm'

// Temporary stub for CleaningAssignmentForm to fix compile error
function CleaningAssignmentForm({ room, onAssignmentComplete }: { room: Room, onAssignmentComplete: () => void }) {
  return (
    <Button size="sm" variant="secondary" onClick={onAssignmentComplete}>
      <Sparkles className="mr-1 h-3 w-3" />
      Assign Cleaning
    </Button>
  )
}


interface Room {
  id: string
  name: string
  roomNumber: string
  type: 'General' | 'Semi-Private' | 'Private' | 'ICU' | 'Emergency'
  floor: number
  capacity: number
  currentOccupancy: number
  status: 'Available' | 'Occupied' | 'Under Maintenance' | 'Cleaning Required' | 'Cleaning In Progress'
  lastCleaned: string
  nextCleaningDue: string
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

interface CleaningTask {
  id: string
  roomId: string
  roomNumber: string
  assignedTo: string
  assignedDate: string
  completedDate?: string
  status: 'Pending' | 'In Progress' | 'Completed' | 'Verified'
  notes: string
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
}

export default function RoomManagementPage() {
  const [showCleaning, setShowCleaning] = useState(false)
  const [showAdmission, setShowAdmission] = useState(false)
  const [admitRoom, setAdmitRoom] = useState<Room | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [newRoom, setNewRoom] = useState<Partial<Room>>({
    name: '',
    roomNumber: '',
    type: 'General',
    floor: 1,
    capacity: 1,
    currentOccupancy: 0,
    status: 'Available',
    lastCleaned: '',
    nextCleaningDue: ''
  })
  const handleAddRoom = () => {
    if (!newRoom.name || !newRoom.roomNumber || !newRoom.type || !newRoom.floor || !newRoom.capacity) {
      toast({ title: 'All fields are required', variant: 'destructive' })
      return
    }
    const id = (rooms.length + 1).toString()
    setRooms([
      ...rooms,
      {
        id,
        name: newRoom.name!,
        roomNumber: newRoom.roomNumber!,
        type: newRoom.type as Room['type'],
        floor: Number(newRoom.floor),
        capacity: Number(newRoom.capacity),
        currentOccupancy: 0,
        status: newRoom.status as Room['status'],
        lastCleaned: newRoom.lastCleaned || '',
        nextCleaningDue: newRoom.nextCleaningDue || ''
      }
    ])
    setShowAddRoom(false)
    setNewRoom({
      name: '',
      roomNumber: '',
      type: 'General',
      floor: 1,
      capacity: 1,
      currentOccupancy: 0,
      status: 'Available',
      lastCleaned: '',
      nextCleaningDue: ''
    })
    toast({ title: 'Room added successfully!' })
  }
  const [patients, setPatients] = useState<Patient[]>([])
  // const [cleaningTasks, setCleaningTasks] = useState<CleaningTask[]>([])
  const [selectedTab, setSelectedTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const { toast } = useToast()

  // Mock data - replace with API calls
  useEffect(() => {
    // Mock rooms data
    const mockRooms: Room[] = [
      {
        id: '1',
        roomNumber: '101',
        type: 'General',
        floor: 1,
        capacity: 2,
        currentOccupancy: 1,
        status: 'Occupied',
        lastCleaned: '2024-01-10',
        nextCleaningDue: '2024-01-12',
        name: ''
      },
      {
        id: '2',
        roomNumber: '102',
        type: 'Private',
        floor: 1,
        capacity: 1,
        currentOccupancy: 0,
        status: 'Available',
        lastCleaned: '2024-01-11',
        nextCleaningDue: '2024-01-13',
        name: ''
      },
      {
        id: '3',
        roomNumber: '201',
        type: 'ICU',
        floor: 2,
        capacity: 1,
        currentOccupancy: 1,
        status: 'Occupied',
        lastCleaned: '2024-01-09',
        nextCleaningDue: '2024-01-11',
        name: ''
      },
      {
        id: '4',
        roomNumber: '202',
        type: 'Semi-Private',
        floor: 2,
        capacity: 2,
        currentOccupancy: 0,
        status: 'Cleaning Required',
        lastCleaned: '2024-01-08',
        nextCleaningDue: '2024-01-10',
        name: ''
      }
    ]

    // Mock patients data
    const mockPatients: Patient[] = [
      {
        id: '1',
        name: 'John Doe',
        admissionDate: '2024-01-08',
        expectedDischargeDate: '2024-01-15',
        roomId: '1',
        diagnosis: 'Pneumonia',
        medications: ['Amoxicillin', 'Paracetamol'],
        notes: 'Patient responding well to treatment',
        status: 'Admitted'
      },
      {
        id: '2',
        name: 'Jane Smith',
        admissionDate: '2024-01-09',
        expectedDischargeDate: '2024-01-16',
        roomId: '3',
        diagnosis: 'Heart Attack',
        medications: ['Aspirin', 'Nitroglycerin'],
        notes: 'Critical condition, monitoring required',
        status: 'Admitted'
      }
    ]

    setRooms(mockRooms)
    setPatients(mockPatients)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800'
      case 'Occupied': return 'bg-blue-100 text-blue-800'
      case 'Under Maintenance': return 'bg-yellow-100 text-yellow-800'
      case 'Cleaning Required': return 'bg-red-100 text-red-800'
      case 'Cleaning In Progress': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }



  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus
    const matchesType = filterType === 'all' || room.type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const getRoomOccupancy = (roomId: string) => {
    return patients.filter(p => p.roomId === roomId && p.status === 'Admitted')
  }

  const handleAdmitPatient = (roomId: string) => {
    // This will be handled by the PatientAdmissionForm component
  }

  const handleDischargePatient = (patientId: string) => {
    // This will be handled by the PatientDischargeForm component
  }



  const refreshData = () => {
    // Refresh data after operations
    // In a real app, this would refetch from API
    window.location.reload()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Room Management</h1>
          <p className="text-muted-foreground">
            Manage patient admissions, room allocations, and cleaning schedules
          </p>
        </div>
        <Dialog open={showAddRoom} onOpenChange={setShowAddRoom}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowAddRoom(true)}>
              <Bed className="mr-2 h-4 w-4" />
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
              <div>
                <label className="block text-sm font-medium mb-1">Floor</label>
                <Input type="number" placeholder="Floor" value={newRoom.floor} onChange={e => setNewRoom({ ...newRoom, floor: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacity</label>
                <Input type="number" placeholder="Capacity" value={newRoom.capacity} onChange={e => setNewRoom({ ...newRoom, capacity: Number(e.target.value) })} />
              </div>
              <Select value={newRoom.status} onValueChange={val => setNewRoom({ ...newRoom, status: val as Room['status'] })}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Occupied">Occupied</SelectItem>
                  <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                  <SelectItem value="Cleaning Required">Cleaning Required</SelectItem>
                  <SelectItem value="Cleaning In Progress">Cleaning In Progress</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Last Cleaned (YYYY-MM-DD)" value={newRoom.lastCleaned} onChange={e => setNewRoom({ ...newRoom, lastCleaned: e.target.value })} />
              <Input placeholder="Next Cleaning Due (YYYY-MM-DD)" value={newRoom.nextCleaningDue} onChange={e => setNewRoom({ ...newRoom, nextCleaningDue: e.target.value })} />
              <Button onClick={handleAddRoom}>Add Room</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.length}</div>
            <p className="text-xs text-muted-foreground">
              {rooms.filter(r => r.status === 'Available').length} available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied Rooms</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rooms.filter(r => r.status === 'Occupied').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {patients.filter(p => p.status === 'Admitted').length} patients
            </p>
          </CardContent>
        </Card>
  {/* Cleaning Required card removed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rooms.filter(r => r.status === 'Under Maintenance').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Temporarily unavailable
            </p>
          </CardContent>
        </Card>
      </div>

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
          <div className="flex items-center space-x-2">
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
                <SelectItem value="Cleaning Required">Cleaning Required</SelectItem>
                <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
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

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                      Floor {room.floor} • {room.type} • {room.currentOccupancy}/{room.capacity} occupied
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
                    
                    <div className="text-sm text-muted-foreground">
                      <p>Last cleaned: {room.lastCleaned}</p>
                      <p>Next cleaning: {room.nextCleaningDue}</p>
                    </div>

                    <div className="flex space-x-2">
                      {room.status === 'Available' && (
                        <PatientAdmissionForm 
                          room={room} 
                          onAdmissionComplete={refreshData}
                        />
                      )}
                      {room.status === 'Cleaning Required' && (
                        <CleaningAssignmentForm 
                          room={room} 
                          onAssignmentComplete={refreshData}
                        />
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
                <PatientAdmissionForm 
                  room={undefined} 
                  onAdmissionComplete={() => { setShowAdmission(false); refreshData(); }} 
                />
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
                          Room {room?.roomNumber} • {patient.diagnosis}
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
                          <PatientDischargeForm 
                            patient={patient} 
                            onDischargeComplete={refreshData}
                          />
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
    </div>
  )
}
