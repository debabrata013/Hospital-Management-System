"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, UserCheck, Download, Filter } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { useAuth } from "@/hooks/useAuth"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import jsPDF from "jspdf"
import autoTable from 'jspdf-autotable'


export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [statusFilter, setStatusFilter] = useState("all")
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const { authState } = useAuth()
  const user = authState?.user

  // Fetch attendance data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/staff/attendance");
        const data = await response.json();
        if (data.success) {
          setAttendanceData(data.attendance);
        } else {
          console.error("Failed to fetch attendance data:", data.error);
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter attendance based on status and month
  const filteredAttendance = attendanceData.filter(record => {
    const recordDate = new Date(record.date)
    const monthMatch = recordDate.getMonth() === currentMonth.getMonth() && 
                       recordDate.getFullYear() === currentMonth.getFullYear()
    
    if (statusFilter === "all") {
      return monthMatch
    }
    
    return monthMatch && record.status === statusFilter
  })

  // Sort by date (newest first)
  const sortedAttendance = [...filteredAttendance].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  // Get stats for the current month
  const monthlyStats = {
    present: filteredAttendance.filter(r => r.status === 'present').length,
    late: filteredAttendance.filter(r => r.status === 'late').length,
    absent: filteredAttendance.filter(r => r.status === 'absent').length,
    total: filteredAttendance.length
  }

  // Navigate between months
  const previousMonth = () => {
    const prev = new Date(currentMonth)
    prev.setMonth(prev.getMonth() - 1)
    setCurrentMonth(prev)
  }

  const nextMonth = () => {
    const next = new Date(currentMonth)
    next.setMonth(next.getMonth() + 1)
    setCurrentMonth(next)
  }

  // Get today's date
  const today = new Date().toISOString().split('T')[0]
  const todayRecord = attendanceData.find(r => r.date === today)

  // PDF Export Function
  const handleExportPDF = () => {
    const doc = new jsPDF()
    const tableColumn = ["Date", "Day", "Check In", "Check Out", "Hours", "Status"]
    const tableRows: (string | number)[][] = []

    sortedAttendance.forEach(record => {
      let hoursWorked = '—'
      if (record.checkIn && record.checkOut) {
        const checkIn = new Date(`2023-01-01T${record.checkIn}`)
        const checkOut = new Date(`2023-01-01T${record.checkOut}`)
        const diff = (checkOut.getTime() - checkIn.getTime()) / 1000 / 60 / 60
        hoursWorked = diff.toFixed(1)
      }

      const ticketData = [
        format(new Date(record.date), 'dd MMM yyyy'),
        format(new Date(record.date), 'EEEE'),
        record.checkIn ? record.checkIn.substring(0, 5) : '—',
        record.checkOut ? record.checkOut.substring(0, 5) : '—',
        hoursWorked,
        record.status.charAt(0).toUpperCase() + record.status.slice(1) // Capitalize status
      ];
      tableRows.push(ticketData)
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      didDrawPage: function(data: any) {
        // Header
        doc.setFontSize(20)
        doc.setTextColor(40)
        doc.text(`Attendance Report - ${format(currentMonth, 'MMMM yyyy')}`, data.settings.margin.left, 15)
      }
    })
    doc.save(`attendance_report_${format(currentMonth, 'MM_yyyy')}.pdf`);
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/staff">
            <Button variant="outline" className="flex items-center">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Record</h1>
            <p className="text-gray-500">View and track your attendance history</p>
          </div>
        </div>
      </div>

      {/* Today's Status Card */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center">
            <Clock className="h-6 w-6 mr-2 text-pink-500" />
            Today's Status
          </CardTitle>
          <CardDescription>Your attendance for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 p-4 rounded-lg bg-gray-50 border border-gray-200">
              <h3 className="font-medium text-gray-700">Date</h3>
              <p className="text-lg font-semibold mt-1">
                {format(new Date(), 'PPP')}
              </p>
              <p className="text-sm text-gray-500">
                {format(new Date(), 'EEEE')}
              </p>
            </div>

            <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <h3 className="font-medium text-gray-700">Check In</h3>
                <p className="text-lg font-semibold mt-1">
                  {todayRecord?.checkIn ? todayRecord.checkIn.substring(0, 5) : '—'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <h3 className="font-medium text-gray-700">Check Out</h3>
                <p className="text-lg font-semibold mt-1">
                  {todayRecord?.checkOut ? todayRecord.checkOut.substring(0, 5) : '—'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <h3 className="font-medium text-gray-700">Status</h3>
                <div className="mt-2">
                  {todayRecord ? (
                    todayRecord.status === 'present' ? (
                      <Badge className="bg-green-100 text-green-700">Present</Badge>
                    ) : todayRecord.status === 'late' ? (
                      <Badge className="bg-yellow-100 text-yellow-700">Late</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700">Absent</Badge>
                    )
                  ) : (
                    <Badge className="bg-gray-100 text-gray-700">Not Recorded</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Note: Attendance is automatically recorded by the system. If you believe there's an error, please contact HR.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Attendance */}
      <Card className="border-pink-100">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold flex items-center">
              <UserCheck className="h-6 w-6 mr-2 text-pink-500" />
              Monthly Attendance
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-2">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>Your attendance records for {format(currentMonth, 'MMMM yyyy')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Stats */}
            <div className="lg:col-span-1 space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <h3 className="font-medium text-green-800">Present</h3>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-2xl font-bold">{monthlyStats.present}</p>
                    <p className="text-sm text-gray-500">
                      {monthlyStats.total ? Math.round((monthlyStats.present / monthlyStats.total) * 100) : 0}%
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                  <h3 className="font-medium text-yellow-800">Late</h3>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-2xl font-bold">{monthlyStats.late}</p>
                    <p className="text-sm text-gray-500">
                      {monthlyStats.total ? Math.round((monthlyStats.late / monthlyStats.total) * 100) : 0}%
                    </p>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                  <h3 className="font-medium text-red-800">Absent</h3>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-2xl font-bold">{monthlyStats.absent}</p>
                    <p className="text-sm text-gray-500">
                      {monthlyStats.total ? Math.round((monthlyStats.absent / monthlyStats.total) * 100) : 0}%
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="font-medium text-blue-800">Working Days</h3>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-2xl font-bold">{monthlyStats.total}</p>
                    <p className="text-sm text-gray-500">This Month</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-2">Quick Filters</h3>
                <div className="space-y-2">
                  <Button 
                    variant={statusFilter === "all" ? "default" : "outline"} 
                    className="w-full justify-start" 
                    onClick={() => setStatusFilter("all")}
                  >
                    All Records
                  </Button>
                  <Button 
                    variant={statusFilter === "present" ? "default" : "outline"} 
                    className="w-full justify-start text-green-700"
                    onClick={() => setStatusFilter("present")}
                  >
                    Present Only
                  </Button>
                  <Button 
                    variant={statusFilter === "late" ? "default" : "outline"} 
                    className="w-full justify-start text-yellow-700"
                    onClick={() => setStatusFilter("late")}
                  >
                    Late Only
                  </Button>
                  <Button 
                    variant={statusFilter === "absent" ? "default" : "outline"} 
                    className="w-full justify-start text-red-700"
                    onClick={() => setStatusFilter("absent")}
                  >
                    Absent Only
                  </Button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                </div>
              ) : sortedAttendance.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedAttendance.map((record, index) => {
                        // Calculate hours worked
                        let hoursWorked = '—'
                        if (record.checkIn && record.checkOut) {
                          const checkIn = new Date(`2023-01-01T${record.checkIn}`)
                          const checkOut = new Date(`2023-01-01T${record.checkOut}`)
                          const diff = (checkOut.getTime() - checkIn.getTime()) / 1000 / 60 / 60
                          hoursWorked = diff.toFixed(1)
                        }
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {format(new Date(record.date), 'dd MMM yyyy')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {format(new Date(record.date), 'EEEE')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {record.checkIn ? record.checkIn.substring(0, 5) : '—'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {record.checkOut ? record.checkOut.substring(0, 5) : '—'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {hoursWorked}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {record.status === 'present' && (
                                <Badge className="bg-green-100 text-green-700">Present</Badge>
                              )}
                              {record.status === 'late' && (
                                <Badge className="bg-yellow-100 text-yellow-700">Late</Badge>
                              )}
                              {record.status === 'absent' && (
                                <Badge className="bg-red-100 text-red-700">Absent</Badge>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
                  <CalendarIcon className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-gray-500">No attendance records found for this month</p>
                </div>
              )}

              {/* Export Button */}
                <div className="flex justify-end mt-4">
                    <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-pink-500 hover:bg-pink-600">
                                <Download className="h-4 w-4 mr-2" />
                                Export Attendance
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Export Attendance PDF</DialogTitle>
                                <DialogDescription>
                                    Your attendance report for {format(currentMonth, 'MMMM yyyy')} is ready. Click the download button to save it.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setExportDialogOpen(false)}>Cancel</Button>
                                <Button className="bg-pink-500 hover:bg-pink-600" onClick={() => {
                                    handleExportPDF();
                                    setExportDialogOpen(false);
                                }}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PDF
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
