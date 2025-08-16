"use client"

import { useState } from 'react'
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

interface PatientAdmissionFormProps {
  room?: Room
  onAdmissionComplete?: () => void
}

export default function PatientAdmissionForm({ room, onAdmissionComplete }: PatientAdmissionFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    contactNumber: '',
    emergencyContact: '',
    address: '',
    diagnosis: '',
    admissionDate: '',
    expectedDischargeDate: '',
    medications: [''],
    notes: '',
    doctorName: '',
    department: '',
    insuranceProvider: '',
    insuranceNumber: '',
    roomId: room?.id || ''
  })
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMedicationChange = (index: number, value: string) => {
    const newMedications = [...formData.medications]
    newMedications[index] = value
    setFormData(prev => ({
      ...prev,
      medications: newMedications
    }))
  }

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, '']
    }))
  }

  const removeMedication = (index: number) => {
    if (formData.medications.length > 1) {
      const newMedications = formData.medications.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        medications: newMedications
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      const requiredFields = ['name', 'age', 'gender', 'diagnosis', 'admissionDate', 'expectedDischargeDate']
      for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData]) {
          throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`)
        }
      }

      if (!formData.roomId) {
        throw new Error('Room selection is required')
      }

      // Filter out empty medications
      const validMedications = formData.medications.filter(med => med.trim() !== '')

      const patientData = {
        ...formData,
        medications: validMedications,
        age: parseInt(formData.age),
        roomId: formData.roomId
      }

      const response = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'admitPatient',
          patientData,
          roomId: formData.roomId
        }),
        credentials: 'include'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to admit patient')
      }

      toast({
        title: "Success",
        description: "Patient admitted successfully",
      })

      // Reset form
      setFormData({
        name: '',
        age: '',
        gender: '',
        contactNumber: '',
        emergencyContact: '',
        address: '',
        diagnosis: '',
        admissionDate: '',
        expectedDischargeDate: '',
        medications: [''],
        notes: '',
        doctorName: '',
        department: '',
        insuranceProvider: '',
        insuranceNumber: '',
        roomId: room?.id || ''
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
            {room ? `Admitting patient to Room ${room.roomNumber} (${room.type})` : 'Select a room and fill in patient details'}
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

          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter patient's full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="0"
                    max="150"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="Age"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
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
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    placeholder="Emergency contact number"
                  />
                </div>
                <div>
                  <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                  <Input
                    id="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                    placeholder="Insurance company"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Full address"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="doctorName">Attending Doctor</Label>
                  <Input
                    id="doctorName"
                    value={formData.doctorName}
                    onChange={(e) => handleInputChange('doctorName', e.target.value)}
                    placeholder="Doctor's name"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cardiology">Cardiology</SelectItem>
                      <SelectItem value="Neurology">Neurology</SelectItem>
                      <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="General Medicine">General Medicine</SelectItem>
                      <SelectItem value="Surgery">Surgery</SelectItem>
                      <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="ICU">ICU</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="insuranceNumber">Insurance Number</Label>
                  <Input
                    id="insuranceNumber"
                    value={formData.insuranceNumber}
                    onChange={(e) => handleInputChange('insuranceNumber', e.target.value)}
                    placeholder="Insurance policy number"
                  />
                </div>
              </div>
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
            </CardContent>
          </Card>

          {/* Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Medications</CardTitle>
              <CardDescription>List all medications prescribed for the patient</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.medications.map((medication, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={medication}
                    onChange={(e) => handleMedicationChange(index, e.target.value)}
                    placeholder={`Medication ${index + 1}`}
                  />
                  {formData.medications.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMedication(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addMedication}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Medication
              </Button>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional notes, special instructions, or observations..."
                rows={3}
              />
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Admitting...' : 'Admit Patient'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
