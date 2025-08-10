"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  Stethoscope,
  Users,
  AlertTriangle,
  Filter,
  Eye,
  CalendarDays,
  Timer
} from 'lucide-react'
import Link from 'next/link'
import { format } from "date-fns"

interface Appointment {
  id: string
  patientId: string
  patientName: string
  phone: string
  doctorId: string
  doctorName: string
  department: string
  appointmentDate: string
  appointmentTime: string
  duration: number
  type: 'consultation' | 'follow-up' | 'emergency' | 'procedure'
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  priority: 'normal' | 'high' | 'urgent'
  notes: string
  createdBy: string
  createdAt: string
}

interface Doctor {
  id: string
  name: string
  department: string
  specialization: string
  availableSlots: string[]
  consultationFee: number
  status: 'available' | 'busy' | 'unavailable'
}

const mockDoctors: Doctor[] = [
  {
    id: "D001",
    name: "Dr. Anil Kumar",
    department: "General Medicine",
    specialization: "General Medicine",
    availableSlots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30"],
    consultationFee: 500,
    status: "available"
  },
  {
    id: "D002", 
    name: "Dr. Priya Singh",
    department: "Gynecology",
    specialization: "Gynecology",
    availableSlots: ["10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00"],
    consultationFee: 800,
    status: "available"
  },
  {
    id: "D003",
    name: "Dr. Rajesh Gupta", 
    department: "Emergency",
    specialization: "Emergency Medicine",
    availableSlots: ["24/7"],
    consultationFee: 1000,
    status: "available"
  }
]

const mockAppointments: Appointment[] = [
  {
    id: "A001",
    patientId: "P001",
    patientName: "Ram Sharma",
    phone: "+91 98765 43210",
    doctorId: "D001",
    doctorName: "Dr. Anil Kumar",
    department: "General Medicine",
    appointmentDate: "2024-01-15",
    appointmentTime: "10:00",
    duration: 30,
    type: "consultation",
    status: "scheduled",
    priority: "normal",
    notes: "Regular checkup appointment",
    createdBy: "Reception-1",
    createdAt: "2024-01-14T10:30:00Z"
  },
  {
    id: "A002",
    patientId: "P002", 
    patientName: "Sunita Devi",
    phone: "+91 98765 43211",
    doctorId: "D002",
    doctorName: "Dr. Priya Singh",
    department: "Gynecology",
    appointmentDate: "2024-01-15",
    appointmentTime: "11:00",
    duration: 30,
    type: "follow-up",
    status: "confirmed",
    priority: "normal",
    notes: "Follow-up checkup appointment",
    createdBy: "Reception-1",
    createdAt: "2024-01-14T11:00:00Z"
  }
]

export default function AppointmentBooking() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>(mockAppointments)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [doctorFilter, setDoctorFilter] = useState("all")

  // New appointment form state
  const [newAppointment, setNewAppointment] = useState({
    patientId: "",
    patientName: "",
    patientNameHindi: "",
    phone: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    type: "consultation" as const,
    priority: "normal" as const,
    notes: ""
  })

  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)

  // Filter appointments
  useEffect(() => {
    let filtered = appointments

    if (searchQuery) {
      filtered = filtered.filter(apt => 
        apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.patientNameHindi.includes(searchQuery) ||
        apt.phone.includes(searchQuery) ||
        apt.doctorName.includes(searchQuery)
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    if (doctorFilter !== "all") {
      filtered = filtered.filter(apt => apt.doctorId === doctorFilter)
    }

    // Filter by selected date
    const dateStr = format(selectedDate, "yyyy-MM-dd")
    filtered = filtered.filter(apt => apt.appointmentDate === dateStr)

    setFilteredAppointments(filtered)
  }, [appointments, searchQuery, statusFilter, doctorFilter, selectedDate])

  // Update available slots when doctor or date changes
  useEffect(() => {
    if (newAppointment.doctorId && newAppointment.appointmentDate) {
      const doctor = mockDoctors.find(d => d.id === newAppointment.doctorId)
      if (doctor) {
        setSelectedDoctor(doctor)
        // Filter out already booked slots
        const bookedSlots = appointments
          .filter(apt => 
            apt.doctorId === newAppointment.doctorId && 
            apt.appointmentDate === newAppointment.appointmentDate &&
            apt.status !== 'cancelled'
          )
          .map(apt => apt.appointmentTime)
        
        const available = doctor.availableSlots.filter(slot => !bookedSlots.includes(slot))
        setAvailableSlots(available)
      }
    }
  }, [newAppointment.doctorId, newAppointment.appointmentDate, appointments])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'no-show': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'निर्धारित'
      case 'confirmed': return 'पुष्ट'
      case 'in-progress': return 'चल रहा'
      case 'completed': return 'पूर्ण'
      case 'cancelled': return 'रद्द'
      case 'no-show': return 'नहीं आया'
      default: return status
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'consultation': return 'परामर्श'
      case 'follow-up': return 'फॉलो-अप'
      case 'emergency': return 'आपातकाल'
      case 'procedure': return 'प्रक्रिया'
      default: return type
    }
  }

  const handleNewAppointmentSubmit = () => {
    if (!newAppointment.patientName || !newAppointment.phone || !newAppointment.doctorId || 
        !newAppointment.appointmentDate || !newAppointment.appointmentTime) {
      alert('कृपया सभी आवश्यक फील्ड भरें')
      return
    }

    const doctor = mockDoctors.find(d => d.id === newAppointment.doctorId)
    if (!doctor) return

    const appointment: Appointment = {
      id: `A${Date.now()}`,
      patientId: newAppointment.patientId || `P${Date.now()}`,
      patientName: newAppointment.patientName,
      patientNameHindi: newAppointment.patientNameHindi,
      phone: newAppointment.phone,
      doctorId: newAppointment.doctorId,
      doctorName: doctor.name,
      department: doctor.department,
      appointmentDate: newAppointment.appointmentDate,
      appointmentTime: newAppointment.appointmentTime,
      duration: 30,
      type: newAppointment.type,
      status: 'scheduled',
      priority: newAppointment.priority,
      notes: newAppointment.notes,
      createdBy: 'Reception-1',
      createdAt: new Date().toISOString()
    }

    setAppointments(prev => [...prev, appointment])
    setShowNewAppointmentDialog(false)
    
    // Reset form
    setNewAppointment({
      patientId: "",
      patientName: "",
      patientNameHindi: "",
      phone: "",
      doctorId: "",
      appointmentDate: "",
      appointmentTime: "",
      type: "consultation",
      priority: "normal",
      notes: ""
    })

    alert('अपॉइंटमेंट सफलतापूर्वक बुक हो गया!')
  }

  const updateAppointmentStatus = (appointmentId: string, newStatus: Appointment['status']) => {
    setAppointments(prev => prev.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    ))
  }

  const deleteAppointment = (appointmentId: string) => {
    if (confirm('क्या आप वाकई इस अपॉइंटमेंट को रद्द करना चाहते हैं?')) {
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId))
    }
  }

  const todayStats = {
    total: filteredAppointments.length,
    scheduled: filteredAppointments.filter(a => a.status === 'scheduled').length,
    confirmed: filteredAppointments.filter(a => a.status === 'confirmed').length,
    completed: filteredAppointments.filter(a => a.status === 'completed').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      {/* Header */}
      <div className="bg-white border-b border-pink-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/receptionist">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                वापस
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Appointment Booking</h1>
              <p className="text-sm text-gray-600">Appointment Booking & Management</p>
            </div>
          </div>
          
          <Button onClick={() => setShowNewAppointmentDialog(true)} className="bg-pink-600 hover:bg-pink-700">
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm">कुल अपॉइंटमेंट</p>
                  <p className="text-2xl font-bold">{todayStats.total}</p>
                </div>
                <CalendarDays className="h-8 w-8 text-pink-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">निर्धारित</p>
                  <p className="text-2xl font-bold">{todayStats.scheduled}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">पुष्ट</p>
                  <p className="text-2xl font-bold">{todayStats.confirmed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">पूर्ण</p>
                  <p className="text-2xl font-bold">{todayStats.completed}</p>
                </div>
                <Users className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">कैलेंडर</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={hi}
                className="rounded-md border"
              />
              <div className="mt-4 text-sm text-gray-600">
                <p>चयनित तिथि:</p>
                <p className="font-medium">{format(selectedDate, "dd MMMM yyyy", { locale: hi })}</p>
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {format(selectedDate, "dd MMMM yyyy", { locale: hi })} के अपॉइंटमेंट
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="खोजें..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">सभी</SelectItem>
                      <SelectItem value="scheduled">निर्धारित</SelectItem>
                      <SelectItem value="confirmed">पुष्ट</SelectItem>
                      <SelectItem value="completed">पूर्ण</SelectItem>
                      <SelectItem value="cancelled">रद्द</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusText(appointment.status)}
                          </Badge>
                          <Badge variant="outline">
                            {getTypeText(appointment.type)}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {appointment.appointmentTime}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="font-semibold text-gray-900">{appointment.patientNameHindi}</p>
                            <p className="text-sm text-gray-600">{appointment.patientName}</p>
                            <p className="text-sm text-gray-600">📞 {appointment.phone}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600">डॉक्टर: {appointment.doctorName}</p>
                            <p className="text-sm text-gray-600">विभाग: {appointment.department}</p>
                            {appointment.notes && (
                              <p className="text-sm text-gray-500">टिप्पणी: {appointment.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAppointment(appointment)
                            setShowEditDialog(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {appointment.status === 'scheduled' && (
                          <Button
                            size="sm"
                            onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            पुष्ट करें
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteAppointment(appointment.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredAppointments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>इस दिन कोई अपॉइंटमेंट नहीं है</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Appointment Dialog */}
      <Dialog open={showNewAppointmentDialog} onOpenChange={setShowNewAppointmentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>नया अपॉइंटमेंट बुक करें</DialogTitle>
            <DialogDescription>
              मरीज़ की जानकारी और अपॉइंटमेंट विवरण भरें
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientName">मरीज़ का नाम (अंग्रेजी) *</Label>
                <Input
                  id="patientName"
                  value={newAppointment.patientName}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, patientName: e.target.value }))}
                  placeholder="Patient Name"
                />
              </div>
              
              <div>
                <Label htmlFor="patientNameHindi">मरीज़ का नाम (हिंदी)</Label>
                <Input
                  id="patientNameHindi"
                  value={newAppointment.patientNameHindi}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, patientNameHindi: e.target.value }))}
                  placeholder="मरीज़ का नाम"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">फोन नंबर *</Label>
                <Input
                  id="phone"
                  value={newAppointment.phone}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                />
              </div>
              
              <div>
                <Label htmlFor="doctor">डॉक्टर चुनें *</Label>
                <Select 
                  value={newAppointment.doctorId} 
                  onValueChange={(value) => setNewAppointment(prev => ({ ...prev, doctorId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="डॉक्टर चुनें" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDoctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="appointmentDate">तिथि *</Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  value={newAppointment.appointmentDate}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, appointmentDate: e.target.value }))}
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
              
              <div>
                <Label htmlFor="appointmentTime">समय *</Label>
                <Select 
                  value={newAppointment.appointmentTime} 
                  onValueChange={(value) => setNewAppointment(prev => ({ ...prev, appointmentTime: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="समय चुनें" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="type">अपॉइंटमेंट प्रकार</Label>
                <Select 
                  value={newAppointment.type} 
                  onValueChange={(value: any) => setNewAppointment(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">परामर्श</SelectItem>
                    <SelectItem value="follow-up">फॉलो-अप</SelectItem>
                    <SelectItem value="emergency">आपातकाल</SelectItem>
                    <SelectItem value="procedure">प्रक्रिया</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="priority">प्राथमिकता</Label>
                <Select 
                  value={newAppointment.priority} 
                  onValueChange={(value: any) => setNewAppointment(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">सामान्य</SelectItem>
                    <SelectItem value="high">उच्च</SelectItem>
                    <SelectItem value="urgent">तत्काल</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">टिप्पणी</Label>
              <Textarea
                id="notes"
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="अतिरिक्त जानकारी या विशेष निर्देश..."
                rows={3}
              />
            </div>
            
            {selectedDoctor && (
              <Alert>
                <Stethoscope className="h-4 w-4" />
                <AlertDescription>
                  परामर्श शुल्क: ₹{selectedDoctor.consultationFee}
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewAppointmentDialog(false)}>
              रद्द करें
            </Button>
            <Button onClick={handleNewAppointmentSubmit}>
              अपॉइंटमेंट बुक करें
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
