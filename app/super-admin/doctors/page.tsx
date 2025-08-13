"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
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
  Clock,
  X
} from 'lucide-react'

// Doctor interface
interface Doctor {
  id: number
  name: string
  email: string
  phone: string
  specialization: string
  department: string
  experience: string
  qualification: string
  status: string
  availability: string
  patientsToday: number
  rating: number
  joinDate: string
  bio?: string
  licenseNumber?: string
  emergencyContact?: string
}

// Form data interface
interface DoctorFormData {
  name: string
  email: string
  phone: string
  specialization: string
  department: string
  experience: string
  qualification: string
  bio: string
  licenseNumber: string
  emergencyContact: string
}

// Mock doctor data
const mockDoctors: Doctor[] = [
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
    joinDate: "Jan 15, 2020",
    bio: "Experienced cardiologist with expertise in interventional cardiology",
    licenseNumber: "MED123456",
    emergencyContact: "+91 98765 43211"
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
    joinDate: "Mar 22, 2019",
    bio: "Specialist in neurological disorders and brain surgery",
    licenseNumber: "MED123457",
    emergencyContact: "+91 87654 32110"
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
    joinDate: "Nov 08, 2021",
    bio: "Dedicated pediatrician with focus on child healthcare",
    licenseNumber: "MED123458",
    emergencyContact: "+91 76543 21099"
  }
]

// Available specializations and departments
const specializations = [
  "Cardiologist", "Neurologist", "Pediatrician", "Orthopedic", "Dermatologist",
  "Psychiatrist", "Oncologist", "Radiologist", "Anesthesiologist", "Surgeon",
  "Gynecologist", "Urologist", "Endocrinologist", "Gastroenterologist", "Pulmonologist"
]

const departments = [
  "Cardiology", "Neurology", "Pediatrics", "Orthopedics", "Dermatology",
  "Psychiatry", "Oncology", "Radiology", "Anesthesiology", "General Surgery",
  "Gynecology", "Urology", "Endocrinology", "Gastroenterology", "Pulmonology"
]

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialization, setSelectedSpecialization] = useState("all")
  const { toast } = useToast()

  // Form validation
  const validateForm = (data: DoctorFormData): string[] => {
    const errors: string[] = []
    
    if (!data.name.trim()) errors.push("Name is required")
    if (!data.email.trim()) errors.push("Email is required")
    if (!data.phone.trim()) errors.push("Phone is required")
    if (!data.specialization) errors.push("Specialization is required")
    if (!data.department) errors.push("Department is required")
    if (!data.experience.trim()) errors.push("Experience is required")
    if (!data.qualification.trim()) errors.push("Qualification is required")
    if (!data.licenseNumber.trim()) errors.push("License number is required")
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (data.email && !emailRegex.test(data.email)) {
      errors.push("Please enter a valid email address")
    }
    
    // Phone validation
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/
    if (data.phone && !phoneRegex.test(data.phone)) {
      errors.push("Please enter a valid phone number")
    }
    
    return errors
  }

  // Add new doctor
  const handleAddDoctor = (formData: DoctorFormData) => {
    const errors = validateForm(formData)
    
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(", "),
        variant: "destructive"
      })
      return
    }

    const newDoctor: Doctor = {
      id: doctors.length + 1,
      ...formData,
      status: "active",
      availability: "Available",
      patientsToday: 0,
      rating: 0,
      joinDate: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
      })
    }

    setDoctors([...doctors, newDoctor])
    setIsAddDialogOpen(false)
    
    toast({
      title: "Success",
      description: `Dr. ${formData.name} has been added successfully!`,
    })

    // Form will be reset when the dialog closes
  }

  // Delete doctor
  const handleDeleteDoctor = (doctorId: number) => {
    if (confirm("Are you sure you want to delete this doctor?")) {
      setDoctors(doctors.filter(doctor => doctor.id !== doctorId))
      toast({
        title: "Success",
        description: "Doctor has been deleted successfully!",
      })
    }
  }

  // Filter doctors
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.department.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSpecialization = selectedSpecialization === "all" || !selectedSpecialization || doctor.specialization === selectedSpecialization
    
    return matchesSearch && matchesSpecialization
  })

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
          
          {/* Add New Doctor Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600">
                <Plus className="h-4 w-4 mr-2" />
                Add New Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-pink-500" />
                  Add New Doctor
                </DialogTitle>
              </DialogHeader>
              
              <AddDoctorForm onSubmit={handleAddDoctor} onCancel={() => {
                setIsAddDialogOpen(false)
              }} />
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
                <p className="text-sm font-medium text-gray-600">Total Doctors</p>
                <p className="text-2xl font-bold text-gray-900">{doctors.length}</p>
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
                <p className="text-2xl font-bold text-green-600">
                  {doctors.filter(d => d.availability === 'Available').length}
                </p>
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
                <p className="text-2xl font-bold text-blue-600">
                  {new Set(doctors.map(d => d.specialization)).size}
                </p>
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
                <p className="text-2xl font-bold text-purple-600">
                  {(doctors.reduce((sum, d) => sum + d.rating, 0) / doctors.length).toFixed(1)}
                </p>
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
              <SelectTrigger className="w-48 border-pink-200 text-pink-600">
                <SelectValue placeholder="Filter by Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Doctors List */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle>Hospital Doctors ({filteredDoctors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDoctors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No doctors found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDoctors.map((doctor) => (
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
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteDoctor(doctor.id)}
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
              onClick={() => setIsAddDialogOpen(true)}
            >
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
    </div>
  )
}

// Add Doctor Form Component
function AddDoctorForm({ onSubmit, onCancel }: { onSubmit: (data: DoctorFormData) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState<DoctorFormData>({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    department: "",
    experience: "",
    qualification: "",
    bio: "",
    licenseNumber: "",
    emergencyContact: ""
  })

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialization: "",
      department: "",
      experience: "",
      qualification: "",
      bio: "",
      licenseNumber: "",
      emergencyContact: ""
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    resetForm()
  }

  const handleInputChange = (field: keyof DoctorFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Dr. John Doe"
            className="border-pink-200 focus:border-pink-400"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="doctor@hospital.com"
            className="border-pink-200 focus:border-pink-400"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
          <Input
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+91 98765 43210"
            className="border-pink-200 focus:border-pink-400"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">License Number *</label>
          <Input
            value={formData.licenseNumber}
            onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
            placeholder="MED123456"
            className="border-pink-200 focus:border-pink-400"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Specialization *</label>
          <Select value={formData.specialization || undefined} onValueChange={(value) => handleInputChange('specialization', value)}>
            <SelectTrigger className="border-pink-200 focus:border-pink-400">
              <SelectValue placeholder="Select specialization" />
            </SelectTrigger>
            <SelectContent>
              {specializations.map((spec) => (
                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
          <Select value={formData.department || undefined} onValueChange={(value) => handleInputChange('department', value)}>
            <SelectTrigger className="border-pink-200 focus:border-pink-400">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Experience *</label>
          <Input
            value={formData.experience}
            onChange={(e) => handleInputChange('experience', e.target.value)}
            placeholder="5 years"
            className="border-pink-200 focus:border-pink-400"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Qualification *</label>
          <Input
            value={formData.qualification}
            onChange={(e) => handleInputChange('qualification', e.target.value)}
            placeholder="MBBS, MD"
            className="border-pink-200 focus:border-pink-400"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
          <Input
            value={formData.emergencyContact}
            onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
            placeholder="+91 98765 43211"
            className="border-pink-200 focus:border-pink-400"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
        <Textarea
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="Brief description about the doctor's expertise and experience..."
          className="border-pink-200 focus:border-pink-400"
          rows={3}
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={() => {
          resetForm()
          onCancel()
        }} className="border-pink-200 text-pink-600">
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Doctor
        </Button>
      </div>
    </form>
  )
}
