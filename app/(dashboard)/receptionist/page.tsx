"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  Calendar, 
  UserPlus, 
  CreditCard, 
  Clock, 
  AlertTriangle, 
  MessageSquare,
  Phone,
  Search,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Bell,
  Activity,
  Stethoscope,
  FileText,
  DollarSign,
  UserCheck,
  Bed,
  LogOut,
  Wifi,
  WifiOff,
  TrendingUp,
  Settings,
  UserCog,
  Shield
} from 'lucide-react'

// Mock data for receptionist dashboard
const receptionistStats = {
  todayRegistrations: 23,
  pendingAppointments: 15,
  waitingPatients: 8,
  totalBills: 45,
  emergencyContacts: 3,
  unreadMessages: 12
}

const patientQueue = [
  {
    id: "P001",
    name: "Ram Sharma",
    tokenNumber: "T001",
    appointmentTime: "09:30 AM",
    doctor: "Dr. Anil Kumar",
    department: "General Medicine",
    status: "waiting",
    priority: "normal",
    phone: "+91 98765 43210"
  },
  {
    id: "P002", 
    name: "Sunita Devi",
    tokenNumber: "T002",
    appointmentTime: "10:00 AM",
    doctor: "Dr. Priya Singh",
    department: "Gynecology",
    status: "in-consultation",
    priority: "normal",
    phone: "+91 98765 43211"
  },
  {
    id: "P003",
    name: "Ajay Kumar",
    tokenNumber: "E001",
    appointmentTime: "Emergency",
    doctor: "Dr. Rajesh Gupta",
    department: "Emergency",
    status: "emergency",
    priority: "high",
    phone: "+91 98765 43212"
  }
]

const recentRegistrations = [
  {
    id: "P024",
    name: "Mohan Lal",
    age: 45,
    gender: "Male",
    phone: "+91 98765 43213",
    registeredAt: "2 hours ago",
    status: "registered"
  },
  {
    id: "P025",
    name: "Kavita Singh",
    age: 32,
    gender: "Female",
    phone: "+91 98765 43214",
    registeredAt: "3 hours ago",
    status: "registered"
  },
  {
    id: "P026",
    name: "Ravi Kumar",
    age: 28,
    gender: "Male",
    phone: "+91 98765 43215",
    registeredAt: "4 hours ago",
    status: "registered"
  }
]

const emergencyContacts = [
  {
    id: 1,
    patientName: "Ajay Kumar",
    contactName: "Sita Kumar",
    relationship: "Wife",
    phone: "+91 98765 43216",
    priority: "high",
    status: "active"
  },
  {
    id: 2,
    patientName: "Elderly Patient",
    contactName: "Dr. Emergency",
    relationship: "Doctor",
    phone: "+91 98765 43217",
    priority: "critical",
    status: "contacted"
  }
]

const pendingBills = [
  {
    id: "B001",
    patientName: "Ram Sharma",
    amount: 2500,
    services: ["Consultation", "Lab Tests"],
    status: "pending",
    dueDate: "Today"
  },
  {
    id: "B002",
    patientName: "Sunita Devi",
    amount: 1800,
    services: ["Consultation", "Medicines"],
    status: "partial",
    dueDate: "Tomorrow"
  }
]

// Navigation items for receptionist
const navigationItems = [
  {
    title: "Dashboard",
    items: [
      { title: "Overview", icon: LayoutDashboard, url: "/receptionist", isActive: true },
      { title: "Patient Queue", icon: Clock, url: "/receptionist/queue" },
    ]
  },
  {
    title: "Patient Management",
    items: [
      { title: "Register Patient", icon: UserPlus, url: "/receptionist/register-patient" },
      { title: "Appointments", icon: Calendar, url: "/receptionist/appointments" },
      { title: "Admissions", icon: Bed, url: "/receptionist/admissions" },
    ]
  },
  {
    title: "Operations",
    items: [
      { title: "Billing & Payments", icon: CreditCard, url: "/receptionist/billing" },
      { title: "Messages", icon: MessageSquare, url: "/receptionist/messages" },
      { title: "Emergency Contacts", icon: Phone, url: "/receptionist/emergency" },
    ]
  }
]

export default function ReceptionistDashboard() {
  const [notifications] = useState(8)
  const [isOnline, setIsOnline] = useState(true)
  const [newPatientDialog, setNewPatientDialog] = useState(false)
  const [emergencyDialog, setEmergencyDialog] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Badge className="bg-yellow-100 text-yellow-700">Waiting</Badge>
      case 'in-consultation':
        return <Badge className="bg-blue-100 text-blue-700">In Consultation</Badge>
      case 'emergency':
        return <Badge className="bg-red-100 text-red-700">Emergency</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex">
        {/* Sidebar */}
        <Sidebar className="border-blue-100">
          <SidebarHeader className="border-b border-blue-100 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-2 rounded-xl">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Arogya Hospital</h2>
                <p className="text-sm text-gray-500">Receptionist</p>
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
                          className="w-full justify-start hover:bg-blue-50 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700"
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
          
          <SidebarFooter className="border-t border-blue-100 p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback className="bg-blue-100 text-blue-700">RC</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Receptionist</p>
                <p className="text-xs text-gray-500 truncate">reception@hospital.com</p>
              </div>
              <div className="flex items-center">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </SidebarFooter>
          
          <SidebarRail />
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="flex-1">
          {/* Top Navigation */}
          <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
            <div className="flex items-center justify-between h-16 px-6">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="text-gray-600 hover:text-blue-500" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Receptionist Dashboard</h1>
                  <p className="text-sm text-gray-500">Patient management and front desk operations</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Online Status */}
                <div className="flex items-center space-x-2">
                  {isOnline ? (
                    <>
                      <Wifi className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Online</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">Offline</span>
                    </>
                  )}
                </div>

                {/* Quick Actions */}
                <Button 
                  size="sm" 
                  className="bg-blue-500 hover:bg-blue-600"
                  onClick={() => setNewPatientDialog(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  New Patient
                </Button>

                {/* Notifications */}
                <div className="relative">
                  <Button variant="ghost" size="sm" className="relative hover:bg-blue-50">
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
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-blue-50">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" />
                        <AvatarFallback className="bg-blue-100 text-blue-700">RC</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>Receptionist Account</DropdownMenuLabel>
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
                    <DropdownMenuItem className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 p-6 space-y-8">
            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <Card className="border-blue-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Today's Registrations</p>
                      <p className="text-3xl font-bold text-gray-900">{receptionistStats.todayRegistrations}</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +15% from yesterday
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-3 rounded-xl">
                      <UserPlus className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Appointments</p>
                      <p className="text-3xl font-bold text-gray-900">{receptionistStats.pendingAppointments}</p>
                      <p className="text-sm text-blue-600 flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        Next at 10:30 AM
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-green-400 to-green-500 p-3 rounded-xl">
                      <Calendar className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Waiting Patients</p>
                      <p className="text-3xl font-bold text-gray-900">{receptionistStats.waitingPatients}</p>
                      <p className="text-sm text-yellow-600 flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        Avg wait: 15 min
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-3 rounded-xl">
                      <Clock className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Bills</p>
                      <p className="text-3xl font-bold text-gray-900">{receptionistStats.totalBills}</p>
                      <p className="text-sm text-purple-600 flex items-center mt-1">
                        <DollarSign className="h-4 w-4 mr-1" />
                        ₹1,25,000 total
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-3 rounded-xl">
                      <CreditCard className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Emergency Contacts</p>
                      <p className="text-3xl font-bold text-gray-900">{receptionistStats.emergencyContacts}</p>
                      <p className="text-sm text-red-600 flex items-center mt-1">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        2 critical
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-red-400 to-red-500 p-3 rounded-xl">
                      <Phone className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-indigo-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                      <p className="text-3xl font-bold text-gray-900">{receptionistStats.unreadMessages}</p>
                      <p className="text-sm text-indigo-600 flex items-center mt-1">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        5 from doctors
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-indigo-400 to-indigo-500 p-3 rounded-xl">
                      <MessageSquare className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Patient Queue */}
              <Card className="border-blue-100">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Patient Queue</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/receptionist/queue">
                        <Eye className="h-4 w-4 mr-2" />
                        View All
                      </Link>
                    </Button>
                  </div>
                  <CardDescription>Current patients waiting for consultation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {patientQueue.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getPriorityIcon(patient.priority)}
                          <span className="font-medium text-sm">{patient.tokenNumber}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{patient.name}</p>
                          <p className="text-xs text-gray-500">{patient.doctor} • {patient.appointmentTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(patient.status)}
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Registrations */}
              <Card className="border-green-100">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Recent Registrations</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setNewPatientDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Register
                    </Button>
                  </div>
                  <CardDescription>Newly registered patients today</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentRegistrations.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-green-100 text-green-700">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{patient.name}</p>
                          <p className="text-xs text-gray-500">{patient.age}Y • {patient.gender} • {patient.registeredAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Emergency Contacts */}
              <Card className="border-red-100">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Emergency Contacts</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setEmergencyDialog(true)}>
                      <Phone className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                  <CardDescription>Critical patient contacts requiring attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {emergencyContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="font-medium text-sm">{contact.contactName}</p>
                          <p className="text-xs text-gray-600">{contact.relationship} of {contact.patientName}</p>
                          <p className="text-xs text-gray-500">{contact.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={contact.priority === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                          {contact.priority}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Pending Bills Section */}
            <Card className="border-purple-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Pending Bills & Payments</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/receptionist/billing">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Billing
                    </Link>
                  </Button>
                </div>
                <CardDescription>Bills requiring payment processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingBills.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <FileText className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">{bill.patientName}</p>
                          <p className="text-sm text-gray-600">{bill.services.join(', ')}</p>
                          <p className="text-xs text-gray-500">Due: {bill.dueDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-bold text-lg">₹{bill.amount.toLocaleString()}</p>
                          {getStatusBadge(bill.status)}
                        </div>
                        <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                          Process Payment
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>

      {/* New Patient Registration Dialog */}
      <Dialog open={newPatientDialog} onOpenChange={setNewPatientDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Register New Patient</DialogTitle>
            <DialogDescription>
              Enter patient details for registration. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" placeholder="Enter first name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" placeholder="Enter last name" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input id="age" type="number" placeholder="Enter age" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" placeholder="Enter complete address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency">Emergency Contact</Label>
              <Input id="emergency" placeholder="Emergency contact number" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewPatientDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600">
              Register Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Emergency Contact Dialog */}
      <Dialog open={emergencyDialog} onOpenChange={setEmergencyDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Emergency Contact</DialogTitle>
            <DialogDescription>
              Contact emergency contacts for critical patients
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium">{contact.contactName}</p>
                    <p className="text-sm text-gray-600">{contact.relationship} of {contact.patientName}</p>
                    <p className="text-sm font-mono">{contact.phone}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    SMS
                  </Button>
                  <Button size="sm" className="bg-green-500 hover:bg-green-600">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmergencyDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
    phone: "+91 98765 43213",
    registeredAt: "11:30 AM",
    registeredBy: "Reception-1"
  },
  {
    id: "P025",
    name: "Geeta Sharma", 
    nameEn: "Geeta Sharma",
    age: 32,
    gender: "Female",
    phone: "+91 98765 43214",
    registeredAt: "11:15 AM",
    registeredBy: "Reception-1"
  }
]

const mockPendingBills = [
  {
    id: "B001",
    patientId: "P001",
    patientName: "Ram Sharma",
    amount: 1250,
    services: ["Consultation", "Blood Test"],
    status: "pending",
    createdAt: "10:30 AM"
  },
  {
    id: "B002", 
    patientId: "P002",
    patientName: "Sunita Devi",
    amount: 2500,
    services: ["Consultation", "Ultrasound"],
    status: "partial",
    paidAmount: 1000,
    createdAt: "09:45 AM"
  }
]

const mockMessages = [
  {
    id: "M001",
    from: "Dr. Anil Kumar",
    message: "Please arrange blood test report for P001. CBC and Sugar Test required.",
    time: "11:45 AM",
    priority: "normal",
    read: false
  },
  {
    id: "M002",
    from: "Admin",
    message: "Staff meeting today at 5 PM in conference room.",
    time: "11:30 AM", 
    priority: "high",
    read: false
  }
]

export default function ReceptionistDashboard() {
  const [isOnline, setIsOnline] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showNewPatientDialog, setShowNewPatientDialog] = useState(false)
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false)
  const [showBillingDialog, setShowBillingDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  // Simulate online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800'
      case 'in-consultation': return 'bg-blue-100 text-blue-800'
      case 'emergency': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'normal': return <Clock className="h-4 w-4 text-blue-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      {/* Header */}
      <div className="bg-white border-b border-pink-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reception Dashboard</h1>
            <p className="text-sm text-gray-600">Reception Dashboard - Arogya Hospital</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Online/Offline Status */}
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">Offline Mode</span>
                </>
              )}
            </div>
            
            {/* Messages */}
            <Button variant="outline" size="sm" className="relative">
              <MessageSquare className="h-4 w-4" />
              {mockMessages.filter(m => !m.read).length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                  {mockMessages.filter(m => !m.read).length}
                </Badge>
              )}
            </Button>
            
            {/* User Profile */}
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>R1</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">Reception-1</p>
                <p className="text-gray-500">Receptionist</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Today's Registrations</p>
                  <p className="text-2xl font-bold">{mockStats.todayRegistrations}</p>
                </div>
                <UserPlus className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Appointments</p>
                  <p className="text-2xl font-bold">{mockStats.pendingAppointments}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Waiting</p>
                  <p className="text-2xl font-bold">{mockStats.waitingPatients}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Billing</p>
                  <p className="text-2xl font-bold">{mockStats.totalBills}</p>
                </div>
                <CreditCard className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Emergency</p>
                  <p className="text-2xl font-bold">{mockStats.emergencyContacts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm">Messages</p>
                  <p className="text-2xl font-bold">{mockStats.unreadMessages}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-pink-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <Button 
            onClick={() => setShowNewPatientDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white h-20 flex flex-col items-center justify-center space-y-2"
          >
            <UserPlus className="h-6 w-6" />
            <span className="text-sm">New Patient</span>
          </Button>

          <Button 
            onClick={() => setShowAppointmentDialog(true)}
            className="bg-green-600 hover:bg-green-700 text-white h-20 flex flex-col items-center justify-center space-y-2"
          >
            <Calendar className="h-6 w-6" />
            <span className="text-sm">Appointment</span>
          </Button>

          <Button 
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-50 h-20 flex flex-col items-center justify-center space-y-2"
          >
            <Bed className="h-6 w-6" />
            <span className="text-sm">Admission</span>
          </Button>

          <Button 
            onClick={() => setShowBillingDialog(true)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white h-20 flex flex-col items-center justify-center space-y-2"
          >
            <CreditCard className="h-6 w-6" />
            <span className="text-sm">Billing</span>
          </Button>

          <Button 
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50 h-20 flex flex-col items-center justify-center space-y-2"
          >
            <Phone className="h-6 w-6" />
            <span className="text-sm">Emergency</span>
          </Button>

          <Button 
            variant="outline"
            className="border-pink-200 text-pink-700 hover:bg-pink-50 h-20 flex flex-col items-center justify-center space-y-2"
          >
            <MessageSquare className="h-6 w-6" />
            <span className="text-sm">Messages</span>
          </Button>

          <Button 
            variant="outline"
            className="border-gray-200 text-gray-700 hover:bg-gray-50 h-20 flex flex-col items-center justify-center space-y-2"
          >
            <Search className="h-6 w-6" />
            <span className="text-sm">Search</span>
          </Button>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="queue">Patient Queue</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patient Queue Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Patient Queue - Today</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockPatientQueue.slice(0, 3).map((patient) => (
                      <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {getPriorityIcon(patient.priority)}
                            <Badge className={getStatusColor(patient.status)}>
                              {patient.status === 'waiting' ? 'Waiting' : 
                               patient.status === 'in-consultation' ? 'In Consultation' : 
                               patient.status === 'emergency' ? 'Emergency' : patient.status}
                            </Badge>
                          </div>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-sm text-gray-600">{patient.tokenNumber} - {patient.appointmentTime}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Recent Messages</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockMessages.slice(0, 3).map((message) => (
                      <div key={message.id} className={`p-3 rounded-lg ${message.read ? 'bg-gray-50' : 'bg-blue-50 border-l-4 border-blue-500'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{message.from}</p>
                            <p className="text-sm text-gray-600 mt-1">{message.message}</p>
                            <p className="text-xs text-gray-500 mt-2">{message.time}</p>
                          </div>
                          {message.priority === 'high' && (
                            <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="queue" className="space-y-4">
            {/* Patient Queue Management will be implemented in next file */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Queue Management</CardTitle>
                <CardDescription>OPD patient waiting list</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Queue management interface will be implemented...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registrations" className="space-y-4">
            {/* Patient Registration will be implemented in next file */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Registration</CardTitle>
                <CardDescription>New patient registration</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Registration interface will be implemented...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            {/* Billing Management will be implemented in next file */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Management</CardTitle>
                <CardDescription>Bill generation and payment processing</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Billing interface will be implemented...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            {/* Internal Messaging will be implemented in next file */}
            <Card>
              <CardHeader>
                <CardTitle>Internal Messages</CardTitle>
                <CardDescription>Communication with doctors and admin</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Messaging interface will be implemented...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs will be implemented in separate components */}
    </div>
  )
}
