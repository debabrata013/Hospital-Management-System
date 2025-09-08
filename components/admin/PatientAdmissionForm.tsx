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
import { Calendar, User, Pill, FileText, Plus, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Room {
  id: string
  roomNumber: string
  type: string
  floor: number
  capacity: number
  currentOccupancy: number
  status: string
}

interface Patient {
  id: string
  name: string
  patient_id: string
  contact_number: string
  date_of_birth: string
  gender: string
  is_active: number
}

interface PatientAdmissionFormProps {
  room?: Room
  onAdmissionComplete?: () => void
}

export default function PatientAdmissionForm({ room, onAdmissionComplete }: PatientAdmissionFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [formData, setFormData] = useState({
    patientId: '',
    roomId: room ? room.id : '',
    admissionDate: '',
    expectedDischargeDate: '',
    diagnosis: '',
    notes: ''
  })
  const { toast } = useToast()

  // Fetch available rooms and patients when form opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableRooms()
      fetchPatients()
      // Reset form data when dialog opens
      setFormData({
        patientId: '',
        roomId: room ? room.id : '',
        admissionDate: '',
        expectedDischargeDate: '',
        diagnosis: '',
        notes: ''
      })
    }
  }, [isOpen, room])

  const fetchAvailableRooms = async () => {
    try {
      const response = await fetch('/api/admin/rooms?status=Available')
      if (response.ok) {
        const payload = await response.json()
        const list = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : [])
        setAvailableRooms(list.map((room: any) => ({
          id: String(room.id),
          roomNumber: room.room_number ?? room.roomNumber ?? '',
          type: room.room_type ?? room.roomType ?? 'General',
          floor: Number(room.floor ?? 0),
          capacity: Number(room.capacity ?? 0),
          currentOccupancy: Number(room.current_occupancy ?? room.currentOccupancy ?? 0),
          status: room.status ?? 'Available'
        })))
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/admin/patients-list')
      if (response.ok) {
        const patientsData = await response.json()
        setPatients(patientsData)
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('Form data:', formData) // Debug log
      console.log('Room prop:', room) // Debug log
      console.log('Room ID from form:', formData.roomId) // Debug log
      
      // Validate required fields
      const requiredFields = ['patientId', 'admissionDate', 'expectedDischargeDate', 'diagnosis']
      
      // Add roomId validation only if no specific room is provided
      if (!room) {
        requiredFields.push('roomId')
      }
      
      for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData]) {
          const fieldName = field === 'roomId' ? 'Room selection' : field.charAt(0).toUpperCase() + field.slice(1)
          throw new Error(`${fieldName} is required`)
        }
      }

      const admissionData = {
        roomId: parseInt(formData.roomId),
        patientId: parseInt(formData.patientId),
        admissionDate: formData.admissionDate,
        expectedDischargeDate: formData.expectedDischargeDate,
        diagnosis: formData.diagnosis,
        notes: formData.notes
      }

      const response = await fetch('/api/admin/room-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(admissionData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to admit patient')
      }

      toast({
        title: "Success",
        description: "Patient admitted successfully",
      })

      setIsOpen(false)
      onAdmissionComplete?.()

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to admit patient',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <User className="mr-2 h-4 w-4" />
          Admit Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Patient Admission Form</DialogTitle>
          <DialogDescription>
            {room ? `Admitting patient to Room ${room.roomNumber} (${room.type})` : 'Select a room and patient for admission'}
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
                    <Label>Current Occupancy</Label>
                    <Input value={`${room.currentOccupancy}/${room.capacity}`} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Room Selection (when no specific room is provided) */}
          {!room && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Room Selection</CardTitle>
                <CardDescription>Select an available room for the patient</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="roomId">Available Room *</Label>
                  <p className="text-sm text-muted-foreground mb-2">Please select a room for the patient admission</p>
                  <Select value={formData.roomId} onValueChange={(value) => handleInputChange('roomId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          Room {room.roomNumber} - {room.type} (Floor {room.floor})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableRooms.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">No available rooms found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Selection</CardTitle>
              <CardDescription>Select the patient to be admitted</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="patientId">Patient *</Label>
                <Select value={formData.patientId} onValueChange={(value) => handleInputChange('patientId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} - {patient.patient_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {patients.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">No patients found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Admission Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Admission Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="admissionDate">Admission Date *</Label>
                  <Input
                    id="admissionDate"
                    type="date"
                    value={formData.admissionDate}
                    onChange={(e) => handleInputChange('admissionDate', e.target.value)}
                    max={today}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expectedDischargeDate">Expected Discharge Date *</Label>
                  <Input
                    id="expectedDischargeDate"
                    type="date"
                    value={formData.expectedDischargeDate}
                    onChange={(e) => handleInputChange('expectedDischargeDate', e.target.value)}
                    min={formData.admissionDate || today}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="diagnosis">Primary Diagnosis *</Label>
                <Input
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                  placeholder="Primary diagnosis"
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional notes or observations..."
                  rows={3}
                />
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
            <Button type="submit" disabled={isLoading || !formData.patientId || (!room && !formData.roomId)}>
              {isLoading ? 'Admitting...' : 'Admit Patient'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

