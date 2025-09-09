"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Phone, Mail, Users, Loader2, Pill, UserCheck, Stethoscope, Sparkles } from 'lucide-react'
import { toast } from "sonner"

interface Staff {
  id: number
  user_id: string
  name: string
  email: string
  mobile: string
  role: string
  department: string
  isActive: boolean
  createdAt: string
  lastLogin: string | null
  shift?: string
  specialization?: string
}

const staffRoles = [
  { value: 'pharmacy', label: 'Pharmacist', icon: Pill, color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'receptionist', label: 'Receptionist', icon: UserCheck, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'staff', label: 'Nurse/Staff', icon: Stethoscope, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'cleaning', label: 'Room Cleaning', icon: Sparkles, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
]

const shifts = ['Morning', 'Afternoon', 'Evening', 'Night', 'flexible']

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    password: '',
    role: '',
    department: '',
    shift: '',
    specialization: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async (type = 'all') => {
    try {
      setLoading(true)
      const response = await fetch(`/api/super-admin/staff?type=${type}`)
      const data = await response.json()
      
      if (data.success) {
        setStaff(data.staff)
      } else {
        toast.error('Failed to fetch staff')
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
      toast.error('Failed to fetch staff')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    fetchStaff(value)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/super-admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Staff created successfully')
        setIsCreateOpen(false)
        resetForm()
        fetchStaff(activeTab)
      } else {
        toast.error(data.error || 'Failed to create staff')
      }
    } catch (error) {
      console.error('Error creating staff:', error)
      toast.error('Failed to create staff')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStaff) return

    setSubmitting(true)

    try {
      const response = await fetch('/api/super-admin/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingStaff.id,
          role: editingStaff.role,
          ...formData
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Staff updated successfully')
        setIsEditOpen(false)
        setEditingStaff(null)
        resetForm()
        fetchStaff(activeTab)
      } else {
        toast.error(data.error || 'Failed to update staff')
      }
    } catch (error) {
      console.error('Error updating staff:', error)
      toast.error('Failed to update staff')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (staff: Staff) => {
    if (!confirm(`Are you sure you want to delete ${staff.name}?`)) return

    try {
      const response = await fetch(`/api/super-admin/staff?id=${staff.id}&role=${staff.role}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Staff deleted successfully')
        fetchStaff(activeTab)
      } else {
        toast.error(data.error || 'Failed to delete staff')
      }
    } catch (error) {
      console.error('Error deleting staff:', error)
      toast.error('Failed to delete staff')
    }
  }

  const openEditDialog = (staff: Staff) => {
    setEditingStaff(staff)
    setFormData({
      name: staff.name,
      mobile: staff.mobile,
      password: '',
      role: staff.role,
      department: staff.department,
      shift: staff.shift || '',
      specialization: staff.specialization || ''
    })
    setIsEditOpen(true)
  }

  const resetForm = () => {
    setFormData({ name: '', mobile: '', password: '', role: '', department: '', shift: '', specialization: '' })
    setEditingStaff(null)
  }

  const getStaffIcon = (role: string) => {
    const staffRole = staffRoles.find(r => r.value === role)
    return staffRole ? staffRole.icon : Users
  }

  const getStaffColor = (role: string) => {
    const staffRole = staffRoles.find(r => r.value === role)
    return staffRole ? staffRole.color : 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const filteredStaff = activeTab === 'all' ? staff : staff.filter(s => s.role === activeTab)

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="h-8 w-8 mr-3 text-pink-500" />
            Manage Staff
          </h1>
          <p className="text-gray-600 mt-1">Manage pharmacy, reception, nursing, and cleaning staff</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-pink-500 hover:bg-pink-600" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Staff</DialogTitle>
              <DialogDescription>
                Add new staff member with 10-digit mobile and 6-digit password
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="6-digit password"
                    maxLength={6}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Staff Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    placeholder="Department (optional)"
                  />
                </div>
                <div>
                  <Label htmlFor="shift">Shift</Label>
                  <Select value={formData.shift} onValueChange={(value) => setFormData({...formData, shift: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      {shifts.map((shift) => (
                        <SelectItem key={shift} value={shift}>{shift}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    placeholder="Specialization (optional)"
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-pink-500 hover:bg-pink-600">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Staff
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hospital Staff</CardTitle>
          <CardDescription>
            {staff.length} staff member{staff.length !== 1 ? 's' : ''} registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Staff ({staff.length})</TabsTrigger>
              <TabsTrigger value="pharmacy">Pharmacy ({staff.filter(s => s.role === 'pharmacy').length})</TabsTrigger>
              <TabsTrigger value="receptionist">Reception ({staff.filter(s => s.role === 'receptionist').length})</TabsTrigger>
              <TabsTrigger value="staff">Nurses ({staff.filter(s => s.role === 'staff').length})</TabsTrigger>
              <TabsTrigger value="cleaning">Cleaning ({staff.filter(s => s.role === 'cleaning').length})</TabsTrigger>
            </TabsList>
          </Tabs>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role & Department</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((member) => {
                const StaffIcon = getStaffIcon(member.role)
                return (
                  <TableRow key={`${member.role}-${member.id}`}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className="bg-pink-100 text-pink-600">
                            {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.user_id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1 text-gray-400" />
                          {member.mobile}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="h-3 w-3 mr-1 text-gray-400" />
                          {member.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline" className={getStaffColor(member.role)}>
                          <StaffIcon className="h-3 w-3 mr-1" />
                          {staffRoles.find(r => r.value === member.role)?.label}
                        </Badge>
                        <div className="text-sm text-gray-500">{member.department}</div>
                        {member.specialization && (
                          <div className="text-xs text-gray-400">{member.specialization}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {member.shift || 'Not specified'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.isActive ? "default" : "secondary"}>
                        {member.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(member)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(member)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update {editingStaff?.name}'s information ({staffRoles.find(r => r.value === editingStaff?.role)?.label})
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-mobile">Mobile Number</Label>
                <Input
                  id="edit-mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-password">New Password</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Leave empty to keep current"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">6-digit password (optional)</p>
              </div>
              <div>
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  placeholder="Department"
                />
              </div>
              <div>
                <Label htmlFor="edit-shift">Work Shift</Label>
                <Select value={formData.shift} onValueChange={(value) => setFormData({...formData, shift: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map((shift) => (
                      <SelectItem key={shift} value={shift}>
                        {shift === 'flexible' ? 'Flexible Hours' : `${shift} Shift`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-specialization">
                  {editingStaff?.role === 'pharmacy' ? 'Pharmacy Specialization' :
                   editingStaff?.role === 'receptionist' ? 'Reception Skills' :
                   editingStaff?.role === 'staff' ? 'Nursing Specialization' :
                   editingStaff?.role === 'cleaning' ? 'Cleaning Specialization' : 'Specialization'}
                </Label>
                <Input
                  id="edit-specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  placeholder={
                    editingStaff?.role === 'pharmacy' ? 'e.g., Clinical Pharmacy, Drug Information' :
                    editingStaff?.role === 'receptionist' ? 'e.g., Patient Relations, Insurance' :
                    editingStaff?.role === 'staff' ? 'e.g., ICU, Emergency, Pediatric' :
                    editingStaff?.role === 'cleaning' ? 'e.g., Room Sanitization, Equipment' : 'Specialization'
                  }
                />
              </div>
            </div>
            
            {/* Role-specific information display */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                {editingStaff && (() => {
                  const StaffIcon = getStaffIcon(editingStaff.role)
                  return <StaffIcon className="h-4 w-4 text-gray-600" />
                })()}
                <span className="text-sm font-medium text-gray-700">
                  {editingStaff && staffRoles.find(r => r.value === editingStaff.role)?.label} Information
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>User ID: <span className="font-mono">{editingStaff?.user_id}</span></div>
                <div>Email: <span className="font-mono">{editingStaff?.email}</span></div>
                <div>Status: <Badge variant={editingStaff?.isActive ? "default" : "secondary"} className="text-xs">
                  {editingStaff?.isActive ? "Active" : "Inactive"}
                </Badge></div>
                <div>Created: {editingStaff?.createdAt ? new Date(editingStaff.createdAt).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-pink-500 hover:bg-pink-600">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Staff Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
