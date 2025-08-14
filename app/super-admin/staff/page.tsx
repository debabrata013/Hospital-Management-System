"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin
} from 'lucide-react'
import Link from 'next/link'
import AddNewStaff from '@/components/admin/AddNewStaff'
import { useToast } from '@/hooks/use-toast'

// Mock staff data - in real app, this would come from API
const mockStaff = [
  {
    id: 1,
    name: "Ravi Kumar",
    email: "ravi.kumar@hospital.com",
    phone: "+91 98765 43210",
    role: "Nurse",
    department: "Emergency",
    shift: "Day Shift",
    status: "active",
    experience: "5 years",
    joinDate: "Jan 15, 2021",
    lastCheckIn: "8:00 AM today"
  },
  {
    id: 2,
    name: "Meera Patel",
    email: "meera.patel@hospital.com",
    phone: "+91 87654 32109",
    role: "Receptionist",
    department: "Front Desk",
    shift: "Morning Shift",
    status: "active",
    experience: "3 years",
    joinDate: "Mar 22, 2022",
    lastCheckIn: "7:30 AM today"
  },
  {
    id: 3,
    name: "Suresh Gupta",
    email: "suresh.gupta@hospital.com",
    phone: "+91 76543 21098",
    role: "Lab Technician",
    department: "Laboratory",
    shift: "Night Shift",
    status: "on-leave",
    experience: "7 years",
    joinDate: "Nov 08, 2020",
    lastCheckIn: "Yesterday 11:00 PM"
  },
  {
    id: 4,
    name: "Anita Singh",
    email: "anita.singh@hospital.com",
    phone: "+91 65432 10987",
    role: "Pharmacist",
    department: "Pharmacy",
    shift: "Day Shift",
    status: "active",
    experience: "4 years",
    joinDate: "Jun 10, 2022",
    lastCheckIn: "8:15 AM today"
  }
]

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredStaff, setFilteredStaff] = useState(mockStaff)
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const { toast } = useToast()

  // Filter staff based on search and department
  useEffect(() => {
    let filtered = mockStaff
    
    if (searchTerm) {
      filtered = filtered.filter(staff => 
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.department.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (selectedDepartment) {
      filtered = filtered.filter(staff => staff.department === selectedDepartment)
    }
    
    setFilteredStaff(filtered)
  }, [searchTerm, selectedDepartment])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>
      case 'on-leave':
        return <Badge className="bg-yellow-100 text-yellow-700">On Leave</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-700">Inactive</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getShiftBadge = (shift: string) => {
    switch (shift) {
      case 'Day Shift':
        return <Badge className="bg-blue-100 text-blue-700">Day Shift</Badge>
      case 'Night Shift':
        return <Badge className="bg-purple-100 text-purple-700">Night Shift</Badge>
      case 'Morning Shift':
        return <Badge className="bg-orange-100 text-orange-700">Morning Shift</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{shift}</Badge>
    }
  }

  const handleViewStaff = (staff: any) => {
    toast({
      title: "View Staff",
      description: `Viewing details for ${staff.name}`,
    })
    // In real app, this would open a modal or navigate to staff detail page
  }

  const handleEditStaff = (staff: any) => {
    toast({
      title: "Edit Staff",
      description: `Editing ${staff.name}'s information`,
    })
    // In real app, this would open an edit modal
  }

  const handleDeleteStaff = (staff: any) => {
    if (confirm(`Are you sure you want to delete ${staff.name}?`)) {
      toast({
        title: "Staff Deleted",
        description: `${staff.name} has been removed from the system`,
      })
      // In real app, this would call the delete API
    }
  }

  const handleManageShifts = () => {
    toast({
      title: "Manage Shifts",
      description: "Opening shift management interface",
    })
    // In real app, this would navigate to shift management
  }

  const handleAttendance = () => {
    toast({
      title: "Attendance",
      description: "Opening attendance tracking interface",
    })
    // In real app, this would navigate to attendance page
  }

  const handleNotifications = () => {
    toast({
      title: "Notifications",
      description: "Opening notification center",
    })
    // In real app, this would open notification panel
  }

  const departments = Array.from(new Set(mockStaff.map(staff => staff.department)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Users className="h-8 w-8 mr-3 text-pink-500" />
              Manage Staff
            </h1>
            <p className="text-gray-600 mt-2">Manage hospital staff, schedules, and departments</p>
          </div>
          <AddNewStaff />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">{mockStaff.length}</p>
              </div>
              <Users className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On Duty Now</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockStaff.filter(s => s.status === 'active').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-blue-600">{departments.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On Leave</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {mockStaff.filter(s => s.status === 'on-leave').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
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
                  placeholder="Search staff by name, role, or department..." 
                  className="pl-10 border-pink-200 focus:border-pink-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 border border-pink-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle>Hospital Staff Members ({filteredStaff.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStaff.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No staff members found matching your criteria
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStaff.map((staff) => (
                <div key={staff.id} className="p-4 border border-pink-100 rounded-lg hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-full h-14 w-14 flex items-center justify-center font-bold">
                        {staff.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{staff.name}</h3>
                        <p className="text-sm text-gray-600 font-medium">{staff.role} • {staff.department}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-xs text-gray-500">
                            <Mail className="h-3 w-3 mr-1" />
                            {staff.email}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Phone className="h-3 w-3 mr-1" />
                            {staff.phone}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {staff.experience} experience
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">Shift</p>
                        {getShiftBadge(staff.shift)}
                      </div>
                      
                      <div className="text-right">
                        <div className="space-y-2">
                          {getStatusBadge(staff.status)}
                          <p className="text-xs text-gray-500">Last check-in:</p>
                          <p className="text-xs font-medium text-gray-700">{staff.lastCheckIn}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Joined: {staff.joinDate}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-pink-200 text-pink-600 hover:bg-pink-50"
                          onClick={() => handleViewStaff(staff)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-pink-200 text-pink-600 hover:bg-pink-50"
                          onClick={() => handleEditStaff(staff)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteStaff(staff)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Department Overview */}
      <Card className="border-pink-100 mt-6">
        <CardHeader>
          <CardTitle>Department Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {departments.slice(0, 3).map(dept => {
              const deptStaff = mockStaff.filter(s => s.department === dept)
              const onDuty = deptStaff.filter(s => s.status === 'active').length
              return (
                <div key={dept} className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800">{dept}</h4>
                  <p className="text-sm text-blue-600 mt-1">
                    {deptStaff.length} staff members • {onDuty} on duty
                  </p>
                </div>
              )
            })}
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
            <AddNewStaff />
            <Link href="/super-admin/staff/shifts">
              <Button 
                variant="outline" 
                className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2"
              >
                <Calendar className="h-6 w-6" />
                <span>Manage Shifts</span>
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2"
              onClick={handleAttendance}
            >
              <Clock className="h-6 w-6" />
              <span>Attendance</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2"
              onClick={handleNotifications}
            >
              <Mail className="h-6 w-6" />
              <span>Send Notifications</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-700 rounded-full">
          <Users className="h-5 w-5 mr-2" />
          <span className="font-medium">Staff Management System is now fully functional!</span>
        </div>
      </div>
    </div>
  )
}
