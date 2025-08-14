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
import { Calendar, User, Pill, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Patient {
  id: string
  name: string
  admissionDate: string
  expectedDischargeDate: string
  roomId: string
  diagnosis: string
  medications: string[]
  notes: string
  status: string
}

interface PatientDischargeFormProps {
  patient: Patient
  onDischargeComplete?: () => void
}

export default function PatientDischargeForm({ patient, onDischargeComplete }: PatientDischargeFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    dischargeDate: '',
    dischargeReason: '',
    finalDiagnosis: patient.diagnosis,
    medicationsAtDischarge: patient.medications,
    followUpInstructions: '',
    dischargeNotes: '',
    dischargeType: '',
    nextFollowUpDate: '',
    specialInstructions: '',
    conditionAtDischarge: ''
  })
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMedicationChange = (index: number, value: string) => {
    const newMedications = [...formData.medicationsAtDischarge]
    newMedications[index] = value
    setFormData(prev => ({
      ...prev,
      medicationsAtDischarge: newMedications
    }))
  }

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medicationsAtDischarge: [...prev.medicationsAtDischarge, '']
    }))
  }

  const removeMedication = (index: number) => {
    if (formData.medicationsAtDischarge.length > 1) {
      const newMedications = formData.medicationsAtDischarge.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        medicationsAtDischarge: newMedications
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      const requiredFields = ['dischargeDate', 'dischargeReason', 'finalDiagnosis', 'conditionAtDischarge']
      for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData]) {
          throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`)
        }
      }

      // Filter out empty medications
      const validMedications = formData.medicationsAtDischarge.filter(med => med.trim() !== '')

      const dischargeData = {
        ...formData,
        medicationsAtDischarge: validMedications,
        patientId: patient.id
      }

      const response = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'dischargePatient',
          patientId: patient.id
        }),
        credentials: 'include'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to discharge patient')
      }

      toast({
        title: "Success",
        description: "Patient discharged successfully",
      })

      setIsOpen(false)
      onDischargeComplete?.()

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to discharge patient',
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
        <Button size="sm" variant="outline">
          <CheckCircle className="mr-1 h-3 w-3" />
          Discharge
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Patient Discharge Form</DialogTitle>
          <DialogDescription>
            Complete discharge process for {patient.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Patient Name</Label>
                  <Input value={patient.name} disabled />
                </div>
                <div>
                  <Label>Admission Date</Label>
                  <Input value={patient.admissionDate} disabled />
                </div>
                <div>
                  <Label>Expected Discharge</Label>
                  <Input value={patient.expectedDischargeDate} disabled />
                </div>
                <div>
                  <Label>Primary Diagnosis</Label>
                  <Input value={patient.diagnosis} disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discharge Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Discharge Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dischargeDate">Actual Discharge Date *</Label>
                  <Input
                    id="dischargeDate"
                    type="date"
                    value={formData.dischargeDate}
                    onChange={(e) => handleInputChange('dischargeDate', e.target.value)}
                    max={today}
                    min={patient.admissionDate}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dischargeType">Discharge Type *</Label>
                  <Select value={formData.dischargeType} onValueChange={(value) => handleInputChange('dischargeType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select discharge type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regular">Regular Discharge</SelectItem>
                      <SelectItem value="Against Medical Advice">Against Medical Advice</SelectItem>
                      <SelectItem value="Transferred">Transferred to Another Facility</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dischargeReason">Discharge Reason *</Label>
                  <Input
                    id="dischargeReason"
                    value={formData.dischargeReason}
                    onChange={(e) => handleInputChange('dischargeReason', e.target.value)}
                    placeholder="Reason for discharge"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="conditionAtDischarge">Condition at Discharge *</Label>
                  <Select value={formData.conditionAtDischarge} onValueChange={(value) => handleInputChange('conditionAtDischarge', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Improved">Improved</SelectItem>
                      <SelectItem value="Stable">Stable</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="Unchanged">Unchanged</SelectItem>
                      <SelectItem value="Worsened">Worsened</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Final Medical Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Final Medical Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="finalDiagnosis">Final Diagnosis *</Label>
                <Textarea
                  id="finalDiagnosis"
                  value={formData.finalDiagnosis}
                  onChange={(e) => handleInputChange('finalDiagnosis', e.target.value)}
                  placeholder="Final diagnosis and any changes from admission"
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dischargeNotes">Discharge Summary *</Label>
                <Textarea
                  id="dischargeNotes"
                  value={formData.dischargeNotes}
                  onChange={(e) => handleInputChange('dischargeNotes', e.target.value)}
                  placeholder="Summary of treatment, procedures, and outcomes"
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Medications at Discharge */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Medications at Discharge</CardTitle>
              <CardDescription>List all medications prescribed for home use</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.medicationsAtDischarge.map((medication, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={medication}
                    onChange={(e) => handleMedicationChange(index, e.target.value)}
                    placeholder={`Medication ${index + 1}`}
                  />
                  {formData.medicationsAtDischarge.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMedication(index)}
                    >
                      Remove
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
                Add Medication
              </Button>
            </CardContent>
          </Card>

          {/* Follow-up Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Follow-up Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nextFollowUpDate">Next Follow-up Date</Label>
                  <Input
                    id="nextFollowUpDate"
                    type="date"
                    value={formData.nextFollowUpDate}
                    onChange={(e) => handleInputChange('nextFollowUpDate', e.target.value)}
                    min={formData.dischargeDate || today}
                  />
                </div>
                <div>
                  <Label htmlFor="followUpInstructions">Follow-up Instructions</Label>
                  <Input
                    id="followUpInstructions"
                    value={formData.followUpInstructions}
                    onChange={(e) => handleInputChange('followUpInstructions', e.target.value)}
                    placeholder="e.g., Visit cardiology clinic"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  placeholder="Any special care instructions, dietary restrictions, activity limitations..."
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Complete Discharge'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
