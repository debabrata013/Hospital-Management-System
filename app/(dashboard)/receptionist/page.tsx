"use client"

import { useState, useEffect } from "react"
import { useOffline } from "@/hooks/use-offline"
import { useAuth } from "@/hooks/useAuth"
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
  Calendar, 
  UserPlus, 
  CreditCard, 
  Clock, 
  AlertTriangle, 
  Phone,
  Search,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  Bell,
  Activity,
  FileText,
  DollarSign,
  Bed,
  LogOut,
  Wifi,
  WifiOff,
  TrendingUp,
  Settings,
  UserCog,
  Shield,
  Stethoscope,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { LogoutButton } from "@/components/auth/LogoutButton"

// Mock data for receptionist dashboard
const receptionistStats = {
  todayRegistrations: 23,
  pendingAppointments: 15,
  waitingPatients: 8,
  totalBills: 45,
  emergencyContacts: 3
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
     
      { title: "Appointments", icon: Calendar, url: "/receptionist/appointments" },
      { title: "Admissions", icon: Bed, url: "/receptionist/admissions" },
    ]
  },
  {
    title: "Operations",
    items: [
      { title: "Billing & Payments", icon: CreditCard, url: "/receptionist/billing" }
    ]
  }
]

export default function ReceptionistDashboard() {
  const [notifications] = useState(8)
  const [newPatientDialog, setNewPatientDialog] = useState(false)
  const [emergencyDialog, setEmergencyDialog] = useState(false)
  const { logout, authState } = useAuth()
  
  // Real data states
  const [dashboardData, setDashboardData] = useState({
    todayRegistrations: 0,
    pendingAppointments: 0,
    waitingPatients: 0,
    totalBills: 0,
    emergencyContacts: 0
  })
  const [patientQueue, setPatientQueue] = useState([])
  const [recentRegistrations, setRecentRegistrations] = useState([])
  const [emergencyContacts, setEmergencyContacts] = useState([])
  const [pendingBills, setPendingBills] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  const handleLogout = () => {
    logout()
  }

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch patients
      const patientsResponse = await fetch('/api/receptionist/patients')
      const patientsData = await patientsResponse.json()
      
      // Fetch queue
      const queueResponse = await fetch('/api/receptionist/queue')
      const queueData = await queueResponse.json()
      
      // Fetch appointments
      const appointmentsResponse = await fetch('/api/receptionist/appointments')
      const appointmentsData = await appointmentsResponse.json()

      // Process data
      const today = new Date().toDateString()
      const todayRegistrations = patientsData.patients?.filter(p => 
        new Date(p.registration_date).toDateString() === today
      ).length || 0

      setDashboardData({
        todayRegistrations,
        pendingAppointments: appointmentsData.appointments?.length || 0,
        waitingPatients: queueData.queue?.filter(q => q.status === 'scheduled').length || 0,
        totalBills: 0, // Will implement billing later
        emergencyContacts: 0 // Will implement emergency contacts later
      })

      setPatientQueue(queueData.queue || [])
      setRecentRegistrations(patientsData.patients?.slice(0, 5) || [])
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const [registrationForm, setRegistrationForm] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    phone: '',
    address: '',
    emergencyContact: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { isOnline, pendingSyncCount, saveRegistration, forceSync, isInitialized } = useOffline()

  const handleRegistrationSubmit = async () => {
    if (!registrationForm.firstName || !registrationForm.lastName || !registrationForm.age || !registrationForm.gender || !registrationForm.phone) {
      return;
    }

    setIsSubmitting(true);
    try {
      await saveRegistration({
        firstName: registrationForm.firstName,
        lastName: registrationForm.lastName,
        age: parseInt(registrationForm.age),
        gender: registrationForm.gender,
        phone: registrationForm.phone,
        address: registrationForm.address,
        emergencyContact: registrationForm.emergencyContact
      });

      // Reset form and close dialog
      setRegistrationForm({
        firstName: '',
        lastName: '',
        age: '',
        gender: '',
        phone: '',
        address: '',
        emergencyContact: ''
      });
      setNewPatientDialog(false);
      
      // Show success message
      alert('Patient registered successfully!');
      
      // Refresh dashboard data
      fetchDashboardData();
      
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Failed to register patient. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Badge className="bg-yellow-100 text-yellow-700">Waiting</Badge>
      case 'in-consultation':
        return <Badge className="bg-pink-100 text-pink-700">In Consultation</Badge>
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex w-full">
        {/* Sidebar */}
        <Sidebar className="border-pink-100 hidden lg:flex">
          <SidebarHeader className="border-b border-pink-100 p-4 lg:p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-2 rounded-xl">
                <Heart className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
              </div>
              <div className="hidden lg:block">
                <h2 className="text-lg font-bold text-gray-900">Arogya Hospital</h2>
                <p className="text-sm text-gray-500">Receptionist</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-2 lg:px-4 py-4 lg:py-6">
            {navigationItems.map((section) => (
              <SidebarGroup key={section.title}>
                <SidebarGroupLabel className="text-gray-600 font-medium mb-2 text-xs lg:text-sm">
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
                          <Link href={item.url} className="flex items-center space-x-2 lg:space-x-3 px-2 lg:px-3 py-2 rounded-lg">
                            <item.icon className="h-4 w-4 lg:h-5 lg:w-5" />
                            <span className="text-xs lg:text-sm">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          
          <SidebarFooter className="border-t border-pink-100 p-2 lg:p-4">
            {/* User Info */}
            <div className="flex items-center space-x-2 lg:space-x-3 p-2 bg-pink-50 rounded-lg mb-3">
              <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback className="bg-pink-100 text-pink-700 text-xs lg:text-sm">
                  {authState.user?.name?.charAt(0)?.toUpperCase() || 'R'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 hidden lg:block">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {authState.user?.name || 'Receptionist'}
                </p>
                <p className="text-xs text-gray-500 truncate">Reception Department</p>
              </div>
              <div className="flex items-center">
                {isOnline ? (
                  <Wifi className="h-3 w-3 lg:h-4 lg:w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-3 w-3 lg:h-4 lg:w-4 text-red-500" />
                )}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-1 lg:space-x-2 px-2 lg:px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
            >
              <LogOut className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="text-xs lg:text-sm font-medium hidden lg:inline">Logout</span>
            </button>
          </SidebarFooter>
          
          <SidebarRail />
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="flex-1 w-full min-w-0">
          {/* Top Navigation */}
          <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
            <div className="flex items-center justify-between h-14 lg:h-16 px-4 lg:px-6">
              <div className="flex items-center space-x-2 lg:space-x-4">
                <SidebarTrigger className="text-gray-600 hover:text-pink-500 lg:hidden" />
                <div>
                  <h1 className="text-lg lg:text-xl font-bold text-gray-900">Receptionist Dashboard</h1>
                  <p className="text-xs lg:text-sm text-gray-500 hidden sm:block">Patient management and front desk operations</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 lg:space-x-4">
                {/* Online Status */}
                <div className="flex items-center space-x-2 lg:space-x-4">
                  <div className="flex items-center space-x-1 lg:space-x-2">
                    {isOnline ? (
                      <>
                        <Wifi className="h-3 w-3 lg:h-4 lg:w-4 text-green-500" />
                        <span className="text-xs lg:text-sm text-green-600 hidden sm:inline">Online</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3 w-3 lg:h-4 lg:w-4 text-red-500" />
                        <span className="text-xs lg:text-sm text-red-600 hidden sm:inline">Offline</span>
                      </>
                    )}
                  </div>
                  
                  {/* Pending Sync Indicator */}
                  {pendingSyncCount > 0 && (
                    <div className="flex items-center space-x-1 lg:space-x-2">
                      <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-700 px-1 lg:px-2 py-1 rounded-full text-xs">
                        <RefreshCw className="h-2 w-2 lg:h-3 lg:w-3" />
                        <span className="hidden sm:inline">{pendingSyncCount} pending</span>
                        <span className="sm:hidden">{pendingSyncCount}</span>
                      </div>
                      {isOnline && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={forceSync}
                          className="text-xs px-1 lg:px-2 py-1 h-6 lg:h-8"
                        >
                          <RefreshCw className="h-2 w-2 lg:h-3 lg:w-3 mr-1" />
                          <span className="hidden lg:inline">Sync</span>
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <Button 
                  size="sm" 
                  className="bg-pink-500 hover:bg-pink-600 px-2 lg:px-4"
                  onClick={() => setNewPatientDialog(true)}
                >
                  <UserPlus className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">New Patient</span>
                  <span className="sm:hidden">New</span>
                </Button>

                {/* Notifications */}
                <div className="relative">
                  <Button variant="ghost" size="sm" className="relative hover:bg-pink-50 p-1 lg:p-2">
                    <Bell className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center">
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
                        <AvatarFallback className="bg-pink-100 text-pink-700">RC</AvatarFallback>
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
                    <LogoutButton />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 p-3 lg:p-6 space-y-4 lg:space-y-8">
            {/* Key Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-6">
              <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-3 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-gray-600">Today's Registrations</p>
                      <p className="text-xl lg:text-3xl font-bold text-gray-900">
                        {isLoading ? '...' : dashboardData.todayRegistrations}
                      </p>
                      <p className="text-xs lg:text-sm text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                        <span className="hidden sm:inline">+15% from yesterday</span>
                        <span className="sm:hidden">+15%</span>
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-2 lg:p-3 rounded-xl">
                      <UserPlus className="h-4 w-4 lg:h-8 lg:w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-3 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-gray-600">Pending Appointments</p>
                      <p className="text-xl lg:text-3xl font-bold text-gray-900">
                        {isLoading ? '...' : dashboardData.pendingAppointments}
                      </p>
                      <p className="text-xs lg:text-sm text-pink-600 flex items-center mt-1">
                        <Calendar className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                        <span className="hidden sm:inline">Next at 10:30 AM</span>
                        <span className="sm:hidden">10:30 AM</span>
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-green-400 to-green-500 p-2 lg:p-3 rounded-xl">
                      <Calendar className="h-4 w-4 lg:h-8 lg:w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-3 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-gray-600">Waiting Patients</p>
                      <p className="text-xl lg:text-3xl font-bold text-gray-900">
                        {isLoading ? '...' : dashboardData.waitingPatients}
                      </p>
                      <p className="text-xs lg:text-sm text-yellow-600 flex items-center mt-1">
                        <Clock className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                        <span className="hidden sm:inline">Avg wait: 15 min</span>
                        <span className="sm:hidden">15 min</span>
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-2 lg:p-3 rounded-xl">
                      <Clock className="h-4 w-4 lg:h-8 lg:w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-100 hover:shadow-lg transition-all duration-300 col-span-2 lg:col-span-1">
                <CardContent className="p-3 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-gray-600">Pending Bills</p>
                      <p className="text-xl lg:text-3xl font-bold text-gray-900">
                        {isLoading ? '...' : dashboardData.totalBills}
                      </p>
                      <p className="text-xs lg:text-sm text-purple-600 flex items-center mt-1">
                        <DollarSign className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                        <span className="hidden sm:inline">₹1,25,000 total</span>
                        <span className="sm:hidden">₹1.25L</span>
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-2 lg:p-3 rounded-xl">
                      <CreditCard className="h-4 w-4 lg:h-8 lg:w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-100 hover:shadow-lg transition-all duration-300 col-span-2 lg:col-span-1">
                <CardContent className="p-3 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-gray-600">Emergency Contacts</p>
                      <p className="text-xl lg:text-3xl font-bold text-gray-900">
                        {isLoading ? '...' : dashboardData.emergencyContacts}
                      </p>
                      <p className="text-xs lg:text-sm text-red-600 flex items-center mt-1">
                        <AlertTriangle className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                        <span className="hidden sm:inline">2 critical</span>
                        <span className="sm:hidden">2 critical</span>
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-red-400 to-red-500 p-2 lg:p-3 rounded-xl">
                      <Phone className="h-4 w-4 lg:h-8 lg:w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
              {/* Patient Queue */}
              <Card className="border-pink-100 xl:col-span-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base lg:text-lg font-semibold">Patient Queue</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/receptionist/queue">
                        <Eye className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                        <span className="hidden sm:inline">View All</span>
                        <span className="sm:hidden">All</span>
                      </Link>
                    </Button>
                  </div>
                  <CardDescription className="text-xs lg:text-sm">Current patients waiting for consultation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 lg:space-y-4">
                  {isLoading ? (
                    <div className="text-center py-4">Loading queue...</div>
                  ) : patientQueue.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">No patients in queue today</div>
                  ) : (
                    patientQueue.slice(0, 5).map((patient) => (
                      <div key={patient.id} className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 lg:space-x-3 min-w-0 flex-1">
                          <div className="flex items-center space-x-1 lg:space-x-2">
                            <span className="font-medium text-xs lg:text-sm">#{patient.id}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-xs lg:text-sm truncate">
                              {patient.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {patient.doctor_name || 'No doctor'} • {patient.appointment_time || 'No time'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 lg:space-x-2 flex-shrink-0">
                          {getStatusBadge(patient.status)}
                          <Button variant="ghost" size="sm" className="p-1">
                            <Phone className="h-3 w-3 lg:h-4 lg:w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Recent Registrations */}
              <Card className="border-green-100 xl:col-span-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base lg:text-lg font-semibold">Recent Registrations</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setNewPatientDialog(true)}>
                      <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                      <span className="hidden sm:inline">Register</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </div>
                  <CardDescription className="text-xs lg:text-sm">Newly registered patients today</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 lg:space-y-4">
                  {isLoading ? (
                    <div className="text-center py-4">Loading registrations...</div>
                  ) : recentRegistrations.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">No recent registrations</div>
                  ) : (
                    recentRegistrations.map((patient) => (
                      <div key={patient.id} className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 lg:space-x-3 min-w-0 flex-1">
                          <Avatar className="h-8 w-8 lg:h-10 lg:w-10 flex-shrink-0">
                            <AvatarFallback className="bg-green-100 text-green-700 text-xs lg:text-sm">
                              {patient.name?.charAt(0) || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-xs lg:text-sm truncate">
                              {patient.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {patient.age}Y • {patient.gender} • {patient.contact_number}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <Button variant="ghost" size="sm" className="p-1">
                            <Edit className="h-3 w-3 lg:h-4 lg:w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="p-1">
                            <Eye className="h-3 w-3 lg:h-4 lg:w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Emergency Contacts */}
              <Card className="border-red-100 xl:col-span-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base lg:text-lg font-semibold">Emergency Contacts</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setEmergencyDialog(true)}>
                      <Phone className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                      <span className="hidden sm:inline">Contact</span>
                      <span className="sm:hidden">Call</span>
                    </Button>
                  </div>
                  <CardDescription className="text-xs lg:text-sm">Critical patient contacts requiring attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 lg:space-y-4">
                  {emergencyContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-2 lg:p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex items-center space-x-2 lg:space-x-3 min-w-0 flex-1">
                        <AlertTriangle className="h-4 w-4 lg:h-5 lg:w-5 text-red-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-xs lg:text-sm truncate">{contact.contactName}</p>
                          <p className="text-xs text-gray-600 truncate">{contact.relationship} of {contact.patientName}</p>
                          <p className="text-xs text-gray-500 truncate">{contact.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 lg:space-x-2 flex-shrink-0">
                        <Badge className={contact.priority === 'critical' ? 'bg-red-100 text-red-700 text-xs' : 'bg-yellow-100 text-yellow-700 text-xs'}>
                          {contact.priority}
                        </Badge>
                        <Button variant="ghost" size="sm" className="p-1">
                          <Phone className="h-3 w-3 lg:h-4 lg:w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Pending Bills & Messages Section */}
            <div className="grid grid-cols-1 gap-4 lg:gap-6">
              {/* Pending Bills */}
              <Card className="border-purple-100">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base lg:text-lg font-semibold">Pending Bills & Payments</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/receptionist/billing">
                        <CreditCard className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                        <span className="hidden sm:inline">Manage Billing</span>
                        <span className="sm:hidden">Billing</span>
                      </Link>
                    </Button>
                  </div>
                  <CardDescription className="text-xs lg:text-sm">Bills requiring payment processing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 lg:space-y-4">
                    {isLoading ? (
                      <div className="text-center py-4">Loading bills...</div>
                    ) : pendingBills.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 text-sm">No pending bills</div>
                    ) : (
                      pendingBills.map((bill) => (
                        <div key={bill.id} className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3 lg:space-x-4 min-w-0 flex-1">
                            <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                              <FileText className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm lg:text-base truncate">{bill.patientName}</p>
                              <p className="text-xs lg:text-sm text-gray-600 truncate">{bill.services?.join(', ')}</p>
                              <p className="text-xs text-gray-500">Due: {bill.dueDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
                            <div className="text-right">
                              <p className="font-bold text-sm lg:text-lg">₹{bill.amount?.toLocaleString()}</p>
                              {getStatusBadge(bill.status)}
                            </div>
                            <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-xs lg:text-sm px-2 lg:px-4">
                              <span className="hidden sm:inline">Process Payment</span>
                              <span className="sm:hidden">Pay</span>
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>

      {/* New Patient Registration Dialog */}
      <Dialog open={newPatientDialog} onOpenChange={setNewPatientDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg lg:text-xl">Register New Patient</DialogTitle>
            <DialogDescription className="text-sm lg:text-base">
              Enter patient details for registration. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
            {/* Offline Warning */}
            {!isOnline && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                  <span className="text-sm text-yellow-700">
                    You're currently offline. Registration data will be saved locally and synced when connection is restored.
                  </span>
                </div>
              </div>
            )}
            
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">First Name *</label>
                <Input 
                  id="firstName" 
                  placeholder="Enter first name" 
                  value={registrationForm.firstName}
                  onChange={(e) => setRegistrationForm(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">Last Name *</label>
                <Input 
                  id="lastName" 
                  placeholder="Enter last name" 
                  value={registrationForm.lastName}
                  onChange={(e) => setRegistrationForm(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="age" className="text-sm font-medium">Age *</label>
                <Input 
                  id="age" 
                  type="number" 
                  placeholder="Enter age" 
                  value={registrationForm.age}
                  onChange={(e) => setRegistrationForm(prev => ({ ...prev, age: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="gender" className="text-sm font-medium">Gender *</label>
                <select 
                  className="w-full p-2 border rounded-md text-sm"
                  value={registrationForm.gender}
                  onChange={(e) => setRegistrationForm(prev => ({ ...prev, gender: e.target.value }))}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Phone Number *</label>
              <Input 
                id="phone" 
                placeholder="+91 98765 43210" 
                value={registrationForm.phone}
                onChange={(e) => setRegistrationForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium">Address</label>
              <textarea 
                id="address" 
                placeholder="Enter complete address" 
                className="w-full p-2 border rounded-md text-sm"
                rows={3}
                value={registrationForm.address}
                onChange={(e) => setRegistrationForm(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="emergency" className="text-sm font-medium">Emergency Contact</label>
              <Input 
                id="emergency" 
                placeholder="Emergency contact number" 
                value={registrationForm.emergencyContact}
                onChange={(e) => setRegistrationForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => {
              setNewPatientDialog(false)
              setRegistrationForm({
                firstName: '',
                lastName: '',
                age: '',
                gender: '',
                phone: '',
                address: '',
                emergencyContact: ''
              })
            }} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button 
              className="bg-pink-500 hover:bg-pink-600 w-full sm:w-auto" 
              onClick={handleRegistrationSubmit}
              disabled={isSubmitting || !registrationForm.firstName || !registrationForm.lastName || !registrationForm.age || !registrationForm.gender || !registrationForm.phone}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {isOnline ? 'Registering...' : 'Saving Offline...'}
                </>
              ) : (
                'Register Patient'
              )}
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
