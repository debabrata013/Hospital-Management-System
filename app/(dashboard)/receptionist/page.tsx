"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Heart, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  UserPlus, 
  CreditCard, 
  Clock, 
  AlertTriangle, 
  MessageSquare,
  Phone,
  Search,
  Edit,
  Eye,
  Bell,
  Stethoscope,
  FileText,
  DollarSign,
  Bed,
  Wifi,
  WifiOff
} from 'lucide-react'

// Mock data for receptionist dashboard
const mockStats = {
  todayRegistrations: 23,
  pendingAppointments: 15,
  waitingPatients: 8,
  totalBills: 45,
  emergencyContacts: 3,
  unreadMessages: 12
}

const mockPatientQueue = [
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

const mockMessages = [
  {
    id: "M001",
    from: "Dr. Anil Kumar",
    message: "Please arrange blood test report for P001. CBC and Sugar Test required.",
    time: "11:45 AM",
    priority: "normal",
    read: false
  },
  {
    id: "M002",
    from: "Admin",
    message: "Staff meeting today at 5 PM in conference room.",
    time: "11:30 AM", 
    priority: "high",
    read: false
  }
]

export default function ReceptionistDashboard() {
  const [isOnline, setIsOnline] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800'
      case 'in-consultation': return 'bg-blue-100 text-blue-800'
      case 'emergency': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'normal': return <Clock className="h-4 w-4 text-blue-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Receptionist Dashboard</h1>
            <p className="text-sm text-gray-500">Patient management and front desk operations</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Online/Offline Status */}
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">Offline Mode</span>
                </>
              )}
            </div>
            
            {/* Quick Actions */}
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
              <UserPlus className="h-4 w-4 mr-2" />
              New Patient
            </Button>

            {/* Messages */}
            <Button variant="outline" size="sm" className="relative">
              <MessageSquare className="h-4 w-4" />
              {mockMessages.filter(m => !m.read).length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                  {mockMessages.filter(m => !m.read).length}
                </Badge>
              )}
            </Button>
            
            {/* User Profile */}
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-blue-100 text-blue-700">RC</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">Receptionist</p>
                <p className="text-gray-500">Front Desk</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Today's Registrations</p>
                  <p className="text-2xl font-bold">{mockStats.todayRegistrations}</p>
                </div>
                <UserPlus className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Appointments</p>
                  <p className="text-2xl font-bold">{mockStats.pendingAppointments}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Waiting</p>
                  <p className="text-2xl font-bold">{mockStats.waitingPatients}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Billing</p>
                  <p className="text-2xl font-bold">{mockStats.totalBills}</p>
                </div>
                <CreditCard className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Emergency</p>
                  <p className="text-2xl font-bold">{mockStats.emergencyContacts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm">Messages</p>
                  <p className="text-2xl font-bold">{mockStats.unreadMessages}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-pink-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white h-20 flex flex-col items-center justify-center space-y-2">
            <UserPlus className="h-6 w-6" />
            <span className="text-sm">New Patient</span>
          </Button>

          <Button className="bg-green-600 hover:bg-green-700 text-white h-20 flex flex-col items-center justify-center space-y-2">
            <Calendar className="h-6 w-6" />
            <span className="text-sm">Appointment</span>
          </Button>

          <Button 
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-50 h-20 flex flex-col items-center justify-center space-y-2"
          >
            <Bed className="h-6 w-6" />
            <span className="text-sm">Admission</span>
          </Button>

          <Button className="bg-yellow-600 hover:bg-yellow-700 text-white h-20 flex flex-col items-center justify-center space-y-2">
            <CreditCard className="h-6 w-6" />
            <span className="text-sm">Billing</span>
          </Button>

          <Button 
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50 h-20 flex flex-col items-center justify-center space-y-2"
          >
            <Phone className="h-6 w-6" />
            <span className="text-sm">Emergency</span>
          </Button>

          <Button 
            variant="outline"
            className="border-pink-200 text-pink-700 hover:bg-pink-50 h-20 flex flex-col items-center justify-center space-y-2"
          >
            <MessageSquare className="h-6 w-6" />
            <span className="text-sm">Messages</span>
          </Button>

          <Button 
            variant="outline"
            className="border-gray-200 text-gray-700 hover:bg-gray-50 h-20 flex flex-col items-center justify-center space-y-2"
          >
            <Search className="h-6 w-6" />
            <span className="text-sm">Search</span>
          </Button>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="queue">Patient Queue</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patient Queue Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Patient Queue - Today</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockPatientQueue.slice(0, 3).map((patient) => (
                      <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {getPriorityIcon(patient.priority)}
                            <Badge className={getStatusColor(patient.status)}>
                              {patient.status === 'waiting' ? 'Waiting' : 
                               patient.status === 'in-consultation' ? 'In Consultation' : 
                               patient.status === 'emergency' ? 'Emergency' : patient.status}
                            </Badge>
                          </div>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-sm text-gray-600">{patient.tokenNumber} - {patient.appointmentTime}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Recent Messages</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockMessages.slice(0, 3).map((message) => (
                      <div key={message.id} className={`p-3 rounded-lg ${message.read ? 'bg-gray-50' : 'bg-blue-50 border-l-4 border-blue-500'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{message.from}</p>
                            <p className="text-sm text-gray-600 mt-1">{message.message}</p>
                            <p className="text-xs text-gray-500 mt-2">{message.time}</p>
                          </div>
                          {message.priority === 'high' && (
                            <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="queue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient Queue Management</CardTitle>
                <CardDescription>OPD patient waiting list and queue management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPatientQueue.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="font-bold text-lg">{patient.tokenNumber}</p>
                          <p className="text-xs text-gray-500">Token</p>
                        </div>
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-gray-600">{patient.doctor}</p>
                          <p className="text-xs text-gray-500">{patient.appointmentTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPriorityIcon(patient.priority)}
                        <Badge className={getStatusColor(patient.status)}>
                          {patient.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient Registration</CardTitle>
                <CardDescription>Register new patients and manage patient information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Register new patients quickly and efficiently</p>
                  <Button asChild>
                    <Link href="/receptionist/register-patient">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Register New Patient
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Billing Management</CardTitle>
                <CardDescription>Process payments and manage billing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Manage patient billing and payments</p>
                  <Button asChild>
                    <Link href="/receptionist/billing">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Billing
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Internal Messages</CardTitle>
                <CardDescription>Communication with doctors and admin staff</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockMessages.map((message) => (
                    <div key={message.id} className={`p-4 rounded-lg border ${message.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <p className="font-medium text-sm">{message.from}</p>
                            {message.priority === 'high' && (
                              <Badge className="bg-red-100 text-red-700">High Priority</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">{message.message}</p>
                          <p className="text-xs text-gray-500 mt-2">{message.time}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Reply
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
