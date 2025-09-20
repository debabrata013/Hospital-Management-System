"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Plus, Edit, Trash2, Phone, Mail, User, Stethoscope, Loader2, UserCheck, ChevronsUpDown, Check } from 'lucide-react'
import { toast } from "sonner"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"


interface Doctor {
  id: number
  user_id: string
  name: string
  email: string
  mobile: string
  department: string
  isActive: boolean
  createdAt: string
  lastLogin: string | null
  experience: string
  patientsTreated: string
  description: string
  available: string
  languages: string
}

const departments = [
  // General Departments
  "Anesthesiology",
  "Cardiology",
  "Dermatology",
  "Emergency Medicine",
  "Endocrinology",
  "Gastroenterology",
  "General Surgery",
  "Gynecology",
  "Hematology",
  "Infectious Disease",
  "Internal Medicine",
  "Nephrology",
  "Neurology",
  "Neurosurgery",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Otolaryngology",
  "Pathology",
  "Pediatrics",
  "Plastic Surgery",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Urology",
  // Surgical Procedures & Specializations
  "ACL reconstruction", 
  "Anterior cruciate ligament Reconstruction",
  "Appendectomy",
  "Arthrodesis", 
  "Arthroplasty", 
  "Arthroscopic Surgery", 
  "Bone grafting", 
  "Carpal tunnel release", 
  "Cesarean section", 
  "Cervical cerclage", 
  "Colporrhaphy",
  "Cholecystectomy", 
  "Debridement", 
  "Endometrial biopsy", 
  "External fixation", 
  "Foot and ankle surgery", 
  "Fracture repair", 
  "Hand surgery", 
  "Hernia repair",
  "Hip replacement", 
  "Hydrocelectomy", 
  "Joint fusion", 
  "Joint replacement", 
  "Knee replacement", 
  "Labiaplasty", 
  "Laminectomy", 
  "Laparoscopic endometriosis surgery", 
  "Osteotomy", 
  "Orchidectomy", 
  "Orchiopexy, inguinal hernia repair", 
  "Ovarian cystectomy", 
  "Pelvic organ prolapse repair", 
  "Pelvic ultrasound", 
  "Robotic surgery", 
  "Rotator cuff repair", 
  "Shoulder arthroscopy", 
  "Shoulder replacement", 
  "Spinal fusion", 
  "Tendon repair", 
  "Testicular biopsy", 
  "Trigger finger release", 
  "Uterine artery embolization", 
  "Varicocelectomy", 
  "Vasectomy",
].sort()

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    password: '',
    department: '',
    experience: '',
    patientsTreated: '',
    description: '',
    available: '',
    languages: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/super-admin/doctors')
      const data = await response.json()
      
      if (data.success) {
        setDoctors(data.doctors)
      } else {
        toast.error('Failed to fetch doctors')
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
      toast.error('Failed to fetch doctors')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Clean and validate form data
    const cleanData = {
      name: formData.name.trim(),
      mobile: formData.mobile.trim(),
      password: formData.password.trim(),
      department: typeof formData.department === 'string' ? formData.department.trim() : '',
      experience: formData.experience.trim(),
      patientsTreated: formData.patientsTreated.trim(),
      description: formData.description.trim(),
      available: formData.available.trim(),
      languages: formData.languages.trim()
    }

    // Frontend validation
    if (!cleanData.name || !cleanData.mobile || !cleanData.password || !cleanData.department) {
      toast.error('Please fill in all required fields, including department')
      setSubmitting(false)
      return
    }

    if (!/^[6-9]\d{9}$/.test(cleanData.mobile)) {
      toast.error('Please enter a valid 10-digit mobile number starting with 6-9')
      setSubmitting(false)
      return
    }

    if (!/^\d{6}$/.test(cleanData.password)) {
      toast.error('Password must be exactly 6 digits')
      setSubmitting(false)
      return
    }

    console.log('Sending doctor data:', cleanData) // Debug log

    try {
      const response = await fetch('/api/super-admin/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData)
      })

      const data = await response.json()
      console.log('Response:', response.status, data) // Debug log

      if (data.success) {
        toast.success('Doctor created successfully')
        setIsCreateOpen(false)
        setFormData({ name: '', mobile: '', password: '', department: '', experience: '', patientsTreated: '', description: '', available: '', languages: '' })
        fetchDoctors()
      } else {
        const errorMessage = data.error || 'An unknown error occurred';
        toast.error(errorMessage);
        console.error('API Error:', errorMessage);
      }
    } catch (error) {
      console.error('Error creating doctor:', error)
      toast.error('Failed to create doctor')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDoctor) return

    setSubmitting(true)

    // Clean and validate form data
    const cleanData = {
      id: editingDoctor.id,
      name: formData.name.trim(),
      mobile: formData.mobile.trim(),
      password: formData.password.trim(),
      department: typeof formData.department === 'string' ? formData.department.trim() : '',
      experience: formData.experience.trim(),
      patientsTreated: formData.patientsTreated.trim(),
      description: formData.description.trim(),
      available: formData.available.trim(),
      languages: formData.languages.trim()
    }

    // Frontend validation
    if (!cleanData.name) {
      toast.error('Name is required')
      setSubmitting(false)
      return
    }

    if (!cleanData.mobile) {
      toast.error('Mobile number is required')
      setSubmitting(false)
      return
    }

    if (!/^[6-9]\d{9}$/.test(cleanData.mobile)) {
      toast.error('Please enter a valid 10-digit mobile number starting with 6-9')
      setSubmitting(false)
      return
    }

    if (cleanData.password && !/^\d{6}$/.test(cleanData.password)) {
      toast.error('Password must be exactly 6 digits')
      setSubmitting(false)
      return
    }

    // Remove empty password from request if not provided
    if (!cleanData.password) {
      delete cleanData.password
    }

    console.log('Sending doctor update data:', cleanData) // Debug log

    try {
      const response = await fetch('/api/super-admin/doctors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData)
      })

      const data = await response.json()
      console.log('Response:', response.status, data) // Debug log

      if (data.success) {
        toast.success('Doctor updated successfully')
        setIsEditOpen(false)
        setEditingDoctor(null)
        setFormData({ name: '', mobile: '', password: '', department: '', experience: '', patientsTreated: '', description: '', available: '', languages: '' })
        fetchDoctors()
      } else {
        toast.error(data.error || 'Failed to update doctor')
      }
    } catch (error) {
      console.error('Error updating doctor:', error)
      toast.error('Failed to update doctor')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (doctor: Doctor) => {
    if (!confirm(`Are you sure you want to delete Dr. ${doctor.name}?`)) return

    try {
      const response = await fetch(`/api/super-admin/doctors?id=${doctor.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Doctor deleted successfully')
        fetchDoctors()
      } else {
        toast.error(data.error || 'Failed to delete doctor')
      }
    } catch (error) {
      console.error('Error deleting doctor:', error)
      toast.error('Failed to delete doctor')
    }
  }

  const openEditDialog = (doctor: Doctor) => {
    setEditingDoctor(doctor)
    setFormData({
      name: doctor.name,
      mobile: doctor.mobile,
      password: '',
      department: doctor.department,
      experience: doctor.experience || '',
      patientsTreated: doctor.patientsTreated || '',
      description: doctor.description || '',
      available: doctor.available || '',
      languages: doctor.languages || ''
    })
    setIsEditOpen(true)
  }

  const resetForm = () => {
    setFormData({ name: '', mobile: '', password: '', department: '', experience: '', patientsTreated: '', description: '', available: '', languages: '' })
    setEditingDoctor(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
       <Link href="/super-admin" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
  <ArrowLeft className="h-4 w-4 mr-2" />
  Back to Dashboard
</Link>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Stethoscope className="h-8 w-8 mr-3 text-pink-500" />
            Manage Doctors
          </h1>
          <p className="text-gray-600 mt-1">Create and manage hospital doctors</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-pink-500 hover:bg-pink-600" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Doctor</DialogTitle>
              <DialogDescription>
                Add a new doctor with 10-digit mobile and 6-digit password
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Doctor Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter doctor's full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '') // Only digits
                      if (value.length <= 10) {
                        setFormData({...formData, mobile: value})
                      }
                    }}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Must start with 6, 7, 8, or 9</p>
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '') // Only digits
                      if (value.length <= 6) {
                        setFormData({...formData, password: value})
                      }
                    }}
                    placeholder="6-digit password"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Exactly 6 digits</p>
                </div>
                <div>
                  <Label htmlFor="department">Department/Specialization</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-[200px] justify-between"
                      >
                        {formData.department
                          ? departments.find((dept) => dept.toLowerCase() === formData.department.toLowerCase())
                          : "Select department..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search department..." />
                        <CommandEmpty>No department found.</CommandEmpty>
                        <CommandGroup>
                          {departments.map((dept) => (
                            <CommandItem
                              key={dept}
                              value={dept}
                              onSelect={(currentValue) => {
                                setFormData({ ...formData, department: currentValue === formData.department ? "" : currentValue });
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${formData.department.toLowerCase() === dept.toLowerCase() ? "opacity-100" : "opacity-0"}`}
                              />
                              {dept}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="experience">Experience</Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    placeholder="e.g., 5 years"
                  />
                </div>
                <div>
                  <Label htmlFor="patientsTreated">Patients Treated</Label>
                  <Input
                    id="patientsTreated"
                    value={formData.patientsTreated}
                    onChange={(e) => setFormData({...formData, patientsTreated: e.target.value})}
                    placeholder="e.g., 1000+"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief description about the doctor"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="available">Available</Label>
                  <Input
                    id="available"
                    value={formData.available}
                    onChange={(e) => setFormData({...formData, available: e.target.value})}
                    placeholder="e.g., Mon-Sat, 9am-1pm"
                  />
                </div>
                <div>
                  <Label htmlFor="languages">Languages</Label>
                  <Input
                    id="languages"
                    value={formData.languages}
                    onChange={(e) => setFormData({...formData, languages: e.target.value})}
                    placeholder="e.g., Hindi, English"
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-pink-500 hover:bg-pink-600">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Doctor
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hospital Doctors</CardTitle>
          <CardDescription>
            {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {doctor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">Dr. {doctor.name}</div>
                        <div className="text-sm text-gray-500">{doctor.user_id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1 text-gray-400" />
                        {doctor.mobile}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-3 w-3 mr-1 text-gray-400" />
                        {doctor.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {doctor.department}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={doctor.isActive ? "default" : "secondary"}>
                      {doctor.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {doctor.lastLogin ? new Date(doctor.lastLogin).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(doctor)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(doctor)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
            <DialogDescription>
              Update doctor information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Doctor Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter doctor's full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-mobile">Mobile Number</Label>
                <Input
                  id="edit-mobile"
                  value={formData.mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '') // Only digits
                    if (value.length <= 10) {
                      setFormData({...formData, mobile: value})
                    }
                  }}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Must start with 6, 7, 8, or 9</p>
              </div>
              <div>
                <Label htmlFor="edit-password">New Password (optional)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '') // Only digits
                    if (value.length <= 6) {
                      setFormData({...formData, password: value})
                    }
                  }}
                  placeholder="6-digit password (leave empty to keep current)"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">Exactly 6 digits (optional)</p>
              </div>
              <div>
                <Label htmlFor="edit-department">Department/Specialization</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-[200px] justify-between"
                    >
                      {formData.department
                        ? departments.find((dept) => dept.toLowerCase() === formData.department.toLowerCase())
                        : "Select department..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search department..." />
                      <CommandEmpty>No department found.</CommandEmpty>
                      <CommandGroup>
                        {departments.map((dept) => (
                          <CommandItem
                            key={dept}
                            value={dept}
                            onSelect={(currentValue) => {
                              setFormData({ ...formData, department: currentValue === formData.department ? "" : currentValue });
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${formData.department.toLowerCase() === dept.toLowerCase() ? "opacity-100" : "opacity-0"}`}
                            />
                            {dept}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="edit-experience">Experience</Label>
                <Input
                  id="edit-experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  placeholder="e.g., 5 years"
                />
              </div>
              <div>
                <Label htmlFor="edit-patientsTreated">Patients Treated</Label>
                <Input
                  id="edit-patientsTreated"
                  value={formData.patientsTreated}
                  onChange={(e) => setFormData({...formData, patientsTreated: e.target.value})}
                  placeholder="e.g., 1000+"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description about the doctor"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-available">Available</Label>
                <Input
                  id="edit-available"
                  value={formData.available}
                  onChange={(e) => setFormData({...formData, available: e.target.value})}
                  placeholder="e.g., Mon-Sat, 9am-1pm"
                />
              </div>
              <div>
                <Label htmlFor="edit-languages">Languages</Label>
                <Input
                  id="edit-languages"
                  value={formData.languages}
                  onChange={(e) => setFormData({...formData, languages: e.target.value})}
                  placeholder="e.g., Hindi, English"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-pink-500 hover:bg-pink-600">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Doctor
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
