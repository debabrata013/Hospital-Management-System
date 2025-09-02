"use client"

import { useState, useEffect } from 'react'
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
  Edit,
  Trash2,
  Eye,
  Stethoscope,
  Mail,
  Phone,
  Calendar,
  Award,
  Clock,
  Loader2,
} from 'lucide-react'

// Doctor interface
interface Doctor {
  id: number
  user_id: string
  name: string
  email: string
  contact_number: string
  specialization: string
  department: string
  experience_years: number
  qualification: string
  license_number: string
  address?: string
  date_of_birth?: string
  gender?: string
  joining_date?: string
  salary?: number
  is_active: boolean
  is_verified: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

// Form data interface
interface DoctorFormData {
  name: string
  email: string
  password: string
  contact_number: string
  specialization: string
  department: string
  experience_years: number
  qualification: string
  license_number: string
  address: string
  date_of_birth: string
  gender: string
  joining_date: string
  salary: number
}

// Stats interface
interface DoctorStats {
  totalDoctors: number
  activeDoctors: number
  inactiveDoctors: number
  specializationsCount: number
  departmentsCount: number
  recentDoctors: number
  specializationBreakdown: Array<{ specialization: string; count: number }>
}

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
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [stats, setStats] = useState<DoctorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialization, setSelectedSpecialization] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  // Fetch doctors from API
  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        specialization: selectedSpecialization === 'all' ? '' : selectedSpecialization
      })
      
      const response = await fetch(`/api/super-admin/doctors?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setDoctors(data.doctors)
        setTotalPages(data.pagination.totalPages)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch doctors",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch doctors",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats from API
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/super-admin/doctors/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchDoctors()
  }, [currentPage, searchTerm, selectedSpecialization])

  useEffect(() => {
    fetchStats()
  }, [])

  // Form validation
  const validateForm = (data: DoctorFormData): string[] => {
    const errors: string[] = []

    if (!data.name.trim()) errors.push("Name is required")
    if (!data.email.trim()) errors.push("Email is required")
    if (!data.password.trim()) errors.push("Password is required")
    if (!data.contact_number.trim()) errors.push("Contact number is required")
    if (!data.specialization) errors.push("Specialization is required")
    if (!data.department) errors.push("Department is required")
    if (!data.qualification.trim()) errors.push("Qualification is required")
    if (!data.license_number.trim()) errors.push("License number is required")

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (data.email && !emailRegex.test(data.email)) {
      errors.push("Please enter a valid email address")
    }

    // Phone validation
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/
    if (data.contact_number && !phoneRegex.test(data.contact_number)) {
      errors.push("Please enter a valid phone number")
    }

    return errors
  }

  // Add new doctor
  const handleAddDoctor = async (formData: DoctorFormData) => {
    const errors = validateForm(formData)

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(", "),
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch('/api/super-admin/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: `Dr. ${formData.name} has been added successfully!`,
        })
        setIsAddDialogOpen(false)
        fetchDoctors() // Refresh the list
        fetchStats() // Refresh stats
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add doctor",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add doctor",
        variant: "destructive"
      })
    }
  }

  // Delete doctor
  const handleDeleteDoctor = async (doctorId: number) => {
    if (confirm("Are you sure you want to deactivate this doctor?")) {
      try {
        const response = await fetch(`/api/super-admin/doctors/${doctorId}`, {
          method: 'DELETE',
        })

        const data = await response.json()

        if (response.ok) {
          toast({
            title: "Success",
            description: "Doctor has been deactivated successfully!",
          })
          fetchDoctors() // Refresh the list
          fetchStats() // Refresh stats
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to deactivate doctor",
            variant: "destructive"
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to deactivate doctor",
          variant: "destructive"
        })
      }
    }
  }

  // Filter doctors (now handled by API, but keeping for UI consistency)
  const filteredDoctors = doctors

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 
      <Badge className="bg-green-100 text-green-700">Active</Badge> :
      <Badge className="bg-red-100 text-red-700">Inactive</Badge>
  }

  const getVerificationBadge = (isVerified: boolean) => {
    return isVerified ? 
      <Badge className="bg-blue-100 text-blue-700">Verified</Badge> :
      <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-pink-500" />
              Manage Doctors
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage hospital doctors, schedules, and specializations</p>
          </div>

          {/* Add New Doctor Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600">
                <Plus className="h-4 w-4 mr-2" />
                Add New Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xs sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Doctors</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.totalDoctors || 0}
                </p>
              </div>
              <Stethoscope className="h-6 w-6 sm:h-8 sm:w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Active Doctors</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.activeDoctors || 0}
                </p>
              </div>
              <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Specializations</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.specializationsCount || 0}
                </p>
              </div>
              <Award className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.recentDoctors || 0}
                </p>
              </div>
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-pink-100 mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search doctors by name, email, or license number..."
                  className="pl-10 border-pink-200 focus:border-pink-400"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1) // Reset to first page when searching
                  }}
                />
              </div>
            </div>
            <Select value={selectedSpecialization} onValueChange={(value) => {
              setSelectedSpecialization(value)
              setCurrentPage(1) // Reset to first page when filtering
            }}>
              <SelectTrigger className="w-full md:w-48 border-pink-200 text-pink-600">
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
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 mx-auto mb-4 text-pink-500 animate-spin" />
              <p className="text-gray-500">Loading doctors...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No doctors found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="p-4 border border-pink-100 rounded-lg hover:shadow-md transition-all duration-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-full h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center font-bold text-md sm:text-lg">
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg sm:text-xl">{doctor.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 font-medium">{doctor.specialization} • {doctor.department || 'General'}</p>
                        <p className="text-xs text-gray-500">{doctor.qualification}</p>
                        <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 mt-2">
                          <div className="flex items-center text-xs text-gray-500">
                            <Mail className="h-3 w-3 mr-1" />
                            {doctor.email}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Phone className="h-3 w-3 mr-1" />
                            {doctor.contact_number}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {doctor.experience_years} years experience
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full sm:w-auto">
                      <div className="text-center w-full sm:w-auto">
                        <p className="text-sm font-medium text-gray-900">User ID</p>
                        <p className="text-lg sm:text-xl font-bold text-pink-600">{doctor.user_id}</p>
                      </div>

                      <div className="text-center w-full sm:w-auto">
                        <p className="text-sm font-medium text-gray-900">License</p>
                        <p className="text-sm font-medium text-blue-600">{doctor.license_number}</p>
                      </div>

                      <div className="text-right w-full sm:w-auto">
                        <div className="space-y-2">
                          {getStatusBadge(doctor.is_active)}
                          {getVerificationBadge(doctor.is_verified)}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Joined: {doctor.created_at ? new Date(doctor.created_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50 flex-1 sm:flex-none">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50 flex-1 sm:flex-none">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50 flex-1 sm:flex-none"
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-6 w-6" />
              <span className="text-center">Add Doctor</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Calendar className="h-6 w-6" />
              <span className="text-center">Manage Schedules</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Award className="h-6 w-6" />
              <span className="text-center">Performance Review</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Mail className="h-6 w-6" />
              <span className="text-center">Send Notifications</span>
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
    password: "",
    contact_number: "",
    specialization: "",
    department: "",
    experience_years: 0,
    qualification: "",
    license_number: "",
    address: "",
    date_of_birth: "",
    gender: "",
    joining_date: "",
    salary: 0
  })

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      contact_number: "",
      specialization: "",
      department: "",
      experience_years: 0,
      qualification: "",
      license_number: "",
      address: "",
      date_of_birth: "",
      gender: "",
      joining_date: "",
      salary: 0
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    resetForm()
  }

  const handleInputChange = (field: keyof DoctorFormData, value: string | number) => {
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Enter secure password"
            className="border-pink-200 focus:border-pink-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
          <Input
            value={formData.contact_number}
            onChange={(e) => handleInputChange('contact_number', e.target.value)}
            placeholder="+91 98765 43210"
            className="border-pink-200 focus:border-pink-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">License Number *</label>
          <Input
            value={formData.license_number}
            onChange={(e) => handleInputChange('license_number', e.target.value)}
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years) *</label>
          <Input
            type="number"
            value={formData.experience_years}
            onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
            placeholder="5"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <Select value={formData.gender || undefined} onValueChange={(value) => handleInputChange('gender', value)}>
            <SelectTrigger className="border-pink-200 focus:border-pink-400">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          <Input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
            className="border-pink-200 focus:border-pink-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date</label>
          <Input
            type="date"
            value={formData.joining_date}
            onChange={(e) => handleInputChange('joining_date', e.target.value)}
            className="border-pink-200 focus:border-pink-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Salary</label>
          <Input
            type="number"
            value={formData.salary}
            onChange={(e) => handleInputChange('salary', parseInt(e.target.value) || 0)}
            placeholder="50000"
            className="border-pink-200 focus:border-pink-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <Textarea
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Complete address..."
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