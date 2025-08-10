"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  Clock,
  User,
  Stethoscope,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

// Mock appointment data
const mockAppointments = [
  {
    id: "APT001",
    patientName: "Rajesh Kumar",
    patientId: "P001",
    doctorName: "Dr. Priya Sharma",
    department: "Cardiology",
    date: "2024-01-09",
    time: "09:30 AM",
    type: "Consultation",
    status: "confirmed",
    phone: "+91 98765 43210",
    notes: "Follow-up for chest pain"
  },
  {
    id: "APT002",
    patientName: "Sunita Devi",
    patientId: "P002",
    doctorName: "Dr. Amit Patel",
    department: "Gynecology",
    date: "2024-01-09",
    time: "10:15 AM",
    type: "Check-up",
    status: "confirmed",
    phone: "+91 87654 32109",
    notes: "Routine pregnancy check-up"
  },
  {
    id: "APT003",
    patientName: "Mohammed Ali",
    patientId: "P003",
    doctorName: "Dr. Sarah Johnson",
    department: "Internal Medicine",
    date: "2024-01-09",
    time: "11:00 AM",
    type: "Follow-up",
    status: "pending",
    phone: "+91 76543 21098",
    notes: "Diabetes management review"
  },
  {
    id: "APT004",
    patientName: "Anita Singh",
    patientId: "P004",
    doctorName: "Dr. Michael Brown",
    department: "Orthopedics",
    date: "2024-01-09",
    time: "02:30 PM",
    type: "Surgery Consultation",
    status: "completed",
    phone: "+91 65432 10987",
    notes: "Knee replacement consultation"
  }
]

export default function AdminAppointmentsPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-700">Confirmed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-700">Completed</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Consultation':
        return 'bg-blue-100 text-blue-700'
      case 'Check-up':
        return 'bg-green-100 text-green-700'
      case 'Follow-up':
        return 'bg-purple-100 text-purple-700'
      case 'Surgery Consultation':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Calendar className="h-8 w-8 mr-3 text-pink-500" />
              Appointment Management
            </h1>
            <p className="text-gray-600 mt-2">Schedule, manage, and track patient appointments</p>
          </div>
          <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Appointment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900">52</p>
              </div>
              <Calendar className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">38</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">11</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">28</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-pink-100 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search appointments by patient name, doctor, or appointment ID..." 
                  className="pl-10 border-pink-200 focus:border-pink-400"
                />
              </div>
            </div>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Status
            </Button>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              <Calendar className="h-4 w-4 mr-2" />
              Today
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle>Today's Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAppointments.map((appointment) => (
              <div key={appointment.id} className="p-4 border border-pink-100 rounded-lg hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-lg h-16 w-16 flex items-center justify-center font-bold">
                      <Clock className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{appointment.patientName}</h3>
                        <Badge variant="outline">{appointment.id}</Badge>
                        <Badge className={getTypeColor(appointment.type)}>{appointment.type}</Badge>
                        {getStatusBadge(appointment.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Stethoscope className="h-4 w-4 mr-2 text-pink-500" />
                            <span className="font-medium">{appointment.doctorName}</span>
                            <span className="ml-2 text-gray-500">• {appointment.department}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2 text-pink-500" />
                            <span>{new Date(appointment.date).toLocaleDateString()} at {appointment.time}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-2 text-pink-500" />
                            <span>Patient ID: {appointment.patientId}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2 text-pink-500" />
                            <span>{appointment.phone}</span>
                          </div>
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Notes:</span> {appointment.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <div className="flex items-center mr-4">
                      {getStatusIcon(appointment.status)}
                    </div>
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      <Edit className="h-4 w-4" />
                    </Button>
                    {appointment.status === 'pending' && (
                      <Button variant="outline" size="sm" className="border-green-200 text-green-600 hover:bg-green-50">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Appointment Types */}
      <Card className="border-pink-100 mt-6">
        <CardHeader>
          <CardTitle>Appointment Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <Stethoscope className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-800">Consultations</h4>
              <p className="text-2xl font-bold text-blue-600">28</p>
              <p className="text-sm text-blue-600">New patient visits</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-semibold text-green-800">Check-ups</h4>
              <p className="text-2xl font-bold text-green-600">15</p>
              <p className="text-sm text-green-600">Routine examinations</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h4 className="font-semibold text-purple-800">Follow-ups</h4>
              <p className="text-2xl font-bold text-purple-600">12</p>
              <p className="text-sm text-purple-600">Return visits</p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h4 className="font-semibold text-red-800">Urgent</h4>
              <p className="text-2xl font-bold text-red-600">3</p>
              <p className="text-sm text-red-600">Emergency appointments</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-pink-100 mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Plus className="h-6 w-6" />
              <span>New Appointment</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Calendar className="h-6 w-6" />
              <span>View Calendar</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <CheckCircle className="h-6 w-6" />
              <span>Confirm Pending</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Phone className="h-6 w-6" />
              <span>Send Reminders</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-pink-100 text-pink-700 rounded-full">
          <Calendar className="h-5 w-5 mr-2" />
          <span className="font-medium">Advanced Appointment Features Coming Soon</span>
        </div>
      </div>
    </div>
  )
}
