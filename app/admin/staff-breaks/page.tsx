"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Clock, 
  User, 
  FileText,
  RefreshCw,
  Calendar as CalendarIcon
} from 'lucide-react'
import { format, intervalToDuration } from 'date-fns'

interface Break {
  id: number
  user_id: number
  staff_name: string
  staff_mobile: string
  department: string
  role: string
  start_time: string
  end_time: string | null
  duration: number | null
  created_at: string
  updated_at: string
}

export default function StaffBreaksPage() {
  const [breaks, setBreaks] = useState<Break[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    fetchBreaks()
  }, [selectedDate])

  const fetchBreaks = async () => {
    try {
      setLoading(true)
      const url = selectedDate 
        ? `/api/admin/staff/breaks?date=${selectedDate}`
        : '/api/admin/staff/breaks'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setBreaks(data.breaks || [])
      }
    } catch (error) {
      console.error('Error fetching staff breaks:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (totalSeconds: number | null) => {
    if (!totalSeconds) return '-'
    if (totalSeconds < 0) totalSeconds = 0
    const duration = intervalToDuration({ start: 0, end: totalSeconds * 1000 })
    const hours = (duration.hours ?? 0).toString().padStart(2, '0')
    const minutes = (duration.minutes ?? 0).toString().padStart(2, '0')
    const seconds = (duration.seconds ?? 0).toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'doctor':
        return 'bg-blue-100 text-blue-700'
      case 'nurse':
        return 'bg-green-100 text-green-700'
      case 'staff':
        return 'bg-purple-100 text-purple-700'
      case 'receptionist':
        return 'bg-orange-100 text-orange-700'
      case 'cleaning_staff':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const activeBreaks = breaks.filter(b => !b.end_time)
  const completedBreaks = breaks.filter(b => b.end_time)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Staff Break Management</h1>
          <p className="text-gray-600">Monitor staff break times and durations</p>
        </div>
        <Button onClick={fetchBreaks} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter by Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="space-y-2">
              <Label htmlFor="date-filter">Select Date</Label>
              <Input
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-48"
              />
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Active Breaks: {activeBreaks.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Completed Breaks: {completedBreaks.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {activeBreaks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-red-500" />
              <span>Active Breaks ({activeBreaks.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {activeBreaks.map((breakItem) => (
                <Card key={breakItem.id} className="border-l-4 border-l-red-500">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span className="font-semibold">{breakItem.staff_name}</span>
                          <Badge className={getRoleBadgeColor(breakItem.role)}>
                            {breakItem.role}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Department: {breakItem.department}</span>
                          <span>Mobile: {breakItem.staff_mobile}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Started at: {formatTime(breakItem.start_time)}
                        </div>
                      </div>
                      <Badge variant="destructive" className="animate-pulse">
                        On Break
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Break History for {formatDate(selectedDate)}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading break records...</p>
            </div>
          ) : completedBreaks.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No completed breaks found for this date</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Mobile</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedBreaks.map((breakItem) => (
                  <TableRow key={breakItem.id}>
                    <TableCell className="font-medium">{breakItem.staff_name}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(breakItem.role)}>
                        {breakItem.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{breakItem.department}</TableCell>
                    <TableCell>{formatTime(breakItem.start_time)}</TableCell>
                    <TableCell>
                      {breakItem.end_time ? formatTime(breakItem.end_time) : '-'}
                    </TableCell>
                    <TableCell className="font-mono">
                      {formatDuration(breakItem.duration)}
                    </TableCell>
                    <TableCell>{breakItem.staff_mobile}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
