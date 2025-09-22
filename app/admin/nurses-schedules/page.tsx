"use client"

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { toast } from 'sonner'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  Plus, 
  RefreshCw,
  User,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface Nurse {
  id: number
  name: string
  email: string
  mobile: string
  specialization?: string
  department?: string
  is_active: boolean
}

interface NurseSchedule {
  id: number
  nurse_id: number
  nurse_name: string
  shift_date: string | null
  start_date: string | null
  end_date: string | null
  start_time: string
  end_time: string
  ward_assignment: string
  shift_type: string
  status: 'Scheduled' | 'active' | 'completed' | 'cancelled' | string
  max_patients: number
  current_patients: number
  created_at: string
}

interface CreateScheduleData {
  nurseId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  shiftType: string;
}

const groupSchedules = (schedules: NurseSchedule[]) => {
  const scheduleGroups = new Map<string, NurseSchedule[]>();

  // Group schedules by properties that define a continuous range
  schedules.forEach(schedule => {
    const key = `${schedule.start_time}|${schedule.end_time}|${schedule.shift_type}|${schedule.ward_assignment}`;
    if (!scheduleGroups.has(key)) {
      scheduleGroups.set(key, []);
    }
    scheduleGroups.get(key)!.push(schedule);
  });

  const consolidatedSchedules: NurseSchedule[] = [];

  // Find consecutive date ranges within each group
  scheduleGroups.forEach(group => {
    if (group.length > 0) {
      group.sort((a, b) => new Date(a.shift_date!).getTime() - new Date(b.shift_date!).getTime());
      
      let currentRange = { ...group[0], start_date: group[0].shift_date, end_date: group[0].shift_date };

      for (let i = 1; i < group.length; i++) {
        const currentDate = new Date(group[i].shift_date!);
        const prevDate = new Date(currentRange.end_date!);
        prevDate.setDate(prevDate.getDate() + 1);

        if (currentDate.getTime() === prevDate.getTime()) {
          // Consecutive day, extend the range
          currentRange.end_date = group[i].shift_date;
        } else {
          // Not consecutive, push the completed range and start a new one
          consolidatedSchedules.push(currentRange);
          currentRange = { ...group[i], start_date: group[i].shift_date, end_date: group[i].shift_date };
        }
      }
      // Push the last range for the group
      consolidatedSchedules.push(currentRange);
    }
  });

  return consolidatedSchedules;
};

export default function NursesSchedulesPage() {
  const [nurses, setNurses] = useState<Nurse[]>([])
  const [schedules, setSchedules] = useState<NurseSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingNurses, setLoadingNurses] = useState(false)
  const [loadingSchedules, setLoadingSchedules] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<NurseSchedule | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingSchedule, setViewingSchedule] = useState<NurseSchedule | null>(null)
  const [nurseSearch, setNurseSearch] = useState('')
  const handleViewSchedule = (schedule: NurseSchedule) => {
    setViewingSchedule(schedule)
    setIsViewModalOpen(true)
  }
  const [formData, setFormData] = useState<CreateScheduleData>({
    nurseId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    startTime: '06:00',
    endTime: '14:00',
    shiftType: 'Morning',
  });

  // Stats - Calculate available nurses dynamically
  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}` // YYYY-MM-DD format
  }

  const getAvailableNurses = () => {
    const today = getTodayDate()
    const scheduledTodayNurseIds = schedules
      .filter(s => {
        // Convert shift_date to YYYY-MM-DD format for comparison
        const shiftDate = s.shift_date ? new Date(s.shift_date).toISOString().split('T')[0] : null
        return shiftDate === today && (s.status.toLowerCase() === 'scheduled' || s.status.toLowerCase() === 'active')
      })
      .map(s => s.nurse_id)
    
    // Remove duplicates and return count of available nurses
    const uniqueScheduledIds = [...new Set(scheduledTodayNurseIds)]
    return nurses.filter(n => !uniqueScheduledIds.includes(n.id)).length
  }

  const stats = {
    totalScheduled: schedules.length,
    availableNurses: getAvailableNurses(),
    lastUpdated: new Date()
  }

  // Group schedules to compute date ranges (by nurse, time, ward, shift type)
  const scheduleRanges = useMemo(() => {
    const map = new Map<string, { min: string; max: string }>()
    for (const s of schedules) {
      const date = s.shift_date
      if (date) {
        const key = `${s.nurse_id}|${s.start_time}|${s.end_time}|${s.ward_assignment}|${s.shift_type}`
        const entry = map.get(key)
        if (!entry) {
          map.set(key, { min: date, max: date })
        } else {
          if (date < entry.min) entry.min = date
          if (date > entry.max) entry.max = date
        }
      }
    }
    return map
  }, [schedules])

  // Load nurses and schedules
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    await Promise.all([loadNurses(), loadSchedules()])
    setLoading(false)
  }

  const loadNurses = async () => {
    try {
      setLoadingNurses(true)
      console.log('🔄 Loading nurses...');
      // Construct absolute URL to prevent deployment issues
      const apiUrl = new URL('/api/admin/nurses', window.location.origin);
      const response = await fetch(apiUrl, { cache: 'no-store' });
      console.log('👥 Nurses API response status:', response.status);
      if (response.ok) {
        const data = await response.json()
        console.log('👥 Nurses data received:', data);
        setNurses(data.nurses || [])
        console.log('👥 Nurses set in state:', data.nurses?.length || 0);
      } else {
        console.log('❌ Failed to load nurses, status:', response.status);
        toast.error('Failed to load nurses')
      }
    } catch (error) {
      console.error('Error loading nurses:', error)
      toast.error('Error loading nurses')
    } finally {
      setLoadingNurses(false)
    }
  }

  const loadSchedules = async () => {
    try {
      setLoadingSchedules(true)
      console.log('📅 Loading schedules...');
      const response = await fetch('/api/admin/nurses-schedules', { cache: 'no-store' })
      console.log('📅 Schedules API response status:', response.status);
      if (response.ok) {
        const data = await response.json()
        console.log('📅 Schedules data received:', data);
        setSchedules(data.schedules || [])
        console.log('📅 Schedules set in state:', data.schedules?.length || 0);
      } else {
        console.log('❌ Failed to load schedules, status:', response.status);
        toast.error('Failed to load schedules')
      }
    } catch (error) {
      console.error('Error loading schedules:', error)
      toast.error('Error loading schedules')
    } finally {
      setLoadingSchedules(false)
    }
  }

  const handleCreateSchedule = async () => {
    try {
      console.log('🚀 Create Schedule clicked!');
      console.log('📊 Form data:', formData);
      console.log('👥 Available nurses:', nurses.length);
      
      // Validation
      if (!formData.nurseId || !formData.startDate || !formData.endDate || !formData.startTime || !formData.endTime) {
        console.log('❌ Validation failed - missing required fields:', {
          nurseId: !!formData.nurseId,
          startDate: !!formData.startDate,
          endDate: !!formData.endDate,
          startTime: !!formData.startTime,
          endTime: !!formData.endTime
        });
        toast.error('Please fill in all required fields')
        return
      }

      if (formData.startTime >= formData.endTime) {
        console.log('❌ Time validation failed:', formData.startTime, '>=', formData.endTime);
        toast.error('End time must be after start time')
        return
      }

      if (formData.startDate > formData.endDate) {
        console.log('❌ Date range validation failed:', formData.startDate, '>', formData.endDate);
        toast.error('End date must be on or after start date')
        return
      }

      console.log('✅ All validations passed, creating schedule...');

      const selectedNurse = nurses.find(n => n.id.toString() === formData.nurseId);
      if (!selectedNurse) {
        toast.error('Selected nurse not found.');
        return;
      }

      const requestBody = {
        nurseId: parseInt(formData.nurseId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        shiftType: formData.shiftType,
      };
      
      console.log('📤 Sending request:', requestBody);

      const response = await fetch('/api/admin/nurses-schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('📥 API Response status:', response.status);
      
      if (response.ok) {
        const successData = await response.json();
        console.log('✅ Success response:', successData);
        const created = successData.createdCount ?? 1;
        const skipped = successData.skippedCount ?? 0;
        toast.success(`Created ${created} schedule(s)${skipped ? `, skipped ${skipped}` : ''}`)
        setIsCreateModalOpen(false)
        setFormData({
          nurseId: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          startTime: '06:00',
          endTime: '14:00',
          shiftType: 'Morning',
        })
        loadSchedules()
      } else {
        const errorData = await response.json()
        console.log('❌ Error response:', errorData);
        toast.error(errorData.error || 'Failed to create schedule')
      }
    } catch (error) {
      console.error('Error creating schedule:', error)
      toast.error('Failed to create schedule')
    }
  }

  const handleUpdateSchedule = async () => {
    if (!editingSchedule) return;

    const selectedNurse = nurses.find(n => n.id === editingSchedule.nurse_id);

    try {
      const response = await fetch(`/api/admin/nurses-schedules/${editingSchedule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: formData.startDate,
          endDate: formData.endDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          shiftType: formData.shiftType,
          applyToRange: true
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const updated = data.updatedCount ?? 1;
        const created = data.createdCount ?? 0;
        toast.success(`Updated ${updated} schedule(s)${created ? `, created ${created}` : ''}`)
        setIsEditModalOpen(false)
        setEditingSchedule(null)
        loadSchedules()
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update schedule');
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Failed to update schedule');
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return

    try {
      const response = await fetch(`/api/admin/nurses-schedules/${scheduleId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Schedule deleted successfully!')
        loadSchedules()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to delete schedule')
      }
    } catch (error) {
      console.error('Error deleting schedule:', error)
      toast.error('Failed to delete schedule')
    }
  }

  const handleEditSchedule = (schedule: NurseSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      nurseId: schedule.nurse_id.toString(),
      startDate: schedule.start_date || schedule.shift_date || '',
      endDate: schedule.end_date || schedule.shift_date || '',
      startTime: schedule.start_time,
      endTime: schedule.end_time,
      shiftType: schedule.shift_type,
    });
    setIsEditModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-700"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>
      case 'active':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-700"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const getShiftTypeColor = (shiftType: string) => {
    switch (shiftType) {
      case 'Morning':
        return 'bg-orange-100 text-orange-700'
      case 'Evening':
        return 'bg-blue-100 text-blue-700'
      case 'Night':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = ((hour + 11) % 12) + 1
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`
  }

  const filteredNurses = nurses.filter(nurse => 
    nurse.name.toLowerCase().includes(nurseSearch.toLowerCase()) ||
    (nurse.mobile && nurse.mobile.includes(nurseSearch))
  );

  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const nurseName = schedule.nurse_name;
    if (!acc[nurseName]) {
      acc[nurseName] = [];
    }
    acc[nurseName].push(schedule);
    return acc;
  }, {} as Record<string, NurseSchedule[]>);
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4 sm:p-6">
      {/* Header */}
        <Link href="/admin" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
  <ArrowLeft className="h-4 w-4 mr-2" />
  Back to Dashboard
</Link>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <UserCheck className="h-8 w-8 mr-2 sm:mr-3 text-pink-500" />
            Nurses Schedules Management
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Manage nurse schedules, shifts, and ward assignments
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button 
            onClick={loadData} 
            variant="outline" 
            className="flex items-center gap-2 border-pink-200"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={(isOpen) => {
              setIsCreateModalOpen(isOpen);
              if (isOpen) {
                setNurseSearch(''); // Reset search on open
              }
            }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 w-full sm:w-auto flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" />
                Create Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Create Nurse Schedule
                </DialogTitle>
                <DialogDescription>
                  Assign a nurse to a specific shift
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="nurseId">Nurse *</Label>
                  <Select value={formData.nurseId} onValueChange={(value) => setFormData(prev => ({ ...prev, nurseId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a nurse">
                        {formData.nurseId ? nurses.find(n => n.id.toString() === formData.nurseId)?.name : null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Search by name or mobile..."
                          value={nurseSearch}
                          onChange={(e) => setNurseSearch(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      {filteredNurses.map((nurse) => (
                        <SelectItem key={nurse.id} value={nurse.id.toString()}>
                          {nurse.name} - {nurse.mobile}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      min={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      required
                    />
                  </div>
                </div>


                <div className="space-y-2">
                  <Label htmlFor="shiftType">Shift Type</Label>
                  <Select value={formData.shiftType} onValueChange={(value) => setFormData(prev => ({ ...prev, shiftType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Morning">Morning Shift</SelectItem>
                      <SelectItem value="Evening">Evening Shift</SelectItem>
                      <SelectItem value="Night">Night Shift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>


              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSchedule} className="bg-pink-500 hover:bg-pink-600">
                  Create Schedule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Nurses</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.availableNurses}
                </p>
                <p className="text-xs text-gray-500 mt-1">Active in system</p>
              </div>
              <Calendar className="h-6 sm:h-8 w-6 sm:w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Nurses</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                  {loading ? '...' : stats.availableNurses}
                </p>
                <p className="text-xs text-gray-500 mt-1">Active in system</p>
              </div>
              <UserCheck className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs text-gray-500 mt-1">Real-time data</p>
              </div>
              <RefreshCw className="h-6 sm:h-8 w-6 sm:w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedules List */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle>Nurse Schedules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : schedules.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(groupedSchedules).map(([nurseName, nurseSchedules]) => {
                const uniqueSchedules = groupSchedules(nurseSchedules);
                return (
                <AccordionItem value={nurseName} key={nurseName}>
                  <AccordionTrigger className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-lg h-12 w-12 flex items-center justify-center font-bold">
                        <UserCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{nurseName}</h3>
                        <p className="text-sm text-gray-500">{nurseSchedules.length} schedule(s)</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4">
                    <div className="space-y-4">
                      {uniqueSchedules.map((schedule) => (
                        <div key={schedule.id} className="p-4 sm:p-5 border border-pink-100 rounded-lg hover:shadow-md transition-all duration-200">
                          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline">ID: {schedule.id}</Badge>
                                  <Badge className={getShiftTypeColor(schedule.shift_type)}>{schedule.shift_type}</Badge>
                                  {getStatusBadge(schedule.status)}
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-pink-500" />
                                    <span>
                                      {schedule.start_date && schedule.end_date && schedule.start_date !== schedule.end_date
                                        ? `${new Date(schedule.start_date).toLocaleDateString()} - ${new Date(schedule.end_date).toLocaleDateString()}`
                                        : new Date(schedule.start_date || schedule.shift_date!).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-pink-500" />
                                    <span>{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-pink-500" />
                                    <span>{schedule.ward_assignment}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleViewSchedule(schedule)} className="border-green-200 text-green-600 hover:bg-green-50">
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleEditSchedule(schedule)} className="border-blue-200 text-blue-600 hover:bg-blue-50">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleDeleteSchedule(schedule.id)} className="border-red-200 text-red-600 hover:bg-red-50">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            )}
            </Accordion>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No nurse schedules found</p>
              <p className="text-gray-400 text-sm">Create your first nurse schedule using the button above</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Schedule Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Nurse Schedule Details
            </DialogTitle>
            <DialogDescription>
              Details for {viewingSchedule?.nurse_name}
            </DialogDescription>
          </DialogHeader>
          {viewingSchedule && (
            <div className="space-y-3 py-2">
              <div><b>ID:</b> {viewingSchedule.id}</div>
              <div><b>Date:</b> {viewingSchedule.shift_date}</div>
              <div><b>Shift:</b> {viewingSchedule.shift_type} ({viewingSchedule.start_time} - {viewingSchedule.end_time})</div>
              <div><b>Status:</b> <Badge>{viewingSchedule.status}</Badge></div>
              <div><b>Ward:</b> {viewingSchedule.ward_assignment}</div>
              <div><b>Patients:</b> {viewingSchedule.current_patients}/{viewingSchedule.max_patients}</div>
              <div><b>Created At:</b> {viewingSchedule.created_at}</div>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Nurse Schedule
            </DialogTitle>
            <DialogDescription>
              Update the schedule details for {editingSchedule?.nurse_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date *</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date *</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  min={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startTime">Start Time *</Label>
                <Input
                  id="edit-startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endTime">End Time *</Label>
                <Input
                  id="edit-endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-shiftType">Shift Type</Label>
              <Select value={formData.shiftType} onValueChange={(value) => setFormData(prev => ({ ...prev, shiftType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Morning">Morning Shift</SelectItem>
                  <SelectItem value="Evening">Evening Shift</SelectItem>
                  <SelectItem value="Night">Night Shift</SelectItem>
                </SelectContent>
              </Select>
            </div>

            
                      </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSchedule} className="bg-pink-500 hover:bg-pink-600">
              Update Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}