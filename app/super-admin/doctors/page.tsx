"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  UserCheck, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Stethoscope,
  Mail,
  Phone,
  Calendar,
  Award,
  Clock
} from 'lucide-react'

// Mock doctor data
const mockDoctors = [
  {
    id: 1,
    name: "Dr. Anjali Mehta",
    email: "anjali.mehta@hospital.com",
    phone: "+91 98765 43210",
    specialization: "Cardiologist",
    department: "Cardiology",
    experience: "12 years",
    qualification: "MBBS, MD Cardiology",
    status: "active",
    availability: "Available",
    patientsToday: 8,
    rating: 4.8,
    joinDate: "Jan 15, 2020"
  },
  {
    id: 2,
    name: "Dr. Vikram Singh",
    email: "vikram.singh@hospital.com",
    phone: "+91 87654 32109",
    specialization: "Neurologist",
    department: "Neurology",
    experience: "15 years",
    qualification: "MBBS, MD Neurology",
    status: "active",
    availability: "In Surgery",
    patientsToday: 6,
    rating: 4.9,
    joinDate: "Mar 22, 2019"
  },
  {
    id: 3,
    name: "Dr. Sunita Rao",
    email: "sunita.rao@hospital.com",
    phone: "+91 76543 21098",
    specialization: "Pediatrician",
    department: "Pediatrics",
    experience: "8 years",
    qualification: "MBBS, MD Pediatrics",
    status: "on-leave",
    availability: "On Leave",
    patientsToday: 0,
    rating: 4.7,
    joinDate: "Nov 08, 2021"
  }
]

export default function DoctorsPage() {
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

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'Available':
        return <Badge className="bg-green-100 text-green-700">Available</Badge>
      case 'In Surgery':
        return <Badge className="bg-blue-100 text-blue-700">In Surgery</Badge>
      case 'On Leave':
        return <Badge className="bg-yellow-100 text-yellow-700">On Leave</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{availability}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UserCheck className="h-8 w-8 mr-3 text-pink-500" />
              Manage Doctors
            </h1>
            <p className="text-gray-600 mt-2">Manage hospital doctors, schedules, and specializations</p>
          </div>
          <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600">
            <Plus className="h-4 w-4 mr-2" />
            Add New Doctor
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Doctors</p>
                <p className="text-2xl font-bold text-gray-900">45</p>
              </div>
              <Stethoscope className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Now</p>
                <p className="text-2xl font-bold text-green-600">32</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Specializations</p>
                <p className="text-2xl font-bold text-blue-600">15</p>
              </div>
              <Award className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-purple-600">4.7</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
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
                  placeholder="Search doctors by name, specialization, or department..." 
                  className="pl-10 border-pink-200 focus:border-pink-400"
                />
              </div>
            </div>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Specialization
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Doctors List */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle>Hospital Doctors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockDoctors.map((doctor) => (
              <div key={doctor.id} className="p-4 border border-pink-100 rounded-lg hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-full h-16 w-16 flex items-center justify-center font-bold text-lg">
                      {doctor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{doctor.name}</h3>
                      <p className="text-sm text-gray-600 font-medium">{doctor.specialization} • {doctor.department}</p>
                      <p className="text-xs text-gray-500">{doctor.qualification}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <Mail className="h-3 w-3 mr-1" />
                          {doctor.email}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Phone className="h-3 w-3 mr-1" />
                          {doctor.phone}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {doctor.experience} experience
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">Today's Patients</p>
                      <p className="text-2xl font-bold text-pink-600">{doctor.patientsToday}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">Rating</p>
                      <p className="text-2xl font-bold text-yellow-600">⭐ {doctor.rating}</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="space-y-2">
                        {getStatusBadge(doctor.status)}
                        {getAvailabilityBadge(doctor.availability)}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Joined: {doctor.joinDate}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
              <span>Add Doctor</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Calendar className="h-6 w-6" />
              <span>Manage Schedules</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Award className="h-6 w-6" />
              <span>Performance Review</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Mail className="h-6 w-6" />
              <span>Send Notifications</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-pink-100 text-pink-700 rounded-full">
          <UserCheck className="h-5 w-5 mr-2" />
          <span className="font-medium">Advanced Doctor Management Features Coming Soon</span>
        </div>
      </div>
    </div>
  )
}
