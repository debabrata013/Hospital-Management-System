"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Calendar, Stethoscope, Package, CreditCard, FileText, ClipboardList, Building2, Settings, LayoutDashboard, Bell, TrendingUp, MessageSquare } from "lucide-react"

export default function ERPPage() {
  const router = useRouter()
  const { user } = useAuth()

  const quickLinks = [
    { href: "/admin/patients", label: "Patients", icon: Users },
    { href: "/admin/appointments", label: "Appointments", icon: Calendar },
    { href: "/admin/schedules", label: "Doctor Schedules", icon: Stethoscope },
    { href: "/admin/inventory", label: "Inventory", icon: Package },
    { href: "/admin/billing", label: "Billing", icon: CreditCard },
    { href: "/admin/erp/attendance", label: "Attendance", icon: ClipboardList },
    { href: "/admin/reports", label: "Reports", icon: FileText },
    { href: "/admin/room-management", label: "Rooms", icon: Building2 },
    { href: "/admin/analytics", label: "Analytics", icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutDashboard className="h-7 w-7 text-pink-500" />
            Unified ERP Workspace
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Central hub for staff and doctors</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" className="border-pink-200 text-pink-700 hover:bg-pink-50 w-full sm:w-auto" onClick={() => router.push("/admin")}>Back to Admin</Button>
          <Button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 w-full sm:w-auto">
            <Bell className="h-4 w-4 mr-2" />Notifications
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left: Quick Links and Tools */}
        <div className="lg:col-span-3 space-y-6">
          {/* Global Search */}
          <Card className="border-pink-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-gray-400" />
                <Input placeholder="Search patients, appointments, bills, medicines..." className="flex-1" />
                <Button className="bg-gradient-to-r from-pink-500 to-pink-600">Search</Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Modules */}
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle className="text-gray-900">Quick Modules</CardTitle>
              <CardDescription>Jump to frequently used areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {quickLinks.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className="group">
                    <div className="w-full h-20 sm:h-24 rounded-xl border border-pink-100 bg-white hover:bg-pink-50 transition flex flex-col items-center justify-center gap-2">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600" />
                      <span className="text-sm font-medium text-gray-800 group-hover:text-pink-700 text-center">{label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Workboards */}
          <Tabs defaultValue="patients" className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-pink-50">
              <TabsTrigger value="patients">Patients</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
            </TabsList>
            <TabsContent value="patients" className="mt-4">
              <Card className="border-pink-100">
                <CardHeader>
                  <CardTitle className="text-gray-900">Patient Workboard</CardTitle>
                  <CardDescription>Admit, discharge, update records</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link href="/admin/patients" className="w-full"><Button className="w-full">Open Patient Manager</Button></Link>
                  <Link href="/admin/admissions" className="w-full"><Button variant="outline" className="w-full">Admissions</Button></Link>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="appointments" className="mt-4">
              <Card className="border-pink-100">
                <CardHeader>
                  <CardTitle className="text-gray-900">Appointments Workboard</CardTitle>
                  <CardDescription>Create, reschedule, view today</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link href="/admin/appointments" className="w-full"><Button className="w-full">Open Appointments</Button></Link>
                  <Link href="/admin/schedules" className="w-full"><Button variant="outline" className="w-full">Doctor Schedules</Button></Link>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="billing" className="mt-4">
              <Card className="border-pink-100">
                <CardHeader>
                  <CardTitle className="text-gray-900">Billing Workboard</CardTitle>
                  <CardDescription>Create invoice, receive payments</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link href="/admin/billing" className="w-full"><Button className="w-full">Open Billing</Button></Link>
                  <Link href="/admin/reports" className="w-full"><Button variant="outline" className="w-full">Financial Reports</Button></Link>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="inventory" className="mt-4">
              <Card className="border-pink-100">
                <CardHeader>
                  <CardTitle className="text-gray-900">Inventory Workboard</CardTitle>
                  <CardDescription>Stock, vendors, purchase orders</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link href="/admin/inventory" className="w-full"><Button className="w-full">Open Inventory</Button></Link>
                  <Link href="/admin/reports" className="w-full"><Button variant="outline" className="w-full">Inventory Reports</Button></Link>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: My Day */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle className="text-gray-900">My Day</CardTitle>
              <CardDescription>For {user?.name || "Staff"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-pink-50">
                <div className="flex items-center gap-2 text-sm text-gray-800">
                  <ClipboardList className="h-4 w-4 text-pink-600" />
                  Assigned Tasks
                </div>
                <Badge variant="secondary">3</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-pink-50">
                <div className="flex items-center gap-2 text-sm text-gray-800">
                  <Calendar className="h-4 w-4 text-pink-600" />
                  Today’s Appointments
                </div>
                <Badge variant="secondary">8</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-pink-50">
                <div className="flex items-center gap-2 text-sm text-gray-800">
                  <MessageSquare className="h-4 w-4 text-pink-600" />
                  Messages
                </div>
                <Badge variant="secondary">5</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle className="text-gray-900">Quick Actions</CardTitle>
              <CardDescription>Frequent workflows</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Link href="/admin/patients"><Button variant="outline" className="w-full">Add Patient</Button></Link>
              <Link href="/admin/appointments"><Button variant="outline" className="w-full">Book Slot</Button></Link>
              <Link href="/admin/billing"><Button variant="outline" className="w-full">Create Invoice</Button></Link>
              <Link href="/admin/inventory"><Button variant="outline" className="w-full">Add Stock</Button></Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


