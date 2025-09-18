"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
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
  Trash2,
  Eye,
  Coffee,
  Calendar,
  LogOut,
  UserCog,
  Shield,
  TrendingUp,
  Thermometer,
  HeartPulse,
  Clipboard,
  UserCheck,
  Package,
  Phone,
  Stethoscope
} from 'lucide-react'
import { LogoutButton } from "@/components/auth/LogoutButton"
import { useAuth } from "@/hooks/useAuth"

// Mock data for staff dashboard
const staffStats = {
  completedTasks: 8,
  pendingTasks: 5,
  medicineDeliveries: 3,
  shiftHours: 8
}

// Navigation items for nurse
const navigationItems = [
  {
    title: "Dashboard",
    items: [
      { title: "Overview", icon: LayoutDashboard, url: "/nurse", isActive: true },
      { title: "Tasks", icon: ClipboardList, url: "/nurse/tasks" },
      { title: "Medicines", icon: Pill, url: "/nurse/medicines" },
      { title: "Vitals", icon: Activity, url: "/nurse/vitals" },
      
    ]
  },
  {
    title: "Personal",
    items: [
      { title: "Break Time", icon: Coffee, url: "/nurse/break" },
      { title: "Leave", icon: Calendar, url: "/nurse/leave" },
    ]
  }
]
export default function StaffDashboard() {
  const [notifications] = useState(6)
  const [staffProfile, setStaffProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [allStaff, setAllStaff] = useState<any[]>([])
  const [assignedPatients, setAssignedPatients] = useState<any[]>([])
  const [patientsLoading, setPatientsLoading] = useState(true)
  const [scheduleData, setScheduleData] = useState<any>(null)
  const [scheduleLoading, setScheduleLoading] = useState(true)
  const { authState } = useAuth()
  const user = authState?.user

  // Fetch staff profile data and colleagues
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch nurse profile
        const profileResponse = await fetch('/api/nurse/profile')
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          setStaffProfile(profileData.staff)
        }

        // Fetch all nurses for directory
        const staffResponse = await fetch('/api/nurse/names')
        if (staffResponse.ok) {
          const staffData = await staffResponse.json()
          if (staffData.success && staffData.data) {
            setAllStaff(staffData.data)
          }
        }


        // Fetch assigned patients
        try {
          const patientsResponse = await fetch('/api/nurse/assigned-patients')
          if (patientsResponse.ok) {
            const patientsData = await patientsResponse.json()
            if (patientsData.success) {
              setAssignedPatients(patientsData.patients || [])
            }
          }
        } catch (error) {
          console.error('Error fetching assigned patients:', error)
          setAssignedPatients([])
        } finally {
          setPatientsLoading(false)
        }

        // Fetch nurse schedule
        try {
          console.log('🔄 Fetching nurse schedule...');
          const scheduleResponse = await fetch('/api/nurse/schedule', { 
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache'
            }
          })
          console.log('📅 Schedule API response status:', scheduleResponse.status);
          
          if (scheduleResponse.ok) {
            const scheduleResponseData = await scheduleResponse.json()
            console.log('📊 Schedule data received:', scheduleResponseData);
            
            if (scheduleResponseData.success) {
              setScheduleData(scheduleResponseData)
              console.log('✅ Schedule data set in state');
              
              // Log current time and schedule details
              const now = new Date();
              console.log('🕐 Current time:', now.toLocaleTimeString());
              console.log('📋 Today schedule:', scheduleResponseData.todaySchedule);
              console.log('📅 Upcoming schedules:', scheduleResponseData.upcomingSchedules?.length || 0);
            }
          } else {
            console.log('❌ Schedule API failed with status:', scheduleResponse.status);
          }
        } catch (error) {
          console.error('Error fetching schedule:', error)
          setScheduleData(null)
        } finally {
          setScheduleLoading(false)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
    <Image
      src="/logo.jpg"
      alt="NMSC Logo"
      width={40}
      height={40}
      className="rounded-md"
    />
    <div>
      <h2 className="text-lg font-bold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
        NMSC
      </h2>
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
                  <h1 className="text-xl font-bold text-gray-900">Nurse Dashboard</h1>
                  <p className="text-sm text-gray-500">Nurse management and hospital operations</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Quick Actions removed */}

                {/* Notifications 
                <div className="relative">
                  <Button variant="ghost" size="sm" className="relative hover:bg-pink-50">
                    <Bell className="h-5 w-5 text-gray-600" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notifications}
                      </span>
                    )}
                  </Button>
                </div> */}
                
{/* Back to Home Link */}
<div className="mb-6">
  <Link
    href="/"
    className="inline-flex items-center text-gray-600 hover:text-pink-500 transition-colors"
  >
    <ArrowLeft className="h-4 w-4 mr-2" />
    Back to Home
  </Link>
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
            {/* Staff Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Staff Profile Card */}
              <Card className="border-pink-100 md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center">
                    <UserCog className="h-6 w-6 mr-2 text-pink-500" />
                    My Profile
                  </CardTitle>
                  <CardDescription>Your nurse profile information</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading profile...</p>
                    </div>
                  ) : staffProfile ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="bg-pink-100 text-pink-700 text-lg">
                            {staffProfile.name?.split(' ').map((n: string) => n[0]).join('') || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{staffProfile.name}</h3>
                          <p className="text-sm text-gray-500">ID: {staffProfile.user_id}</p>
                          <Badge className="mt-1 capitalize">{staffProfile.role}</Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                        <div>
                          <p className="text-gray-500">Department</p>
                          <p className="font-medium">{staffProfile.department || 'Not assigned'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Assignment</p>
                          <div className="flex items-center">
                            <Badge 
                              className={`capitalize ${
                                staffProfile.assignment === 'ward' 
                                  ? 'bg-blue-100 text-blue-700 border-blue-200' 
                                  : staffProfile.assignment === 'opd'
                                  ? 'bg-green-100 text-green-700 border-green-200'
                                  : 'bg-gray-100 text-gray-700 border-gray-200'
                              }`}
                            >
                              {staffProfile.assignment === 'ward' ? 'Ward' : 
                               staffProfile.assignment === 'opd' ? 'OPD' : 
                               'Not Assigned'}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-500">Shift</p>
                          <p className="font-medium capitalize">{staffProfile.shift || 'Flexible'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Contact</p>
                          <p className="font-medium">{staffProfile.mobile}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Email</p>
                          <p className="font-medium">{staffProfile.email}</p>
                        </div>
                      </div>
                      
                      {staffProfile.specialization && (
                        <div className="mt-2">
                          <p className="text-gray-500 text-sm">Specialization</p>
                          <p className="font-medium">{staffProfile.specialization}</p>
                        </div>
                      )}
                      
                      <div className="pt-4 border-t border-gray-100">
                        <Link href="/nurse/leave">
                          <Button className="w-full bg-pink-500 hover:bg-pink-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            Apply for Leave
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Profile information not available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Quick Stats */}
              <Card className="border-pink-100 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center">
                    <Activity className="h-6 w-6 mr-2 text-pink-500" />
                    Work Dashboard
                  </CardTitle>
                  <CardDescription>Today's shifts and schedule</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-blue-800">
                          {scheduleLoading ? 'Current Shift' : 
                           scheduleData?.scheduleType === 'current' ? 'Current Shift' :
                           scheduleData?.scheduleType === 'upcoming' ? 'Upcoming Shift' :
                           scheduleData?.scheduleType === 'completed' ? 'Recent Shift' :
                           'Shift Status'}
                        </h3>
                        <Clock className="h-5 w-5 text-blue-500" />
                      </div>
                      {scheduleLoading ? (
                        <div className="animate-pulse">
                          <div className="h-8 bg-blue-200 rounded mt-2"></div>
                          <div className="h-4 bg-blue-200 rounded mt-1"></div>
                        </div>
                      ) : scheduleData?.todaySchedule ? (
                        <>
                          <div className="flex items-center space-x-2">
                            <p className="text-2xl font-bold capitalize">
                              {scheduleData.todaySchedule.shift_type}
                            </p>
                            {scheduleData.scheduleType === 'current' && (
                              <Badge className="bg-green-100 text-green-700 text-xs">ACTIVE</Badge>
                            )}
                            {scheduleData.scheduleType === 'upcoming' && (
                              <Badge className="bg-blue-100 text-blue-700 text-xs">UPCOMING</Badge>
                            )}
                            {scheduleData.scheduleType === 'completed' && (
                              <Badge className="bg-gray-100 text-gray-700 text-xs">COMPLETED</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {scheduleData.todaySchedule.start_time} - {scheduleData.todaySchedule.end_time}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {scheduleData.todaySchedule.ward_assignment} • {scheduleData.todaySchedule.status}
                          </p>
                          <p className="text-xs text-blue-500 mt-1">
                            🕐 Current: {new Date().toLocaleTimeString()}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-2xl font-bold mt-2">No Shift</p>
                          <p className="text-sm text-gray-600 mt-1">No schedule assigned for today</p>
                          <p className="text-xs text-blue-500 mt-1">
                            🕐 Current: {new Date().toLocaleTimeString()}
                          </p>
                        </>
                      )}
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-green-800">Today's Tasks</h3>
                        <ClipboardList className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="text-2xl font-bold mt-2">8</p>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="text-green-600 font-medium">3 completed</span> • 5 pending
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-purple-800">Break Status</h3>
                        <Coffee className="h-5 w-5 text-purple-500" />
                      </div>
                      <Link href="/nurse/break">
                        <Button variant="outline" className="w-full mt-2 border-purple-200 text-purple-700 hover:bg-purple-100">
                          Start Break
                        </Button>
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        Time used today: 0 minutes
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-medium text-gray-700 mb-2">Schedule Overview</h3>
                    {scheduleLoading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-10 bg-gray-300 rounded-full"></div>
                              <div className="space-y-2 flex-1">
                                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                                <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : scheduleData?.todaySchedule ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center">
                            <div className="w-2 h-10 bg-blue-500 rounded-full mr-3"></div>
                            <div>
                              <p className="font-medium capitalize">{scheduleData.todaySchedule.shift_type} Shift</p>
                              <p className="text-sm text-gray-500">
                                {scheduleData.todaySchedule.start_time} - {scheduleData.todaySchedule.end_time}
                              </p>
                              <p className="text-xs text-gray-400">
                                {scheduleData.todaySchedule.ward_assignment}
                              </p>
                            </div>
                          </div>
                          <Badge className={`capitalize ${
                            scheduleData.todaySchedule.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                            scheduleData.todaySchedule.status === 'active' ? 'bg-green-100 text-green-700' :
                            scheduleData.todaySchedule.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {scheduleData.todaySchedule.status}
                          </Badge>
                        </div>
                        
                        {scheduleData.upcomingSchedules && scheduleData.upcomingSchedules.length > 1 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-600 mb-2">Upcoming Schedules</h4>
                            <div className="space-y-2">
                              {scheduleData.upcomingSchedules.slice(1, 3).map((schedule: any, index: number) => (
                                <div key={schedule.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                  <div className="flex items-center">
                                    <div className="w-2 h-8 bg-gray-400 rounded-full mr-3"></div>
                                    <div>
                                      <p className="text-sm font-medium capitalize">{schedule.shift_type} Shift</p>
                                      <p className="text-xs text-gray-500">
                                        {new Date(schedule.shift_date).toLocaleDateString()} • {schedule.start_time} - {schedule.end_time}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {schedule.ward_assignment}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gray-50 rounded-lg">
                        <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No schedule assigned</p>
                        <p className="text-xs text-gray-400">Contact admin for schedule assignment</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Assigned Patients Section */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <Users className="h-6 w-6 mr-2 text-pink-500" />
                  Assigned Patients
                </CardTitle>
                <CardDescription>Patients assigned to you by doctors</CardDescription>
              </CardHeader>
              <CardContent>
                {patientsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading assigned patients...</p>
                  </div>
                ) : assignedPatients.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {assignedPatients.slice(0, 6).map((patient: any) => (
                        <div key={patient.assignment_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {patient.patient_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">{patient.patient_name}</h4>
                              <p className="text-sm text-gray-600 truncate">ID: {patient.patient_code}</p>
                              {patient.patient_phone && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <Phone className="h-3 w-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">{patient.patient_phone}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1 mt-1">
                                <Stethoscope className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  Dr. {patient.doctor_name} ({patient.doctor_department})
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 mt-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  Assigned: {new Date(patient.assigned_date).toLocaleDateString()}
                                </span>
                              </div>
                              {patient.blood_group && (
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {patient.blood_group}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {assignedPatients.length > 6 && (
                      <div className="text-center mt-4">
                        <Button variant="outline" className="text-pink-600 border-pink-200 hover:bg-pink-50">
                          View All {assignedPatients.length} Patients
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No patients assigned yet</p>
                    <p className="text-xs text-gray-400 mt-1">Patients will appear here when doctors assign them to you</p>
                  </div>
                )}
              </CardContent>
            </Card>
                        
      
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
