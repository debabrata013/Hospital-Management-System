"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Bed, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  User,
  Calendar,
  Clock,
  Activity,
  MapPin,
  Stethoscope,
  FileText,
  LogOut
} from 'lucide-react'
// import { useRouter } from 'next/navigation'

// Mock admission data
const mockAdmissions = [
  {
    id: "ADM001",
    patientName: "Rajesh Kumar",
    patientId: "P001",
    age: 45,
    gender: "Male",
    admissionDate: "2024-01-08",
    admissionTime: "02:30 PM",
    doctorName: "Dr. Priya Sharma",
    department: "Cardiology",
    room: "ICU-101",
    bedNumber: "B-15",
    condition: "Post-Surgery Recovery",
    status: "stable",
    expectedDischarge: "2024-01-12",
    insurance: "Yes",
    emergencyContact: "+91 98765 43210"
  },
  {
    id: "ADM002",
    patientName: "Sunita Devi",
    patientId: "P002",
    age: 38,
    gender: "Female",
    admissionDate: "2024-01-09",
    admissionTime: "08:15 AM",
    doctorName: "Dr. Amit Patel",
    department: "Gynecology",
    room: "Ward-205",
    bedNumber: "B-32",
    condition: "Pregnancy Complications",
    status: "improving",
    expectedDischarge: "2024-01-11",
    insurance: "Yes",
    emergencyContact: "+91 87654 32109"
  },
  {
    id: "ADM003",
    patientName: "Mohammed Ali",
    patientId: "P003",
    age: 62,
    gender: "Male",
    admissionDate: "2024-01-07",
    admissionTime: "11:45 PM",
    doctorName: "Dr. Sarah Johnson",
    department: "Internal Medicine",
    room: "CCU-301",
    bedNumber: "B-08",
    condition: "Cardiac Monitoring",
    status: "critical",
    expectedDischarge: "2024-01-15",
    insurance: "No",
    emergencyContact: "+91 76543 21098"
  }
]

  // const router = useRouter();
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'stable':
        return <Badge className="bg-green-100 text-green-700">Stable</Badge>
      case 'improving':
        return <Badge className="bg-blue-100 text-blue-700">Improving</Badge>
      case 'critical':
        return <Badge className="bg-red-100 text-red-700">Critical</Badge>
      case 'discharged':
        return <Badge className="bg-purple-100 text-purple-700">Discharged</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'stable':
        return <Activity className="h-4 w-4 text-green-500" />
      case 'improving':
        return <Activity className="h-4 w-4 text-blue-500" />
      case 'critical':
        return <Activity className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoomTypeColor = (room: string) => {
    if (room.includes('ICU')) return 'bg-red-100 text-red-700'
    if (room.includes('CCU')) return 'bg-orange-100 text-orange-700'
    if (room.includes('Ward')) return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-700'
  }

export default function AdmissionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Bed className="h-8 w-8 mr-3 text-pink-500" />
              Admission & Discharge Management
            </h1>
            <p className="text-gray-600 mt-2">Manage patient admissions, room assignments, and discharge processes</p>
          </div>
          <Button
            className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600"
            // onClick={() => router.push('/admin/admissions/new')}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Admission
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Admitted</p>
                <p className="text-2xl font-bold text-gray-900">23</p>
              </div>
              <Bed className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Beds</p>
                <p className="text-2xl font-bold text-green-600">12</p>
              </div>
              <MapPin className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Discharges Today</p>
                <p className="text-2xl font-bold text-blue-600">5</p>
              </div>
              <LogOut className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Patients</p>
                <p className="text-2xl font-bold text-red-600">3</p>
              </div>
              <Activity className="h-8 w-8 text-red-500" />
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
                  placeholder="Search by patient name, room number, or admission ID..." 
                  className="pl-10 border-pink-200 focus:border-pink-400"
                />
              </div>
            </div>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Status
            </Button>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              <MapPin className="h-4 w-4 mr-2" />
              Room Type
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admissions List */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle>Current Admissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAdmissions.map((admission) => (
              <div key={admission.id} className="p-4 border border-pink-100 rounded-lg hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-lg h-16 w-16 flex items-center justify-center font-bold">
                      <Bed className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-xl text-gray-900">{admission.patientName}</h3>
                        <Badge variant="outline">{admission.id}</Badge>
                        <Badge className={getRoomTypeColor(admission.room)}>{admission.room}</Badge>
                        {getStatusBadge(admission.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-2 text-pink-500" />
                            <span>{admission.age} years • {admission.gender} • ID: {admission.patientId}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Stethoscope className="h-4 w-4 mr-2 text-pink-500" />
                            <span className="font-medium">{admission.doctorName}</span>
                            <span className="ml-2 text-gray-500">• {admission.department}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2 text-pink-500" />
                            <span>Admitted: {new Date(admission.admissionDate).toLocaleDateString()} at {admission.admissionTime}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 text-pink-500" />
                            <span>Room: {admission.room} • Bed: {admission.bedNumber}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2 text-pink-500" />
                            <span>Expected Discharge: {new Date(admission.expectedDischarge).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium">Insurance:</span>
                            <Badge className={admission.insurance === 'Yes' ? 'bg-green-100 text-green-700 ml-2' : 'bg-red-100 text-red-700 ml-2'}>
                              {admission.insurance}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Condition: {admission.condition}</p>
                            <p className="text-xs text-gray-600">Emergency Contact: {admission.emergencyContact}</p>
                          </div>
                          <div className="flex items-center">
                            {getStatusIcon(admission.status)}
                          </div>
                        </div>
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
                    <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Room Status Overview */}
      <Card className="border-pink-100 mt-6">
        <CardHeader>
          <CardTitle>Room Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <Activity className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h4 className="font-semibold text-red-800">ICU</h4>
              <p className="text-2xl font-bold text-red-600">8/10</p>
              <p className="text-sm text-red-600">Occupied/Total</p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg text-center">
              <Activity className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <h4 className="font-semibold text-orange-800">CCU</h4>
              <p className="text-2xl font-bold text-orange-600">5/6</p>
              <p className="text-sm text-orange-600">Occupied/Total</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <Bed className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-800">General Ward</h4>
              <p className="text-2xl font-bold text-blue-600">15/25</p>
              <p className="text-sm text-blue-600">Occupied/Total</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <MapPin className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-semibold text-green-800">Private Rooms</h4>
              <p className="text-2xl font-bold text-green-600">8/15</p>
              <p className="text-sm text-green-600">Occupied/Total</p>
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
            <Button
              variant="outline"
              className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2"
              // onClick={() => router.push('/admin/admissions/new')}
            >
              <Plus className="h-6 w-6" />
              <span>New Admission</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <LogOut className="h-6 w-6" />
              <span>Process Discharge</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <MapPin className="h-6 w-6" />
              <span>Room Assignment</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <FileText className="h-6 w-6" />
              <span>Discharge Summary</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-pink-100 text-pink-700 rounded-full">
          <Bed className="h-5 w-5 mr-2" />
          <span className="font-medium">Advanced Admission Management Features Coming Soon</span>
        </div>
      </div>
    </div>
  )
}
