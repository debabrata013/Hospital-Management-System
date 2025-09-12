"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  User, 
  FileText,
  RefreshCw,
  Stethoscope,
  Users
} from 'lucide-react'

interface DoctorLeaveRequest {
  id: number
  doctor_id: string
  doctor_name: string
  leave_type: string
  start_date: string
  end_date: string
  start_time?: string
  end_time?: string
  is_full_day: boolean
  reason: string
  emergency_contact?: string
  replacement_doctor?: string
  replacement_doctor_name?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  approved_by?: string
  approved_at?: string
}

interface StaffLeaveRequest {
  id: number
  user_id: number
  staff_name: string
  staff_mobile: string
  department: string
  role: string
  leave_type: string
  start_date: string
  end_date: string
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected'
  created_at: string
  updated_at: string
}

export default function LeaveManagementPage() {
  const [doctorLeaveRequests, setDoctorLeaveRequests] = useState<DoctorLeaveRequest[]>([])
  const [staffLeaveRequests, setStaffLeaveRequests] = useState<StaffLeaveRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [activeMainTab, setActiveMainTab] = useState('doctor')
  const [doctorStatusTab, setDoctorStatusTab] = useState('pending')
  const [staffStatusTab, setStaffStatusTab] = useState('pending')

  useEffect(() => {
    fetchDoctorLeaveRequests()
    fetchStaffLeaveRequests()
  }, [])

  const fetchDoctorLeaveRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/leave-requests')
      if (response.ok) {
        const data = await response.json()
        setDoctorLeaveRequests(data.leaveRequests || [])
      }
    } catch (error) {
      console.error('Error fetching doctor leave requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStaffLeaveRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/staff/leave-requests')
      if (response.ok) {
        const data = await response.json()
        setStaffLeaveRequests(data.leaveRequests || [])
      }
    } catch (error) {
      console.error('Error fetching staff leave requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshAll = () => {
    fetchDoctorLeaveRequests()
    fetchStaffLeaveRequests()
  }

  const handleDoctorApproval = async (requestId: number, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/leave-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action
        })
      })

      if (response.ok) {
        fetchDoctorLeaveRequests()
      } else {
        console.error('Failed to update doctor leave request')
      }
    } catch (error) {
      console.error('Error updating doctor leave request:', error)
    }
  }

  const handleStaffApproval = async (requestId: number, action: 'approve' | 'reject') => {
    try {
      const status = action === 'approve' ? 'Approved' : 'Rejected'
      const response = await fetch('/api/admin/staff/leave-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leave_request_id: requestId,
          status: status
        })
      })

      if (response.ok) {
        fetchStaffLeaveRequests()
      } else {
        console.error('Failed to update staff leave request')
      }
    } catch (error) {
      console.error('Error updating staff leave request:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return null
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDoctorStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-700 border-yellow-300"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-700 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStaffStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="text-yellow-700 border-yellow-300"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'Approved':
        return <Badge variant="default" className="bg-green-100 text-green-700 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'Rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getLeaveTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sick':
        return 'bg-red-100 text-red-700'
      case 'annual':
      case 'vacation':
        return 'bg-blue-100 text-blue-700'
      case 'unpaid':
        return 'bg-orange-100 text-orange-700'
      case 'emergency':
      case 'personal':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // Filter functions for doctor requests
  const getFilteredDoctorRequests = () => {
    if (doctorStatusTab === 'pending') return doctorLeaveRequests.filter(r => r.status === 'pending')
    if (doctorStatusTab === 'approved') return doctorLeaveRequests.filter(r => r.status === 'approved')
    if (doctorStatusTab === 'rejected') return doctorLeaveRequests.filter(r => r.status === 'rejected')
    return doctorLeaveRequests
  }

  // Filter functions for staff requests
  const getFilteredStaffRequests = () => {
    if (staffStatusTab === 'pending') return staffLeaveRequests.filter(r => r.status === 'Pending')
    if (staffStatusTab === 'approved') return staffLeaveRequests.filter(r => r.status === 'Approved')
    if (staffStatusTab === 'rejected') return staffLeaveRequests.filter(r => r.status === 'Rejected')
    return staffLeaveRequests
  }

  const renderDoctorLeaveCard = (request: DoctorLeaveRequest) => (
    <Card key={request.id} className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-4 w-4" />
              <span className="font-semibold">{request.doctor_name}</span>
              <Badge className={getLeaveTypeColor(request.leave_type)}>
                {request.leave_type}
              </Badge>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(request.start_date)} - {formatDate(request.end_date)}
                </span>
              </div>
              {!request.is_full_day && request.start_time && request.end_time && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatTime(request.start_time)} - {formatTime(request.end_time)}
                  </span>
                </div>
              )}
              {request.is_full_day && (
                <Badge variant="outline">Full Day</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getDoctorStatusBadge(request.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium mb-1">Reason:</h4>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
              {request.reason}
            </p>
          </div>
          
          {request.emergency_contact && (
            <div>
              <h4 className="font-medium mb-1">Emergency Contact:</h4>
              <p className="text-sm text-gray-700">{request.emergency_contact}</p>
            </div>
          )}
          
          {request.replacement_doctor_name && (
            <div>
              <h4 className="font-medium mb-1">Replacement Doctor:</h4>
              <p className="text-sm text-gray-700">{request.replacement_doctor_name}</p>
            </div>
          )}

          <div className="text-xs text-gray-500">
            Requested on: {formatDate(request.created_at)}
          </div>

          {request.status === 'pending' && (
            <div className="flex space-x-2 pt-2">
              <Button 
                size="sm" 
                onClick={() => handleDoctorApproval(request.id, 'approve')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleDoctorApproval(request.id, 'reject')}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const renderStaffLeaveCard = (request: StaffLeaveRequest) => (
    <Card key={request.id} className="border-l-4 border-l-green-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="font-semibold">{request.staff_name}</span>
              <Badge className={getLeaveTypeColor(request.leave_type)}>
                {request.leave_type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {request.role}
              </Badge>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(request.start_date)} - {formatDate(request.end_date)}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span>Department: {request.department}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>Mobile: {request.staff_mobile}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStaffStatusBadge(request.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium mb-1">Reason:</h4>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
              {request.reason}
            </p>
          </div>
          
          <div className="text-xs text-gray-500">
            Requested on: {formatDate(request.created_at)}
          </div>

          {request.status === 'Pending' && (
            <div className="flex space-x-2 pt-2">
              <Button 
                size="sm" 
                onClick={() => handleStaffApproval(request.id, 'approve')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleStaffApproval(request.id, 'reject')}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-gray-600">Manage doctor and staff leave requests and approvals</p>
        </div>
        <Button onClick={refreshAll} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="doctor" className="flex items-center space-x-2">
            <Stethoscope className="h-4 w-4" />
            <span>Doctor Leave ({doctorLeaveRequests.length})</span>
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Staff Leave ({staffLeaveRequests.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="doctor" className="space-y-4">
          <Tabs value={doctorStatusTab} onValueChange={setDoctorStatusTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">
                Pending ({doctorLeaveRequests.filter(r => r.status === 'pending').length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({doctorLeaveRequests.filter(r => r.status === 'approved').length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({doctorLeaveRequests.filter(r => r.status === 'rejected').length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({doctorLeaveRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={doctorStatusTab} className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading doctor leave requests...</p>
                </div>
              ) : getFilteredDoctorRequests().length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No doctor leave requests found</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {getFilteredDoctorRequests().map(renderDoctorLeaveCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Tabs value={staffStatusTab} onValueChange={setStaffStatusTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">
                Pending ({staffLeaveRequests.filter(r => r.status === 'Pending').length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({staffLeaveRequests.filter(r => r.status === 'Approved').length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({staffLeaveRequests.filter(r => r.status === 'Rejected').length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({staffLeaveRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={staffStatusTab} className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading staff leave requests...</p>
                </div>
              ) : getFilteredStaffRequests().length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No staff leave requests found</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {getFilteredStaffRequests().map(renderStaffLeaveCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}
