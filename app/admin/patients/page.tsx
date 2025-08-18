"use client"

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
  Eye,
  UserPlus,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Activity,
  FileText,
  Bed
} from 'lucide-react'

// Mock patient data
const mockPatients = [
  {
    id: "P001",
    name: "Rajesh Kumar",
    age: 45,
    gender: "Male",
    phone: "+91 98765 43210",
    email: "rajesh.kumar@email.com",
    address: "123 Main Street, Delhi",
    bloodGroup: "B+",
    lastVisit: "2024-01-08",
    status: "active",
    admissionStatus: "outpatient",
    doctor: "Dr. Priya Sharma",
    department: "Cardiology"
  },
  {
    id: "P002",
    name: "Sunita Devi",
    age: 38,
    gender: "Female",
    phone: "+91 87654 32109",
    email: "sunita.devi@email.com",
    address: "456 Park Avenue, Mumbai",
    bloodGroup: "A+",
    lastVisit: "2024-01-09",
    status: "active",
    admissionStatus: "admitted",
    doctor: "Dr. Amit Patel",
    department: "Gynecology"
  },
  {
    id: "P003",
    name: "Mohammed Ali",
    age: 62,
    gender: "Male",
    phone: "+91 76543 21098",
    email: "mohammed.ali@email.com",
    address: "789 Garden Road, Bangalore",
    bloodGroup: "O-",
    lastVisit: "2024-01-05",
    status: "inactive",
    admissionStatus: "discharged",
    doctor: "Dr. Sarah Johnson",
    department: "Internal Medicine"
  }
]

export default function AdminPatientsPage() {
  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge className="bg-green-100 text-green-700">Active</Badge>
      : <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>
  }

  const getAdmissionBadge = (status: string) => {
    switch (status) {
      case 'admitted':
        return <Badge className="bg-blue-100 text-blue-700">Admitted</Badge>
      case 'outpatient':
        return <Badge className="bg-green-100 text-green-700">Outpatient</Badge>
      case 'discharged':
        return <Badge className="bg-purple-100 text-purple-700">Discharged</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Users className="h-8 w-8 mr-3 text-pink-500" />
              Patient Management
            </h1>
            <p className="text-gray-600 mt-2">Manage patient records, admissions, and medical history</p>
          </div>
          <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600">
            <Plus className="h-4 w-4 mr-2" />
            Add New Patient
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
              <Users className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admitted Today</p>
                <p className="text-2xl font-bold text-blue-600">23</p>
              </div>
              <Bed className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Discharged Today</p>
                <p className="text-2xl font-bold text-green-600">18</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Registrations</p>
                <p className="text-2xl font-bold text-purple-600">12</p>
              </div>
              <UserPlus className="h-8 w-8 text-purple-500" />
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
                  placeholder="Search patients by name, ID, phone, or email..." 
                  className="pl-10 border-pink-200 focus:border-pink-400"
                />
              </div>
            </div>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPatients.map((patient) => (
              <div key={patient.id} className="p-4 border border-pink-100 rounded-lg hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-full h-16 w-16 flex items-center justify-center font-bold text-lg">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-xl text-gray-900">{patient.name}</h3>
                        <Badge variant="outline">{patient.id}</Badge>
                        {getStatusBadge(patient.status)}
                        {getAdmissionBadge(patient.admissionStatus)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium w-20">Age:</span>
                            <span>{patient.age} years • {patient.gender}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-3 w-3 mr-2 text-pink-500" />
                            <span>{patient.phone}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-3 w-3 mr-2 text-pink-500" />
                            <span>{patient.email}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium w-20">Blood:</span>
                            <span className="font-semibold text-red-600">{patient.bloodGroup}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium w-20">Doctor:</span>
                            <span>{patient.doctor}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium w-20">Dept:</span>
                            <span>{patient.department}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="mr-4">{patient.address}</span>
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Last visit: {new Date(patient.lastVisit).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Patient Categories */}
      <Card className="border-pink-100 mt-6">
        <CardHeader>
          <CardTitle>Patient Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <Bed className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-800">Admitted Patients</h4>
              <p className="text-2xl font-bold text-blue-600">23</p>
              <p className="text-sm text-blue-600">Currently in hospital</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <Activity className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-semibold text-green-800">Outpatients</h4>
              <p className="text-2xl font-bold text-green-600">156</p>
              <p className="text-sm text-green-600">Regular consultations</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h4 className="font-semibold text-purple-800">Follow-ups</h4>
              <p className="text-2xl font-bold text-purple-600">89</p>
              <p className="text-sm text-purple-600">Scheduled returns</p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg text-center">
              <UserPlus className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <h4 className="font-semibold text-orange-800">New Patients</h4>
              <p className="text-2xl font-bold text-orange-600">12</p>
              <p className="text-sm text-orange-600">Today's registrations</p>
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
              <span>Register Patient</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Bed className="h-6 w-6" />
              <span>Admit Patient</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Activity className="h-6 w-6" />
              <span>Discharge Patient</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <FileText className="h-6 w-6" />
              <span>Medical Records</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-pink-100 text-pink-700 rounded-full">
          <Users className="h-5 w-5 mr-2" />
          <span className="font-medium">Advanced Patient Management Features Coming Soon</span>
        </div>
      </div>
    </div>
  )
}
