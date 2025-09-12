"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Heart,
  LayoutDashboard,
  Users,
  Activity,
  UserPlus,
  ClipboardList,
  Clock,
  AlertTriangle,
  Pill,
  CheckCircle,
  Plus,
  Edit,
  Eye,
  Bell,
  FileText,
  Stethoscope,
  Settings,
  UserCog,
  Shield,
  TrendingUp,
  Calendar,
  Thermometer,
  HeartPulse,
  Clipboard,
  UserCheck,
  Package,
  Coffee
} from 'lucide-react'
import { LogoutButton } from "@/components/auth/LogoutButton"
import { useAuth } from "@/hooks/useAuth"

// Mock data for staff dashboard
const staffStats = {
  assignedPatients: 12,
  completedTasks: 8,
  pendingVitals: 5,
  medicineDeliveries: 3,
  shiftHours: 8
}

const assignedPatients = [
  {
    id: "P001",
    name: "Ram Sharma",
    age: 45,
    gender: "Male",
    roomNumber: "101",
    bedNumber: "A1",
    condition: "Stable",
    lastVitalsTime: "2 hours ago",
    nextMedicine: "14:30",
    priority: "normal",
    diagnosis: "Hypertension monitoring",
    doctor: "Dr. Anil Kumar",
    admissionDate: "2024-01-08"
  },
  {
    id: "P002",
    name: "Sunita Devi",
    age: 32,
    gender: "Female",
    roomNumber: "205",
    bedNumber: "B2",
    condition: "Good",
    lastVitalsTime: "1 hour ago",
    nextMedicine: "15:00",
    priority: "normal",
    diagnosis: "Post-delivery care",
    doctor: "Dr. Priya Singh",
    admissionDate: "2024-01-07"
  },
  {
    id: "P003",
    name: "Ajay Kumar",
    age: 28,
    gender: "Male",
    roomNumber: "ICU-1",
    bedNumber: "I1",
    condition: "Critical",
    lastVitalsTime: "30 minutes ago",
    nextMedicine: "Every 2 hours",
    priority: "high",
    diagnosis: "Accident trauma",
    doctor: "Dr. Rajesh Gupta",
    admissionDate: "2024-01-08"
  }
]

const pendingTasks = [
  {
    id: "T001",
    patientId: "P001",
    patientName: "Ram Sharma",
    task: "Record vital signs",
    priority: "normal",
    dueTime: "14:00",
    status: "pending",
    assignedBy: "Dr. Anil Kumar"
  },
  {
    id: "T002",
    patientId: "P003",
    patientName: "Ajay Kumar",
    task: "Administer medication",
    priority: "high",
    dueTime: "14:30",
    status: "pending",
    assignedBy: "Dr. Rajesh Gupta"
  },
  {
    id: "T003",
    patientId: "P002",
    patientName: "Sunita Devi",
    task: "Wound dressing change",
    priority: "normal",
    dueTime: "15:00",
    status: "pending",
    assignedBy: "Dr. Priya Singh"
  }
]

const medicineSchedule = [
  {
    id: "MED001",
    patientId: "P001",
    patientName: "Ram Sharma",
    medicine: "Amlodipine 5mg",
    dosage: "1 tablet",
    time: "14:30",
    status: "pending",
    route: "Oral"
  },
  {
    id: "MED002",
    patientId: "P003",
    patientName: "Ajay Kumar",
    medicine: "Morphine 10mg",
    dosage: "1 injection",
    time: "15:00",
    status: "pending",
    route: "IV"
  },
  {
    id: "MED003",
    patientId: "P002",
    patientName: "Sunita Devi",
    medicine: "Iron tablets",
    dosage: "2 tablets",
    time: "15:30",
    status: "pending",
    route: "Oral"
  }
]

// Navigation items for staff
const navigationItems = [
  {
    title: "Dashboard",
    items: [
      { title: "Overview", icon: LayoutDashboard, url: "/staff", isActive: true },
      { title: "My Patients", icon: Users, url: "/staff/patients" },
    ]
  },
  {
    title: "Communication",
    items: [
      { title: "Leave", icon: Calendar, url: "/staff/leave" },
    ]
  }
]
export default function StaffDashboard() {
  const [notifications] = useState(6)
  const [vitalsDialog, setVitalsDialog] = useState(false)
  const [taskDialog, setTaskDialog] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [staffProfile, setStaffProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState<any[]>([])
  const [vitalsForm, setVitalsForm] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    oxygenSaturation: '',
    respiratoryRate: '',
    notes: ''
  })
  const { authState } = useAuth()
  const user = authState?.user

  // Fetch staff profile data and patients
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch staff profile
        const profileResponse = await fetch('/api/staff/profile')
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          setStaffProfile(profileData.staff)
        }

        // Fetch patients
        const patientsResponse = await fetch('/api/staff/patients')
        console.log('Patients API response status:', patientsResponse.status)
        if (patientsResponse.ok) {
          const patientsData = await patientsResponse.json()
          console.log('Patients API response:', patientsData)
          setPatients(patientsData.patients || [])
        } else {
          console.error('Failed to fetch patients:', patientsResponse.status, await patientsResponse.text())
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-700 animate-pulse">Urgent</Badge>
      case 'high':
        return <Badge className="bg-orange-100 text-orange-700">High</Badge>
      case 'normal':
        return <Badge className="bg-blue-100 text-blue-700">Normal</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{priority}</Badge>
    }
  }

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
      case 'overdue':
        return <Badge className="bg-red-100 text-red-700">Overdue</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  return (
    <SidebarProvider>
        <div className="h-screen w-full bg-gradient-to-br from-pink-50 to-white flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar className="border-pink-100">
          <SidebarHeader className="border-b border-pink-100 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-2 rounded-xl">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Arogya Hospital</h2>
                <p className="text-sm text-gray-500">{loading ? 'Loading...' : (staffProfile?.name || user?.name || 'Staff Member')}</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-4 py-6">
            {navigationItems.map((section) => (
              <SidebarGroup key={section.title}>
                <SidebarGroupLabel className="text-gray-600 font-medium mb-2">
                  {section.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={item.isActive}
                          className="w-full justify-start hover:bg-pink-50 data-[active=true]:bg-pink-100 data-[active=true]:text-pink-700"
                        >
                          <Link href={item.url} className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="border-t border-pink-100 p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback className="bg-pink-100 text-pink-700">
                  {loading ? 'SN' : (staffProfile?.name?.split(' ').map((n: string) => n[0]).join('') || user?.name?.split(' ').map((n: string) => n[0]).join('') || 'SN')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{loading ? 'Loading...' : (staffProfile?.name || user?.name || 'Staff Member')}</p>
                <p className="text-xs text-gray-500 truncate">{loading ? 'Loading...' : (staffProfile?.email || user?.email || 'staff@hospital.com')}</p>
              </div>
            </div>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="flex-1 h-full overflow-hidden">
          {/* Top Navigation */}
          <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50 w-full">
            <div className="flex items-center justify-between h-16 px-6 w-full">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="text-gray-600 hover:text-pink-500" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Staff Dashboard</h1>
                  <p className="text-sm text-gray-500">Patient care and nursing management</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Quick Actions removed */}

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
                        <AvatarFallback className="bg-pink-100 text-pink-700">
                          {loading ? 'SN' : (staffProfile?.name?.split(' ').map((n: string) => n[0]).join('') || user?.name?.split(' ').map((n: string) => n[0]).join('') || 'SN')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{loading ? 'Loading...' : (staffProfile?.name || user?.name || 'Staff Member')}</p>
                        <p className="text-xs leading-none text-muted-foreground">{loading ? 'Loading...' : (staffProfile?.email || user?.email || 'staff@hospital.com')}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {staffProfile && (
                      <div className="px-2 py-1.5 text-sm">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Role:</span>
                            <p className="font-medium capitalize">{staffProfile.role}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Department:</span>
                            <p className="font-medium">{staffProfile.department}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">ID:</span>
                            <p className="font-medium">{staffProfile.user_id}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Shift:</span>
                            <p className="font-medium capitalize">{staffProfile.shift || 'Flexible'}</p>
                          </div>
                        </div>
                        {staffProfile.specialization && (
                          <div className="mt-2">
                            <span className="text-muted-foreground text-xs">Specialization:</span>
                            <p className="font-medium text-xs">{staffProfile.specialization}</p>
                          </div>
                        )}
                      </div>
                    )}
                    <DropdownMenuSeparator />
                    <LogoutButton />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          {/* Dashboard Content */}
          <main className="flex-1 p-6 space-y-8 h-full overflow-y-auto">
            {/* My Patients Section */}
            <Card className="border-pink-100 h-full">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <Users className="h-6 w-6 mr-2 text-pink-500" />
                  My Patients
                </CardTitle>
                <CardDescription>Select a patient to record vitals</CardDescription>
              </CardHeader>
              <CardContent className="h-full">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading patients...</p>
                  </div>
                ) : patients.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No patients found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 h-full overflow-y-auto">
                    {patients.map((patient) => (
                      <Card 
                        key={patient.id} 
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md border ${
                          selectedPatient?.id === patient.id 
                            ? 'border-pink-300 bg-pink-50' 
                            : 'border-gray-200 hover:border-pink-200'
                        }`}
                        onClick={() => {
                          setSelectedPatient(patient)
                          setVitalsDialog(true)
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-pink-100 text-pink-700">
                                {patient.name?.split(' ').map((n: string) => n[0]).join('') || 'P'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">{patient.name}</h3>
                              <p className="text-sm text-gray-500">ID: {patient.patient_id}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {patient.age} yrs
                                </span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {patient.gender}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
                              <Activity className="h-4 w-4 mr-1" />
                              Record Vitals
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>

      {/* Patient Vitals Dialog */}
      <Dialog open={vitalsDialog} onOpenChange={setVitalsDialog}>
        <DialogContent className="w-[95vw] max-w-[1200px] h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Patient Vitals</DialogTitle>
            <DialogDescription>
              Select a patient and enter their vital signs
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Patient Selection */}
            <div className="space-y-2">
              <label htmlFor="patient" className="text-sm font-medium">Patient</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={selectedPatient?.id || ''}
                onChange={(e) => {
                  const patient = patients.find(p => p.id === e.target.value)
                  setSelectedPatient(patient || null)
                }}
              >
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.patient_id}
                  </option>
                ))}
              </select>
            </div>

            {selectedPatient && (
              <>
                {/* Patient Info */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">{selectedPatient.name}</h4>
                  <p className="text-sm text-gray-600">ID: {selectedPatient.patient_id} • Age: {selectedPatient.age} • Gender: {selectedPatient.gender}</p>
                </div>

                {/* Vitals Section - Matching Doctor Dashboard */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Vitals</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Blood Pressure</label>
                      <Input
                        placeholder="120/80"
                        value={vitalsForm.bloodPressure}
                        onChange={(e) => setVitalsForm(prev => ({ ...prev, bloodPressure: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Heart Rate (bpm)</label>
                      <Input
                        placeholder="72"
                        value={vitalsForm.heartRate}
                        onChange={(e) => setVitalsForm(prev => ({ ...prev, heartRate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Temperature (°F)</label>
                      <Input
                        placeholder="98.6"
                        value={vitalsForm.temperature}
                        onChange={(e) => setVitalsForm(prev => ({ ...prev, temperature: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Weight (kg)</label>
                      <Input
                        placeholder="70"
                        value={vitalsForm.weight}
                        onChange={(e) => setVitalsForm(prev => ({ ...prev, weight: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Height (cm)</label>
                      <Input
                        placeholder="170"
                        value={vitalsForm.height}
                        onChange={(e) => setVitalsForm(prev => ({ ...prev, height: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Oxygen Saturation (%)</label>
                      <Input
                        placeholder="98"
                        value={vitalsForm.oxygenSaturation}
                        onChange={(e) => setVitalsForm(prev => ({ ...prev, oxygenSaturation: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Respiratory Rate (/min)</label>
                      <Input
                        placeholder="16"
                        value={vitalsForm.respiratoryRate}
                        onChange={(e) => setVitalsForm(prev => ({ ...prev, respiratoryRate: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <textarea
                    placeholder="Additional observations or notes"
                    className="w-full p-2 border rounded-md mt-1"
                    rows={3}
                    value={vitalsForm.notes}
                    onChange={(e) => setVitalsForm(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setVitalsDialog(false)
              setSelectedPatient(null)
              setVitalsForm({
                bloodPressure: '',
                heartRate: '',
                temperature: '',
                weight: '',
                height: '',
                oxygenSaturation: '',
                respiratoryRate: '',
                notes: ''
              })
            }}>
              Cancel
            </Button>
            <Button 
              className="bg-pink-500 hover:bg-pink-600"
              disabled={!selectedPatient}
              onClick={async () => {
                if (!selectedPatient) return
                
                try {
                  const response = await fetch('/api/staff/vitals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      patientId: selectedPatient.id,
                      vitals: vitalsForm,
                      notes: vitalsForm.notes
                    })
                  })

                  if (response.ok) {
                    setVitalsDialog(false)
                    setSelectedPatient(null)
                    setVitalsForm({
                      bloodPressure: '',
                      heartRate: '',
                      temperature: '',
                      weight: '',
                      height: '',
                      oxygenSaturation: '',
                      respiratoryRate: '',
                      notes: ''
                    })
                    alert('Vitals recorded successfully!')
                  } else {
                    const error = await response.json()
                    alert(error.error || 'Failed to record vitals')
                  }
                } catch (error) {
                  console.error('Error recording vitals:', error)
                  alert('Failed to record vitals')
                }
              }}
            >
              <Activity className="h-4 w-4 mr-1" />
              Save Vitals
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
