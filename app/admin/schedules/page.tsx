"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  Clock,
  User,
  Stethoscope,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'
import { useRealtimeDashboard } from '@/hooks/useRealtimeDashboard'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { DoctorDetailsModal } from '@/components/ui/doctor-details-modal'
import { CreateScheduleModal } from '@/components/ui/create-schedule-modal'
type DoctorSchedule = {
  id: string            // Format: "SCH-{doctor_id}" e.g. "SCH-30"
  doctorName: string    // From users.name 
  department: string    // From users.department
  specialization: string // From users.specialization
  shift: string        // Calculated shift label
  startTime: string    // Formatted schedule start time
  endTime: string      // Formatted schedule end time
  room: string         // Room number or "OPD"
  status: string       // doctor's current status (available/busy/on_leave)
  patientsScheduled: number // Number of patients scheduled for today
  maxPatients: number     // Maximum patients (default 12)
}

type StaffDuty = {
  id: string
  name: string
  role: string
  department: string
  shift: string
  startTime: string
  endTime: string
  status: string
  assignedWard: string
}

export default function AdminSchedulesPage() {
  const { stats, loading, error, refresh } = useRealtimeDashboard(30000) // Refresh every 30 seconds
  const [doctorSchedules, setDoctorSchedules] = useState<DoctorSchedule[]>([])
  const [staffDuty, setStaffDuty] = useState<StaffDuty[]>([])
  const [loadingSchedules, setLoadingSchedules] = useState(true)
  const [loadingStaff, setLoadingStaff] = useState(true)
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null)
  const [showDoctorDetails, setShowDoctorDetails] = useState(false)
  const [showCreateSchedule, setShowCreateSchedule] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingSchedules(true)
        const res = await fetch('/api/admin/doctor-schedules', { cache: 'no-store' })
        const data = await res.json()
        setDoctorSchedules(data.schedules || [])
      } catch (_) {}
      finally {
        setLoadingSchedules(false)
      }
    }
    const loadStaff = async () => {
      try {
        setLoadingStaff(true)
        const res = await fetch('/api/admin/staff-duty', { cache: 'no-store' })
        const data = await res.json()
        setStaffDuty(data.staff || [])
      } catch (_) {}
      finally {
        setLoadingStaff(false)
      }
    }
    load()
    loadStaff()
    const t = setInterval(() => { load(); loadStaff(); }, 30000)
    return () => clearInterval(t)
  }, [])

  const handleViewDoctor = (schedule: DoctorSchedule) => {
    // Extract doctor ID from schedule.id format "SCH-30" -> "30"
    const doctorId = schedule.id.replace('SCH-', '');
    if (!doctorId || doctorId === schedule.id) {
      toast.error('Unable to identify doctor ID');
      return;
    }
    setSelectedDoctorId(doctorId)
    setShowDoctorDetails(true)
  }

  const handleViewStaff = (staff: StaffDuty) => {
    toast.info(`Viewing ${staff.name} (${staff.role})`)
  }

  const handleEditStaff = (staff: StaffDuty) => {
    toast.success(`Editing duty for ${staff.name}`)
  }

  const handleCloseStaff = (staff: StaffDuty) => {
    setStaffDuty(prev => prev.filter(s => s.id !== staff.id))
    toast.message(`Dismissed ${staff.name}`)
  }

  const handleCreateSchedule = () => {
    console.log('Create Schedule button clicked!')
    setShowCreateSchedule(true)
    toast.info('Opening create schedule modal...')
  }

  const handleScheduleCreated = () => {
    // Refresh the schedules list after successful creation
    const load = async () => {
      try {
        setLoadingSchedules(true)
        const res = await fetch('/api/admin/doctor-schedules', { cache: 'no-store' })
        const data = await res.json()
        setDoctorSchedules(data.schedules || [])
      } catch (_) {}
      finally {
        setLoadingSchedules(false)
      }
    }
    load()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return <Badge className="bg-green-100 text-green-700">Available</Badge>
      case 'busy': return <Badge className="bg-yellow-100 text-yellow-700">Busy</Badge>
      case 'in_surgery': return <Badge className="bg-red-100 text-red-700">In Surgery</Badge>
      case 'on_leave': return null // Don't show "On Leave" badge
      case 'on_duty': return <Badge className="bg-green-100 text-green-700">On Duty</Badge>
      case 'off_duty': return <Badge className="bg-gray-100 text-gray-700">Off Duty</Badge>
      default: return <Badge className="bg-blue-100 text-blue-700">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'busy': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'in_surgery': return <XCircle className="h-4 w-4 text-red-500" />
      case 'on_leave': return <XCircle className="h-4 w-4 text-gray-500" />
      case 'on_duty': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'off_duty': return <XCircle className="h-4 w-4 text-gray-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case 'Morning': return 'bg-orange-100 text-orange-700'
      case 'Evening': return 'bg-blue-100 text-blue-700'
      case 'Night': return 'bg-purple-100 text-purple-700'
      case 'Full Day': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4 sm:p-6">

      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-8 w-8 mr-2 sm:mr-3 text-pink-500" />
            Doctor Schedules
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Manage doctor schedules and appointments
          </p>
          {error && (
            <p className="text-red-500 text-sm mt-1">
              Error loading data: {error}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={refresh}
            variant="outline" 
            className="border-pink-200 text-pink-600 hover:bg-pink-50 w-full sm:w-auto flex items-center justify-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleCreateSchedule} className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 w-full sm:w-auto flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" />
            Create Schedule
          </Button>
        </div>
      </div>

      {/* Real-time Status Indicator */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
          <span className="text-sm text-gray-600">
            {loading ? 'Updating...' : `Last updated: ${new Date(stats.lastUpdated).toLocaleTimeString()}`}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Auto-refresh every 30 seconds
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doctors on Duty</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.doctorsOnDuty}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {loading ? 'Loading...' : 'Currently active'}
                </p>
              </div>
              <Stethoscope className="h-6 sm:h-8 w-6 sm:w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Staff on Duty</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {loading ? '...' : stats.staffOnDuty}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {loading ? 'Loading...' : 'Currently active'}
                </p>
              </div>
              <Users className="h-6 sm:h-8 w-6 sm:w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Rooms</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                  {loading ? '...' : stats.availableRooms}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {loading ? 'Loading...' : 'Ready for patients'}
                </p>
              </div>
              <MapPin className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-pink-100 mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search by doctor, department, or room..." 
                className="pl-10 border-pink-200 focus:border-pink-400 w-full"
              />
            </div>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 w-full sm:w-auto flex items-center justify-center gap-2">
              <Filter className="h-4 w-4" />
              Filter by Department
            </Button>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 w-full sm:w-auto flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              Today
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Doctor Schedules */}
      <Card className="border-pink-100 mb-6">
        <CardHeader>
          <CardTitle>Doctor Schedules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(loadingSchedules ? [] : doctorSchedules).map((schedule) => (
            <div key={schedule.id} className="p-4 sm:p-5 border border-pink-100 rounded-lg hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex-shrink-0 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-lg h-16 w-16 flex items-center justify-center font-bold">
                <Stethoscope className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 flex-wrap mb-2">
                  <h3 className="font-bold text-lg sm:text-xl text-gray-900">{schedule.doctorName}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">#{schedule.id.replace('SCH-', '')}</Badge>
                    {getStatusBadge(schedule.status)}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-pink-200 text-pink-600 hover:bg-pink-50"
                      onClick={() => handleViewDoctor(schedule)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-sm text-gray-600">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-pink-500" />
                      <span className="font-medium">{schedule.specialization} • {schedule.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-pink-500" />
                      <span>{schedule.startTime} - {schedule.endTime}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-pink-500" />
                      <span>Room {schedule.room}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-pink-500" />
                      <span>Appointments: {schedule.patientsScheduled}/{schedule.maxPatients}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-pink-500 h-2 rounded-full" 
                    style={{ 
                      width: `${(schedule.patientsScheduled / schedule.maxPatients) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Doctor Details Modal */}
      {selectedDoctorId && (
        <DoctorDetailsModal 
          isOpen={showDoctorDetails}
          onClose={() => {
            setShowDoctorDetails(false)
            setSelectedDoctorId(null)
          }}
          doctorId={selectedDoctorId}
        />
      )}

      {/* Create Schedule Modal */}
      <CreateScheduleModal 
        isOpen={showCreateSchedule}
        onClose={() => {
          console.log('Modal close called')
          setShowCreateSchedule(false)
        }}
        onSuccess={handleScheduleCreated}
      />
    </div>
  )
}
