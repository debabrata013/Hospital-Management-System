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
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'

// Mock schedule data
const mockSchedules = [
  {
    id: "SCH001",
    doctorName: "Dr. Priya Sharma",
    department: "Cardiology",
    specialization: "Cardiologist",
    shift: "Morning",
    startTime: "08:00 AM",
    endTime: "02:00 PM",
    room: "Room 101",
    status: "available",
    patientsScheduled: 8,
    maxPatients: 12,
    date: "2024-01-09"
  },
  {
    id: "SCH002",
    doctorName: "Dr. Amit Patel",
    department: "Gynecology",
    specialization: "Gynecologist",
    shift: "Full Day",
    startTime: "08:00 AM",
    endTime: "06:00 PM",
    room: "Room 205",
    status: "busy",
    patientsScheduled: 15,
    maxPatients: 15,
    date: "2024-01-09"
  },
  {
    id: "SCH003",
    doctorName: "Dr. Sarah Johnson",
    department: "Internal Medicine",
    specialization: "Internal Medicine",
    shift: "Evening",
    startTime: "02:00 PM",
    endTime: "10:00 PM",
    room: "Room 302",
    status: "on_leave",
    patientsScheduled: 0,
    maxPatients: 10,
    date: "2024-01-09"
  },
  {
    id: "SCH004",
    doctorName: "Dr. Michael Brown",
    department: "Orthopedics",
    specialization: "Orthopedic Surgeon",
    shift: "Morning",
    startTime: "09:00 AM",
    endTime: "01:00 PM",
    room: "OT-1",
    status: "in_surgery",
    patientsScheduled: 3,
    maxPatients: 4,
    date: "2024-01-09"
  }
]

// Mock staff schedule data
const mockStaffSchedules = [
  {
    id: "STAFF001",
    name: "Nurse Ravi Kumar",
    role: "Senior Nurse",
    department: "Emergency",
    shift: "Day Shift",
    startTime: "08:00 AM",
    endTime: "08:00 PM",
    status: "on_duty",
    assignedWard: "Emergency Ward"
  },
  {
    id: "STAFF002",
    name: "Meera Patel",
    role: "Receptionist",
    department: "Front Desk",
    shift: "Morning Shift",
    startTime: "07:00 AM",
    endTime: "03:00 PM",
    status: "on_duty",
    assignedWard: "Reception"
  },
  {
    id: "STAFF003",
    name: "Suresh Gupta",
    role: "Lab Technician",
    department: "Laboratory",
    shift: "Night Shift",
    startTime: "10:00 PM",
    endTime: "06:00 AM",
    status: "off_duty",
    assignedWard: "Lab"
  }
]

export default function AdminSchedulesPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-700">Available</Badge>
      case 'busy':
        return <Badge className="bg-yellow-100 text-yellow-700">Busy</Badge>
      case 'in_surgery':
        return <Badge className="bg-red-100 text-red-700">In Surgery</Badge>
      case 'on_leave':
        return <Badge className="bg-gray-100 text-gray-700">On Leave</Badge>
      case 'on_duty':
        return <Badge className="bg-green-100 text-green-700">On Duty</Badge>
      case 'off_duty':
        return <Badge className="bg-gray-100 text-gray-700">Off Duty</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'busy':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'in_surgery':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'on_leave':
        return <XCircle className="h-4 w-4 text-gray-500" />
      case 'on_duty':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'off_duty':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case 'Morning':
        return 'bg-blue-100 text-blue-700'
      case 'Evening':
        return 'bg-purple-100 text-purple-700'
      case 'Full Day':
        return 'bg-green-100 text-green-700'
      case 'Day Shift':
        return 'bg-blue-100 text-blue-700'
      case 'Night Shift':
        return 'bg-purple-100 text-purple-700'
      case 'Morning Shift':
        return 'bg-orange-100 text-orange-700'
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
              Staff Schedules & Duty Management
            </h1>
            <p className="text-gray-600 mt-2">Manage doctor schedules, staff shifts, and room allocations</p>
          </div>
          <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600">
            <Plus className="h-4 w-4 mr-2" />
            Create Schedule
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doctors on Duty</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <Stethoscope className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Staff on Duty</p>
                <p className="text-2xl font-bold text-green-600">45</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Rooms</p>
                <p className="text-2xl font-bold text-blue-600">8</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Shift Changes</p>
                <p className="text-2xl font-bold text-purple-600">6</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
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
                  placeholder="Search by doctor name, department, or room..." 
                  className="pl-10 border-pink-200 focus:border-pink-400"
                />
              </div>
            </div>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Department
            </Button>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              <Calendar className="h-4 w-4 mr-2" />
              Today
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Doctor Schedules */}
      <Card className="border-pink-100 mb-6">
        <CardHeader>
          <CardTitle>Doctor Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockSchedules.map((schedule) => (
              <div key={schedule.id} className="p-4 border border-pink-100 rounded-lg hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-lg h-16 w-16 flex items-center justify-center font-bold">
                      <Stethoscope className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{schedule.doctorName}</h3>
                        <Badge variant="outline">{schedule.id}</Badge>
                        <Badge className={getShiftColor(schedule.shift)}>{schedule.shift}</Badge>
                        {getStatusBadge(schedule.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-2 text-pink-500" />
                            <span className="font-medium">{schedule.specialization}</span>
                            <span className="ml-2 text-gray-500">• {schedule.department}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2 text-pink-500" />
                            <span>{schedule.startTime} - {schedule.endTime}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 text-pink-500" />
                            <span>{schedule.room}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-2 text-pink-500" />
                            <span>Patients: {schedule.patientsScheduled}/{schedule.maxPatients}</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-pink-500 h-2 rounded-full" 
                          style={{ width: `${(schedule.patientsScheduled / schedule.maxPatients) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <div className="flex items-center mr-4">
                      {getStatusIcon(schedule.status)}
                    </div>
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Staff Schedules */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle>Staff Duty Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockStaffSchedules.map((staff) => (
              <div key={staff.id} className="p-4 border border-pink-100 rounded-lg hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg h-14 w-14 flex items-center justify-center font-bold">
                      <User className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{staff.name}</h3>
                        <Badge variant="outline">{staff.id}</Badge>
                        <Badge className={getShiftColor(staff.shift)}>{staff.shift}</Badge>
                        {getStatusBadge(staff.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium w-16">Role:</span>
                            <span>{staff.role}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium w-16">Dept:</span>
                            <span>{staff.department}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2 text-pink-500" />
                            <span>{staff.startTime} - {staff.endTime}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 text-pink-500" />
                            <span>{staff.assignedWard}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <div className="flex items-center mr-4">
                      {getStatusIcon(staff.status)}
                    </div>
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shift Overview */}
      <Card className="border-pink-100 mt-6">
        <CardHeader>
          <CardTitle>Shift Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-800">Morning Shift</h4>
              <p className="text-2xl font-bold text-blue-600">18</p>
              <p className="text-sm text-blue-600">Staff on duty</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h4 className="font-semibold text-purple-800">Evening Shift</h4>
              <p className="text-2xl font-bold text-purple-600">15</p>
              <p className="text-sm text-purple-600">Staff on duty</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <Clock className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-800">Night Shift</h4>
              <p className="text-2xl font-bold text-gray-600">12</p>
              <p className="text-sm text-gray-600">Staff on duty</p>
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
              <span>Create Schedule</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Users className="h-6 w-6" />
              <span>Assign Duties</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <MapPin className="h-6 w-6" />
              <span>Room Allocation</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Clock className="h-6 w-6" />
              <span>Attendance</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-pink-100 text-pink-700 rounded-full">
          <Calendar className="h-5 w-5 mr-2" />
          <span className="font-medium">Advanced Scheduling Features Coming Soon</span>
        </div>
      </div>
    </div>
  )
}
