"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  ArrowLeft,
  Save,
  Loader2
} from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'

interface Patient {
  id: number
  name: string
  patientId: string
  phone: string
  dateOfBirth: string
  gender: string
}

interface Doctor {
  id: number
  name: string
  department: string
  specialization: string
}

interface AppointmentType {
  name: string
  duration: number
  color: string
}

export default function AddAppointmentPage() {
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '09:00',
    appointmentType: 'consultation',
    reasonForVisit: '',
    notes: ''
  })
  
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([])

  // Fetch form data
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await fetch('/api/admin/appointment-data')
        if (response.ok) {
          const data = await response.json()
          setPatients(data.patients)
          setDoctors(data.doctors)
          setAppointmentTypes(data.appointmentTypes)
        }
      } catch (error) {
        console.error('Error fetching form data:', error)
        toast({
          title: "Error",
          description: "Failed to load form data",
          variant: "destructive",
        })
      }
    }

    fetchFormData()
  }, [toast])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.patientId || !formData.doctorId || !formData.appointmentDate || !formData.appointmentTime) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create appointment')
      }

      const result = await response.json()
      
      toast({
        title: "Success",
        description: `Appointment scheduled successfully! ID: ${result.appointmentIdGenerated}`,
      })

      // Redirect to appointments list
      router.push('/admin/appointments')
      
    } catch (error: any) {
      console.error('Error creating appointment:', error)
      toast({
        title: "Error",
        description: error.message || 'Failed to create appointment',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getSelectedPatient = () => {
    return patients.find(p => p.id.toString() === formData.patientId)
  }

  const getSelectedDoctor = () => {
    return doctors.find(d => d.id.toString() === formData.doctorId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8 flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-pink-200 text-pink-600 hover:bg-pink-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-7 w-7 md:h-8 md:w-8 mr-2 md:mr-3 text-pink-500" />
            Schedule New Appointment
          </h1>
          <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">
            Create a new appointment for a patient
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Selection */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-pink-500" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="patientId">Select Patient *</Label>
                  <Select
                    value={formData.patientId}
                    onValueChange={(value) => handleInputChange('patientId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.name} ({patient.patientId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {getSelectedPatient() && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Patient Details</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">ID:</span> {getSelectedPatient()?.patientId}</p>
                      <p><span className="font-medium">Phone:</span> {getSelectedPatient()?.phone || 'N/A'}</p>
                      <p><span className="font-medium">Gender:</span> {getSelectedPatient()?.gender}</p>
                      <p><span className="font-medium">DOB:</span> {getSelectedPatient()?.dateOfBirth}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Doctor Selection */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-pink-500" />
                  Doctor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="doctorId">Select Doctor *</Label>
                  <Select
                    value={formData.doctorId}
                    onValueChange={(value) => handleInputChange('doctorId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.name} - {doctor.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {getSelectedDoctor() && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Doctor Details</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Department:</span> {getSelectedDoctor()?.department}</p>
                      <p><span className="font-medium">Specialization:</span> {getSelectedDoctor()?.specialization || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Appointment Details */}
            <Card className="border-pink-100 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-pink-500" />
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="appointmentDate">Date *</Label>
                    <Input
                      id="appointmentDate"
                      type="date"
                      value={formData.appointmentDate}
                      onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="border-pink-200 focus:border-pink-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="appointmentTime">Time *</Label>
                    <Input
                      id="appointmentTime"
                      type="time"
                      value={formData.appointmentTime}
                      onChange={(e) => handleInputChange('appointmentTime', e.target.value)}
                      className="border-pink-200 focus:border-pink-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="appointmentType">Type *</Label>
                    <Select
                      value={formData.appointmentType}
                      onValueChange={(value) => handleInputChange('appointmentType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {appointmentTypes.map((type) => (
                          <SelectItem key={type.name} value={type.name}>
                            {type.name.replace('-', ' ')} ({type.duration} min)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="reasonForVisit">Reason for Visit *</Label>
                  <Textarea
                    id="reasonForVisit"
                    placeholder="Describe the reason for the appointment..."
                    value={formData.reasonForVisit}
                    onChange={(e) => handleInputChange('reasonForVisit', e.target.value)}
                    className="border-pink-200 focus:border-pink-400 min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes or instructions..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="border-pink-200 focus:border-pink-400 min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
