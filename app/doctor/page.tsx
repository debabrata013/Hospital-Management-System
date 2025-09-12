"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Heart, LayoutDashboard, Calendar, Users, FileText, Stethoscope, Bell, LogOut, Plus, Clock, Activity, TrendingUp, Eye, FlaskConical, Brain, Pill, User, Phone, MapPin, CalendarDays, FileEdit } from 'lucide-react'


// Mock data removed - using real API data from /api/doctor/appointments

// Mock recent patients data removed - using real API data from /api/doctor/recent-patients


// Navigation items
const navigationItems = [
  {
    title: "मुख्य (Main)",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, url: "/doctor", isActive: true },
      { title: "Today's Schedule", icon: Calendar, url: "/doctor/schedule" },
      { title: "Leave Requests", icon: CalendarDays, url: "/doctor/leave-requests" },
    ]
  },
  {
    title: "रोगी प्रबंधन (Patient Care)",
    items: [
      { title: "Patient Records", icon: Users, url: "/doctor/patients" },
      { title: "Patient Information Center", icon: FileText, url: "/doctor/patient-info" },
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
  
  // Prescription modal states
  const [prescriptionDialog, setPrescriptionDialog] = useState(false);
  const [selectedAppointmentForPrescription, setSelectedAppointmentForPrescription] = useState<any>(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
    remarks: ''
  });

  useEffect(() => {
    if (user) {
      console.log('Auth User Object:', user);
    }
  }, [user]);


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

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Please log in to view the dashboard.</div>;
  }

  // Use logged-in user data, with placeholders for details not in the auth state
  const doctorInfo = {
    name: user.name || 'Doctor',
    specialization: user.department || "Cardiologist", // Use department from auth or placeholder
    department: user.department || "Cardiology Department", // Use department from auth or placeholder
    employeeId: user.id,
    experience: "12 years" // Placeholder
  };


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

  const handleTaskClick = (task: any) => {
    switch (task.type) {
      case 'prescription_review':
        // Navigate to patient page with prescription focus
        window.location.href = `/doctor/patients/${task.Patient.id}?tab=prescriptions&prescriptionId=${task.id.replace('PRESC_', '')}`;
        break;
      case 'appointment_prep':
        // Navigate to patient page for appointment preparation
        window.location.href = `/doctor/patients/${task.Patient.id}?tab=appointments&appointmentId=${task.id.replace('APPT_', '')}`;
        break;
      case 'lab_review':
        // Navigate to lab results
        window.location.href = `/doctor/lab-results?patientId=${task.Patient.id}`;
        break;
      default:
        // Default to patient page
        window.location.href = `/doctor/patients/${task.Patient.id}`;
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
              <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-pink-700">DR</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user ? user.name : 'Doctor'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.department || 'Cardiologist'}</p>
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
                  <h1 className="text-xl font-bold text-gray-900">{user ? user.name : 'Doctor'}</h1>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Stethoscope className="h-4 w-4 mr-1" />
                    {user?.department || 'Cardiologist'}
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
                      <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-pink-700">DR</span>
                      </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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


            </div>

            {/* Quick Actions */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="text-gray-900">Quick Actions</CardTitle>
                <CardDescription>Common daily operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              {/* Appointments */}
              <Card className="border-pink-100">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">Appointments</CardTitle>
                    <CardDescription>Your scheduled appointments</CardDescription>
                  </div>
                  <Link href="/doctor/schedule">
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {appointmentsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-gray-500">Loading appointments...</div>
                      </div>
                    ) : appointments.length > 0 ? (
                      appointments.map((appointment: any) => (
                        <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start space-x-3 flex-1 min-w-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-600 font-semibold text-sm">
                                  {appointment.name ? appointment.name.charAt(0).toUpperCase() : 'P'}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-semibold text-gray-900 truncate">
                                    {appointment.Patient?.firstName && appointment.Patient?.lastName 
                                      ? `${appointment.Patient.firstName} ${appointment.Patient.lastName}`
                                      : appointment.name || 'Unknown Patient'
                                    }
                                  </h4>
                                  {getStatusBadge(appointment.status)}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{appointment.reason || 'General Consultation'}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{appointment.appointmentTime ? new Date(`2000-01-01T${appointment.appointmentTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:00'}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                                  </div>
                                  {appointment.appointmentType && (
                                    <div className="flex items-center space-x-1">
                                      <span className="capitalize">{appointment.appointmentType.replace('-', ' ')}</span>
                                    </div>
                                  )}
                                </div>
                                {(appointment.createdBy?.name || appointment.createdByName) && (
                                  <div className="mt-1 text-xs text-blue-600">
                                    Scheduled by {appointment.createdBy?.name || appointment.createdByName}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2 flex-shrink-0 w-24">
                              <Button variant="outline" size="sm" className="h-8 w-full text-xs">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-full text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                onClick={() => {
                                  setSelectedAppointmentForPrescription(appointment);
                                  setPrescriptionDialog(true);
                                }}
                              >
                                <FileEdit className="h-3 w-3 mr-1" />
                                Prescription
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No appointments scheduled</p>
                      </div>
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
                      <div 
                        key={task.id} 
                        className={`p-4 rounded-xl border ${getPriorityColor(task.priority)} cursor-pointer hover:shadow-md transition-all duration-200`}
                        onClick={() => handleTaskClick(task)}
                      >
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
                            <Button variant="outline" size="sm" className="h-8 mt-1">
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
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

      {/* Prescription Dialog */}
      <Dialog open={prescriptionDialog} onOpenChange={setPrescriptionDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Prescription</DialogTitle>
            <DialogDescription>
              Create prescription for {selectedAppointmentForPrescription?.Patient?.firstName} {selectedAppointmentForPrescription?.Patient?.lastName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Vitals Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Vitals</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label>Blood Pressure</Label>
                  <Input
                    placeholder="120/80"
                    value={prescriptionForm.bloodPressure}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, bloodPressure: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Heart Rate (bpm)</Label>
                  <Input
                    placeholder="72"
                    value={prescriptionForm.heartRate}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, heartRate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Temperature (°F)</Label>
                  <Input
                    placeholder="98.6"
                    value={prescriptionForm.temperature}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, temperature: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Weight (kg)</Label>
                  <Input
                    placeholder="70"
                    value={prescriptionForm.weight}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, weight: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Height (cm)</Label>
                  <Input
                    placeholder="170"
                    value={prescriptionForm.height}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, height: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Medicines Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Medicines</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPrescriptionForm(prev => ({
                      ...prev,
                      medicines: [...prev.medicines, { name: '', dosage: '', frequency: '', duration: '' }]
                    }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Medicine
                </Button>
              </div>
              
              <div className="space-y-4">
                {prescriptionForm.medicines.map((medicine, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div>
                      <Label>Medicine Name</Label>
                      <Input
                        placeholder="Medicine name"
                        value={medicine.name}
                        onChange={(e) => {
                          const newMedicines = [...prescriptionForm.medicines];
                          newMedicines[index].name = e.target.value;
                          setPrescriptionForm(prev => ({ ...prev, medicines: newMedicines }));
                        }}
                      />
                    </div>
                    <div>
                      <Label>Dosage</Label>
                      <Input
                        placeholder="500mg"
                        value={medicine.dosage}
                        onChange={(e) => {
                          const newMedicines = [...prescriptionForm.medicines];
                          newMedicines[index].dosage = e.target.value;
                          setPrescriptionForm(prev => ({ ...prev, medicines: newMedicines }));
                        }}
                      />
                    </div>
                    <div>
                      <Label>Frequency</Label>
                      <Input
                        placeholder="2 times daily"
                        value={medicine.frequency}
                        onChange={(e) => {
                          const newMedicines = [...prescriptionForm.medicines];
                          newMedicines[index].frequency = e.target.value;
                          setPrescriptionForm(prev => ({ ...prev, medicines: newMedicines }));
                        }}
                      />
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="7 days"
                          value={medicine.duration}
                          onChange={(e) => {
                            const newMedicines = [...prescriptionForm.medicines];
                            newMedicines[index].duration = e.target.value;
                            setPrescriptionForm(prev => ({ ...prev, medicines: newMedicines }));
                          }}
                        />
                        {prescriptionForm.medicines.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              const newMedicines = prescriptionForm.medicines.filter((_, i) => i !== index);
                              setPrescriptionForm(prev => ({ ...prev, medicines: newMedicines }));
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Remarks Section */}
            <div>
              <Label>Remarks & Instructions</Label>
              <Textarea
                placeholder="Additional remarks, instructions for patient..."
                rows={4}
                value={prescriptionForm.remarks}
                onChange={(e) => setPrescriptionForm(prev => ({ ...prev, remarks: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPrescriptionDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                try {
                  const response = await fetch('/api/doctor/prescriptions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      appointmentId: selectedAppointmentForPrescription?.id,
                      patientId: selectedAppointmentForPrescription?.Patient?.id,
                      vitals: {
                        bloodPressure: prescriptionForm.bloodPressure,
                        heartRate: prescriptionForm.heartRate,
                        temperature: prescriptionForm.temperature,
                        weight: prescriptionForm.weight,
                        height: prescriptionForm.height
                      },
                      medicines: prescriptionForm.medicines.filter(med => med.name.trim() !== ''),
                      remarks: prescriptionForm.remarks
                    })
                  });

                  if (response.ok) {
                    setPrescriptionDialog(false);
                    setPrescriptionForm({
                      bloodPressure: '',
                      heartRate: '',
                      temperature: '',
                      weight: '',
                      height: '',
                      medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
                      remarks: ''
                    });
                    alert('Prescription created successfully!');
                  } else {
                    const error = await response.json();
                    alert(error.message || 'Failed to create prescription');
                  }
                } catch (error) {
                  console.error('Error creating prescription:', error);
                  alert('Failed to create prescription');
                }
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <FileEdit className="h-4 w-4 mr-1" />
              Create Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
