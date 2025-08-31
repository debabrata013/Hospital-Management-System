"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, 
  Users, Phone, Mail, MapPin, Calendar, User, 
  ArrowLeft, ChevronLeft, ChevronRight, MoreHorizontal
} from 'lucide-react'

interface Patient {
  id: number
  patient_id: string
  name: string
  date_of_birth: string
  gender: string
  contact_number: string
  email?: string
  address: string
  blood_group?: string
  emergency_contact_name: string
  emergency_contact_number: string
  emergency_contact_relation?: string
  city?: string
  state?: string
  pincode?: string
  marital_status?: string
  occupation?: string
  insurance_provider?: string
  insurance_policy_number?: string
  insurance_expiry_date?: string
  aadhar_number?: string
  profile_image?: string
  medical_history?: string
  allergies?: string
  current_medications?: string
  is_active: number
  registration_date: string
  created_by?: number
  created_at: string
  updated_at: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function PatientsPage() {
  const { toast } = useToast()
  const [patients, setPatients] = useState<Patient[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: '',
    gender: undefined as string | undefined,
    contact_number: '',
    email: '',
    address: '',
    blood_group: undefined as string | undefined,
    emergency_contact_name: '',
    emergency_contact_number: '',
    emergency_contact_relation: '',
    city: '',
    state: '',
    pincode: '',
    marital_status: undefined as string | undefined,
    occupation: '',
    insurance_provider: '',
    insurance_policy_number: '',
    insurance_expiry_date: '',
    aadhar_number: ''
  })

  useEffect(() => {
    fetchPatients()
  }, [pagination.page, search, statusFilter])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`/api/admin/patients?${params}`)
      if (!response.ok) throw new Error('Failed to fetch patients')
      
      const data = await response.json()
      setPatients(data.patients)
      setPagination(data.pagination)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create patient')
      }

      const result = await response.json()
      toast({
        title: "Success",
        description: `Patient ${result.patientId} created successfully`
      })
      
      setIsAddDialogOpen(false)
      resetForm()
      fetchPatients()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create patient',
        variant: "destructive"
      })
    }
  }

  const handleEditPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) return

    try {
      const response = await fetch('/api/admin/patients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedPatient.id, ...formData })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update patient')
      }

      toast({
        title: "Success",
        description: "Patient updated successfully"
      })
      
      setIsEditDialogOpen(false)
      setSelectedPatient(null)
      resetForm()
      fetchPatients()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update patient',
        variant: "destructive"
      })
    }
  }

  const handleDeletePatient = async (id: number) => {
    if (!confirm('Are you sure you want to delete this patient?')) return

    try {
      const response = await fetch(`/api/admin/patients?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete patient')
      }

      toast({
        title: "Success",
        description: "Patient deleted successfully"
      })
      
      fetchPatients()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete patient',
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      date_of_birth: '',
      gender: undefined,
      contact_number: '',
      email: '',
      address: '',
      blood_group: undefined,
      emergency_contact_name: '',
      emergency_contact_number: '',
      emergency_contact_relation: '',
      city: '',
      state: '',
      pincode: '',
      marital_status: undefined,
      occupation: '',
      insurance_provider: '',
      insurance_policy_number: '',
      insurance_expiry_date: '',
      aadhar_number: ''
    })
  }

  const openEditDialog = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormData({
      name: patient.name,
      date_of_birth: patient.date_of_birth,
      gender: patient.gender || undefined,
      contact_number: patient.contact_number,
      email: patient.email || '',
      address: patient.address || '',
      blood_group: patient.blood_group || undefined,
      emergency_contact_name: patient.emergency_contact_name || '',
      emergency_contact_number: patient.emergency_contact_number || '',
      emergency_contact_relation: patient.emergency_contact_relation || '',
      city: patient.city || '',
      state: patient.state || '',
      pincode: patient.pincode || '',
      marital_status: patient.marital_status || undefined,
      occupation: patient.occupation || '',
      insurance_provider: patient.insurance_provider || '',
      insurance_policy_number: patient.insurance_policy_number || '',
      insurance_expiry_date: patient.insurance_expiry_date || '',
      aadhar_number: patient.aadhar_number || ''
    })
    setIsEditDialogOpen(true)
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const getStatusBadge = (isActive: number) => {
    return isActive === 1 ? (
      <Badge className="bg-green-100 text-green-700">Active</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-700">Inactive</Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
            <p className="text-gray-600 mt-2">Manage all patient records and information</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
                <DialogDescription>Enter patient information to create a new record</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddPatient} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={formData.gender || undefined} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger>
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
                    <Label htmlFor="contact_number">Contact Number *</Label>
                    <Input
                      id="contact_number"
                      value={formData.contact_number}
                      onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="blood_group">Blood Group</Label>
                    <Select value={formData.blood_group || undefined} onValueChange={(value) => setFormData({ ...formData, blood_group: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="emergency_contact_name">Emergency Contact Name *</Label>
                    <Input
                      id="emergency_contact_name"
                      value={formData.emergency_contact_name}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergency_contact_number">Emergency Contact Phone *</Label>
                    <Input
                      id="emergency_contact_number"
                      value={formData.emergency_contact_number}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_number: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency_contact_relation">Emergency Contact Relation</Label>
                    <Input
                      id="emergency_contact_relation"
                      value={formData.emergency_contact_relation}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_relation: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="marital_status">Marital Status</Label>
                  <Select value={formData.marital_status || undefined} onValueChange={(value) => setFormData({ ...formData, marital_status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="insurance_provider">Insurance Provider</Label>
                  <Input
                    id="insurance_provider"
                    value={formData.insurance_provider}
                    onChange={(e) => setFormData({ ...formData, insurance_provider: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="insurance_policy_number">Insurance Policy Number</Label>
                  <Input
                    id="insurance_policy_number"
                    value={formData.insurance_policy_number}
                    onChange={(e) => setFormData({ ...formData, insurance_policy_number: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="insurance_expiry_date">Insurance Expiry Date</Label>
                  <Input
                    id="insurance_expiry_date"
                    type="date"
                    value={formData.insurance_expiry_date}
                    onChange={(e) => setFormData({ ...formData, insurance_expiry_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="aadhar_number">Aadhar Number</Label>
                  <Input
                    id="aadhar_number"
                    value={formData.aadhar_number}
                    onChange={(e) => setFormData({ ...formData, aadhar_number: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Patient</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search patients by name, ID, or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter || undefined} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => { setSearch(''); setStatusFilter('all'); }}>
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Patients ({pagination.total})
          </CardTitle>
          <CardDescription>
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-4 animate-pulse">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No patients found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {patients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-pink-100 text-pink-700">
                        {patient.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                        {getStatusBadge(patient.is_active)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {patient.patient_id}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {calculateAge(patient.date_of_birth)} years
                        </span>
                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {patient.contact_number}
                        </span>
                        {patient.email && (
                          <span className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {patient.email}
                          </span>
                        )}
                      </div>
                      {patient.address && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {patient.address}
                          {patient.city && `, ${patient.city}`}
                          {patient.state && `, ${patient.state}`}
                          {patient.pincode && ` - ${patient.pincode}`}
                        </div>
                      )}
                      {patient.emergency_contact_name && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Phone className="h-3 w-3 mr-1" />
                          Emergency: {patient.emergency_contact_name} ({patient.emergency_contact_number})
                          {patient.emergency_contact_relation && ` - ${patient.emergency_contact_relation}`}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(patient)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePatient(patient.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>Update patient information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditPatient} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-date_of_birth">Date of Birth *</Label>
                <Input
                  id="edit-date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-gender">Gender *</Label>
                <Select value={formData.gender || undefined} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
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
                <Label htmlFor="edit-contact_number">Contact Number *</Label>
                <Input
                  id="edit-contact_number"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-address">Address *</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-blood_group">Blood Group</Label>
                <Select value={formData.blood_group || undefined} onValueChange={(value) => setFormData({ ...formData, blood_group: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-emergency_contact_name">Emergency Contact Name *</Label>
                <Input
                  id="edit-emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-emergency_contact_number">Emergency Contact Phone *</Label>
                <Input
                  id="edit-emergency_contact_number"
                  value={formData.emergency_contact_number}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_number: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-emergency_contact_relation">Emergency Contact Relation</Label>
                <Input
                  id="edit-emergency_contact_relation"
                  value={formData.emergency_contact_relation}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_relation: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-state">State</Label>
                <Input
                  id="edit-state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-pincode">Pincode</Label>
              <Input
                id="edit-pincode"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-marital_status">Marital Status</Label>
              <Select value={formData.marital_status || undefined} onValueChange={(value) => setFormData({ ...formData, marital_status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Married">Married</SelectItem>
                  <SelectItem value="Divorced">Divorced</SelectItem>
                  <SelectItem value="Widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-occupation">Occupation</Label>
              <Input
                id="edit-occupation"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-insurance_provider">Insurance Provider</Label>
              <Input
                id="edit-insurance_provider"
                value={formData.insurance_provider}
                onChange={(e) => setFormData({ ...formData, insurance_provider: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-insurance_policy_number">Insurance Policy Number</Label>
              <Input
                id="edit-insurance_policy_number"
                value={formData.insurance_policy_number}
                onChange={(e) => setFormData({ ...formData, insurance_policy_number: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-insurance_expiry_date">Insurance Expiry Date</Label>
              <Input
                id="edit-insurance_expiry_date"
                type="date"
                value={formData.insurance_expiry_date}
                onChange={(e) => setFormData({ ...formData, insurance_expiry_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-aadhar_number">Aadhar Number</Label>
              <Input
                id="edit-aadhar_number"
                value={formData.aadhar_number}
                onChange={(e) => setFormData({ ...formData, aadhar_number: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Patient</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
