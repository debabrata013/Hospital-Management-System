"use client"

import { useState } from "react"
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
    title: "Patient Care",
    items: [
      { title: "Vitals & Status", icon: Activity, url: "/staff/vitals" },
      { title: "Medicine Delivery", icon: Pill, url: "/staff/medicines" },
      { title: "Task Management", icon: ClipboardList, url: "/staff/tasks" },
    ]
  },
  {
    title: "Communication",
    items: [
      { title: "Leave", icon: Calendar, url: "/staff/leave" },
      { title: "Break", icon: Coffee, url: "/staff/break" },
    ]
  }
]
export default function StaffDashboard() {
  const [notifications] = useState(6)
  const [vitalsDialog, setVitalsDialog] = useState(false)
  const [taskDialog, setTaskDialog] = useState(false)
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex">
        {/* Sidebar */}
        <Sidebar className="border-green-100">
          <SidebarHeader className="border-b border-green-100 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-400 to-green-500 p-2 rounded-xl">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Arogya Hospital</h2>
                <p className="text-sm text-gray-500">Staff Nurse</p>
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
                          className="w-full justify-start hover:bg-green-50 data-[active=true]:bg-green-100 data-[active=true]:text-green-700"
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

          <SidebarFooter className="border-t border-green-100 p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback className="bg-green-100 text-green-700">SN</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Staff Nurse</p>
                <p className="text-xs text-gray-500 truncate">nurse@hospital.com</p>
              </div>
            </div>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="flex-1">
          {/* Top Navigation */}
          <header className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
            <div className="flex items-center justify-between h-16 px-6">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="text-gray-600 hover:text-green-500" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Staff Dashboard</h1>
                  <p className="text-sm text-gray-500">Patient care and nursing management</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Quick Actions */}
                <Button
                  size="sm"
                  className="bg-green-500 hover:bg-green-600"
                  onClick={() => setVitalsDialog(true)}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Record Vitals
                </Button>

                {/* Notifications */}
                <div className="relative">
                  <Button variant="ghost" size="sm" className="relative hover:bg-green-50">
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
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-green-50">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" />
                        <AvatarFallback className="bg-green-100 text-green-700">SN</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>Staff Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <UserCog className="mr-2 h-4 w-4" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Preferences
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <LogoutButton />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          {/* Dashboard Content */}
          <main className="flex-1 p-6 space-y-8">
            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <Card className="border-green-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Assigned Patients</p>
                      <p className="text-3xl font-bold text-gray-900">{staffStats.assignedPatients}</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        3 new today
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-green-400 to-green-500 p-3 rounded-xl">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                      <p className="text-3xl font-bold text-gray-900">{staffStats.completedTasks}</p>
                      <p className="text-sm text-blue-600 flex items-center mt-1">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {pendingTasks.length} pending
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-3 rounded-xl">
                      <ClipboardList className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Vitals</p>
                      <p className="text-3xl font-bold text-gray-900">{staffStats.pendingVitals}</p>
                      <p className="text-sm text-yellow-600 flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        Due soon
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-3 rounded-xl">
                      <Activity className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Medicine Deliveries</p>
                      <p className="text-3xl font-bold text-gray-900">{staffStats.medicineDeliveries}</p>
                      <p className="text-sm text-purple-600 flex items-center mt-1">
                        <Pill className="h-4 w-4 mr-1" />
                        Next at 14:30
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-3 rounded-xl">
                      <Package className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-indigo-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Shift Hours</p>
                      <p className="text-3xl font-bold text-gray-900">{staffStats.shiftHours}</p>
                      <p className="text-sm text-indigo-600 flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        6 PM - 6 AM
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-indigo-400 to-indigo-500 p-3 rounded-xl">
                      <Calendar className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Assigned Patients */}
              <Card className="border-green-100">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">My Patients</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/staff/patients">
                        <Eye className="h-4 w-4 mr-2" />
                        View All
                      </Link>
                    </Button>
                  </div>
                  <CardDescription>Patients assigned to your care</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assignedPatients.slice(0, 3).map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-green-100 text-green-700">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{patient.name}</p>
                          <p className="text-xs text-gray-500">Room {patient.roomNumber} • {patient.diagnosis}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getConditionBadge(patient.condition)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPatient(patient)
                            setVitalsDialog(true)
                          }}
                        >
                          <Activity className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Pending Tasks */}
              <Card className="border-blue-100">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Pending Tasks</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/staff/tasks">
                        <ClipboardList className="h-4 w-4 mr-2" />
                        View All
                      </Link>
                    </Button>
                  </div>
                  <CardDescription>Tasks requiring your attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <ClipboardList className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{task.task}</p>
                          <p className="text-xs text-gray-500">{task.patientName} • Due: {task.dueTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPriorityBadge(task.priority)}
                        <Button variant="ghost" size="sm">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Medicine Schedule */}
              <Card className="border-purple-100">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Medicine Schedule</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/staff/medicines">
                        <Pill className="h-4 w-4 mr-2" />
                        View All
                      </Link>
                    </Button>
                  </div>
                  <CardDescription>Upcoming medicine deliveries</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {medicineSchedule.map((med) => (
                    <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <Pill className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{med.medicine}</p>
                          <p className="text-xs text-gray-500">{med.patientName} • {med.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-yellow-100 text-yellow-700">{med.status}</Badge>
                        <Button variant="ghost" size="sm">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>

      {/* Record Vitals Dialog */}
      <Dialog open={vitalsDialog} onOpenChange={setVitalsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Record Patient Vitals</DialogTitle>
            <DialogDescription>
              Enter vital signs and status updates for the patient
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="patient" className="text-sm font-medium">Patient</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="">Select patient</option>
                  {assignedPatients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} - Room {patient.roomNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="time" className="text-sm font-medium">Time</label>
                <Input id="time" type="time" defaultValue={new Date().toTimeString().slice(0, 5)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="bp" className="text-sm font-medium">Blood Pressure</label>
                <Input id="bp" placeholder="120/80" />
              </div>
              <div className="space-y-2">
                <label htmlFor="pulse" className="text-sm font-medium">Pulse Rate</label>
                <Input id="pulse" placeholder="72 bpm" />
              </div>
              <div className="space-y-2">
                <label htmlFor="temp" className="text-sm font-medium">Temperature</label>
                <Input id="temp" placeholder="98.6°F" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="oxygen" className="text-sm font-medium">Oxygen Saturation</label>
                <Input id="oxygen" placeholder="98%" />
              </div>
              <div className="space-y-2">
                <label htmlFor="respiratory" className="text-sm font-medium">Respiratory Rate</label>
                <Input id="respiratory" placeholder="16/min" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">Notes</label>
              <textarea
                id="notes"
                placeholder="Additional observations or notes"
                className="w-full p-2 border rounded-md"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVitalsDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-green-500 hover:bg-green-600">
              Save Vitals
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
