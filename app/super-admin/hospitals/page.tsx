"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  Building2, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Phone,
  Mail,
  Users,
  Activity,
  Star,
  X
} from 'lucide-react'

// Mock hospital data
const mockHospitals = [
  {
    id: 1,
    name: "Arogya Central Hospital",
    location: "Mumbai, Maharashtra",
    address: "123 Health Street, Andheri West, Mumbai - 400058",
    phone: "+91 22 2674 5678",
    email: "info@arogyacentral.com",
    type: "Multi-Specialty",
    beds: 250,
    doctors: 45,
    staff: 120,
    status: "active",
    rating: 4.8,
    established: "2015",
    lastUpdate: "2 hours ago"
  },
  {
    id: 2,
    name: "Arogya City Medical Center",
    location: "Delhi, NCR",
    address: "456 Medical Plaza, Connaught Place, New Delhi - 110001",
    phone: "+91 11 4567 8901",
    email: "contact@arogyacity.com",
    type: "General Hospital",
    beds: 180,
    doctors: 32,
    staff: 85,
    status: "active",
    rating: 4.6,
    established: "2018",
    lastUpdate: "1 day ago"
  },
  {
    id: 3,
    name: "Arogya Specialty Clinic",
    location: "Bangalore, Karnataka",
    address: "789 Care Avenue, Koramangala, Bangalore - 560034",
    phone: "+91 80 9876 5432",
    email: "admin@arogyaspecialty.com",
    type: "Specialty Clinic",
    beds: 50,
    doctors: 15,
    staff: 35,
    status: "maintenance",
    rating: 4.4,
    established: "2020",
    lastUpdate: "3 days ago"
  }
]

export default function HospitalsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [hospitals, setHospitals] = useState(mockHospitals)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    phone: '',
    email: '',
    type: '',
    beds: '',
    doctors: '',
    staff: '',
    established: ''
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-700">Maintenance</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-700">Inactive</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Multi-Specialty':
        return <Badge className="bg-blue-100 text-blue-700">Multi-Specialty</Badge>
      case 'General Hospital':
        return <Badge className="bg-purple-100 text-purple-700">General Hospital</Badge>
      case 'Specialty Clinic':
        return <Badge className="bg-orange-100 text-orange-700">Specialty Clinic</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{type}</Badge>
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.name || !formData.location || !formData.address || !formData.phone || !formData.email || !formData.type) {
      toast.error('Please fill in all required fields')
      return
    }

    // Create new hospital object
    const newHospital = {
      id: hospitals.length + 1,
      name: formData.name,
      location: formData.location,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      type: formData.type,
      beds: parseInt(formData.beds) || 0,
      doctors: parseInt(formData.doctors) || 0,
      staff: parseInt(formData.staff) || 0,
      status: "active",
      rating: 0,
      established: formData.established || new Date().getFullYear().toString(),
      lastUpdate: "Just now"
    }

    // Add to hospitals list
    setHospitals(prev => [newHospital, ...prev])
    
    // Reset form
    setFormData({
      name: '',
      location: '',
      address: '',
      phone: '',
      email: '',
      type: '',
      beds: '',
      doctors: '',
      staff: '',
      established: ''
    })
    
    // Close modal
    setIsAddModalOpen(false)
    
    // Show success message
    toast.success('Hospital added successfully!')
  }

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      address: '',
      phone: '',
      email: '',
      type: '',
      beds: '',
      doctors: '',
      staff: '',
      established: ''
    })
  }

  const handleDeleteHospital = (hospitalId: number) => {
    if (confirm('Are you sure you want to delete this hospital? This action cannot be undone.')) {
      setHospitals(prev => prev.filter(h => h.id !== hospitalId))
      toast.success('Hospital deleted successfully!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Building2 className="h-8 w-8 mr-3 text-pink-500" />
              Manage Hospitals
            </h1>
            <p className="text-gray-600 mt-2">Manage hospital network, locations, and facilities</p>
          </div>
          
          {/* Add Hospital Modal */}
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Hospital
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-pink-500" />
                  Add New Hospital
                </DialogTitle>
                <DialogDescription>
                  Fill in the details below to add a new hospital to the network.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Hospital Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter hospital name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Hospital Type *</Label>
                    <Select value={formData.type || undefined} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select hospital type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Multi-Specialty">Multi-Specialty</SelectItem>
                        <SelectItem value="General Hospital">General Hospital</SelectItem>
                        <SelectItem value="Specialty Clinic">Specialty Clinic</SelectItem>
                        <SelectItem value="Emergency Center">Emergency Center</SelectItem>
                        <SelectItem value="Rehabilitation Center">Rehabilitation Center</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="City, State"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="established">Established Year</Label>
                    <Input
                      id="established"
                      type="number"
                      value={formData.established}
                      onChange={(e) => handleInputChange('established', e.target.value)}
                      placeholder="e.g., 2020"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter complete address"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+91 123 456 7890"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="info@hospital.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="beds">Number of Beds</Label>
                    <Input
                      id="beds"
                      type="number"
                      value={formData.beds}
                      onChange={(e) => handleInputChange('beds', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="doctors">Number of Doctors</Label>
                    <Input
                      id="doctors"
                      type="number"
                      value={formData.doctors}
                      onChange={(e) => handleInputChange('doctors', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="staff">Number of Staff</Label>
                    <Input
                      id="staff"
                      type="number"
                      value={formData.staff}
                      onChange={(e) => handleInputChange('staff', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <DialogFooter className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      resetForm()
                      setIsAddModalOpen(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Hospital
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hospitals</p>
                <p className="text-2xl font-bold text-gray-900">{hospitals.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Hospitals</p>
                <p className="text-2xl font-bold text-green-600">{hospitals.filter(h => h.status === 'active').length}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Beds</p>
                <p className="text-2xl font-bold text-blue-600">{hospitals.reduce((sum, h) => sum + h.beds, 0).toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {(hospitals.reduce((sum, h) => sum + h.rating, 0) / hospitals.length).toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
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
                  placeholder="Search hospitals by name, location, or type..." 
                  className="pl-10 border-pink-200 focus:border-pink-400"
                />
              </div>
            </div>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Location
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hospitals List */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle>Hospital Network</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {hospitals.map((hospital) => (
              <div key={hospital.id} className="p-6 border border-pink-100 rounded-lg hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-lg h-16 w-16 flex items-center justify-center font-bold text-lg">
                      {hospital.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-xl text-gray-900">{hospital.name}</h3>
                        {getTypeBadge(hospital.type)}
                        {getStatusBadge(hospital.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 text-pink-500" />
                            <span className="font-medium">{hospital.location}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2 text-pink-500" />
                            <span>{hospital.phone}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2 text-pink-500" />
                            <span>{hospital.email}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Address:</span> {hospital.address}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Established:</span> {hospital.established}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Last Update:</span> {hospital.lastUpdate}
                          </p>
                        </div>
                      </div>

                      {/* Hospital Stats */}
                      <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{hospital.beds}</p>
                          <p className="text-xs text-gray-600">Total Beds</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{hospital.doctors}</p>
                          <p className="text-xs text-gray-600">Doctors</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">{hospital.staff}</p>
                          <p className="text-xs text-gray-600">Staff</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-yellow-600">⭐ {hospital.rating}</p>
                          <p className="text-xs text-gray-600">Rating</p>
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
                                          <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteHospital(hospital.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Network Overview */}
      <Card className="border-pink-100 mt-6">
        <CardHeader>
          <CardTitle>Network Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800">Multi-Specialty Hospitals</h4>
              <p className="text-sm text-blue-600 mt-1">45 hospitals • 8,500 beds</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800">General Hospitals</h4>
              <p className="text-sm text-green-600 mt-1">62 hospitals • 5,200 beds</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800">Specialty Clinics</h4>
              <p className="text-sm text-purple-600 mt-1">20 clinics • 1,720 beds</p>
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
              <span>Add Hospital</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <MapPin className="h-6 w-6" />
              <span>View Map</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Activity className="h-6 w-6" />
              <span>Performance Report</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Star className="h-6 w-6" />
              <span>Quality Metrics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-pink-100 text-pink-700 rounded-full">
          <Building2 className="h-5 w-5 mr-2" />
          <span className="font-medium">Advanced Hospital Management Features Coming Soon</span>
        </div>
      </div>
    </div>
  )
}
