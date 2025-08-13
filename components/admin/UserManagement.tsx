"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  UserPlus,
  Filter,
  Download,
  Upload,
  MoreHorizontal
} from 'lucide-react'
import { toast } from 'sonner'

interface User {
  _id: string
  name: string
  email: string
  role: string
  contactNumber: string
  department?: string
  specialization?: string
  isActive: boolean
  createdAt: string
  lastLogin?: string
    permissions?: { module: string; actions: string[] }[]
}

interface UserFormData {
  name: string
  email: string
  password: string
  role: string
  contactNumber: string
  department: string
  specialization: string
  qualification: string[]
  experience: number
  licenseNumber: string
  salary: number
  address: {
    street: string
    city: string
    state: string
    pincode: string
  }
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [isNotifyDialogOpen, setIsNotifyDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [roleStats, setRoleStats] = useState<Record<string, number>>({})

  const [permissionsState, setPermissionsState] = useState<Record<string, Set<string>>>({})
  const [notifyForm, setNotifyForm] = useState<{ subject: string; message: string; priority: 'LOW'|'MEDIUM'|'HIGH'|'URGENT'; emails: string }>(
    { subject: '', message: '', priority: 'LOW', emails: '' }
  )

  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: '',
    contactNumber: '',
    department: '',
    specialization: '',
    qualification: [],
    experience: 0,
    licenseNumber: '',
    salary: 0,
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  })

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm, roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && roleFilter !== 'all' && { role: roleFilter })
      })

      const response = await fetch(`/api/admin/users?${params}`)
      if (response.ok) {
        const result = await response.json()
        setUsers(result.data.users)
        setTotalPages(result.data.pagination.pages)
        setRoleStats(result.data.roleStats)
      } else {
        toast.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Error fetching users')
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('User created successfully')
        setIsAddDialogOpen(false)
        resetForm()
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create user')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Error creating user')
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('User updated successfully')
        setIsEditDialogOpen(false)
        resetForm()
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Error updating user')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('User deleted successfully')
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Error deleting user')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: '',
      contactNumber: '',
      department: '',
      specialization: '',
      qualification: [],
      experience: 0,
      licenseNumber: '',
      salary: 0,
      address: {
        street: '',
        city: '',
        state: '',
        pincode: ''
      },
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      }
    })
    setSelectedUser(null)
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      contactNumber: user.contactNumber,
      department: user.department || '',
      specialization: user.specialization || '',
      qualification: [],
      experience: 0,
      licenseNumber: '',
      salary: 0,
      address: {
        street: '',
        city: '',
        state: '',
        pincode: ''
      },
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      }
    })
    setIsEditDialogOpen(true)
  }

  const openPermissionsDialog = (user: User) => {
    setSelectedUser(user)
    // Convert existing permissions array to state map
    const map: Record<string, Set<string>> = {}
    ;(user.permissions || []).forEach(p => {
      map[p.module] = new Set(p.actions)
    })
    setPermissionsState(map)
    setIsPermissionsDialogOpen(true)
  }

  const togglePermission = (moduleName: string, action: string) => {
    setPermissionsState(prev => {
      const next = { ...prev }
      if (!next[moduleName]) next[moduleName] = new Set<string>()
      if (next[moduleName].has(action)) next[moduleName].delete(action)
      else next[moduleName].add(action)
      return next
    })
  }

  const handleSavePermissions = async () => {
    if (!selectedUser) return
    const permissions = Object.entries(permissionsState).map(([module, actionsSet]) => ({
      module,
      actions: Array.from(actionsSet)
    })).filter(p => p.actions.length > 0)
    try {
      const res = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions })
      })
      if (res.ok) {
        toast.success('Permissions updated')
        setIsPermissionsDialogOpen(false)
        fetchUsers()
      } else {
        const err = await res.json(); toast.error(err.error || 'Failed to update permissions')
      }
    } catch (e) {
      console.error(e)
      toast.error('Error updating permissions')
    }
  }

  const openNotifyDialog = (user: User) => {
    setSelectedUser(user)
    setNotifyForm({ subject: '', message: '', priority: 'LOW', emails: user.email })
    setIsNotifyDialogOpen(true)
  }

  const handleSendNotification = async () => {
    try {
      const emails = notifyForm.emails.split(',').map(e => e.trim()).filter(Boolean)
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: emails,
          subject: notifyForm.subject,
          message: notifyForm.message,
          priority: notifyForm.priority,
          category: 'SYSTEM',
          type: 'EMAIL'
        })
      })
      if (res.ok) {
        toast.success('Notification sent')
        setIsNotifyDialogOpen(false)
        setNotifyForm({ subject: '', message: '', priority: 'LOW', emails: '' })
      } else {
        const err = await res.json(); toast.error(err.error || 'Failed to send notification')
      }
    } catch (e) {
      console.error(e)
      toast.error('Error sending notification')
    }
  }

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      'super-admin': 'bg-red-100 text-red-800',
      'admin': 'bg-blue-100 text-blue-800',
      'doctor': 'bg-green-100 text-green-800',
      'staff': 'bg-yellow-100 text-yellow-800',
      'receptionist': 'bg-purple-100 text-purple-800',
      'patient': 'bg-gray-100 text-gray-800'
    }
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {Object.entries(roleStats).map(([role, count]) => (
          <Card key={role}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-sm text-gray-600 capitalize">{role.replace('-', ' ')}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              User Management
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                  </DialogHeader>
                  <UserForm 
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleAddUser}
                    isEdit={false}
                  />
                </DialogContent>
              </Dialog>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super-admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="receptionist">Receptionist</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell>{user.contactNumber}</TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPermissionsDialog(user)}
                            title="Manage Permissions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openNotifyDialog(user)}
                            title="Send Notification"
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <UserForm 
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleEditUser}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Permissions {selectedUser ? `- ${selectedUser.name}` : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {['patients','appointments','billing','inventory','reports','users','messages','shifts'].map(moduleName => (
              <div key={moduleName} className="border rounded-md p-3">
                <div className="font-medium capitalize mb-2">{moduleName}</div>
                <div className="flex flex-wrap gap-2">
                  {['create','read','update','delete','approve'].map(action => {
                    const checked = !!permissionsState[moduleName]?.has(action)
                    return (
                      <label key={action} className={`inline-flex items-center gap-2 px-3 py-1 rounded-md border cursor-pointer ${checked ? 'bg-pink-50 border-pink-300' : ''}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePermission(moduleName, action)}
                        />
                        <span className="capitalize text-sm">{action}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSavePermissions}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Dialog */}
      <Dialog open={isNotifyDialogOpen} onOpenChange={setIsNotifyDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Send Notification {selectedUser ? `to ${selectedUser.name}` : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="emails">Recipient Emails (comma separated)</Label>
              <Input id="emails" value={notifyForm.emails} onChange={(e) => setNotifyForm({ ...notifyForm, emails: e.target.value })} placeholder="admin1@hospital.com, admin2@hospital.com" />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={notifyForm.subject} onChange={(e) => setNotifyForm({ ...notifyForm, subject: e.target.value })} placeholder="Subject" />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" value={notifyForm.message} onChange={(e) => setNotifyForm({ ...notifyForm, message: e.target.value })} placeholder="Write your message..." rows={5} />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={notifyForm.priority} onValueChange={(v) => setNotifyForm({ ...notifyForm, priority: v as any })}>
                <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsNotifyDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSendNotification}>Send</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// User Form Component
function UserForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  isEdit 
}: {
  formData: UserFormData
  setFormData: (data: UserFormData) => void
  onSubmit: () => void
  isEdit: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter full name"
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter email address"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="password">Password {!isEdit && '*'}</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={isEdit ? "Leave blank to keep current" : "Enter password"}
          />
        </div>
        <div>
          <Label htmlFor="contactNumber">Phone Number *</Label>
          <Input
            id="contactNumber"
            value={formData.contactNumber}
            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
            placeholder="Enter phone number"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="role">Role *</Label>
          <Select value={formData.role || undefined} onValueChange={(value) => setFormData({ ...formData, role: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="doctor">Doctor</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="receptionist">Receptionist</SelectItem>
              <SelectItem value="patient">Patient</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            placeholder="Enter department"
          />
        </div>
      </div>

      {formData.role === 'doctor' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="Enter specialization"
            />
          </div>
          <div>
            <Label htmlFor="licenseNumber">License Number</Label>
            <Input
              id="licenseNumber"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              placeholder="Enter license number"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => {}}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {isEdit ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </div>
  )
}
