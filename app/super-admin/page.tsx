"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react";
import Image from "next/image";


import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
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
import { Heart, LayoutDashboard, Users, UserCheck, UserCog, Settings, FileText, Bell, LogOut, Activity, TrendingUp, AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// Interfaces
interface DashboardStats {
  totalUsers: number
  totalDoctors: number
  totalAdmins: number
  totalPatients: number
  todayAppointments: number
  systemHealth: number
}

interface MonthlyData {
  month: string
  users: number
  doctors: number
}

// Navigation items (removed hospital management)
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
    ]
  }
]

export default function SuperAdminDashboard() {
  const [notifications] = useState(5)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { logout } = useAuth()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/super-admin/dashboard-stats')
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }
      
      const data = await response.json()
      setStats(data.stats)
      setMonthlyData(data.monthlyData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

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
                            <item.icon className="h-4 w-4" />
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
          
          <SidebarFooter className="p-4 border-t border-pink-100">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-pink-100 text-pink-700">SA</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Super Admin</p>
                <p className="text-xs text-gray-500 truncate">System Administrator</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-pink-100 px-6">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className="text-gray-600 hover:text-gray-900" />
              <h1 className="text-xl font-semibold text-gray-900">Super Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
             {/* <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button> */}
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

              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-pink-100 text-pink-700">SA</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Super Admin</p>
                      <p className="text-xs leading-none text-muted-foreground">System Administrator</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 p-6 space-y-8">
            {loading ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="border-pink-100">
                      <CardContent className="p-6">
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : error ? (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Dashboard</h3>
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={fetchDashboardData} variant="outline" className="border-red-300 text-red-700">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Key Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Users</p>
                          <p className="text-3xl font-bold text-gray-900">{(stats?.totalUsers || 0).toLocaleString()}</p>
                          <p className="text-sm text-green-600 flex items-center mt-1">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Active system users
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
                          <p className="text-3xl font-bold text-gray-900">{(stats?.totalDoctors || 0).toLocaleString()}</p>
                          <p className="text-sm text-green-600 flex items-center mt-1">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Medical professionals
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
                          <p className="text-sm font-medium text-gray-600">Total Patients</p>
                          <p className="text-3xl font-bold text-gray-900">{(stats?.totalPatients || 0).toLocaleString()}</p>
                          <p className="text-sm text-blue-600 flex items-center mt-1">
                            <Activity className="h-4 w-4 mr-1" />
                            Registered patients
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-3 rounded-xl">
                          <Heart className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-pink-100 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">System Health</p>
                          <p className="text-3xl font-bold text-gray-900">{stats?.systemHealth || 0}%</p>
                          <p className="text-sm text-green-600 flex items-center mt-1">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            All systems operational
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-3 rounded-xl">
                          <Shield className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-pink-100">
                    <CardHeader>
                      <CardTitle className="text-gray-900">User Growth Trend</CardTitle>
                      <CardDescription>Monthly user registration statistics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="users" stroke="#ec4899" strokeWidth={2} />
                            <Line type="monotone" dataKey="doctors" stroke="#10b981" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-pink-100">
                    <CardHeader>
                      <CardTitle className="text-gray-900">User Distribution</CardTitle>
                      <CardDescription>Distribution of users by role</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Doctors', value: stats?.totalDoctors || 0, fill: '#10b981' },
                                { name: 'Admins', value: stats?.totalAdmins || 0, fill: '#ec4899' },
                                { name: 'Other Staff', value: (stats?.totalUsers || 0) - (stats?.totalDoctors || 0) - (stats?.totalAdmins || 0), fill: '#3b82f6' }
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(entry: any) => `${entry.name} (${((entry.value / (stats?.totalUsers || 1)) * 100).toFixed(0)}%)`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
