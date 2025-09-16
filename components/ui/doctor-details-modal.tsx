import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Stethoscope,
  Clock,
  Users,
  BookOpen,
  User,
  CalendarCheck,
  Activity,
  Bed 
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface DoctorDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  doctorId: string
}

interface DoctorDetails {
  id: number
  doctor_name: string  
  email: string
  role: string
  contact_number: string
  specialization: string
  qualifications: string
  experience_years: number
  license_number: string
  department: string
  is_active: boolean
  status: string
  admitted_patients: number
  todays_appointments: number
  recentPatients: Array<{
    patient_id: number
    patient_name: string
    admission_date: string
    diagnosis: string
    chief_complaint: string
    room_number: string
  }>
}

export function DoctorDetailsModal({
  isOpen,
  onClose,
  doctorId
}: DoctorDetailsModalProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [details, setDetails] = useState<DoctorDetails | null>(null)

  useEffect(() => {
    const fetchDetails = async () => {
      if (!isOpen || !doctorId) return
      
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/admin/doctor-details/${doctorId}`)
        if (!res.ok) throw new Error('Failed to fetch doctor details')
        const data = await res.json()
        setDetails(data.doctor)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load details')
        console.error('Error fetching doctor details:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [doctorId, isOpen])

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'bg-green-100 text-green-700'
      case 'busy': return 'bg-yellow-100 text-yellow-700'
      case 'in surgery': return 'bg-blue-100 text-blue-700'
      case 'on leave': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Doctor Details</DialogTitle>
          <DialogDescription>
            Real-time information and patient status
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
          </div>
        ) : error ? (
          <div className="text-red-500 p-4 text-center">
            {error}
          </div>
        ) : details ? (
          <div className="space-y-6">
            {/* Doctor Header */}
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white p-4 rounded-lg">
                <Stethoscope className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">{details.doctor_name}</h3>
                <p className="text-gray-600">{details.qualifications}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">{details.specialization}</Badge>
                  <Badge variant="outline">{details.department}</Badge>
                  <Badge className={getStatusColor(details.status)}>{details.status}</Badge>
                </div>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-pink-500" />
                  <div>
                    <p className="text-sm font-medium">Experience</p>
                    <p className="text-gray-700">{details.experience_years} years</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-pink-500" />
                  <div>
                    <p className="text-sm font-medium">License Number</p>
                    <p className="text-gray-700">{details.license_number}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-pink-500" />
                  <div>
                    <p className="text-sm font-medium">Contact</p>
                    <p className="text-gray-700">{details.contact_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-pink-500" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-gray-700">{details.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-5 w-5 text-blue-500" />
                  <h4 className="font-medium">Admitted Patients</h4>
                </div>
                <p className="text-2xl font-bold text-blue-600">{details.admitted_patients}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="h-5 w-5 text-green-500" />
                  <h4 className="font-medium">Today's Appointments</h4>
                </div>
                <p className="text-2xl font-bold text-green-600">{details.todays_appointments}</p>
              </div>
            </div>

            {/* Recent Patients */}
            {details.recentPatients?.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Recent Patients
                </h4>
                <div className="space-y-2">
                  {details.recentPatients.map((patient) => (
                    <div 
                      key={patient.patient_id}
                      className="bg-white p-3 rounded-lg border border-gray-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{patient.patient_name}</p>
                          <p className="text-sm text-gray-600">
                            {patient.diagnosis}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {formatDate(patient.admission_date)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}