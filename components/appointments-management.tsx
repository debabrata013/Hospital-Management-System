"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import {
  CalendarIcon,
  Clock,
  Search,
  Plus,
  MapPin,
  Phone,
  Video,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react"

export function AppointmentsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterSpecialty, setFilterSpecialty] = useState("all")
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [bookingForm, setBookingForm] = useState({
    specialty: "",
    doctor: "",
    date: "",
    time: "",
    type: "",
    reason: "",
    notes: "",
  })

  const upcomingAppointments = [
    {
      id: 1,
      date: "2024-12-15",
      time: "10:00 AM",
      doctor: "Dr. Sarah Smith",
      specialty: "Cardiology",
      type: "Follow-up",
      status: "confirmed",
      location: "Medical Center - Room 205",
      duration: "30 minutes",
      notes: "Bring previous test results",
      contactPhone: "(555) 123-4567",
    },
    {
      id: 2,
      date: "2024-12-22",
      time: "2:30 PM",
      doctor: "Dr. Michael Johnson",
      specialty: "Dermatology",
      type: "Consultation",
      status: "pending",
      location: "Dermatology Clinic - Room 101",
      duration: "45 minutes",
      notes: "Skin examination",
      contactPhone: "(555) 234-5678",
    },
    {
      id: 3,
      date: "2025-01-05",
      time: "9:15 AM",
      doctor: "Dr. Emily Williams",
      specialty: "General Practice",
      type: "Annual Checkup",
      status: "confirmed",
      location: "Main Building - Room 302",
      duration: "60 minutes",
      notes: "Fasting required - no food 12 hours before",
      contactPhone: "(555) 345-6789",
    },
  ]

  const pastAppointments = [
    {
      id: 4,
      date: "2024-11-28",
      time: "11:00 AM",
      doctor: "Dr. Sarah Smith",
      specialty: "Cardiology",
      type: "Follow-up",
      status: "completed",
      location: "Medical Center - Room 205",
      duration: "30 minutes",
      notes: "Blood pressure check",
      summary: "Blood pressure stable, continue current medication",
    },
    {
      id: 5,
      date: "2024-11-15",
      time: "3:00 PM",
      doctor: "Dr. Robert Brown",
      specialty: "Endocrinology",
      type: "Consultation",
      status: "completed",
      location: "Specialty Clinic - Room 150",
      duration: "45 minutes",
      notes: "Diabetes management",
      summary: "HbA1c improved, adjusted medication dosage",
    },
    {
      id: 6,
      date: "2024-10-20",
      time: "1:30 PM",
      doctor: "Dr. Lisa Davis",
      specialty: "Ophthalmology",
      type: "Eye Exam",
      status: "completed",
      location: "Eye Center - Room 201",
      duration: "30 minutes",
      notes: "Annual eye examination",
      summary: "Vision unchanged, no issues detected",
    },
  ]

  const availableDoctors = [
    { id: 1, name: "Dr. Sarah Smith", specialty: "Cardiology" },
    { id: 2, name: "Dr. Michael Johnson", specialty: "Dermatology" },
    { id: 3, name: "Dr. Emily Williams", specialty: "General Practice" },
    { id: 4, name: "Dr. Robert Brown", specialty: "Endocrinology" },
    { id: 5, name: "Dr. Lisa Davis", specialty: "Ophthalmology" },
  ]

  const timeSlots = [
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-blue-600" />
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleBookAppointment = () => {
    // In a real app, this would submit to an API
    console.log("Booking appointment:", bookingForm)
    setIsBookingModalOpen(false)
    setBookingForm({
      specialty: "",
      doctor: "",
      date: "",
      time: "",
      type: "",
      reason: "",
      notes: "",
    })
    alert("Appointment request submitted successfully!")
  }

  const filteredUpcomingAppointments = upcomingAppointments.filter((appointment) => {
    const matchesSearch =
      appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || appointment.status === filterStatus
    const matchesSpecialty = filterSpecialty === "all" || appointment.specialty === filterSpecialty
    return matchesSearch && matchesStatus && matchesSpecialty
  })

  const filteredPastAppointments = pastAppointments.filter((appointment) => {
    const matchesSearch =
      appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = filterSpecialty === "all" || appointment.specialty === filterSpecialty
    return matchesSearch && matchesSpecialty
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage your healthcare appointments and schedule new visits</p>
        </div>
        <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
              <DialogDescription>Schedule a new appointment with one of our healthcare providers.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  <Select
                    value={bookingForm.specialty}
                    onValueChange={(value) => setBookingForm({ ...bookingForm, specialty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="dermatology">Dermatology</SelectItem>
                      <SelectItem value="general">General Practice</SelectItem>
                      <SelectItem value="endocrinology">Endocrinology</SelectItem>
                      <SelectItem value="ophthalmology">Ophthalmology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor">Preferred Doctor</Label>
                  <Select
                    value={bookingForm.doctor}
                    onValueChange={(value) => setBookingForm({ ...bookingForm, doctor: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDoctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.name}>
                          {doctor.name} - {doctor.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preferred Date</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    disabled={(date) => date < new Date()}
                  />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="time">Preferred Time</Label>
                    <Select
                      value={bookingForm.time}
                      onValueChange={(value) => setBookingForm({ ...bookingForm, time: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Appointment Type</Label>
                    <Select
                      value={bookingForm.type}
                      onValueChange={(value) => setBookingForm({ ...bookingForm, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="checkup">Annual Checkup</SelectItem>
                        <SelectItem value="urgent">Urgent Care</SelectItem>
                        <SelectItem value="telemedicine">Telemedicine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit</Label>
                <Input
                  id="reason"
                  value={bookingForm.reason}
                  onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                  placeholder="Brief description of your concern"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  placeholder="Any additional information or special requests"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBookingModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBookAppointment}>Submit Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
  <CardContent className="p-4">
    <div className="flex flex-col md:flex-row flex-wrap items-stretch md:items-center gap-4">
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>
      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="w-full md:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="confirmed">Confirmed</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
        <SelectTrigger className="w-full md:w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Specialties</SelectItem>
          <SelectItem value="Cardiology">Cardiology</SelectItem>
          <SelectItem value="Dermatology">Dermatology</SelectItem>
          <SelectItem value="General Practice">General Practice</SelectItem>
          <SelectItem value="Endocrinology">Endocrinology</SelectItem>
          <SelectItem value="Ophthalmology">Ophthalmology</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </CardContent>
</Card>

      {/* Appointments Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
          <TabsTrigger value="past">Past Appointments</TabsTrigger>
        </TabsList>

        {/* Upcoming & Past Appointments */}
        <TabsContent value="upcoming" className="space-y-4">
          {filteredUpcomingAppointments.length === 0 ? (
            <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="p-8 text-center">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming appointments</h3>
                <p className="text-gray-600 mb-4">You don't have any scheduled appointments matching your filters.</p>
                <Button onClick={() => setIsBookingModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Book Your First Appointment
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredUpcomingAppointments.map((appointment) => (
              <Card
                key={appointment.id}
                className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-6">
  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
    <div className="flex items-start gap-4 flex-1">
      {/* Left: Icon + Details */}
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
        <Stethoscope className="w-6 h-6 text-blue-600" />
      </div>
      <div className="flex-1 min-w-[200px]">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h3 className="font-semibold text-gray-900">{appointment.doctor}</h3>
          <Badge variant="outline">{appointment.specialty}</Badge>
          <Badge className={getStatusColor(appointment.status)}>
            {getStatusIcon(appointment.status)}
            <span className="ml-1 capitalize">{appointment.status}</span>
          </Badge>
        </div>
        {/* Info rows */}
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center gap-2 flex-wrap">
            <CalendarIcon className="w-4 h-4" />
            <span>
              {appointment.date} at {appointment.time}
            </span>
            <span className="text-gray-400">({appointment.duration})</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <MapPin className="w-4 h-4" />
            <span>{appointment.location}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Phone className="w-4 h-4" />
            <span>{appointment.contactPhone}</span>
          </div>
        </div>
      </div>
    </div>
    {/* Action Buttons */}
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm">
        Reschedule
      </Button>
      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
        Cancel
      </Button>
    </div>
  </div>
</CardContent>

              </Card>
            ))
          )}
        </TabsContent>

        {/* Past Appointments */}
        <TabsContent value="past" className="space-y-4">
          {filteredPastAppointments.length === 0 ? (
            <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No past appointments</h3>
                <p className="text-gray-600">No appointment history matching your filters.</p>
              </CardContent>
            </Card>
          ) : (
            filteredPastAppointments.map((appointment) => (
              <Card key={appointment.id} className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{appointment.doctor}</h3>
                          <Badge variant="outline">{appointment.specialty}</Badge>
                          <Badge className="bg-green-100 text-green-800">Completed</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            <span>
                              {appointment.date} at {appointment.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{appointment.location}</span>
                          </div>
                        </div>
                        {appointment.summary && (
                          <div className="p-3 bg-blue-50/50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Visit Summary:</strong> {appointment.summary}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Book Follow-up
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
