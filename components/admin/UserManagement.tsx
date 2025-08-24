'use client'

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
  Download,
  UserPlus
} from 'lucide-react'
import { toast } from 'sonner'

// User interface
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
}

// Form data interface
interface UserFormData {
  name: string
  email: string
  password: string
  role: string
  contactNumber: string
  department: string
  specialization: string
}

export default function UserManagement() {
  // State management
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [roleStats, setRoleStats] = useState<Record<string, number>>({})
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: '',
    contactNumber: '',
    department: '',
    specialization: ''
  })

  // Fetch users on component mount and when filters change
  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm, roleFilter])

  // Main functions for user management
  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log('Fetching users with params:', {
        page: currentPage,
        searchTerm,
        roleFilter
      })
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter !== 'all' && { role: roleFilter })
      })

      const response = await fetch(`/api/super-admin/users?${params}`)
      const result = await response.json()
      console.log('API Response:', result)

      if (response.ok && result.success) {
        // Map the API response to our User interface
        if (!Array.isArray(result.data)) {
          console.error('Invalid data format - data is not an array:', result.data)
          toast.error('Invalid data format received from server')
          return
        }

        console.log('Raw user data:', result.data)
        
        const mappedUsers = result.data.map((user: any) => {
          console.log('Processing user:', user)
          return {
            _id: user.id || user._id,
            name: user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user.name || 'Unknown',
            email: user.email,
            role: user.role,
            contactNumber: user.contactNumber || user.phoneNumber || '',
            department: user.department || user.address || '',
            specialization: user.specialization || '',
            isActive: typeof user.isActive === 'boolean' ? user.isActive : true,
            createdAt: user.createdAt
          }
        })
        
        console.log('Mapped users:', mappedUsers)
        setUsers(mappedUsers)
        
        // Handle pagination
        const total = result.meta?.total || result.total || 0
        const limit = result.meta?.limit || 10
        const pages = Math.ceil(total / limit)
        console.log('Pagination:', { total, limit, pages })
        setTotalPages(pages)

        // Handle role stats
        if (result.roleStats) {
          console.log('Role stats:', result.roleStats)
          setRoleStats(result.roleStats)
        }
      } else {
        toast.error(result.message || 'Failed to fetch users')
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
      // Form validation
      if (!formData.name || !formData.email || !formData.password || !formData.role) {
        toast.error('Please fill in all required fields')
        return
      }

      // Split name into first and last name
      const [firstName, ...lastNameParts] = formData.name.split(' ')
      const lastName = lastNameParts.join(' ')

      // Create user request
      console.log('Adding user with data:', {
        firstName,
        lastName,
        email: formData.email,
        role: formData.role,
        contactNumber: formData.contactNumber,
        department: formData.department,
        specialization: formData.specialization
      })

      const response = await fetch('/api/super-admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          contactNumber: formData.contactNumber || '',
          department: formData.department || '',
          specialization: formData.specialization || ''
        })
      })
      
      console.log('Add user response status:', response.status)

      const result = await response.json()

      if (response.ok) {
        toast.success('User created successfully')
        setIsAddDialogOpen(false)
        resetForm()
        fetchUsers()
      } else {
        toast.error(result.message || 'Failed to create user')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Failed to create user')
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return

    try {
      const [firstName, ...lastNameParts] = formData.name.split(' ')
      const lastName = lastNameParts.join(' ')

      const response = await fetch(`/api/super-admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email: formData.email,
          role: formData.role,
          contactNumber: formData.contactNumber,
          department: formData.department,
          specialization: formData.specialization
        })
      })

      if (response.ok) {
        toast.success('User updated successfully')
        setIsEditDialogOpen(false)
        resetForm()
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/super-admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('User deleted successfully')
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
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
      specialization: ''
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
      specialization: user.specialization || ''
    })
    setIsEditDialogOpen(true)
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

  // Component render
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
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

      {/* Main Content */}
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
                placeholder="Search users..."
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
