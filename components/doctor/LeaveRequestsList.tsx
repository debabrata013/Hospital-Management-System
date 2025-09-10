"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  User, 
  Phone, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause
} from "lucide-react"
// Using native date formatting instead of date-fns for simplicity
import toast from "react-hot-toast"

interface LeaveRequest {
  id: number
  leave_type: string
  start_date: string
  end_date: string
  start_time?: string
  end_time?: string
  is_full_day: boolean
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approved_by?: string
  approved_by_name?: string
  approved_at?: string
  rejection_reason?: string
  emergency_contact?: string
  replacement_doctor?: string
  replacement_doctor_name?: string
  created_at: string
  updated_at: string
}

interface LeaveRequestsListProps {
  onEdit?: (request: LeaveRequest) => void
  refreshTrigger?: number
}

export default function LeaveRequestsList({ onEdit, refreshTrigger }: LeaveRequestsListProps) {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true)
      console.log('Fetching leave requests...')
      const response = await fetch('/api/doctor/leave-requests')
      console.log('Fetch response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Fetch error:', errorData)
        throw new Error(errorData.error || 'Failed to fetch leave requests')
      }
      
      const data = await response.json()
      console.log('Fetched leave requests:', data)
      setLeaveRequests(data)
    } catch (error) {
      console.error('Error fetching leave requests:', error)
      toast.error('Failed to load leave requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaveRequests()
  }, [refreshTrigger])

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this leave request?')) {
      return
    }

    try {
      const response = await fetch(`/api/doctor/leave-requests/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to cancel leave request')
      }

      toast.success('Leave request cancelled successfully')
      fetchLeaveRequests()
    } catch (error) {
      console.error('Error cancelling leave request:', error)
      toast.error('Failed to cancel leave request')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Pause className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getLeaveTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      sick_leave: "Sick Leave",
      vacation: "Vacation",
      emergency: "Emergency",
      personal: "Personal",
      conference: "Conference/Training",
      other: "Other"
    }
    return types[type] || type
  }

  const formatDateRange = (startDate: string, endDate: string, startTime?: string, endTime?: string, isFullDay?: boolean) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start.toDateString() === end.toDateString()) {
      // Same day
      if (isFullDay) {
        return start.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      } else {
        return `${start.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} (${startTime || 'N/A'} - ${endTime || 'N/A'})`
      }
    } else {
      // Multiple days
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    }
  }

  if (loading) {
    return (
      <Card className="border-pink-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            <span className="ml-2">Loading leave requests...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-pink-100">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-pink-600" />
          My Leave Requests
        </CardTitle>
        <CardDescription>
          View and manage your submitted leave requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {leaveRequests.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No leave requests found</p>
            <p className="text-sm text-gray-400">Submit your first leave request above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaveRequests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-pink-100 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {getLeaveTypeLabel(request.leave_type)}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatDateRange(
                          request.start_date,
                          request.end_date,
                          request.start_time,
                          request.end_time,
                          request.is_full_day
                        )}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Reason:</strong> {request.reason}
                  </p>
                  
                  {request.emergency_contact && (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Emergency Contact: {request.emergency_contact}
                    </p>
                  )}
                  
                  {request.replacement_doctor_name && (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Replacement: {request.replacement_doctor_name}
                    </p>
                  )}
                </div>

                {request.status === 'approved' && request.approved_by_name && (
                  <div className="bg-green-50 border border-green-200 rounded p-2 mb-3">
                    <p className="text-sm text-green-700">
                      <CheckCircle className="h-3 w-3 inline mr-1" />
                      Approved by {request.approved_by_name}
                      {request.approved_at && (
                        <span className="text-green-600">
                          {' '}on {new Date(request.approved_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {request.status === 'rejected' && (
                  <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
                    <p className="text-sm text-red-700">
                      <XCircle className="h-3 w-3 inline mr-1" />
                      Request rejected
                    </p>
                    {request.rejection_reason && (
                      <p className="text-sm text-red-600 mt-1">
                        Reason: {request.rejection_reason}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Submitted: {new Date(request.created_at).toLocaleString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit?.(request)}
                        className="h-8 px-3 text-xs border-pink-200 text-pink-600 hover:bg-pink-50"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel(request.id)}
                        className="h-8 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
