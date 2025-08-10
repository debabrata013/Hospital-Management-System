"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  UserCog, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Shield,
  Mail,
  Phone,
  Calendar
} from 'lucide-react'

// Mock admin data
const mockAdmins = [
  {
    id: 1,
    name: "Dr. Rajesh Kumar",
    email: "rajesh.admin@hospital.com",
    phone: "+91 98765 43210",
    role: "Hospital Admin",
    department: "Administration",
    status: "active",
    lastLogin: "2 hours ago",
    joinDate: "Jan 15, 2023"
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priya.admin@hospital.com",
    phone: "+91 87654 32109",
    role: "Department Admin",
    department: "Cardiology",
    status: "active",
    lastLogin: "1 day ago",
    joinDate: "Mar 22, 2023"
  },
  {
    id: 3,
    name: "Amit Patel",
    email: "amit.admin@hospital.com",
    phone: "+91 76543 21098",
    role: "System Admin",
    department: "IT Department",
    status: "inactive",
    lastLogin: "5 days ago",
    joinDate: "Nov 08, 2022"
  }
]

export default function AdminsPage() {
  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge className="bg-green-100 text-green-700">Active</Badge>
      : <Badge className="bg-red-100 text-red-700">Inactive</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UserCog className="h-8 w-8 mr-3 text-pink-500" />
              Manage Admins
            </h1>
            <p className="text-gray-600 mt-2">Manage hospital administrators and their permissions</p>
          </div>
          <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600">
            <Plus className="h-4 w-4 mr-2" />
            Add New Admin
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Admins</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <UserCog className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Admins</p>
                <p className="text-2xl font-bold text-green-600">10</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-blue-600">8</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-purple-600">3</p>
              </div>
              <Plus className="h-8 w-8 text-purple-500" />
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
                  placeholder="Search admins by name, email, or department..." 
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

      {/* Admins List */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle>Hospital Administrators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAdmins.map((admin) => (
              <div key={admin.id} className="p-4 border border-pink-100 rounded-lg hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-full h-12 w-12 flex items-center justify-center font-bold">
                      {admin.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{admin.name}</h3>
                      <p className="text-sm text-gray-600">{admin.role} • {admin.department}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-xs text-gray-500">
                          <Mail className="h-3 w-3 mr-1" />
                          {admin.email}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Phone className="h-3 w-3 mr-1" />
                          {admin.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      {getStatusBadge(admin.status)}
                      <p className="text-xs text-gray-500 mt-1">Last login: {admin.lastLogin}</p>
                      <p className="text-xs text-gray-500">Joined: {admin.joinDate}</p>
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

      {/* Add Admin Form Placeholder */}
      <Card className="border-pink-100 mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Plus className="h-6 w-6" />
              <span>Add Admin</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Shield className="h-6 w-6" />
              <span>Manage Permissions</span>
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
          <UserCog className="h-5 w-5 mr-2" />
          <span className="font-medium">Advanced Admin Management Features Coming Soon</span>
        </div>
      </div>
    </div>
  )
}
