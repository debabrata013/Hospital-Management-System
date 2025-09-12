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
  AlertCircle,
  RefreshCw
} from 'lucide-react'

interface LeaveRequest {
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

export default function LeaveManagementPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/leave-requests')
      if (response.ok) {
        const data = await response.json()
        setLeaveRequests(data.leaveRequests || [])
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (requestId: number, action: 'approve' | 'reject') => {
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
        // Refresh the list
        fetchLeaveRequests()
      } else {
        console.error('Failed to update leave request')
      }
    } catch (error) {
      console.error('Error updating leave request:', error)
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

  const getStatusBadge = (status: string) => {
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

  const getLeaveTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sick':
        return 'bg-red-100 text-red-700'
      case 'vacation':
        return 'bg-blue-100 text-blue-700'
      case 'emergency':
        return 'bg-orange-100 text-orange-700'
      case 'personal':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredRequests = leaveRequests.filter(request => {
    if (activeTab === 'pending') return request.status === 'pending'
    if (activeTab === 'approved') return request.status === 'approved'
    if (activeTab === 'rejected') return request.status === 'rejected'
    return true
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-gray-600">Manage doctor leave requests and approvals</p>
        </div>
        <Button onClick={fetchLeaveRequests} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending ({leaveRequests.filter(r => r.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({leaveRequests.filter(r => r.status === 'approved').length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({leaveRequests.filter(r => r.status === 'rejected').length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({leaveRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading leave requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No leave requests found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
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
                        {getStatusBadge(request.status)}
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
                            onClick={() => handleApproval(request.id, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleApproval(request.id, 'reject')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
