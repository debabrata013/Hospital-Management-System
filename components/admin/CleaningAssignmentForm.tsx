"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, User, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Room {
  id: string
  roomNumber: string
  type: string
  floor: number
  status: string
}

interface CleaningStaff {
  id: string
  name: string
  specialization: string
  isAvailable: boolean
  currentTasks: number
}

interface CleaningAssignmentFormProps {
  room?: Room
  onAssignmentComplete?: () => void
}

export default function CleaningAssignmentForm({ room, onAssignmentComplete }: CleaningAssignmentFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [cleaningStaff, setCleaningStaff] = useState<CleaningStaff[]>([])
  const [formData, setFormData] = useState({
    assignedTo: '',
    priority: 'Medium',
    cleaningType: 'Regular Clean',
    estimatedDuration: '1 hour',
    notes: '',
    scheduledDate: '',
    scheduledTime: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchCleaningStaff()
    }
  }, [isOpen])

  const fetchCleaningStaff = async () => {
    try {
      const response = await fetch('/api/admin/cleaning', {
        credentials: 'include'
      });

      const contentType = response.headers.get('content-type') || '';
      let result = null;

      if (contentType.includes('application/json')) {
        result = await response.json();
      } else {
        toast({
          title: 'Error',
          description: 'Unexpected response from server. Please try again later.',
          variant: 'destructive'
        });
        setCleaningStaff([]);
        return;
      }

      if (response.ok && result.data?.staff) {
        setCleaningStaff(result.data.staff);
      } else {
        toast({
          title: 'Error',
          description: result?.error || 'Failed to fetch cleaning staff',
          variant: 'destructive'
        });
        setCleaningStaff([]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch cleaning staff',
        variant: 'destructive'
      });
      setCleaningStaff([]);
    }
  };


  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-update estimated duration based on cleaning type
    if (field === 'cleaningType') {
      const duration = value === 'Deep Clean' ? '2 hours' : '1 hour'
      setFormData(prev => ({
        ...prev,
        estimatedDuration: duration
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      const requiredFields = ['assignedTo', 'priority', 'cleaningType', 'scheduledDate']
      for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData]) {
          throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`)
        }
      }

      if (!room) {
        throw new Error('Room information is required')
      }

      const assignmentData = {
        roomId: room.id,
        roomNumber: room.roomNumber,
        assignedTo: formData.assignedTo,
        priority: formData.priority,
        notes: formData.notes,
        cleaningType: formData.cleaningType,
        estimatedDuration: formData.estimatedDuration,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime
      }


      const response = await fetch('/api/admin/cleaning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'assignCleaning',
          ...assignmentData
        }),
        credentials: 'include'
      })

      let result = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        result = await response.json();
      } else {
        // Not JSON, likely an error page
        throw new Error('Unexpected response format');
      }

      if (!response.ok) {
        throw new Error(result?.error || 'Failed to assign cleaning task')
      }

      toast({
        title: "Success",
        description: "Cleaning task assigned successfully",
      })

      // Reset form
      setFormData({
        assignedTo: '',
        priority: 'Medium',
        cleaningType: 'Regular Clean',
        estimatedDuration: '1 hour',
        notes: '',
        scheduledDate: '',
        scheduledTime: ''
      })

      setIsOpen(false)
      onAssignmentComplete?.()

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to assign cleaning task',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return 'bg-gray-100 text-gray-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'High': return 'bg-orange-100 text-orange-800'
      case 'Urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Low': return null
      case 'Medium': return <Clock className="h-4 w-4" />
      case 'High': return <AlertTriangle className="h-4 w-4" />
      case 'Urgent': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Sparkles className="mr-1 h-3 w-3" />
          Assign Cleaning
        </Button>
      </DialogTrigger>
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Cleaning Task</DialogTitle>
          <DialogDescription>
            {room ? `Assign cleaning for Room ${room.roomNumber} (${room.type})` : 'Select a room and assign cleaning'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Information */}
          {room && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Room Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Room Number</Label>
                    <Input value={room.roomNumber} disabled />
                  </div>
                  <div>
                    <Label>Room Type</Label>
                    <Input value={room.type} disabled />
                  </div>
                  <div>
                    <Label>Floor</Label>
                    <Input value={room.floor} disabled />
                  </div>
                  <div>
                    <Label>Current Status</Label>
                    <Input value={room.status} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cleaning Assignment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cleaning Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assignedTo">Assign To *</Label>
                  <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange('assignedTo', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cleaning staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {cleaningStaff
                        .filter(staff => staff.isAvailable)
                        .map(staff => (
                          <SelectItem key={staff.id} value={staff.name}>
                            <div className="flex items-center justify-between w-full">
                              <span>{staff.name}</span>
                              <Badge variant="outline" className="ml-2">
                                {staff.currentTasks} tasks
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {cleaningStaff.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-1">No available cleaning staff</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="priority">Priority *</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cleaningType">Cleaning Type *</Label>
                  <Select value={formData.cleaningType} onValueChange={(value) => handleInputChange('cleaningType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cleaning type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regular Clean">Regular Clean</SelectItem>
                      <SelectItem value="Deep Clean">Deep Clean</SelectItem>
                      <SelectItem value="Sanitization">Sanitization</SelectItem>
                      <SelectItem value="Maintenance Clean">Maintenance Clean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="estimatedDuration">Estimated Duration</Label>
                  <Input
                    id="estimatedDuration"
                    value={formData.estimatedDuration}
                    onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                    placeholder="e.g., 1 hour"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduledDate">Scheduled Date *</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                    min={today}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="scheduledTime">Scheduled Time</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Special Instructions</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any special cleaning requirements, notes, or instructions..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Staff Availability Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Staff Availability</CardTitle>
              <CardDescription>Current cleaning staff status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cleaningStaff.map(staff => (
                  <div key={staff.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{staff.name}</span>
                        <Badge variant="outline">{staff.specialization}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={staff.isAvailable ? "default" : "secondary"}
                        className="flex items-center space-x-1"
                      >
                        {staff.isAvailable ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            <span>Available</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3" />
                            <span>Busy</span>
                          </>
                        )}
                      </Badge>
                      <Badge variant="outline">
                        {staff.currentTasks} tasks
                      </Badge>
                    </div>
                  </div>
                ))}
                {cleaningStaff.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No cleaning staff available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || cleaningStaff.length === 0}>
              {isLoading ? 'Assigning...' : 'Assign Cleaning Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
