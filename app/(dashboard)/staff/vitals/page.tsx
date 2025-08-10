"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  Activity,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Heart,
  Thermometer,
  Stethoscope,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react'

// Mock data for vitals
const vitalsHistory = [
  {
    id: "V001",
    patientId: "P001",
    patientName: "Ram Sharma",
    roomNumber: "101",
    recordedAt: "2024-01-15T14:30:00Z",
    recordedBy: "Staff Nurse",
    vitals: {
      bloodPressure: "130/85",
      pulse: "78",
      temperature: "98.6",
      oxygenSaturation: "98",
      respiratoryRate: "16",
      weight: "70",
      height: "170"
    },
    status: "Normal",
    notes: "Patient stable, responding well to medication"
  },
  {
    id: "V002",
    patientId: "P003",
    patientName: "Ajay Kumar",
    roomNumber: "ICU-1",
    recordedAt: "2024-01-15T14:00:00Z",
    recordedBy: "Staff Nurse",
    vitals: {
      bloodPressure: "110/70",
      pulse: "95",
      temperature: "99.2",
      oxygenSaturation: "95",
      respiratoryRate: "20",
      weight: "65",
      height: "175"
    },
    status: "Critical",
    notes: "Elevated temperature and pulse, continuous monitoring required"
  },
  {
    id: "V003",
    patientId: "P002",
    patientName: "Sunita Devi",
    roomNumber: "205",
    recordedAt: "2024-01-15T13:30:00Z",
    recordedBy: "Staff Nurse",
    vitals: {
      bloodPressure: "120/80",
      pulse: "72",
      temperature: "98.4",
      oxygenSaturation: "99",
      respiratoryRate: "14",
      weight: "55",
      height: "160"
    },
    status: "Good",
    notes: "All vitals within normal range, recovery progressing well"
  }
]

const pendingVitals = [
  {
    id: "PV001",
    patientId: "P001",
    patientName: "Ram Sharma",
    roomNumber: "101",
    dueTime: "15:00",
    frequency: "Every 4 hours",
    priority: "normal",
    lastRecorded: "2 hours ago"
  },
  {
    id: "PV002",
    patientId: "P003",
    patientName: "Ajay Kumar",
    roomNumber: "ICU-1",
    dueTime: "14:30",
    frequency: "Every 2 hours",
    priority: "high",
    lastRecorded: "30 minutes ago"
  },
  {
    id: "PV003",
    patientId: "P004",
    patientName: "Geeta Sharma",
    roomNumber: "102",
    dueTime: "16:00",
    frequency: "Every 6 hours",
    priority: "normal",
    lastRecorded: "4 hours ago"
  }
]

export default function StaffVitalsPage() {
  const [activeTab, setActiveTab] = useState("pending")
  const [newVitalsDialog, setNewVitalsDialog] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Critical':
        return <Badge className="bg-red-100 text-red-700">Critical</Badge>
      case 'Normal':
        return <Badge className="bg-green-100 text-green-700">Normal</Badge>
      case 'Good':
        return <Badge className="bg-blue-100 text-blue-700">Good</Badge>
      case 'Abnormal':
        return <Badge className="bg-yellow-100 text-yellow-700">Abnormal</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-700">High Priority</Badge>
      case 'normal':
        return <Badge className="bg-blue-100 text-blue-700">Normal</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{priority}</Badge>
    }
  }

  const getVitalTrend = (current: string, previous?: string) => {
    if (!previous) return <Minus className="h-4 w-4 text-gray-400" />
    
    const currentNum = parseFloat(current)
    const previousNum = parseFloat(previous)
    
    if (currentNum > previousNum) {
      return <TrendingUp className="h-4 w-4 text-red-500" />
    } else if (currentNum < previousNum) {
      return <TrendingDown className="h-4 w-4 text-green-500" />
    } else {
      return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

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
              <h1 className="text-xl font-bold text-gray-900">Vitals & Status Updates</h1>
              <p className="text-sm text-gray-500">Record and monitor patient vital signs</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              size="sm" 
              className="bg-green-500 hover:bg-green-600"
              onClick={() => setNewVitalsDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Record Vitals
            </Button>
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
                  <p className="text-sm font-medium text-gray-600">Pending Vitals</p>
                  <p className="text-3xl font-bold text-gray-900">{pendingVitals.length}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recorded Today</p>
                  <p className="text-3xl font-bold text-gray-900">{vitalsHistory.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {vitalsHistory.filter(v => v.status === 'Critical').length}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-xl">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Normal Status</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {vitalsHistory.filter(v => v.status === 'Normal' || v.status === 'Good').length}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-xl">
                  <CheckCircle className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="pending">Pending Vitals</TabsTrigger>
              <TabsTrigger value="history">Vitals History</TabsTrigger>
            </TabsList>
            
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

          {/* Pending Vitals Tab */}
          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Vital Signs</CardTitle>
                <CardDescription>Patients requiring vital sign monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingVitals.map((vital) => (
                    <div key={vital.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-3 rounded-lg">
                          <Activity className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{vital.patientName}</h3>
                          <p className="text-sm text-gray-600">Room {vital.roomNumber}</p>
                          <p className="text-sm text-gray-500">
                            Due: {vital.dueTime} • {vital.frequency}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Last recorded</p>
                          <p className="text-sm font-medium">{vital.lastRecorded}</p>
                        </div>
                        {getPriorityBadge(vital.priority)}
                        <Button 
                          size="sm" 
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => {
                            setSelectedPatient(vital)
                            setNewVitalsDialog(true)
                          }}
                        >
                          Record Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vitals History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vitals History</CardTitle>
                <CardDescription>Recently recorded vital signs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {vitalsHistory.map((record) => (
                    <Card key={record.id} className="border">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{record.patientName}</h3>
                            <p className="text-sm text-gray-600">
                              Room {record.roomNumber} • Recorded by {record.recordedBy}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(record.recordedAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(record.status)}
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="bg-red-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <Heart className="h-4 w-4 text-red-500" />
                                <span className="text-sm font-medium">Blood Pressure</span>
                              </div>
                              {getVitalTrend(record.vitals.bloodPressure)}
                            </div>
                            <p className="text-lg font-semibold">{record.vitals.bloodPressure} mmHg</p>
                          </div>
                          
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <Activity className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">Pulse Rate</span>
                              </div>
                              {getVitalTrend(record.vitals.pulse)}
                            </div>
                            <p className="text-lg font-semibold">{record.vitals.pulse} bpm</p>
                          </div>
                          
                          <div className="bg-orange-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <Thermometer className="h-4 w-4 text-orange-500" />
                                <span className="text-sm font-medium">Temperature</span>
                              </div>
                              {getVitalTrend(record.vitals.temperature)}
                            </div>
                            <p className="text-lg font-semibold">{record.vitals.temperature}°F</p>
                          </div>
                          
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <Stethoscope className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">Oxygen Sat.</span>
                              </div>
                              {getVitalTrend(record.vitals.oxygenSaturation)}
                            </div>
                            <p className="text-lg font-semibold">{record.vitals.oxygenSaturation}%</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                          <div>
                            <span className="font-medium text-gray-600">Respiratory Rate: </span>
                            <span>{record.vitals.respiratoryRate}/min</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Weight: </span>
                            <span>{record.vitals.weight} kg</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Height: </span>
                            <span>{record.vitals.height} cm</span>
                          </div>
                        </div>
                        
                        {record.notes && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm">
                              <span className="font-medium text-gray-600">Notes: </span>
                              {record.notes}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Record Vitals Dialog */}
      <Dialog open={newVitalsDialog} onOpenChange={setNewVitalsDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Record Patient Vitals</DialogTitle>
            <DialogDescription>
              Enter vital signs and status updates for the patient
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Patient</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P001">Ram Sharma - Room 101</SelectItem>
                    <SelectItem value="P002">Sunita Devi - Room 205</SelectItem>
                    <SelectItem value="P003">Ajay Kumar - ICU-1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" defaultValue={new Date().toTimeString().slice(0, 5)} />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bp">Blood Pressure (mmHg)</Label>
                <Input id="bp" placeholder="120/80" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pulse">Pulse Rate (bpm)</Label>
                <Input id="pulse" placeholder="72" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temp">Temperature (°F)</Label>
                <Input id="temp" placeholder="98.6" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="oxygen">Oxygen Saturation (%)</Label>
                <Input id="oxygen" placeholder="98" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="respiratory">Respiratory Rate (/min)</Label>
                <Input id="respiratory" placeholder="16" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" placeholder="70" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Overall Status</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="abnormal">Abnormal</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes & Observations</Label>
              <Textarea 
                id="notes" 
                placeholder="Additional observations, patient condition, or concerns"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewVitalsDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-green-500 hover:bg-green-600">
              Save Vitals
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
