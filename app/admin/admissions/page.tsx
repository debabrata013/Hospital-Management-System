"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Bed, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  User,
  Calendar,
  Activity,
  MapPin,
  Stethoscope,
  FileText,
  LogOut
} from 'lucide-react'

type AdmittedPatient = {
  id: number
  patientId: number
  name: string
  age: number
  condition: string
  roomNumber: string
  admissionDate: string
  status: string
  doctor?: { name: string }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'stable':
      return <Badge className="bg-green-100 text-green-700">Stable</Badge>
    case 'improving':
      return <Badge className="bg-blue-100 text-blue-700">Improving</Badge>
    case 'critical':
      return <Badge className="bg-red-100 text-red-700">Critical</Badge>
    case 'discharged':
      return <Badge className="bg-purple-100 text-purple-700">Discharged</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'stable':
      return <Activity className="h-4 w-4 text-green-500" />
    case 'improving':
      return <Activity className="h-4 w-4 text-blue-500" />
    case 'critical':
      return <Activity className="h-4 w-4 text-red-500" />
    default:
      return <Activity className="h-4 w-4 text-gray-500" />
  }
}

const getRoomTypeColor = (room: string) => {
  if (room.includes('ICU')) return 'bg-red-100 text-red-700'
  if (room.includes('CCU')) return 'bg-orange-100 text-orange-700'
  if (room.includes('Ward')) return 'bg-blue-100 text-blue-700'
  return 'bg-gray-100 text-gray-700'
}

export default function AdmissionsPage() {
  const [loading, setLoading] = useState(false)
  const [admissions, setAdmissions] = useState<AdmittedPatient[]>([])
  const [showNewAdmission, setShowNewAdmission] = useState(false)
  const [rooms, setRooms] = useState<any[]>([])
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    gender: 'Unknown',
    dateOfBirth: '',
    contactNumber: '',
    emergencyContact: '',
    diagnosis: '',
    expectedDischargeDate: '',
    notes: '',
    roomId: ''
  })

  const [stats, setStats] = useState<{ admittedPatients?: number; availableBeds?: number; dischargesToday?: number; criticalPatients?: number }>({})

  async function fetchAdmissions() {
    try {
      setLoading(true)
      const [admissionsRes, statsRes] = await Promise.all([
        fetch('/api/admin/admitted-patients', { cache: 'no-store' }),
        fetch('/api/admin/dashboard-stats', { cache: 'no-store' })
      ])
      if (!admissionsRes.ok) throw new Error('Failed to load admissions')
      const data = await admissionsRes.json()
      setAdmissions(Array.isArray(data) ? data : [])
      if (statsRes.ok) {
        const s = await statsRes.json()
        setStats(s || {})
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function dischargePatient(patientId: number) {
    try {
      const res = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dischargePatient', patientId })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Failed to discharge patient')
      }
      await fetchAdmissions()
      alert('Patient discharged successfully')
    } catch (e: any) {
      alert(e.message || 'Discharge failed')
    }
  }

  useEffect(() => {
    fetchAdmissions()
  }, [])

  async function openNewAdmission() {
    setShowNewAdmission(true)
    if (rooms.length === 0) {
      try {
        setLoadingRooms(true)
        const res = await fetch('/api/admin/rooms?status=Available', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load rooms')
        const data = await res.json()
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
        setRooms(list)
      } catch (e) {
        console.error(e)
        alert('Could not load rooms')
      } finally {
        setLoadingRooms(false)
      }
    }
  }

  async function submitNewAdmission(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.roomId) {
      alert('Please provide patient name and select a room')
      return
    }
    try {
      setSubmitting(true)
      const payload = {
        action: 'admitPatient',
        roomId: Number(form.roomId),
        patientData: {
          name: form.name,
          contactNumber: form.contactNumber,
          gender: form.gender,
          dateOfBirth: form.dateOfBirth || null,
          address: '',
          emergencyContact: form.emergencyContact,
          medicalHistory: '',
          expectedDischargeDate: form.expectedDischargeDate || null,
          diagnosis: form.diagnosis,
          notes: form.notes
        }
      }
      const res = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Failed to admit patient')
      }
      setShowNewAdmission(false)
      setForm({
        name: '', gender: 'Unknown', dateOfBirth: '', contactNumber: '', emergencyContact: '',
        diagnosis: '', expectedDischargeDate: '', notes: '', roomId: ''
      })
      await fetchAdmissions()
      alert('Patient admitted successfully')
    } catch (e: any) {
      alert(e.message || 'Admission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4 sm:p-6">
      
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <Bed className="h-8 w-8 mr-2 sm:mr-3 text-pink-500" />
            Admission & Discharge Management
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Manage patient admissions, room assignments, and discharge processes
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600" onClick={fetchAdmissions}>
            Refresh
          </Button>
          <Button className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600" onClick={openNewAdmission}>
            <Plus className="h-4 w-4 mr-2" />
            New Admission
          </Button>
        </div>
      </div>

      {showNewAdmission && (
        <Card className="border-pink-200 mb-6">
          <CardHeader>
            <CardTitle>New Admission</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={submitNewAdmission}>
              <div>
                <label className="text-sm text-gray-700">Patient Name</label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Gender</label>
                <select className="w-full h-10 border rounded px-3" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-700">Date of Birth</label>
                <Input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-700">Contact Number</label>
                <Input value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })} placeholder="Phone" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Emergency Contact</label>
                <Input value={form.emergencyContact} onChange={e => setForm({ ...form, emergencyContact: e.target.value })} placeholder="Emergency contact" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Diagnosis</label>
                <Input value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} placeholder="Diagnosis" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Expected Discharge</label>
                <Input type="date" value={form.expectedDischargeDate} onChange={e => setForm({ ...form, expectedDischargeDate: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-700">Notes</label>
                <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Room</label>
                <select className="w-full h-10 border rounded px-3" value={form.roomId} onChange={e => setForm({ ...form, roomId: e.target.value })}>
                  <option value="">{loadingRooms ? 'Loading rooms...' : 'Select room'}</option>
                  {rooms.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.room_number || r.roomName || `Room ${r.id}`}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600">
                  {submitting ? 'Submitting...' : 'Admit Patient'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowNewAdmission(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Admitted</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.admittedPatients ?? '—'}</p>
              </div>
              <Bed className="h-6 sm:h-8 w-6 sm:w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Beds</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.availableBeds ?? '—'}</p>
              </div>
              <MapPin className="h-6 sm:h-8 w-6 sm:w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Discharges Today</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.dischargesToday ?? '—'}</p>
              </div>
              <LogOut className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-pink-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Patients</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.criticalPatients ?? '—'}</p>
              </div>
              <Activity className="h-6 sm:h-8 w-6 sm:w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card className="border-pink-100 mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search by patient, room, or ID..." 
                className="pl-10 border-pink-200 focus:border-pink-400 w-full"
              />
            </div>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 w-full sm:w-auto flex items-center justify-center gap-2">
              <Filter className="h-4 w-4" />
              Filter by Status
            </Button>
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 w-full sm:w-auto flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4" />
              Room Type
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admissions List */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle>Current Admissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading && (
              <div className="text-sm text-gray-500">Loading admissions...</div>
            )}
            {!loading && admissions.length === 0 && (
              <div className="text-sm text-gray-500">No current admissions found.</div>
            )}
            {admissions.map((admission) => (
              <div key={admission.id} className="p-4 sm:p-5 border border-pink-100 rounded-lg hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex-shrink-0 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-lg h-16 w-16 flex items-center justify-center font-bold">
                  <Bed className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-2 flex-wrap">
                    <h3 className="font-bold text-lg sm:text-xl text-gray-900">{admission.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">PID: {admission.patientId}</Badge>
                      <Badge className={getRoomTypeColor(String(admission.roomNumber))}>{admission.roomNumber}</Badge>
                      {getStatusBadge(admission.status || 'admitted')}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-sm text-gray-600">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-pink-500" />
                        <span>{admission.age} years • ID: {admission.patientId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-pink-500" />
                        <span className="font-medium">{admission.doctor?.name || 'Not Assigned'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-pink-500" />
                        <span>Admitted: {new Date(admission.admissionDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-pink-500" />
                        <span>Room: {admission.roomNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Condition:</span>
                        <span>{admission.condition || '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Condition: {admission.condition || '—'}</p>
                    </div>
                    <div>{getStatusIcon(admission.status || 'admitted')}</div>
                  </div>
                </div>

                <div className="flex gap-2 mt-2 sm:mt-0 sm:flex-col">
                  <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50" onClick={() => dischargePatient(admission.patientId)}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Room Status Overview */}
      <Card className="border-pink-100 mt-6">
        <CardHeader>
          <CardTitle>Room Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "ICU", icon: <Activity className="h-8 w-8 text-red-500 mx-auto mb-2"/>, occupied: 8, total: 10, bg: "bg-red-50", text: "text-red-600" },
              { title: "CCU", icon: <Activity className="h-8 w-8 text-orange-500 mx-auto mb-2"/>, occupied: 5, total: 6, bg: "bg-orange-50", text: "text-orange-600" },
              { title: "General Ward", icon: <Bed className="h-8 w-8 text-blue-500 mx-auto mb-2"/>, occupied: 15, total: 25, bg: "bg-blue-50", text: "text-blue-600" },
              { title: "Private Rooms", icon: <MapPin className="h-8 w-8 text-green-500 mx-auto mb-2"/>, occupied: 8, total: 15, bg: "bg-green-50", text: "text-green-600" }
            ].map((room) => (
              <div key={room.title} className={`p-4 ${room.bg} rounded-lg text-center`}>
                {room.icon}
                <h4 className={`font-semibold ${room.text}`}>{room.title}</h4>
                <p className={`text-2xl font-bold ${room.text}`}>{room.occupied}/{room.total}</p>
                <p className={`text-sm ${room.text}`}>Occupied/Total</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-pink-100 mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <Plus className="h-6 w-6" />
              <span className="text-xs sm:text-sm text-center">New Admission</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <LogOut className="h-6 w-6" />
              <span className="text-xs sm:text-sm text-center">Process Discharge</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <MapPin className="h-6 w-6" />
              <span className="text-xs sm:text-sm text-center">Room Assignment</span>
            </Button>
            <Button variant="outline" className="h-20 border-pink-200 text-pink-600 hover:bg-pink-50 flex flex-col items-center justify-center space-y-2">
              <FileText className="h-6 w-6" />
              <span className="text-xs sm:text-sm text-center">Discharge Summary</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="mt-6 sm:mt-8 text-center">
        <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-pink-100 text-pink-700 rounded-full text-sm sm:text-base">
          <Bed className="h-5 w-5 mr-2" />
          <span className="font-medium">Advanced Admission Management Features Coming Soon</span>
        </div>
      </div>

    </div>
  )
}

