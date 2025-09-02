"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
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
import { Heart, LayoutDashboard, Calendar, Users, FileText, Stethoscope, Bell, LogOut, Plus, Clock, Activity, TrendingUp, Eye, FlaskConical, Brain, Pill, User, Phone, MapPin } from 'lucide-react'


// Mock data removed - using real API data from /api/doctor/appointments

// Mock recent patients data removed - using real API data from /api/doctor/recent-patients


// Navigation items
const navigationItems = [
  {
    title: "मुख्य (Main)",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, url: "/doctor", isActive: true },
      { title: "Today's Schedule", icon: Calendar, url: "/doctor/schedule" },
    ]
  },
  {
    title: "रोगी प्रबंधन (Patient Care)",
    items: [
      { title: "Patient Records", icon: Users, url: "/doctor/patients" },
      { title: "Consultations", icon: Stethoscope, url: "/doctor/consultations" },
      { title: "Medical History", icon: FileText, url: "/doctor/history" },
    ]
  },
  {
    title: "उपकरण (Tools)",
    items: [
      { title: "AI Assistant", icon: Brain, url: "/doctor/ai-tools" },
      { title: "Lab Results", icon: FlaskConical, url: "/doctor/lab-results" },
    ]
  }
]

export default function DoctorDashboard() {
  const { authState, logout } = useAuth();
  const { user, isLoading } = authState;
  const [notifications] = useState(5);
  const [stats, setStats] = useState({
    todaysAppointments: 0,
    totalPatients: 0,
    emergencyCalls: 0,
    surgeriesToday: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [recentPatientsLoading, setRecentPatientsLoading] = useState(true);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [pendingTasksLoading, setPendingTasksLoading] = useState(true);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Please log in to view the dashboard.</div>;
  }

  // Use logged-in user data, with placeholders for details not in the auth state
  const doctorInfo = {
    name: `${user.firstName} ${user.lastName}`,
    specialization: "Cardiologist", // Placeholder - to be fetched from a doctor profile API
    department: "Cardiology Department", // Placeholder
    employeeId: user.id,
    experience: "12 years" // Placeholder
  };

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const response = await fetch('/api/doctor/dashboard-stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    const fetchAppointments = async () => {
      try {
        setAppointmentsLoading(true);
        const response = await fetch('/api/doctor/appointments');
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }
        const data = await response.json();
        console.log('Appointments API response:', data); // Debug log
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        // Set empty array instead of leaving undefined
        setAppointments([]);
      } finally {
        setAppointmentsLoading(false);
      }
    };

    const fetchRecentPatients = async () => {
      try {
        setRecentPatientsLoading(true);
        const response = await fetch('/api/doctor/recent-patients');
        if (!response.ok) {
          throw new Error('Failed to fetch recent patients');
        }
        const data = await response.json();
        setRecentPatients(data);
      } catch (error) {
        console.error("Error fetching recent patients:", error);
      } finally {
        setRecentPatientsLoading(false);
      }
    };

    const fetchPendingTasks = async () => {
      try {
        setPendingTasksLoading(true);
        const response = await fetch('/api/doctor/pending-tasks');
        if (!response.ok) {
          throw new Error('Failed to fetch pending tasks');
        }
        const data = await response.json();
        setPendingTasks(data);
      } catch (error) {
        console.error("Error fetching pending tasks:", error);
      } finally {
        setPendingTasksLoading(false);
      }
    };

    if (user) {
      fetchStats();
      fetchAppointments();
      fetchRecentPatients();
      fetchPendingTasks();
    }
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
      case 'waiting':
        return <Badge className="bg-yellow-100 text-yellow-700">Waiting</Badge>
      case 'scheduled':
        return <Badge className="bg-purple-100 text-purple-700">Scheduled</Badge>
      case 'stable':
        return <Badge className="bg-green-100 text-green-700">Stable</Badge>
      case 'under_observation':
        return <Badge className="bg-yellow-100 text-yellow-700">Under Observation</Badge>
      case 'improving':
        return <Badge className="bg-blue-100 text-blue-700">Improving</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'prescription_review': return <Pill className="h-4 w-4" />
      case 'lab_review': return <FlaskConical className="h-4 w-4" />
      case 'ai_summary': return <Brain className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
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
                <p className="text-sm text-gray-500">डॉक्टर पैनल</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-4 py-6">
            {navigationItems.map((section: any) => (
              <SidebarGroup key={section.title}>
                <SidebarGroupLabel className="text-gray-600 font-medium mb-2">
                  {section.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item: any) => (
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
                <AvatarImage src={"/placeholder.svg?height=40&width=40"} />
                <AvatarFallback className="bg-pink-100 text-pink-700">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{doctorInfo.name}</p>
                <p className="text-xs text-gray-500 truncate">Cardiologist</p>
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
                  <h1 className="text-xl font-bold text-gray-900">{doctorInfo.name}</h1>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Stethoscope className="h-4 w-4 mr-1" />
                    {doctorInfo.specialization}
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
                        <AvatarImage src={"/placeholder.svg?height=40&width=40"} />
                        <AvatarFallback className="bg-pink-100 text-pink-700">{initials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>Doctor Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/doctor/settings">
                        <User className="mr-2 h-4 w-4" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/doctor/schedule">
                        <Calendar className="mr-2 h-4 w-4" />
                        My Schedule
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onSelect={() => logout()}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                      <p className="text-3xl font-bold text-gray-900">{statsLoading ? '...' : stats.todaysAppointments}</p>
                      <p className="text-sm text-green-600 mt-1">
                        Scheduled for today
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
                      <p className="text-sm font-medium text-gray-600">Total Patients</p>
                      <p className="text-3xl font-bold text-yellow-600">{statsLoading ? '...' : stats.totalPatients}</p>
                      <p className="text-sm text-yellow-600 mt-1">
                        Under your care
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-3 rounded-xl">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Emergency Calls</p>
                      <p className="text-3xl font-bold text-red-600">{statsLoading ? '...' : stats.emergencyCalls}</p>
                      <p className="text-sm text-red-600 mt-1">
                        Urgent attention needed
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-red-400 to-red-500 p-3 rounded-xl">
                      <Activity className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>


              <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Experience</p>
                      <p className="text-3xl font-bold text-green-600">{doctorInfo.experience.split(' ')[0]}</p>
                      <p className="text-sm text-green-600 mt-1">
                        Years of practice
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-green-400 to-green-500 p-3 rounded-xl">
                      <User className="h-8 w-8 text-white" />
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
                  <Link href="/doctor/consultations/new">
                    <Button className="w-full h-16 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-xl flex flex-col items-center justify-center space-y-1">
                      <Plus className="h-5 w-5" />
                      <span className="text-sm">New Consultation</span>
                    </Button>
                  </Link>
                  
                  <Link href="/doctor/patients">
                    <Button variant="outline" className="w-full h-16 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl flex flex-col items-center justify-center space-y-1">
                      <Users className="h-5 w-5" />
                      <span className="text-sm">Patient Records</span>
                    </Button>
                  </Link>
                  
                  <Link href="/doctor/ai-tools">
                    <Button variant="outline" className="w-full h-16 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl flex flex-col items-center justify-center space-y-1">
                      <Brain className="h-5 w-5" />
                      <span className="text-sm">AI Assistant</span>
                    </Button>
                  </Link>
                  
                  <Link href="/doctor/lab-results">
                    <Button variant="outline" className="w-full h-16 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl flex flex-col items-center justify-center space-y-1">
                      <FlaskConical className="h-5 w-5" />
                      <span className="text-sm">Lab Results</span>
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
                    <CardDescription>Your scheduled patients for today</CardDescription>
                  </div>
                  <Link href="/doctor/schedule">
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointmentsLoading ? (
                      <p>Loading appointments...</p>
                    ) : appointments.length > 0 ? (
                      appointments.map((appointment: any) => (
                        <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center space-x-4">
                            <div className="bg-pink-100 p-2 rounded-lg">
                              <Clock className="h-5 w-5 text-pink-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{appointment.Patient.firstName} {appointment.Patient.lastName}</p>
                              <p className="text-sm text-gray-600">{appointment.reason}</p>
                              <p className="text-sm text-gray-500">{new Date(appointment.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(appointment.status)}
                            <Link href={`/doctor/patients/${appointment.Patient.id}?appointmentId=${appointment.id}`} passHref>
                              <Button variant="outline" size="sm" className="h-8 mt-1">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No appointments scheduled for today.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Patients */}
              <Card className="border-pink-100">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">Recent Patients</CardTitle>
                    <CardDescription>Recently consulted patients</CardDescription>
                  </div>
                  <Link href="/doctor/patients">
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentPatientsLoading ? (
                      <p>Loading recent patients...</p>
                    ) : recentPatients.length > 0 ? (
                      recentPatients.map((patient) => (
                      <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{patient.firstName} {patient.lastName} ({patient.age}y)</p>
                            <p className="text-sm text-gray-600">Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(patient.status)}
                           <Link href={`/doctor/patients/${patient.id}`} passHref>
                             <Button variant="outline" size="sm" className="h-8 mt-1">
                               <Eye className="h-4 w-4 mr-1" />
                               View
                             </Button>
                           </Link>
                        </div>
                      </div>
                    ))
                    ) : (
                      <p>No recent patients found.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Tasks */}
            <Card className="border-pink-100">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900">Pending Tasks</CardTitle>
                  <CardDescription>Items requiring your attention</CardDescription>
                </div>
                <Badge className="bg-red-100 text-red-700">
                  {pendingTasksLoading ? '...' : pendingTasks.length} pending
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingTasksLoading ? (
                    <p>Loading tasks...</p>
                  ) : pendingTasks.length > 0 ? (
                    pendingTasks.map((task: any) => (
                      <div key={task.id} className={`p-4 rounded-xl border ${getPriorityColor(task.priority)}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getTaskIcon(task.type)}
                            <div>
                              <p className="font-semibold">{task.Patient.firstName} {task.Patient.lastName}</p>
                              <p className="text-sm opacity-75">{task.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={`${getPriorityColor(task.priority)} border-0`}>
                              {task.priority}
                            </Badge>
                            <p className="text-xs opacity-75 mt-1">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No pending tasks.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
