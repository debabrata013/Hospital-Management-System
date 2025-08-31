"use client"

import { useState, useEffect } from 'react'
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
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'

interface Appointment {
  id: number
  appointmentId: string
  appointmentDate: string
  appointmentTime: string
  appointmentType: string
  reasonForVisit: string
  status: string
  notes: string
  createdAt: string
  patient: {
    id: number
    name: string
    phone: string
    dateOfBirth: string
    gender: string
  }
  doctor: {
    id: number
    name: string
    department: string
    specialization: string
  }
}

interface AppointmentStats {
  todayAppointments: number
  confirmed: number
  pending: number
  completed: number
  typeStats: Array<{
    type: string
    count: number
  }>
  weeklyTrends: Array<{
    date: string
    total: number
    completed: number
  }>
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminAppointmentsPage() {
  const { toast } = useToast()
  const router = useRouter()
  
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState<AppointmentStats>({
    todayAppointments: 0,
    confirmed: 0,
    pending: 0,
    completed: 0,
    typeStats: [],
    weeklyTrends: []
  })
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedType, setSelectedType] = useState('')

  // Fetch appointments
  const fetchAppointments = async (page: number = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        date: selectedDate,
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedType && { type: selectedType })
      })

      const response = await fetch(`/api/admin/appointments?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch appointments')
      }

      const data = await response.json()
      setAppointments(data.appointments)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/admin/appointment-stats?date=${selectedDate}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // Update appointment status
  const updateAppointmentStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/appointments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status: newStatus
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update appointment')
      }

      toast({
        title: "Success",
        description: "Appointment status updated successfully",
      })

      // Refresh data
      fetchAppointments(pagination.page)
      fetchStats()
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      })
    }
  }

  // Delete appointment
  const deleteAppointment = async (id: number) => {
    if (!confirm('Are you sure you want to delete this appointment?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/appointments?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete appointment')
      }

      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      })

      // Refresh data
      fetchAppointments(pagination.page)
      fetchStats()
    } catch (error) {
      console.error('Error deleting appointment:', error)
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive",
      })
    }
  }

  // Handle search
  const handleSearch = () => {
    fetchAppointments(1)
  }

  // Handle date change
  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    fetchAppointments(1)
    fetchStats()
  }

  // Handle status filter
  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status === selectedStatus ? '' : status)
    fetchAppointments(1)
  }

  // Handle type filter
  const handleTypeFilter = (type: string) => {
    setSelectedType(type === selectedType ? '' : type)
    fetchAppointments(1)
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    fetchAppointments(page)
  }

  useEffect(() => {
    fetchAppointments()
    fetchStats()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-700">Confirmed</Badge>
      case 'scheduled':
        return <Badge className="bg-yellow-100 text-yellow-700">Scheduled</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-700">Completed</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>
      case 'no-show':
        return <Badge className="bg-gray-100 text-gray-700">No Show</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'scheduled':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'bg-blue-100 text-blue-700'
      case 'check-up':
        return 'bg-green-100 text-green-700'
      case 'follow-up':
        return 'bg-purple-100 text-purple-700'
      case 'surgery-consultation':
        return 'bg-red-100 text-red-700'
      case 'emergency':
        return 'bg-orange-100 text-orange-700'
      case 'routine':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-7 w-7 md:h-8 md:w-8 mr-2 md:mr-3 text-pink-500" />
            Appointment Management
          </h1>
          <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">
            Schedule, manage, and track patient appointments
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => fetchStats()}
            variant="outline"
            size="sm"
            className="border-pink-200 text-pink-600 hover:bg-pink-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={() => router.push('/admin/appointments/add')}
            className="w-full md:w-auto bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Appointment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 md:mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm md:text-base font-medium text-gray-600">Today's Appointments</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
              </div>
              <Calendar className="h-6 w-6 md:h-8 md:w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm md:text-base font-medium text-gray-600">Confirmed</p>
                <p className="text-xl md:text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm md:text-base font-medium text-gray-600">Pending</p>
                <p className="text-xl md:text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <AlertCircle className="h-6 w-6 md:h-8 md:w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm md:text-base font-medium text-gray-600">Completed</p>
                <p className="text-xl md:text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card className="border-pink-100 mb-6">
        <CardContent className="p-4 md:p-6 flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Search appointments by patient name, doctor, or appointment ID..." 
              className="pl-10 border-pink-200 focus:border-pink-400 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="border-pink-200 focus:border-pink-400 w-full md:w-auto"
          />
          <Button 
            onClick={() => handleStatusFilter('scheduled')}
            variant={selectedStatus === 'scheduled' ? 'default' : 'outline'}
            className={`border-pink-200 text-pink-600 hover:bg-pink-50 w-full md:w-auto ${
              selectedStatus === 'scheduled' ? 'bg-pink-500 text-white' : ''
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Pending
          </Button>
          <Button 
            onClick={() => handleStatusFilter('confirmed')}
            variant={selectedStatus === 'confirmed' ? 'default' : 'outline'}
            className={`border-pink-200 text-pink-600 hover:bg-pink-50 w-full md:w-auto ${
              selectedStatus === 'confirmed' ? 'bg-pink-500 text-white' : ''
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Confirmed
          </Button>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card className="border-pink-100 mb-6">
        <CardHeader>
          <CardTitle>Appointments - {new Date(selectedDate).toLocaleDateString()}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading appointments...</p>
              </div>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
              <p className="text-muted-foreground mb-4">
                {selectedDate === new Date().toISOString().split('T')[0] 
                  ? 'No appointments scheduled for today' 
                  : 'No appointments found for the selected date'}
              </p>
              <Button onClick={() => router.push('/admin/appointments/add')}>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="p-4 border border-pink-100 rounded-lg hover:shadow-md transition-all duration-200 flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-start md:items-center gap-4 flex-1">
                    <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-lg h-16 w-16 flex items-center justify-center font-bold">
                      <Clock className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:space-x-3 mb-2 gap-1 md:gap-0">
                        <h3 className="font-bold text-lg text-gray-900">{appointment.patient.name}</h3>
                        <Badge variant="outline">{appointment.appointmentId}</Badge>
                        <Badge className={getTypeColor(appointment.appointmentType)}>
                          {appointment.appointmentType.replace('-', ' ')}
                        </Badge>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 mb-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Stethoscope className="h-4 w-4 text-pink-500" />
                            <span className="font-medium">{appointment.doctor.name}</span>
                            <span className="text-gray-500">• {appointment.doctor.department}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-pink-500" />
                            <span>{new Date(appointment.appointmentDate).toLocaleDateString()} at {formatTime(appointment.appointmentTime)}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4 text-pink-500" />
                            <span>Patient ID: {appointment.patient.id}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4 text-pink-500" />
                            <span>{appointment.patient.phone || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      {appointment.reasonForVisit && (
                        <div className="p-2 md:p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                          <span className="font-medium">Reason:</span> {appointment.reasonForVisit}
                        </div>
                      )}
                      {appointment.notes && (
                        <div className="p-2 md:p-3 bg-blue-50 rounded-lg text-sm text-blue-700 mt-2">
                          <span className="font-medium">Notes:</span> {appointment.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(appointment.status)}
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                      <Edit className="h-4 w-4" />
                    </Button>
                    {appointment.status === 'scheduled' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-green-200 text-green-600 hover:bg-green-50"
                        onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {appointment.status === 'confirmed' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => deleteAppointment(appointment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card className="border-pink-100 mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appointment Types */}
      <Card className="border-pink-100 mb-6">
        <CardHeader>
          <CardTitle>Appointment Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {stats.typeStats.map((typeStat) => (
              <div key={typeStat.type} className="p-4 bg-blue-50 rounded-lg text-center">
                <Stethoscope className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-800 capitalize">
                  {typeStat.type.replace('-', ' ')}
                </h4>
                <p className="text-2xl font-bold text-blue-600">{typeStat.count}</p>
                <p className="text-sm text-blue-600">Appointments</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-pink-100 mb-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => router.push('/admin/appointments/add')}
              variant="outline" 
              className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2"
            >
              <Plus className="h-6 w-6" />
              <span>New Appointment</span>
            </Button>
            <Button 
              onClick={() => handleDateChange(new Date().toISOString().split('T')[0])}
              variant="outline" 
              className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2"
            >
              <Calendar className="h-6 w-6" />
              <span>Today</span>
            </Button>
            <Button 
              onClick={() => handleStatusFilter('scheduled')}
              variant="outline" 
              className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2"
            >
              <CheckCircle className="h-6 w-6" />
              <span>Pending</span>
            </Button>
            <Button 
              onClick={() => fetchStats()}
              variant="outline" 
              className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2"
            >
              <RefreshCw className="h-6 w-6" />
              <span>Refresh</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
