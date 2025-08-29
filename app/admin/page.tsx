"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
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
import { Heart, LayoutDashboard, Users, Calendar, UserCheck, Package, CreditCard, Bell, LogOut, Plus, FileText, AlertTriangle, Clock, Bed, Stethoscope, Pill, DollarSign, TrendingUp, Eye, MoreHorizontal, MapPin } from 'lucide-react'

// Mock data for the dashboard
const branchInfo = {
  name: "आरोग्य अस्पताल - मुख्य शाखा",
  location: "नई दिल्ली",
  adminName: "डॉ. प्रिया शर्मा"
}

const todayStats = {
  totalAppointments: 45,
  completedAppointments: 28,
  admittedPatients: 23,
  availableBeds: 12,
  criticalAlerts: 3,
  todayRevenue: 15420
}

const upcomingAppointments = [
  {
    id: "APT001",
    patientName: "John Smith",
    doctorName: "Dr. Michael Brown",
    time: "09:30 AM",
    type: "Consultation",
    status: "confirmed",
    department: "Cardiology"
  },
  {
    id: "APT002", 
    patientName: "Emily Davis",
    doctorName: "Dr. Lisa Chen",
    time: "10:15 AM",
    type: "Follow-up",
    status: "confirmed",
    department: "Internal Medicine"
  },
  {
    id: "APT003",
    patientName: "Robert Wilson",
    doctorName: "Dr. James Taylor",
    time: "11:00 AM",
    type: "Surgery Consultation",
    status: "pending",
    department: "Surgery"
  },
  {
    id: "APT004",
    patientName: "Maria Garcia",
    doctorName: "Dr. Anna Rodriguez",
    time: "11:45 AM",
    type: "Checkup",
    status: "confirmed",
    department: "Pediatrics"
  }
]

const admittedPatients = [
  {
    id: "P001",
    name: "David Lee",
    age: 45,
    condition: "Post-Surgery Recovery",
    doctor: "Dr. Michael Brown",
    room: "ICU-101",
    admissionDate: "2024-01-14",
    status: "stable"
  },
  {
    id: "P002",
    name: "Jennifer White",
    age: 32,
    condition: "Pneumonia Treatment",
    doctor: "Dr. Lisa Chen",
    room: "Ward-205",
    admissionDate: "2024-01-15",
    status: "improving"
  },
  {
    id: "P003",
    name: "Thomas Anderson",
    age: 58,
    condition: "Cardiac Monitoring",
    doctor: "Dr. James Taylor",
    room: "CCU-301",
    admissionDate: "2024-01-15",
    status: "critical"
  }
]

const stockAlerts = [
  {
    medicine: "Amoxicillin 500mg",
    currentStock: 15,
    minRequired: 50,
    category: "Antibiotic",
    urgency: "high"
  },
  {
    medicine: "Paracetamol 650mg",
    currentStock: 45,
    minRequired: 100,
    category: "Analgesic",
    urgency: "medium"
  },
  {
    medicine: "Insulin Glargine",
    currentStock: 8,
    minRequired: 25,
    category: "Diabetes",
    urgency: "critical"
  }
]

const doctorSchedules = [
  {
    name: "Dr. Michael Brown",
    department: "Cardiology",
    shift: "Morning (8:00 AM - 2:00 PM)",
    status: "available",
    patients: 8
  },
  {
    name: "Dr. Lisa Chen", 
    department: "Internal Medicine",
    shift: "Full Day (8:00 AM - 6:00 PM)",
    status: "busy",
    patients: 12
  },
  {
    name: "Dr. James Taylor",
    department: "Surgery",
    shift: "Afternoon (2:00 PM - 10:00 PM)",
    status: "in_surgery",
    patients: 6
  }
]

// Navigation items
const navigationItems = [
  {
    title: "Main",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, url: "/admin", isActive: true },
      { title: "Analytics", icon: TrendingUp, url: "/admin/analytics" },
      { title: "Reports", icon: FileText, url: "/admin/reports" },
    ]
  },
  {
    title: "Patient Management",
    items: [
      { title: "Manage Patients", icon: Users, url: "/admin/patients" },
      { title: "Appointments", icon: Calendar, url: "/admin/appointments" },
      { title: "Admissions", icon: Bed, url: "/admin/admissions" },
      { title: "Room Management", icon: Bed, url: "/admin/room-management" },
    ]
  },
  {
    title: "Operations",
    items: [
      { title: "Doctor Schedules", icon: UserCheck, url: "/admin/schedules" },
      { title: "Inventory/Pharmacy", icon: Package, url: "/admin/inventory" },
      { title: "Billing", icon: CreditCard, url: "/admin/billing" },
    ]
  }
]

export default function AdminDashboard() {
  const [notifications] = useState(7)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-700">Confirmed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>
      case 'stable':
        return <Badge className="bg-blue-100 text-blue-700">Stable</Badge>
      case 'improving':
        return <Badge className="bg-green-100 text-green-700">Improving</Badge>
      case 'critical':
        return <Badge className="bg-red-100 text-red-700">Critical</Badge>
      case 'available':
        return <Badge className="bg-green-100 text-green-700">Available</Badge>
      case 'busy':
        return <Badge className="bg-yellow-100 text-yellow-700">Busy</Badge>
      case 'in_surgery':
        return <Badge className="bg-red-100 text-red-700">In Surgery</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex">
        {/* Sidebar */}
        <Sidebar className="border-pink-100">
          <SidebarHeader className="border-b border-pink-100 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-2 rounded-xl">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">आरोग्य अस्पताल</h2>
                <p className="text-sm text-gray-500">शाखा प्रशासक</p>
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
                <AvatarFallback className="bg-pink-100 text-pink-700">SJ</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{branchInfo.adminName}</p>
                <p className="text-xs text-gray-500 truncate">Branch Administrator</p>
              </div>
            </div>
          </SidebarFooter>
          
          <SidebarRail />
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="flex-1">
          {/* Top Navigation */}
          <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
            <div className="flex items-center justify-between h-16 px-6">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="text-gray-600 hover:text-pink-500" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{branchInfo.name}</h1>
                  <p className="text-sm text-gray-500 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {branchInfo.location}
                  </p>
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
                        <AvatarFallback className="bg-pink-100 text-pink-700">SJ</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      Branch Settings
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
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                      <p className="text-3xl font-bold text-gray-900">{todayStats.totalAppointments}</p>
                      <p className="text-sm text-green-600 mt-1">
                        {todayStats.completedAppointments} completed
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-3 rounded-xl">
                      <Calendar className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Admitted Patients</p>
                      <p className="text-3xl font-bold text-gray-900">{todayStats.admittedPatients}</p>
                      <p className="text-sm text-blue-600 mt-1">
                        {todayStats.availableBeds} beds available
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-3 rounded-xl">
                      <Bed className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Stock Alerts</p>
                      <p className="text-3xl font-bold text-red-600">{todayStats.criticalAlerts}</p>
                      <p className="text-sm text-red-600 mt-1">
                        Require immediate attention
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-red-400 to-red-500 p-3 rounded-xl">
                      <AlertTriangle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                      <p className="text-3xl font-bold text-green-600">₹{todayStats.todayRevenue.toLocaleString()}</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +12% from yesterday
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-green-400 to-green-500 p-3 rounded-xl">
                      <DollarSign className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="text-gray-900">Quick Actions</CardTitle>
                <CardDescription>Common daily operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/admin/patients/add">
                    <Button className="w-full h-16 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-xl flex flex-col items-center justify-center space-y-1">
                      <Plus className="h-5 w-5" />
                      <span className="text-sm">Add Patient</span>
                    </Button>
                  </Link>
                  
                  <Link href="/admin/appointments/schedule">
                    <Button variant="outline" className="w-full h-16 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl flex flex-col items-center justify-center space-y-1">
                      <Calendar className="h-5 w-5" />
                      <span className="text-sm">Schedule Appointment</span>
                    </Button>
                  </Link>
                  
                  <Link href="/admin/reports">
                    <Button variant="outline" className="w-full h-16 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl flex flex-col items-center justify-center space-y-1">
                      <FileText className="h-5 w-5" />
                      <span className="text-sm">Generate Report</span>
                    </Button>
                  </Link>
                  
                  <Link href="/admin/inventory">
                    <Button variant="outline" className="w-full h-16 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl flex flex-col items-center justify-center space-y-1">
                      <Package className="h-5 w-5" />
                      <span className="text-sm">Check Inventory</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Main Dashboard Widgets */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Today's Appointments */}
              <Card className="border-pink-100">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">Today's Appointments</CardTitle>
                    <CardDescription>Upcoming appointments for today</CardDescription>
                  </div>
                  <Link href="/admin/appointments">
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className="bg-pink-100 p-2 rounded-lg">
                            <Clock className="h-5 w-5 text-pink-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{appointment.patientName}</p>
                            <p className="text-sm text-gray-600">{appointment.doctorName} • {appointment.department}</p>
                            <p className="text-sm text-gray-500">{appointment.time} • {appointment.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(appointment.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Admitted Patients */}
              <Card className="border-pink-100">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">Admitted Patients</CardTitle>
                    <CardDescription>Currently admitted patients</CardDescription>
                  </div>
                  <Link href="/admin/admissions">
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {admittedPatients.map((patient) => (
                      <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Bed className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{patient.name} ({patient.age}y)</p>
                            <p className="text-sm text-gray-600">{patient.condition}</p>
                            <p className="text-sm text-gray-500">{patient.doctor} • Room {patient.room}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(patient.status)}
                          <p className="text-xs text-gray-500 mt-1">
                            Since {new Date(patient.admissionDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row Widgets */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Medicine Stock Alerts */}
              <Card className="border-pink-100">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900 flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      Medicine Stock Alerts
                    </CardTitle>
                    <CardDescription>Items requiring immediate restocking</CardDescription>
                  </div>
                  <Link href="/admin/inventory">
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      Manage Stock
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stockAlerts.map((item, index) => (
                      <div key={index} className={`p-4 rounded-xl border ${getUrgencyColor(item.urgency)}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Pill className="h-5 w-5" />
                            <div>
                              <p className="font-semibold">{item.medicine}</p>
                              <p className="text-sm opacity-75">{item.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{item.currentStock} / {item.minRequired}</p>
                            <p className="text-xs opacity-75">Current / Required</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Progress 
                            value={(item.currentStock / item.minRequired) * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Doctor Schedules */}
              <Card className="border-pink-100">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">Doctor Schedules</CardTitle>
                    <CardDescription>Current doctor availability and schedules</CardDescription>
                  </div>
                  <Link href="/admin/schedules">
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {doctorSchedules.map((doctor, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <Stethoscope className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{doctor.name}</p>
                            <p className="text-sm text-gray-600">{doctor.department}</p>
                            <p className="text-sm text-gray-500">{doctor.shift}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(doctor.status)}
                          <p className="text-xs text-gray-500 mt-1">
                            {doctor.patients} patients today
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
