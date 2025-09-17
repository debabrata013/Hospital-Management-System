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
  Coffee,
  Phone
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

// Navigation items for staff
const navigationItems = [
  {
    title: "Dashboard",
    items: [
      { title: "Overview", icon: LayoutDashboard, url: "/staff", isActive: true },
      { title: "Tasks", icon: ClipboardList, url: "/staff/tasks" },
      { title: "Medicines", icon: Pill, url: "/staff/medicines" },
      { title: "Vitals", icon: Activity, url: "/staff/vitals" },
      
    ]
  },
  {
    title: "Personal",
    items: [
      { title: "Attendance", icon: UserCheck, url: "/staff/attendance" },
      { title: "Break Time", icon: Coffee, url: "/staff/break" },
      { title: "Leave", icon: Calendar, url: "/staff/leave" },
    ]
  }
]
export default function StaffDashboard() {
  const [notifications] = useState(6)
  const [staffProfile, setStaffProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [allStaff, setAllStaff] = useState<any[]>([])
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [attendanceLoading, setAttendanceLoading] = useState(true)
  const { authState } = useAuth()
  const user = authState?.user

  // Fetch staff profile data and colleagues
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch staff profile
        const profileResponse = await fetch('/api/staff/profile')
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          setStaffProfile(profileData.staff)
        }

        // Fetch all staff for directory
        const staffResponse = await fetch('/api/staff/names')
        if (staffResponse.ok) {
          const staffData = await staffResponse.json()
          if (staffData.success && staffData.data) {
            setAllStaff(staffData.data)
          }
        }

        // Fetch attendance data
        try {
          const attendanceResponse = await fetch('/api/staff/attendance')
          if (attendanceResponse.ok) {
            const attendanceData = await attendanceResponse.json()
            if (attendanceData.success) {
              setAttendanceData(attendanceData.data || [])
            }
          }
        } catch (error) {
          console.error('Error fetching attendance data:', error)
          // Use mock data if API fails
          setAttendanceData([
            { date: '2025-09-14', checkIn: '08:05:00', checkOut: '17:00:00', status: 'present' },
            { date: '2025-09-13', checkIn: '08:02:00', checkOut: '17:05:00', status: 'present' },
            { date: '2025-09-12', checkIn: '08:00:00', checkOut: '16:58:00', status: 'present' },
            { date: '2025-09-11', checkIn: '08:10:00', checkOut: '17:10:00', status: 'present' },
            { date: '2025-09-10', checkIn: '08:25:00', checkOut: '17:00:00', status: 'late' },
            { date: '2025-09-09', checkIn: null, checkOut: null, status: 'absent' }
          ])
        } finally {
          setAttendanceLoading(false)
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
                
{/* Back to Home Link
<div className="mb-6">
  <Link
    href="/"
    className="inline-flex items-center text-gray-600 hover:text-pink-500 transition-colors"
  >
    <ArrowLeft className="h-4 w-4 mr-2" />
    Back to Home
  </Link>
</div> */}

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
                        <Link href="/staff/leave">
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
                        <h3 className="font-medium text-blue-800">Current Shift</h3>
                        <Clock className="h-5 w-5 text-blue-500" />
                      </div>
                      <p className="text-2xl font-bold mt-2">{staffProfile?.shift || 'Flexible'}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {staffProfile?.role === 'pharmacy' ? 'Pharmacy Hours' : 
                         staffProfile?.role === 'receptionist' ? 'Front Desk' : 
                         staffProfile?.role === 'staff' ? 'Nursing Schedule' : 'Staff Hours'}
                      </p>
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
                      <Link href="/staff/break">
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
                    <h3 className="font-medium text-gray-700 mb-2">Today's Schedule</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-2 h-10 bg-blue-500 rounded-full mr-3"></div>
                          <div>
                            <p className="font-medium">Morning Briefing</p>
                            <p className="text-sm text-gray-500">8:00 AM - 8:30 AM</p>
                          </div>
                        </div>
                        <Badge>Completed</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-2 h-10 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <p className="font-medium">Shift Duties</p>
                            <p className="text-sm text-gray-500">8:30 AM - 12:30 PM</p>
                          </div>
                        </div>
                        <Badge variant="outline">In Progress</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-2 h-10 bg-orange-500 rounded-full mr-3"></div>
                          <div>
                            <p className="font-medium">Lunch Break</p>
                            <p className="text-sm text-gray-500">12:30 PM - 1:30 PM</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Upcoming</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
                        
      
            {/* Attendance Section */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <UserCheck className="h-6 w-6 mr-2 text-pink-500" />
                  My Attendance
                </CardTitle>
                <CardDescription>View your attendance history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Attendance Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                      <div className="flex flex-col">
                        <h3 className="font-medium text-green-800">Present Days</h3>
                        <p className="text-2xl font-bold mt-1">
                          {attendanceLoading 
                            ? "..." 
                            : attendanceData.filter(a => a.status === 'present').length}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                      <div className="flex flex-col">
                        <h3 className="font-medium text-yellow-800">Late Days</h3>
                        <p className="text-2xl font-bold mt-1">
                          {attendanceLoading 
                            ? "..." 
                            : attendanceData.filter(a => a.status === 'late').length}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                      <div className="flex flex-col">
                        <h3 className="font-medium text-red-800">Absent Days</h3>
                        <p className="text-2xl font-bold mt-1">
                          {attendanceLoading 
                            ? "..." 
                            : attendanceData.filter(a => a.status === 'absent').length}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <div className="flex flex-col">
                        <h3 className="font-medium text-blue-800">Attendance Rate</h3>
                        <p className="text-2xl font-bold mt-1">
                          {attendanceLoading 
                            ? "..." 
                            : attendanceData.length 
                              ? Math.round((attendanceData.filter(a => a.status === 'present' || a.status === 'late').length / attendanceData.length) * 100) + '%'
                              : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Attendance History Table */}
                  <div className="mt-4">
                    <h3 className="font-medium text-gray-700 mb-2">Recent Attendance</h3>
                    
                    {attendanceLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                        <p className="mt-2 text-gray-500">Loading attendance history...</p>
                      </div>
                    ) : attendanceData.length > 0 ? (
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {attendanceData.slice(0, 7).map((record, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(record.date).toLocaleDateString('en-US', {
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric'
                                  })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {record.checkIn ? record.checkIn.substring(0, 5) : '—'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {record.checkOut ? record.checkOut.substring(0, 5) : '—'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {record.status === 'present' && (
                                    <Badge className="bg-green-100 text-green-700">Present</Badge>
                                  )}
                                  {record.status === 'late' && (
                                    <Badge className="bg-yellow-100 text-yellow-700">Late</Badge>
                                  )}
                                  {record.status === 'absent' && (
                                    <Badge className="bg-red-100 text-red-700">Absent</Badge>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <Clock className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No attendance records found</p>
                      </div>
                    )}
                    
                    {/* View All Link */}
                    <div className="flex justify-center mt-4">
                      <Link href="/staff/attendance">
                        <Button variant="outline" className="text-gray-600">
                          View Complete Attendance History
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
