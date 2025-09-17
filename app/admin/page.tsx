"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";



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
import { Heart, LayoutDashboard, Users, Calendar, UserCheck, Package, CreditCard, Bell, LogOut, Plus, FileText, AlertTriangle, Clock, Bed, Stethoscope, Pill, DollarSign, TrendingUp, Eye, MoreHorizontal, MapPin, MessageSquare, CalendarCheck } from 'lucide-react'

// Mock data for the dashboard (some parts are still mock)
const branchInfo = {
  name: "NMSC - मुख्य शाखा",
  location: "नई दिल्ली",
  adminName: "डॉ. प्रिया शर्मा"
}

interface DashboardStats {
  totalAppointments: number;
  completedAppointments: number;
  admittedPatients: number;
  availableBeds: number;
  criticalAlerts: number;
  todayRevenue: number;
}

interface AdmittedPatient {
  id: string;
  name: string;
  age: number;
  condition: string;
  roomNumber: string;
  admissionDate: string;
  status: string;
  doctor: { name: string };
}

interface StockAlert {
  id: string;
  name: string;
  quantity: number;
  lowStockThreshold: number;
  category: string;
}

interface DoctorSchedule {
  id: string;
  name: string;
  department: string;
  status: string;
  shifts: { dayOfWeek: string; startTime: string; endTime: string }[];
}

interface Appointment {
  id: string;
  appointmentDate: string;
  service: string;
  status: string;
  patient: { name: string };
  doctor: { name: string; department: string };
}

export default function AdminDashboard() {
  const router = useRouter();   // ✅ correctly initialized router
  const { user, isLoading, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [admittedPatients, setAdmittedPatients] = useState<AdmittedPatient[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [doctorSchedules, setDoctorSchedules] = useState<DoctorSchedule[]>([]);
  const [notifications] = useState(7);

  // Feature flags to toggle visibility without removing code
  const SHOW_BILLING_IN_SIDEBAR = false;
  const SHOW_MESSAGES_IN_SIDEBAR = false;

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, appointmentsRes, admittedPatientsRes, stockAlertsRes, doctorSchedulesRes] = await Promise.all([
          fetch('/api/admin/dashboard-stats'),
          fetch('/api/admin/appointments'),
          fetch('/api/admin/admitted-patients'),
          fetch('/api/admin/stock-alerts'),
          fetch('/api/admin/doctor-schedules'),
        ]);

        if (!statsRes.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        if (!appointmentsRes.ok) {
          throw new Error('Failed to fetch appointments');
        }
        if (!admittedPatientsRes.ok) {
          throw new Error('Failed to fetch admitted patients');
        }
        if (!stockAlertsRes.ok) {
          throw new Error('Failed to fetch stock alerts');
        }
        if (!doctorSchedulesRes.ok) {
          throw new Error('Failed to fetch doctor schedules');
        }

        const statsData = await statsRes.json();
        const appointmentsData = await appointmentsRes.json();
        const admittedPatientsData = await admittedPatientsRes.json();
        const stockAlertsData = await stockAlertsRes.json();
        const doctorSchedulesData = await doctorSchedulesRes.json();

        setStats(statsData);
        setUpcomingAppointments(appointmentsData);
        setAdmittedPatients(admittedPatientsData);
        setStockAlerts(stockAlertsData);
        setDoctorSchedules(doctorSchedulesData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const getDoctorStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return 'default';
      case 'busy': return 'destructive';
      case 'on-leave': return 'outline';
      default: return 'secondary';
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const todayStats = stats || {
    totalAppointments: 0,
    completedAppointments: 0,
    admittedPatients: 0,
    availableBeds: 0,
    criticalAlerts: 0,
    todayRevenue: 0,
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex">
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
      <p className="text-sm text-gray-500"> Admin</p>
    </div>
  </div>
</SidebarHeader>

          
          <SidebarContent className="px-4 py-6">
            {/* Navigation items */}
            <div>
              {/* Main */}
              <SidebarGroup>
                <SidebarGroupLabel className="text-gray-600 font-medium mb-2">
                  Main
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        isActive={true}
                        className="w-full justify-start hover:bg-pink-50 data-[active=true]:bg-pink-100 data-[active=true]:text-pink-700"
                      >
                        <Link href="/admin" className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                          <LayoutDashboard className="h-5 w-5" />
                          <span>Dashboard</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        className="w-full justify-start hover:bg-pink-50"
                      >
                        <Link href="/admin/analytics" className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                          <TrendingUp className="h-5 w-5" />
                          <span>Analytics</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    {/* Reports menu item removed as requested */}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Patient Management */}
              <SidebarGroup>
                <SidebarGroupLabel className="text-gray-600 font-medium mb-2">
                  Patient Management
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        className="w-full justify-start hover:bg-pink-50"
                      >
                        <Link href="/admin/patients" className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                          <Users className="h-5 w-5" />
                          <span>Manage Patients</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        className="w-full justify-start hover:bg-pink-50"
                      >
                        <Link href="/admin/appointments" className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                          <Calendar className="h-5 w-5" />
                          <span>Appointments</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        className="w-full justify-start hover:bg-pink-50"
                      >
                        <Link href="/admin/admissions" className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                          <Bed className="h-5 w-5" />
                          <span>Admissions</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        className="w-full justify-start hover:bg-pink-50"
                      >
                        <Link href="/admin/room-management" className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                          <Bed className="h-5 w-5" />
                          <span>Room Management</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Operations */}
              <SidebarGroup>
                <SidebarGroupLabel className="text-gray-600 font-medium mb-2">
                  Operations
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>

                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        className="w-full justify-start hover:bg-pink-50"
                      >
                        <Link href="/admin/leave-management" className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                          <CalendarCheck className="h-5 w-5" />
                          <span>Leave Management</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        className="w-full justify-start hover:bg-pink-50"
                      >
                        <Link href="/admin/inventory" className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                          <Package className="h-5 w-5" />
                          <span>Inventory/Pharmacy</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    {SHOW_BILLING_IN_SIDEBAR && (
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          asChild 
                          className="w-full justify-start hover:bg-pink-50"
                        >
                          <Link href="/admin/billing" className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                            <CreditCard className="h-5 w-5" />
                            <span>Billing</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                    {SHOW_MESSAGES_IN_SIDEBAR && (
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          asChild 
                          className="w-full justify-start hover:bg-pink-50"
                        >
                          <Link href="/admin/messages" className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                            <MessageSquare className="h-5 w-5" />
                            <span>Messages</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Add-ons */}
              <SidebarGroup>
                <SidebarGroupLabel className="text-gray-600 font-medium mb-2">
                  Add-ons
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        className="w-full justify-start hover:bg-pink-50"
                      >
                        <Link href="/admin/erp" className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                          <LayoutDashboard className="h-5 w-5" />
                          <span>ERP</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </div>
          </SidebarContent>
          
          <SidebarFooter className="border-t border-pink-100 p-4">
            <div className="space-y-3">
              {/* Current User Info */}
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-pink-100 text-pink-700">
                    {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'AD'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'Administrator'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.role === 'admin' ? 'Branch Administrator' : user?.role || 'Administrator'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.mobile || user?.email}
                  </p>
                </div>
              </div>
              
              {/* Logout Button */}
              <Button 
                onClick={handleLogout}
                variant="outline" 
                size="sm" 
                className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
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
                </div>
                */}
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
                    
                    <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
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
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-700 font-medium">Error loading dashboard data</p>
                </div>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                      <p className="text-3xl font-bold text-gray-900">{todayStats.totalAppointments}</p>
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
                      <p className="text-3xl font-bold text-green-600">₹{(todayStats.todayRevenue || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-400 to-green-500 p-3 rounded-xl">
                      <DollarSign className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="text-gray-900">Quick Actions</CardTitle>
                <CardDescription>Common daily operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/admin/patients">
                    <Button className="w-full h-16 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-xl flex flex-col items-center justify-center space-y-1">
                      <Plus className="h-5 w-5" />
                      <span className="text-sm">Manage Patients</span>
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
             */}

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
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center space-x-4 p-3 animate-pulse">
                          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingAppointments.map((apt) => (
                        <div key={apt.id} className="flex items-center space-x-4 p-3 hover:bg-pink-50 rounded-lg transition-colors">
                          <Avatar className="h-10 w-10 border-2 border-white ring-2 ring-pink-200">
                            <AvatarFallback>{apt.patient.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{apt.patient.name}</p>
                            <p className="text-xs text-gray-500 truncate">
                              <span className="font-medium">{apt.doctor.name}</span> - {apt.doctor.department}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-pink-600">{new Date(apt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            {getStatusBadge(apt.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No appointments scheduled for today</p>
                    </div>
                  )}
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
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl animate-pulse">
                          <div className="flex items-center space-x-4">
                            <div className="bg-gray-200 p-2 rounded-lg h-9 w-9"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-32"></div>
                              <div className="h-3 bg-gray-200 rounded w-24"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : admittedPatients && admittedPatients.length > 0 ? (
                    <div className="space-y-4">
                      {admittedPatients.map((patient) => (
                        <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center space-x-4">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <Bed className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{patient.name} ({patient.age}y)</p>
                              <p className="text-sm text-gray-600">{patient.condition || 'N/A'}</p>
                              <p className="text-sm text-gray-500">{patient.doctor?.name || 'N/A'} • Room {patient.roomNumber || 'N/A'}</p>
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
                  ) : (
                    <div className="text-center py-8">
                      <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No patients currently admitted</p>
                    </div>
                  )}
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
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 rounded-xl border border-gray-200 animate-pulse">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="h-5 w-5 bg-gray-200 rounded"></div>
                              <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                                <div className="h-3 bg-gray-200 rounded w-20"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : stockAlerts && stockAlerts.length > 0 ? (
                    <div className="space-y-4">
                      {stockAlerts.map((item) => (
                        <div key={item.id} className={`p-4 rounded-xl border ${getUrgencyColor('critical')}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Pill className="h-5 w-5" />
                              <div>
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-sm opacity-75">{item.category || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{item.quantity} / {item.lowStockThreshold}</p>
                              <p className="text-xs opacity-75">Current / Required</p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <Progress 
                              value={(item.quantity / item.lowStockThreshold) * 100} 
                              className="h-2"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No stock alerts at the moment</p>
                    </div>
                  )}
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
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-32"></div>
                              <div className="h-3 bg-gray-200 rounded w-24"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : doctorSchedules && doctorSchedules.length > 0 ? (
                    <div className="space-y-4">
                      {doctorSchedules.map((doctor) => (
                        <div key={doctor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={`/avatars/doctor-${doctor.id}.png`} />
                              <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{doctor.name}</p>
                              <p className="text-sm opacity-75">{doctor.department}</p>
                            </div>
                          </div>
                          <div className="text-sm text-center">
                            {doctor.shifts && doctor.shifts.length > 0 ? (
                              <p>{doctor.shifts[0].dayOfWeek}: {formatTime(doctor.shifts[0].startTime)} - {formatTime(doctor.shifts[0].endTime)}</p>
                            ) : (
                              <p>No shift assigned</p>
                            )}
                          </div>
                          <Badge variant={getDoctorStatusVariant(doctor.status)}>{doctor.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No doctor schedules available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
