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
  XCircle,
  RefreshCw
} from 'lucide-react'
import { useRealtimeDashboard } from '@/hooks/useRealtimeDashboard'

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
  const { stats, loading, error, refresh } = useRealtimeDashboard(30000) // Refresh every 30 seconds

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return <Badge className="bg-green-100 text-green-700">Available</Badge>
      case 'busy': return <Badge className="bg-yellow-100 text-yellow-700">Busy</Badge>
      case 'in_surgery': return <Badge className="bg-red-100 text-red-700">In Surgery</Badge>
      case 'on_leave': return <Badge className="bg-gray-100 text-gray-700">On Leave</Badge>
      case 'on_duty': return <Badge className="bg-green-100 text-green-700">On Duty</Badge>
      case 'off_duty': return <Badge className="bg-gray-100 text-gray-700">Off Duty</Badge>
      default: return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'busy': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'in_surgery': return <XCircle className="h-4 w-4 text-red-500" />
      case 'on_leave': return <XCircle className="h-4 w-4 text-gray-500" />
      case 'on_duty': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'off_duty': return <XCircle className="h-4 w-4 text-gray-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case 'Morning': return 'bg-blue-100 text-blue-700'
      case 'Evening': return 'bg-purple-100 text-purple-700'
      case 'Full Day': return 'bg-green-100 text-green-700'
      case 'Day Shift': return 'bg-blue-100 text-blue-700'
      case 'Night Shift': return 'bg-purple-100 text-purple-700'
      case 'Morning Shift': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4 sm:p-6">

      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-8 w-8 mr-2 sm:mr-3 text-pink-500" />
            Staff Schedules & Duty Management
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Manage doctor schedules, staff shifts, and room allocations
          </p>
          {error && (
            <p className="text-red-500 text-sm mt-1">
              Error loading data: {error}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={refresh}
            variant="outline" 
            className="border-pink-200 text-pink-600 hover:bg-pink-50 w-full sm:w-auto flex items-center justify-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 w-full sm:w-auto flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" />
            Create Schedule
          </Button>
        </div>
      </div>

      {/* Real-time Status Indicator */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
          <span className="text-sm text-gray-600">
            {loading ? 'Updating...' : `Last updated: ${new Date(stats.lastUpdated).toLocaleTimeString()}`}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Auto-refresh every 30 seconds
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doctors on Duty</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.doctorsOnDuty}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {loading ? 'Loading...' : 'Currently active'}
                </p>
              </div>
              <Stethoscope className="h-6 sm:h-8 w-6 sm:w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Staff on Duty</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {loading ? '...' : stats.staffOnDuty}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {loading ? 'Loading...' : 'Currently active'}
                </p>
              </div>
              <Users className="h-6 sm:h-8 w-6 sm:w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Rooms</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                  {loading ? '...' : stats.availableRooms}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {loading ? 'Loading...' : 'Ready for patients'}
                </p>
              </div>
              <MapPin className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Shift Changes</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">
                  {loading ? '...' : stats.shiftChanges}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {loading ? 'Loading...' : 'Today\'s changes'}
                </p>
              </div>
              <Clock className="h-6 sm:h-8 w-6 sm:w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-pink-100 mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search by doctor, department, or room..." 
                className="pl-10 border-pink-200 focus:border-pink-400 w-full"
              />
            </div>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 w-full sm:w-auto flex items-center justify-center gap-2">
              <Filter className="h-4 w-4" />
              Filter by Department
            </Button>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 w-full sm:w-auto flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
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
        <CardContent className="space-y-4">
          {mockSchedules.map((schedule) => (
            <div key={schedule.id} className="p-4 sm:p-5 border border-pink-100 rounded-lg hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex-shrink-0 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-lg h-16 w-16 flex items-center justify-center font-bold">
                <Stethoscope className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 flex-wrap mb-2">
                  <h3 className="font-bold text-lg sm:text-xl text-gray-900">{schedule.doctorName}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{schedule.id}</Badge>
                    <Badge className={getShiftColor(schedule.shift)}>{schedule.shift}</Badge>
                    {getStatusBadge(schedule.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-sm text-gray-600">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-pink-500" />
                      <span className="font-medium">{schedule.specialization} • {schedule.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-pink-500" />
                      <span>{schedule.startTime} - {schedule.endTime}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-pink-500" />
                      <span>{schedule.room}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-pink-500" />
                      <span>Patients: {schedule.patientsScheduled}/{schedule.maxPatients}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${(schedule.patientsScheduled / schedule.maxPatients) * 100}%` }}></div>
                </div>
              </div>

              <div className="flex gap-2 mt-2 sm:mt-0 sm:flex-col">
                <div>{getStatusIcon(schedule.status)}</div>
                <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Staff Schedules */}
      <Card className="border-pink-100 mb-6">
        <CardHeader>
          <CardTitle>Staff Duty Assignments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockStaffSchedules.map((staff) => (
            <div key={staff.id} className="p-4 sm:p-5 border border-pink-100 rounded-lg hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex-shrink-0 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg h-14 w-14 flex items-center justify-center font-bold">
                <User className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 flex-wrap mb-2">
                  <h3 className="font-bold text-lg sm:text-xl text-gray-900">{staff.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{staff.id}</Badge>
                    <Badge className={getShiftColor(staff.shift)}>{staff.shift}</Badge>
                    {getStatusBadge(staff.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <span className="font-medium w-16">Role:</span>
                      <span>{staff.role}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium w-16">Dept:</span>
                      <span>{staff.department}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-pink-500" />
                      <span>{staff.startTime} - {staff.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-pink-500" />
                      <span>{staff.assignedWard}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-2 sm:mt-0 sm:flex-col">
                <div>{getStatusIcon(staff.status)}</div>
                <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Shift Overview */}
      <Card className="border-pink-100 mb-6">
        <CardHeader>
          <CardTitle>Shift Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <Clock className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500 mx-auto mb-1 sm:mb-2" />
              <h4 className="font-semibold text-blue-800">Morning Shift</h4>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">18</p>
              <p className="text-sm sm:text-base text-blue-600">Staff on duty</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <Clock className="h-6 sm:h-8 w-6 sm:w-8 text-purple-500 mx-auto mb-1 sm:mb-2" />
              <h4 className="font-semibold text-purple-800">Evening Shift</h4>
              <p className="text-xl sm:text-2xl font-bold text-purple-600">15</p>
              <p className="text-sm sm:text-base text-purple-600">Staff on duty</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Clock className="h-6 sm:h-8 w-6 sm:w-8 text-gray-500 mx-auto mb-1 sm:mb-2" />
              <h4 className="font-semibold text-gray-800">Night Shift</h4>
              <p className="text-xl sm:text-2xl font-bold text-gray-600">12</p>
              <p className="text-sm sm:text-base text-gray-600">Staff on duty</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-pink-100 mb-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: <Plus className="h-6 w-6" />, label: 'Create Schedule' },
              { icon: <Users className="h-6 w-6" />, label: 'Assign Duties' },
              { icon: <MapPin className="h-6 w-6" />, label: 'Room Allocation' },
              { icon: <Clock className="h-6 w-6" />, label: 'Attendance' }
            ].map((action, i) => (
              <Button key={i} variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center gap-2">
                {action.icon}
                <span className="text-xs sm:text-sm">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-pink-100 text-pink-700 rounded-full">
          <Calendar className="h-5 w-5 mr-2" />
          <span className="font-medium text-sm sm:text-base">Advanced Scheduling Features Coming Soon</span>
        </div>
      </div>
    </div>
  )
}
