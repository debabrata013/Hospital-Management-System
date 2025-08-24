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
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Plus, Search, Edit, Trash2, Calendar as CalendarIcon } from 'lucide-react'

// Types
interface CleaningTask {
  _id: string
  roomNumber: string
  assignedTo: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  scheduledDate: string
  notes?: string
  createdAt: string
}

interface CleaningStaff {
  _id: string
  name: string
  isAvailable: boolean
}

interface FormData {
  roomNumber: string
  assignedTo: string
  priority: string
  scheduledDate: Date
  notes: string
}

export default function AssignCleaning() {
  // State
  const [tasks, setTasks] = useState<CleaningTask[]>([])
  const [staff, setStaff] = useState<CleaningStaff[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<CleaningTask | null>(null)
  const [formData, setFormData] = useState<FormData>({
    roomNumber: '',
    assignedTo: '',
    priority: 'medium',
    scheduledDate: new Date(),
    notes: ''
  })

  // Fetch tasks and staff on component mount
  useEffect(() => {
    fetchTasks()
    fetchStaff()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/cleaning/tasks')
      const data = await response.json()

      if (response.ok) {
        setTasks(data.data)
      } else {
        toast.error(data.message || 'Failed to fetch tasks')
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Error fetching tasks')
    } finally {
      setLoading(false)
    }
  }

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/cleaning/staff')
      const data = await response.json()

      if (response.ok) {
        setStaff(data.data)
      } else {
        toast.error(data.message || 'Failed to fetch staff')
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
      toast.error('Error fetching staff')
    }
  }

  const handleAddTask = async () => {
    try {
      if (!formData.roomNumber || !formData.assignedTo || !formData.scheduledDate) {
        toast.error('Please fill in all required fields')
        return
      }

      const response = await fetch('/api/cleaning/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: formData.roomNumber,
          assignedTo: formData.assignedTo,
          priority: formData.priority,
          scheduledDate: formData.scheduledDate.toISOString(),
          notes: formData.notes,
          status: 'pending'
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Task created successfully')
        setIsAddDialogOpen(false)
        resetForm()
        fetchTasks()
      } else {
        toast.error(result.message || 'Failed to create task')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Error creating task')
    }
  }

  const handleEditTask = async () => {
    if (!selectedTask) return

    try {
      const response = await fetch(`/api/cleaning/tasks/${selectedTask._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: formData.roomNumber,
          assignedTo: formData.assignedTo,
          priority: formData.priority,
          scheduledDate: formData.scheduledDate.toISOString(),
          notes: formData.notes
        })
      })

      if (response.ok) {
        toast.success('Task updated successfully')
        setIsEditDialogOpen(false)
        resetForm()
        fetchTasks()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to update task')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Error updating task')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch(`/api/cleaning/tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Task deleted successfully')
        fetchTasks()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to delete task')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Error deleting task')
    }
  }

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/cleaning/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success('Status updated successfully')
        fetchTasks()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Error updating status')
    }
  }

  const resetForm = () => {
    setFormData({
      roomNumber: '',
      assignedTo: '',
      priority: 'medium',
      scheduledDate: new Date(),
      notes: ''
    })
    setSelectedTask(null)
  }

  const openEditDialog = (task: CleaningTask) => {
    setSelectedTask(task)
    setFormData({
      roomNumber: task.roomNumber,
      assignedTo: task.assignedTo,
      priority: task.priority,
      scheduledDate: new Date(task.scheduledDate),
      notes: task.notes || ''
    })
    setIsEditDialogOpen(true)
  }

  const getPriorityBadgeColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Cleaning Tasks Management</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Assign New Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Assign New Cleaning Task</DialogTitle>
                  </DialogHeader>
                  <CleaningTaskForm 
                    formData={formData}
                    setFormData={setFormData}
                    staff={staff}
                    onSubmit={handleAddTask}
                    isEdit={false}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by room number or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tasks Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Notes</TableHead>
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
                ) : filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No cleaning tasks found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => (
                    <TableRow key={task._id}>
                      <TableCell className="font-medium">{task.roomNumber}</TableCell>
                      <TableCell>{task.assignedTo}</TableCell>
                      <TableCell>
                        <Select
                          value={task.status}
                          onValueChange={(value) => handleUpdateStatus(task._id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <Badge className={getStatusBadgeColor(task.status)}>
                              {task.status.replace('-', ' ')}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityBadgeColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(task.scheduledDate), 'PPP')}</TableCell>
                      <TableCell className="max-w-xs truncate">{task.notes}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(task)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task._id)}
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
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Cleaning Task</DialogTitle>
          </DialogHeader>
          <CleaningTaskForm 
            formData={formData}
            setFormData={setFormData}
            staff={staff}
            onSubmit={handleEditTask}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Form Component
function CleaningTaskForm({ 
  formData, 
  setFormData, 
  staff,
  onSubmit, 
  isEdit 
}: {
  formData: FormData
  setFormData: (data: FormData) => void
  staff: CleaningStaff[]
  onSubmit: () => void
  isEdit: boolean
}) {
  return (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="roomNumber">Room Number *</Label>
          <Input
            id="roomNumber"
            value={formData.roomNumber}
            onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
            placeholder="Enter room number"
          />
        </div>
        <div>
          <Label htmlFor="assignedTo">Assign To *</Label>
          <Select 
            value={formData.assignedTo} 
            onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select staff member" />
            </SelectTrigger>
            <SelectContent>
              {staff.map((member) => (
                <SelectItem 
                  key={member._id} 
                  value={member._id}
                  disabled={!member.isAvailable}
                >
                  {member.name} {!member.isAvailable && '(Unavailable)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priority">Priority *</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(value) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="scheduledDate">Scheduled Date *</Label>
          <div className="mt-1">
            <Calendar
              mode="single"
              selected={formData.scheduledDate}
              onSelect={(date) => date && setFormData({ ...formData, scheduledDate: date })}
              className="rounded-md border"
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Enter any additional notes"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => {}}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {isEdit ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </div>
  )
}
