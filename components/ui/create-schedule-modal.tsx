'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, User, MapPin } from 'lucide-react'
import { toast } from 'sonner'

interface Doctor {
  id: number
  name: string
  specialization: string
  department: string
}

interface CreateScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateScheduleModal({ isOpen, onClose, onSuccess }: CreateScheduleModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '2025-09-16', // Default to current date
    startTime: '09:00',
    endTime: '17:00',
    roomNumber: 'OPD',
    maxPatients: '12'
  })

  // Debug logging
  console.log('CreateScheduleModal rendered with isOpen:', isOpen)

  // Load doctors when modal opens
  useEffect(() => {
    if (isOpen) {
      loadDoctors()
    }
  }, [isOpen])

  const loadDoctors = async () => {
    try {
      setLoadingDoctors(true)
      console.log('Loading doctors...')
      const response = await fetch('/api/admin/doctors', { cache: 'no-store' })
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Doctors data:', data)
        setDoctors(data.doctors || [])
        if (data.doctors && data.doctors.length > 0) {
          toast.success(`Loaded ${data.doctors.length} doctors`)
        } else {
          toast.warning('No doctors found')
        }
      } else {
        const errorData = await response.json()
        console.error('Failed to load doctors:', errorData)
        toast.error('Failed to load doctors list')
      }
    } catch (error) {
      console.error('Error loading doctors:', error)
      toast.error('Failed to load doctors list')
    } finally {
      setLoadingDoctors(false)
    }
  }

  const handleSubmit = async (e: any) => {
    if (typeof e.preventDefault === 'function') {
      e.preventDefault()
    }
    console.log('🚀 CREATE SCHEDULE PROCESS STARTED!')
    console.log('📊 Form data:', formData)
    console.log('👥 Available doctors:', doctors.length)
    console.log('⏱️ Current time:', new Date().toISOString())
    
    // Validation
    if (!formData.doctorId || !formData.date || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all required fields')
      console.log('Validation failed - missing required fields:', {
        doctorId: !!formData.doctorId,
        date: !!formData.date,
        startTime: !!formData.startTime,
        endTime: !!formData.endTime
      })
      return
    }

    // Validate time format
    if (formData.startTime >= formData.endTime) {
      toast.error('End time must be after start time')
      console.log('Time validation failed:', formData.startTime, '>=', formData.endTime)
      return
    }

    console.log('All validations passed, creating schedule...')
    setIsLoading(true)

    try {
      console.log('Sending API request...')
      const requestBody = {
        doctorId: parseInt(formData.doctorId),
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        roomNumber: formData.roomNumber || 'OPD',
        maxPatients: parseInt(formData.maxPatients)
      }
      console.log('Request body:', requestBody)

      const response = await fetch('/api/admin/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('API response status:', response.status)
      const responseData = await response.json()
      console.log('API response data:', responseData)

      if (response.ok) {
        toast.success('Schedule created successfully!')
        console.log('Schedule creation successful!')
        setFormData({
          doctorId: '',
          date: '2025-09-16',
          startTime: '09:00',
          endTime: '17:00',
          roomNumber: 'OPD',
          maxPatients: '12'
        })
        onSuccess()
        onClose()
      } else {
        console.error('API error:', responseData)
        toast.error(responseData.error || 'Failed to create schedule')
      }
    } catch (error) {
      console.error('Error creating schedule:', error)
      toast.error('Failed to create schedule')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  console.log('About to render Dialog with isOpen:', isOpen)
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create New Schedule
            {/* Debug info */}
            <span className="text-xs text-gray-500 ml-2">
              ({doctors.length} doctors loaded)
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Doctor Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="doctorId" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Doctor *
              </Label>
              {!loadingDoctors && doctors.length === 0 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={loadDoctors}
                  className="text-xs"
                >
                  Refresh
                </Button>
              )}
            </div>
            <Select value={formData.doctorId} onValueChange={(value) => handleInputChange('doctorId', value)} disabled={loadingDoctors}>
              <SelectTrigger>
                <SelectValue placeholder={loadingDoctors ? "Loading doctors..." : doctors.length === 0 ? "No doctors available" : "Select a doctor"} />
              </SelectTrigger>
              <SelectContent>
                {loadingDoctors ? (
                  <SelectItem value="loading" disabled>Loading doctors...</SelectItem>
                ) : doctors.length === 0 ? (
                  <SelectItem value="no-doctors" disabled>No doctors found</SelectItem>
                ) : (
                  doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{doctor.name}</span>
                        <span className="text-sm text-gray-500">{doctor.specialization} • {doctor.department}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date *
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]} // Prevent past dates
              required
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Start Time *
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Room Number */}
          <div className="space-y-2">
            <Label htmlFor="roomNumber" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Room Number
            </Label>
            <Input
              id="roomNumber"
              type="text"
              value={formData.roomNumber}
              onChange={(e) => handleInputChange('roomNumber', e.target.value)}
              placeholder="e.g., 101, OPD, Emergency"
            />
          </div>

          {/* Max Patients */}
          <div className="space-y-2">
            <Label htmlFor="maxPatients">Maximum Patients</Label>
            <Input
              id="maxPatients"
              type="number"
              value={formData.maxPatients}
              onChange={(e) => handleInputChange('maxPatients', e.target.value)}
              min="1"
              max="50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>

            <Button 
              type="button" 
              disabled={isLoading || loadingDoctors || !formData.doctorId}
              className="bg-pink-500 hover:bg-pink-600 text-white disabled:bg-gray-400"
              onClick={async (e) => {
                console.log('Create Schedule button clicked!');
                console.log('Current form data:', formData);
                
                // Prevent any default behavior
                e.preventDefault();
                e.stopPropagation();
                
                // Manual validation
                if (!formData.doctorId) {
                  toast.error('Please select a doctor');
                  return;
                }
                if (!formData.date) {
                  toast.error('Please select a date');
                  return;
                }
                if (!formData.startTime || !formData.endTime) {
                  toast.error('Please set start and end times');
                  return;
                }
                if (formData.startTime >= formData.endTime) {
                  toast.error('End time must be after start time');
                  return;
                }
                
                // Create a synthetic event object for handleSubmit
                const syntheticEvent = {
                  preventDefault: () => {},
                  stopPropagation: () => {}
                };
                
                await handleSubmit(syntheticEvent);
              }}
            >
              {isLoading ? 'Creating Schedule...' : 'Create Schedule'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}