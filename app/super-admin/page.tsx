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
import { Heart, LayoutDashboard, Users, UserCheck, UserCog, Settings, FileText, Bell, LogOut, Building2, Activity, TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock, Shield, Database, Server, Wifi, HardDrive, MoreHorizontal, Eye, Edit, Trash2, Home } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Mock data for charts and statistics
const systemStats = {
  totalHospitals: 127,
  totalUsers: 15420,
  activeDoctors: 3240,
  systemHealth: 98.5
}

const monthlyData = [
  { month: 'Jan', hospitals: 95, users: 12000, doctors: 2800 },
  { month: 'Feb', hospitals: 102, users: 12800, doctors: 2950 },
  { month: 'Mar', hospitals: 108, users: 13200, doctors: 3050 },
  { month: 'Apr', hospitals: 115, users: 14100, doctors: 3150 },
  { month: 'May', hospitals: 121, users: 14800, doctors: 3200 },
  { month: 'Jun', hospitals: 127, users: 15420, doctors: 3240 }
]

const systemHealthData = [
  { name: 'Database', value: 99.2, status: 'healthy' },
  { name: 'API Services', value: 98.8, status: 'healthy' },
  { name: 'Storage', value: 97.5, status: 'warning' },
  { name: 'Network', value: 99.9, status: 'healthy' }
]

const recentActivities = [
  {
    id: 1,
    type: 'hospital_added',
    message: 'New hospital "City Medical Center" added to the system',
    timestamp: '2 hours ago',
    user: 'Admin John',
    status: 'success'
  },
  {
    id: 2,
    type: 'user_suspended',
    message: 'User account suspended for policy violation',
    timestamp: '4 hours ago',
    user: 'Admin Sarah',
    status: 'warning'
  },
  {
    id: 3,
    type: 'system_update',
    message: 'System maintenance completed successfully',
    timestamp: '6 hours ago',
    user: 'System',
    status: 'info'
  },
  {
    id: 4,
    type: 'security_alert',
    message: 'Multiple failed login attempts detected',
    timestamp: '8 hours ago',
    user: 'Security System',
    status: 'error'
  }
]

const topHospitals = [
  { name: 'General Hospital', users: 1250, doctors: 85, status: 'active' },
  { name: 'City Medical Center', users: 980, doctors: 72, status: 'active' },
  { name: 'Regional Healthcare', users: 875, doctors: 65, status: 'active' },
  { name: 'Metro Hospital', users: 720, doctors: 58, status: 'maintenance' },
  { name: 'Community Care', users: 650, doctors: 45, status: 'active' }
]

// Navigation items
const navigationItems = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, url: "/super-admin", isActive: true },
      { title: "Analytics", icon: TrendingUp, url: "/super-admin/analytics" },
    ]
  },
  {
    title: "Management",
    items: [
      { title: "Manage Admins", icon: UserCog, url: "/super-admin/admins" },
      { title: "Manage Doctors", icon: UserCheck, url: "/super-admin/doctors" },
      { title: "Manage Staff", icon: Users, url: "/super-admin/staff" },
      { title: "Hospitals", icon: Building2, url: "/super-admin/hospitals" },
      { title: "Room Management", icon: Home, url: "/super-admin/room-management" },
    ]
  },
  {
    title: "System",
    items: [
      { title: "System Settings", icon: Settings, url: "/super-admin/settings" },
      { title: "Security", icon: Shield, url: "/super-admin/security" },
      { title: "Logs", icon: FileText, url: "/super-admin/logs" },
    ]
  }
]

export default function SuperAdminDashboard() {
  const [notifications] = useState(5)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'hospital_added': return <Building2 className="h-4 w-4 text-green-500" />
      case 'user_suspended': return <UserCog className="h-4 w-4 text-yellow-500" />
      case 'system_update': return <Settings className="h-4 w-4 text-blue-500" />
      case 'security_alert': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-700">Maintenance</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-700">Inactive</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
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
                <h2 className="text-lg font-bold text-gray-900">Arogya Hospital</h2>
                <p className="text-sm text-gray-500">Super Admin</p>
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
                <AvatarFallback className="bg-pink-100 text-pink-700">SA</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Super Admin</p>
                <p className="text-xs text-gray-500 truncate">admin@medicarepro.com</p>
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
                  <h1 className="text-xl font-bold text-gray-900">Super Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">System overview and management</p>
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
                        <AvatarFallback className="bg-pink-100 text-pink-700">SA</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>Super Admin Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <UserCog className="mr-2 h-4 w-4" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      System Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Shield className="mr-2 h-4 w-4" />
                      Security
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Hospitals</p>
                      <p className="text-3xl font-bold text-gray-900">{systemStats.totalHospitals}</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +12% from last month
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-3 rounded-xl">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900">{systemStats.totalUsers.toLocaleString()}</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +8% from last month
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-3 rounded-xl">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Doctors</p>
                      <p className="text-3xl font-bold text-gray-900">{systemStats.activeDoctors.toLocaleString()}</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +5% from last month
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-green-400 to-green-500 p-3 rounded-xl">
                      <UserCheck className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">System Health</p>
                      <p className="text-3xl font-bold text-gray-900">{systemStats.systemHealth}%</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        All systems operational
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 p-3 rounded-xl">
                      <Activity className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Growth Chart */}
              <Card className="border-pink-100">
                <CardHeader>
                  <CardTitle className="text-gray-900">System Growth</CardTitle>
                  <CardDescription>Monthly growth across key metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px'
                          }} 
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="hospitals" 
                          stroke="#ff7eb9" 
                          strokeWidth={3}
                          name="Hospitals"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="users" 
                          stroke="#60a5fa" 
                          strokeWidth={3}
                          name="Users"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="doctors" 
                          stroke="#34d399" 
                          strokeWidth={3}
                          name="Doctors"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card className="border-pink-100">
                <CardHeader>
                  <CardTitle className="text-gray-900">System Health Status</CardTitle>
                  <CardDescription>Real-time system component monitoring</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {systemHealthData.map((component) => (
                    <div key={component.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {component.status === 'healthy' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          )}
                          <span className="font-medium text-gray-900">{component.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-600">{component.value}%</span>
                      </div>
                      <Progress 
                        value={component.value} 
                        className="h-2"
                        style={{
                          '--progress-background': component.status === 'healthy' ? '#10b981' : '#f59e0b'
                        } as React.CSSProperties}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Tables Section */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <Card className="border-pink-100">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">Recent Activities</CardTitle>
                    <CardDescription>Latest system activities and changes</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-xs text-gray-500">{activity.user}</p>
                            <span className="text-xs text-gray-400">•</span>
                            <p className="text-xs text-gray-500">{activity.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Hospitals */}
              <Card className="border-pink-100">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">Top Hospitals</CardTitle>
                    <CardDescription>Hospitals with highest user activity</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topHospitals.map((hospital, index) => (
                      <div key={hospital.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{hospital.name}</p>
                            <p className="text-sm text-gray-500">
                              {hospital.users} users • {hospital.doctors} doctors
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(hospital.status)}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Suspend
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="text-gray-900">Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <Button className="h-20 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-xl flex flex-col items-center justify-center space-y-2">
                    <Building2 className="h-6 w-6" />
                    <span className="text-sm">Add Hospital</span>
                  </Button>
                  
                  <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl flex flex-col items-center justify-center space-y-2">
                    <UserCog className="h-6 w-6" />
                    <span className="text-sm">Add Admin</span>
                  </Button>
                  
                  <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl flex flex-col items-center justify-center space-y-2">
                    <Settings className="h-6 w-6" />
                    <span className="text-sm">System Config</span>
                  </Button>
                  
                  <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl flex flex-col items-center justify-center space-y-2">
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">View Logs</span>
                  </Button>
                  
                  <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl flex flex-col items-center justify-center space-y-2">
                    <Shield className="h-6 w-6" />
                    <span className="text-sm">Security</span>
                  </Button>
                  
                  <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-xl flex flex-col items-center justify-center space-y-2">
                    <TrendingUp className="h-6 w-6" />
                    <span className="text-sm">Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
