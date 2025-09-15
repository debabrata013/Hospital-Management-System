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
import { Calendar, Clock, User, Bed, Pill, FileText, AlertCircle, CheckCircle, XCircle, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import PatientAdmissionForm from '@/components/admin/PatientAdmissionForm'
import PatientDischargeForm from '@/components/admin/PatientDischargeForm'
import CleaningManagement from '@/components/admin/CleaningManagement'
import AssignCleaningButton from '@/components/admin/AssignCleaningButton'


interface Room {
  id: string
  name: string
  roomNumber: string
  type: 'General' | 'Semi-Private' | 'Private' | 'ICU' | 'Emergency'
  floor: number
  capacity: number
  currentOccupancy: number
  status: 'Available' | 'Occupied' | 'Under Maintenance' | 'Cleaning Required'
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



export default function RoomManagementPage() {

  const [showAdmission, setShowAdmission] = useState(false)
  const [admitRoom, setAdmitRoom] = useState<Room | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [newRoom, setNewRoom] = useState<Partial<Room>>({
    name: '',
    roomNumber: '',
    type: 'General',
    floor: 1,
    capacity: 1,
    currentOccupancy: 0,
    status: 'Available'
  })
  const handleAddRoom = async () => {
    if (!newRoom.roomNumber || !newRoom.type || !newRoom.floor || !newRoom.capacity) {
      toast({ title: 'Room number, type, floor, capacity are required', variant: 'destructive' })
      return
    }
    try {
      const res = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createRoom',
          roomNumber: newRoom.roomNumber,
          roomName: newRoom.name || '',
          roomType: newRoom.type,
          floor: Number(newRoom.floor),
          capacity: Number(newRoom.capacity),
          dailyRate: 0,
          description: ''
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Failed to create room')
      }
      setShowAddRoom(false)
      setNewRoom({ name: '', roomNumber: '', type: 'General', floor: 1, capacity: 1, currentOccupancy: 0, status: 'Available' })
      await fetchRooms()
      toast({ title: 'Room added successfully!' })
    } catch (e: any) {
      toast({ title: e.message || 'Failed to add room', variant: 'destructive' })
    }
  }
  const [patients, setPatients] = useState<Patient[]>([])
  const [loadingPatients, setLoadingPatients] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const { toast } = useToast()
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsRoom, setDetailsRoom] = useState<Room | null>(null)

  async function fetchRooms() {
    try {
      setLoadingRooms(true)
      const res = await fetch('/api/admin/rooms', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load rooms')
      const data = await res.json()
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const mapped: Room[] = list.map((r: any) => ({
        id: String(r.id),
        name: r.room_name || '',
        roomNumber: r.room_number,
        type: (r.room_type || 'General'),
        floor: Number(r.floor || 0),
        capacity: Number(r.capacity || 0),
        currentOccupancy: Number(r.current_occupancy || 0),
        status: r.status || 'Available'
      }))
      setRooms(mapped)
    } catch (e) {
      console.error(e)
      toast({ title: 'Unable to load rooms', variant: 'destructive' })
    } finally {
      setLoadingRooms(false)
    }
  }

  useEffect(() => {
    fetchRooms()
    fetchAdmissions()
  }, [])

  async function fetchAdmissions() {
    try {
      setLoadingPatients(true)
      const res = await fetch('/api/admin/room-assignments?status=Active', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load admissions')
      const data = await res.json()
      const mapped: Patient[] = (Array.isArray(data) ? data : []).map((row: any) => ({
        id: String(row.id),
        name: row.patient_name || row.name || 'Unknown',
        admissionDate: row.admission_date ? String(row.admission_date).slice(0,10) : '',
        expectedDischargeDate: row.expected_discharge_date ? String(row.expected_discharge_date).slice(0,10) : '',
        actualDischargeDate: row.actual_discharge_date ? String(row.actual_discharge_date).slice(0,10) : undefined,
        roomId: String(row.room_id),
        diagnosis: row.diagnosis || '',
        medications: [],
        notes: row.notes || '',
        status: 'Admitted'
      }))
      setPatients(mapped)
    } catch (e) {
      console.error(e)
      toast({ title: 'Unable to load admissions', variant: 'destructive' })
    } finally {
      setLoadingPatients(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800'
      case 'Occupied': return 'bg-blue-100 text-blue-800'
      case 'Under Maintenance': return 'bg-yellow-100 text-yellow-800'
      case 'Cleaning Required': return 'bg-red-100 text-red-800'
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
    fetchRooms()
    fetchAdmissions()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Room Management</h1>
          <p className="text-muted-foreground">
            Manage patient admissions and room allocations
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
                </SelectContent>
              </Select>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Cleaning</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rooms.filter(r => r.status === 'Cleaning Required').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require cleaning
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="cleaning">Cleaning</TabsTrigger>
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
                    


                                         <div className="flex space-x-2">
                       {room.status === 'Available' && (
                         <PatientAdmissionForm 
                           room={room} 
                           onAdmissionComplete={refreshData}
                         />
                       )}
                       {room.status === 'Cleaning Required' && (
                         <AssignCleaningButton 
                           room={room} 
                           onCleaningAssigned={refreshData}
                         />
                       )}
                       <Button size="sm" variant="outline" onClick={() => { setDetailsRoom(room); setDetailsOpen(true) }}>
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

        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Room Details</DialogTitle>
              <DialogDescription>Current information for this room.</DialogDescription>
            </DialogHeader>
            {detailsRoom && (
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Room:</span> {detailsRoom.roomNumber} ({detailsRoom.type})</div>
                <div><span className="font-medium">Floor:</span> {detailsRoom.floor}</div>
                <div><span className="font-medium">Capacity:</span> {detailsRoom.capacity}</div>
                <div><span className="font-medium">Occupied:</span> {detailsRoom.currentOccupancy}</div>
                <div><span className="font-medium">Status:</span> {detailsRoom.status}</div>
                <div className="mt-3">
                  <p className="font-medium mb-1">Patients in this room:</p>
                  {getRoomOccupancy(detailsRoom.id).length === 0 ? (
                    <p className="text-muted-foreground">No active admissions</p>
                  ) : (
                    <ul className="list-disc pl-5 space-y-1">
                      {getRoomOccupancy(detailsRoom.id).map(p => (
                        <li key={p.id}>{p.name} — {p.diagnosis} (Admitted {p.admissionDate})</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

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

        {/* Cleaning Tab */}
        <TabsContent value="cleaning" className="space-y-4">
          <CleaningManagement 
            rooms={rooms} 
            onCleaningComplete={refreshData}
          />
        </TabsContent>

      </Tabs>
    </div>
  )
}
