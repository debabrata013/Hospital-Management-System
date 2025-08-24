"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Clock, User, Sparkles, AlertTriangle, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CleaningTask {
  id: string
  roomId: string
  roomNumber: string
  assignedTo: string
  assignedDate: string
  completedDate?: string
  status: 'Pending' | 'In Progress' | 'Completed' | 'Verified'
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  cleaningType: 'Regular Clean' | 'Deep Clean' | 'Sanitization' | 'Maintenance'
  notes: string
  estimatedDuration: number
  createdAt: string
  updatedAt: string
}

interface CleaningStaff {
  id: string
  name: string
  email: string
  phone: string
  status: 'Available' | 'Busy' | 'Off Duty'
  currentTasks: number
  maxTasks: number
  specialization: string[]
  shift: 'Morning' | 'Afternoon' | 'Evening' | 'Night'
  createdAt: string
}

interface Room {
  id: string
  roomNumber: string
  type: string
  status: string
}

interface CleaningManagementProps {
  rooms: Room[]
  onCleaningComplete?: () => void
}

export default function CleaningManagement({ rooms, onCleaningComplete }: CleaningManagementProps) {
  const [cleaningTasks, setCleaningTasks] = useState<CleaningTask[]>([])
  const [cleaningStaff, setCleaningStaff] = useState<CleaningStaff[]>([])
  const [showNewTask, setShowNewTask] = useState(false)
  const [showAssignCleaning, setShowAssignCleaning] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  // Form states
  const [newTask, setNewTask] = useState({
    roomId: '',
    assignedTo: '',
    priority: 'Medium' as CleaningTask['priority'],
    cleaningType: 'Regular Clean' as CleaningTask['cleaningType'],
    notes: '',
    estimatedDuration: 30
  })

  const [assignCleaning, setAssignCleaning] = useState({
    roomId: '',
    priority: 'Medium' as CleaningTask['priority'],
    cleaningType: 'Regular Clean' as CleaningTask['cleaningType'],
    notes: ''
  })

  // Fetch cleaning data
  useEffect(() => {
    fetchCleaningData()
  }, [])

  const fetchCleaningData = async () => {
    try {
      const response = await fetch('/api/admin/cleaning')
      if (response.ok) {
        const data = await response.json()
        setCleaningTasks(data.data.tasks || [])
        setCleaningStaff(data.data.staff || [])
      }
    } catch (error) {
      console.error('Error fetching cleaning data:', error)
      toast({ title: 'Error fetching cleaning data', variant: 'destructive' })
    }
  }

  const handleCreateTask = async () => {
    try {
      const response = await fetch('/api/admin/cleaning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createTask',
          ...newTask
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({ title: 'Cleaning task created successfully' })
        setShowNewTask(false)
        setNewTask({
          roomId: '',
          assignedTo: '',
          priority: 'Medium',
          cleaningType: 'Regular Clean',
          notes: '',
          estimatedDuration: 30
        })
        fetchCleaningData()
      } else {
        const error = await response.json()
        toast({ title: error.error || 'Error creating task', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error creating task:', error)
      toast({ title: 'Error creating task', variant: 'destructive' })
    }
  }

  const handleAssignCleaning = async () => {
    try {
      const response = await fetch('/api/admin/cleaning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assignCleaning',
          roomNumber: rooms.find(r => r.id === assignCleaning.roomId)?.roomNumber,
          ...assignCleaning
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({ title: 'Cleaning assigned successfully' })
        setShowAssignCleaning(false)
        setAssignCleaning({
          roomId: '',
          priority: 'Medium',
          cleaningType: 'Regular Clean',
          notes: ''
        })
        fetchCleaningData()
        onCleaningComplete?.()
      } else {
        const error = await response.json()
        toast({ title: error.error || 'Error assigning cleaning', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error assigning cleaning:', error)
      toast({ title: 'Error assigning cleaning', variant: 'destructive' })
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, status: CleaningTask['status']) => {
    try {
      const response = await fetch('/api/admin/cleaning', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status })
      })

      if (response.ok) {
        toast({ title: 'Task status updated successfully' })
        fetchCleaningData()
        if (status === 'Completed') {
          onCleaningComplete?.()
        }
      } else {
        const error = await response.json()
        toast({ title: error.error || 'Error updating task', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error updating task:', error)
      toast({ title: 'Error updating task', variant: 'destructive' })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this cleaning task?')) return

    try {
      const response = await fetch(`/api/admin/cleaning?taskId=${taskId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({ title: 'Task deleted successfully' })
        fetchCleaningData()
      } else {
        const error = await response.json()
        toast({ title: error.error || 'Error deleting task', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      toast({ title: 'Error deleting task', variant: 'destructive' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'In Progress': return 'bg-blue-100 text-blue-800'
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'Verified': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'High': return 'bg-orange-100 text-orange-800'
      case 'Urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStaffStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800'
      case 'Busy': return 'bg-yellow-100 text-yellow-800'
      case 'Off Duty': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Helper function to safely check if a string includes a search term
  const safeIncludes = (text: string | undefined | null, searchTerm: string): boolean => {
    if (!text) return false;
    return text.toLowerCase().includes(searchTerm.toLowerCase());
  };

  const filteredTasks = cleaningTasks.filter(task => {
    if (!task) return false;
    
    const matchesSearch = searchTerm === '' || (
      safeIncludes(task.roomNumber, searchTerm) ||
      safeIncludes(task.assignedTo, searchTerm) ||
      safeIncludes(task.notes, searchTerm)
    );
      
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  })

  const roomsNeedingCleaning = rooms.filter(room => room.status === 'Cleaning Required')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cleaning Management</h2>
          <p className="text-muted-foreground">Manage room cleaning tasks and staff assignments</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showNewTask} onOpenChange={setShowNewTask}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Cleaning Task</DialogTitle>
                <DialogDescription>Assign a specific cleaning task to staff.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={newTask.roomId} onValueChange={val => setNewTask({ ...newTask, roomId: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map(room => (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.roomNumber} - {room.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={newTask.assignedTo} onValueChange={val => setNewTask({ ...newTask, assignedTo: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to Staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {cleaningStaff.filter(s => s.status === 'Available').map(staff => (
                      <SelectItem key={staff.id} value={staff.name}>
                        {staff.name} ({staff.currentTasks}/{staff.maxTasks} tasks)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={newTask.priority} onValueChange={val => setNewTask({ ...newTask, priority: val as CleaningTask['priority'] })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newTask.cleaningType} onValueChange={val => setNewTask({ ...newTask, cleaningType: val as CleaningTask['cleaningType'] })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cleaning Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular Clean">Regular Clean</SelectItem>
                    <SelectItem value="Deep Clean">Deep Clean</SelectItem>
                    <SelectItem value="Sanitization">Sanitization</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea 
                  placeholder="Notes (optional)"
                  value={newTask.notes}
                  onChange={e => setNewTask({ ...newTask, notes: e.target.value })}
                />
                <Button onClick={handleCreateTask} className="w-full">Create Task</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAssignCleaning} onOpenChange={setShowAssignCleaning}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Sparkles className="mr-2 h-4 w-4" />
                Auto Assign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Auto-Assign Cleaning</DialogTitle>
                <DialogDescription>Automatically assign cleaning to available staff.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={assignCleaning.roomId} onValueChange={val => setAssignCleaning({ ...assignCleaning, roomId: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Room" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomsNeedingCleaning.map(room => (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.roomNumber} - {room.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={assignCleaning.priority} onValueChange={val => setAssignCleaning({ ...assignCleaning, priority: val as CleaningTask['priority'] })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={assignCleaning.cleaningType} onValueChange={val => setAssignCleaning({ ...assignCleaning, cleaningType: val as CleaningTask['cleaningType'] })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cleaning Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular Clean">Regular Clean</SelectItem>
                    <SelectItem value="Deep Clean">Deep Clean</SelectItem>
                    <SelectItem value="Sanitization">Sanitization</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea 
                  placeholder="Notes (optional)"
                  value={assignCleaning.notes}
                  onChange={e => setAssignCleaning({ ...assignCleaning, notes: e.target.value })}
                />
                <Button onClick={handleAssignCleaning} className="w-full">Assign Cleaning</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cleaningTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {cleaningTasks.filter(t => t.status === 'Pending').length} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Staff</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cleaningStaff.filter(s => s.status === 'Available').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {cleaningStaff.length} total staff
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rooms Need Cleaning</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roomsNeedingCleaning.length}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cleaningTasks.filter(t => 
                t.status === 'Completed' && 
                t.completedDate === new Date().toISOString().split('T')[0]
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Tasks completed today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Verified">Verified</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cleaning Tasks */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Cleaning Tasks</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map(task => (
            <Card key={task.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Room {task.roomNumber}</CardTitle>
                  <div className="flex space-x-1">
                    <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  </div>
                </div>
                <CardDescription>
                  Assigned to {task.assignedTo} • {task.cleaningType}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Assigned: {task.assignedDate}</span>
                  <span className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    {task.estimatedDuration} min
                  </span>
                </div>
                
                {task.notes && (
                  <div className="p-2 bg-blue-50 rounded border">
                    <p className="text-sm">{task.notes}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  {task.status === 'Pending' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleUpdateTaskStatus(task.id, 'In Progress')}
                    >
                      Start
                    </Button>
                  )}
                  {task.status === 'In Progress' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleUpdateTaskStatus(task.id, 'Completed')}
                    >
                      Complete
                    </Button>
                  )}
                  {task.status === 'Completed' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleUpdateTaskStatus(task.id, 'Verified')}
                    >
                      Verify
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cleaning Staff */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Cleaning Staff</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cleaningStaff.map(staff => (
            <Card key={staff.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{staff.name}</CardTitle>
                  <Badge className={getStaffStatusColor(staff.status)}>{staff.status}</Badge>
                </div>
                <CardDescription>
                  {staff.email} • {staff.phone}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Current Tasks:</span>
                  <span className="font-medium">{staff.currentTasks}/{staff.maxTasks}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Shift:</span>
                  <span className="font-medium">{staff.shift}</span>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Specializations:</p>
                  <div className="flex flex-wrap gap-1">
                    {staff.specialization.map(spec => (
                      <Badge key={spec} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
