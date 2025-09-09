"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, Users, Check, LogOut, ArrowLeft, Phone, CircleCheck, Circle } from "lucide-react"

interface StaffOption {
  userId: string
  name: string
  employeeId?: string
  department?: string
  role?: string
  mobile?: string
}

interface ShiftItem {
  _id: string
  staffId: { _id: string; name: string; employeeId?: string; role?: string; department?: string }
  shiftDate: string
  shiftType?: string
  startTime: string
  endTime: string
  status: string
  attendance?: {
    checkIn?: { time: string }
    checkOut?: { time: string }
  }
}

export default function AttendancePage() {
  const { toast } = useToast()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [staff, setStaff] = useState<StaffOption[]>([])
  const [todayShifts, setTodayShifts] = useState<ShiftItem[]>([])
  const [selectedStaffId, setSelectedStaffId] = useState<string>("")
  const [selectedShiftId, setSelectedShiftId] = useState<string>("")
  const [mobile, setMobile] = useState<string>("")
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({
    shiftDate: new Date().toISOString().split("T")[0],
    shiftType: "Morning",
    startTime: "09:00",
    endTime: "17:00",
    department: "",
    notes: "",
  })

  const todayISO = useMemo(() => new Date().toISOString().split("T")[0], [])

  async function fetchStaff() {
    try {
      setLoading(true)
      const collected: Record<string, StaffOption> = {}
      let page = 1
      const limit = 200
      while (true) {
        const res = await fetch(`/api/staff/profiles?page=${page}&limit=${limit}&sortBy=name&sortOrder=asc`, { credentials: "include", cache: "no-store" })
        if (res.status === 401 || res.status === 403) {
          toast({ title: "Access denied", description: "You must be admin or HR to mark attendance", variant: "destructive" })
          break
        }
        const data = await res.json()
        if (!data?.success) break
        for (const p of data.data || []) {
          const opt: StaffOption = {
            userId: p.userId,
            name: p.name,
            employeeId: p.employeeId,
            department: p.department,
            role: p.role,
            mobile: p.mobile || p.user?.mobile,
          }
          collected[opt.userId] = opt
        }
        const totalPages = data.pagination?.totalPages || 1
        if (page >= totalPages) break
        page += 1
      }
      let options = Object.values(collected)

      // Fallback: if empty, try super-admin endpoints for doctors and staff
      if (options.length === 0) {
        try {
          const [staffRes, doctorsRes] = await Promise.all([
            fetch(`/api/super-admin/staff?type=all`, { credentials: "include", cache: "no-store" }),
            fetch(`/api/super-admin/doctors`, { credentials: "include", cache: "no-store" })
          ])
          if (staffRes.ok) {
            const sd = await staffRes.json()
            const list: any[] = sd?.staff || sd?.data || []
            for (const s of list) {
              const opt: StaffOption = {
                userId: String(s.user_id || s.id),
                name: s.name,
                employeeId: s.employeeId || undefined,
                department: s.department || s.specialization || undefined,
                role: s.role || 'staff',
                mobile: s.mobile || s.contact_number,
              }
              collected[opt.userId] = opt
            }
          }
          if (doctorsRes.ok) {
            const dd = await doctorsRes.json()
            const list: any[] = dd?.doctors || dd?.data || []
            for (const d of list) {
              const opt: StaffOption = {
                userId: String(d.user_id || d.id),
                name: d.name,
                employeeId: d.employeeId || undefined,
                department: d.department || d.specialization || undefined,
                role: 'doctor',
                mobile: d.mobile || d.contact_number,
              }
              collected[opt.userId] = opt
            }
          }
          options = Object.values(collected)
        } catch (e) {
          // ignore fallback errors
        }
      }

      setStaff(options)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function fetchTodayShifts() {
    try {
      const q = new URLSearchParams()
      q.set("dateFrom", `${todayISO}T00:00:00.000Z`)
      q.set("dateTo", `${todayISO}T23:59:59.999Z`)
      q.set("limit", "200")
      const res = await fetch(`/api/staff/shifts?${q.toString()}`, { credentials: "include", cache: "no-store" })
      const data = await res.json()
      if (data?.success) setTodayShifts(data.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchStaff()
    fetchTodayShifts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-select first available staff and today's shift
  useEffect(() => {
    if (!selectedShiftId && todayShifts.length > 0) {
      setSelectedShiftId(todayShifts[0]._id)
      setSelectedStaffId(todayShifts[0].staffId?._id || "")
    }
  }, [todayShifts])

  async function handleCheckIn() {
    if (!selectedShiftId) {
      toast({ title: "Select shift", description: "Please choose a shift to check in", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/staff/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check_in", shiftId: selectedShiftId, method: "Manual" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to check in")
      toast({ title: "Checked in", description: "Attendance recorded" })
      fetchTodayShifts()
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Could not check in", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckOut() {
    if (!selectedShiftId) {
      toast({ title: "Select shift", description: "Please choose a shift to check out", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/staff/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check_out", shiftId: selectedShiftId, method: "Manual" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to check out")
      toast({ title: "Checked out", description: "Attendance updated" })
      fetchTodayShifts()
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Could not check out", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function handleMobileLookup() {
    if (!mobile.trim()) return
    try {
      const res = await fetch(`/api/staff/lookup-by-mobile?mobile=${encodeURIComponent(mobile.trim())}`, { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Mobile not found")
      const foundId = data?.data?.userId || data?.data?.id
      setSelectedStaffId(foundId)
      // Preselect today's first shift for this staff if available
      const first = todayShifts.find(s => s.staffId?._id === foundId)
      if (first) setSelectedShiftId(first._id)
      toast({ title: "User found", description: `${data?.data?.name}` })
    } catch (e: any) {
      setSelectedStaffId("")
      setSelectedShiftId("")
      toast({ title: "Not found", description: e.message || "No user for mobile" , variant: "destructive" })
    }
  }

  async function handleCreateShift() {
    if (!selectedStaffId || !createForm.shiftDate) {
      toast({ title: "Missing fields", description: "Select staff and date to create shift", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/staff/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          staffId: selectedStaffId,
          shiftDate: new Date(createForm.shiftDate).toISOString(),
          shiftType: createForm.shiftType,
          startTime: createForm.startTime,
          endTime: createForm.endTime,
          department: createForm.department || undefined,
          notes: createForm.notes || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to create shift")
      toast({ title: "Shift created", description: "Shift added for selected staff" })
      setCreating(false)
      setCreateForm((p) => ({ ...p, notes: "" }))
      fetchTodayShifts()
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Could not create shift", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const filteredShifts = useMemo(() => {
    return todayShifts.filter(s => !selectedStaffId || s.staffId?._id === selectedStaffId)
  }, [todayShifts, selectedStaffId])

  const doctorShifts = useMemo(() => todayShifts.filter(s => (s.staffId?.role || '').toLowerCase().includes('doctor')), [todayShifts])
  const otherStaffShifts = useMemo(() => todayShifts.filter(s => !(s.staffId?.role || '').toLowerCase().includes('doctor')), [todayShifts])

  const doctorRoster = useMemo(() => staff.filter(s => (s.role || '').toLowerCase().includes('doctor')), [staff])
  const staffRoster = useMemo(() => staff.filter(s => !(s.role || '').toLowerCase().includes('doctor')), [staff])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
          <Users className="h-7 w-7 mr-2 text-pink-500" /> Attendance
        </h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Link href="/admin/erp"><Button className="w-full sm:w-auto">ERP Home</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-1 border-pink-100">
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Link href="/super-admin/staff">
                <Button variant="outline" size="sm">Add Staff</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => setCreating((v) => !v)}>{creating ? "Close" : "Create Shift"}</Button>
            </div>
            <div className="space-y-2">
              <Label>Mobile Number</Label>
              <div className="flex gap-2">
                <Input placeholder="Enter mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} inputMode="numeric" />
                <Button variant="outline" onClick={handleMobileLookup} title="Find by mobile">
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Staff</Label>
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  {/* Doctors */}
                  <div className="px-2 py-1 text-xs text-gray-500">Doctors</div>
                  {staff.filter(s => (s.role || '').toLowerCase().includes('doctor')).map((s) => (
                    <SelectItem key={`doc-${s.userId}`} value={s.userId}>{`${s.name}${s.employeeId ? ` (${s.employeeId})` : ""}${s.department ? ` • ${s.department}` : ""}${s.role ? ` • ${s.role}` : ""}`}</SelectItem>
                  ))}
                  {/* Other Staff */}
                  <div className="px-2 py-1 text-xs text-gray-500">Staff</div>
                  {staff.filter(s => !(s.role || '').toLowerCase().includes('doctor')).map((s) => (
                    <SelectItem key={`staff-${s.userId}`} value={s.userId}>{`${s.name}${s.employeeId ? ` (${s.employeeId})` : ""}${s.department ? ` • ${s.department}` : ""}${s.role ? ` • ${s.role}` : ""}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Shift</Label>
              <Select value={selectedShiftId} onValueChange={setSelectedShiftId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select today's shift" />
                </SelectTrigger>
                <SelectContent>
                  {filteredShifts.map((s) => (
                    <SelectItem key={s._id} value={s._id}>{`${new Date(s.shiftDate).toDateString()} • ${s.startTime}-${s.endTime} • ${s.staffId?.name}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {creating ? (
              <div className="space-y-3 border rounded-lg p-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label>Date</Label>
                    <Input type="date" value={createForm.shiftDate} onChange={(e) => setCreateForm((p) => ({ ...p, shiftDate: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Type</Label>
                    <Select value={createForm.shiftType} onValueChange={(v) => setCreateForm((p) => ({ ...p, shiftType: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['Morning','Evening','Night','Full Day','Emergency','On-Call'].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label>Start</Label>
                    <Input type="time" value={createForm.startTime} onChange={(e) => setCreateForm((p) => ({ ...p, startTime: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>End</Label>
                    <Input type="time" value={createForm.endTime} onChange={(e) => setCreateForm((p) => ({ ...p, endTime: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Department</Label>
                  <Input placeholder="Optional" value={createForm.department} onChange={(e) => setCreateForm((p) => ({ ...p, department: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Notes</Label>
                  <Input placeholder="Optional" value={createForm.notes} onChange={(e) => setCreateForm((p) => ({ ...p, notes: e.target.value }))} />
                </div>
                <Button onClick={handleCreateShift} disabled={loading} className="w-full">Create Shift</Button>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleCheckIn} disabled={loading}>
                <Check className="h-4 w-4 mr-2" /> Check-In
              </Button>
              <Button variant="outline" onClick={handleCheckOut} disabled={loading}>
                <LogOut className="h-4 w-4 mr-2" /> Check-Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-pink-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-pink-600" /> Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Roster names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-pink-100 bg-white">
                <div className="text-sm font-semibold text-gray-700 mb-2">Doctors ({doctorRoster.length})</div>
                {doctorRoster.length === 0 ? (
                  <div className="text-gray-500 text-sm">No doctors found</div>
                ) : (
                  <ul className="text-sm text-gray-800 space-y-1 max-h-44 overflow-auto">
                    {doctorRoster.map(d => (
                      <li key={`roster-doc-${d.userId}`}>{d.name}{d.employeeId ? ` (${d.employeeId})` : ''}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="p-4 rounded-xl border border-pink-100 bg-white">
                <div className="text-sm font-semibold text-gray-700 mb-2">Staff ({staffRoster.length})</div>
                {staffRoster.length === 0 ? (
                  <div className="text-gray-500 text-sm">No staff found</div>
                ) : (
                  <ul className="text-sm text-gray-800 space-y-1 max-h-44 overflow-auto">
                    {staffRoster.map(st => (
                      <li key={`roster-staff-${st.userId}`}>{st.name}{st.employeeId ? ` (${st.employeeId})` : ''}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Doctors */}
            <div className="space-y-3">
              <div className="text-sm font-semibold text-gray-700">Doctors</div>
              {doctorShifts.length === 0 ? (
                <div className="text-gray-500 text-sm">No doctor shifts today</div>
              ) : (
                doctorShifts.map((s) => {
                  const present = Boolean(s.attendance?.checkIn?.time)
                  return (
                    <div key={`doc-${s._id}`} className="p-4 rounded-xl border border-pink-100 bg-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {present ? <CircleCheck className="h-5 w-5 text-green-600" /> : <Circle className="h-5 w-5 text-gray-300" />}
                        <div>
                          <div className="font-medium text-gray-900">{s.staffId?.name} {s.staffId?.employeeId ? `(${s.staffId.employeeId})` : ""}</div>
                          <div className="text-sm text-gray-600 flex gap-3 flex-wrap">
                            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {s.startTime} - {s.endTime}</span>
                            {s.shiftType ? <span className="text-xs px-2 py-0.5 rounded-full bg-pink-50 text-pink-700">{s.shiftType}</span> : null}
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">{s.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-700">
                        <div>Check-In: <span className="font-semibold">{s.attendance?.checkIn?.time ? new Date(s.attendance.checkIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</span></div>
                        <div>Check-Out: <span className="font-semibold">{s.attendance?.checkOut?.time ? new Date(s.attendance.checkOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</span></div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Other Staff */}
            <div className="space-y-3">
              <div className="text-sm font-semibold text-gray-700">Staff</div>
              {otherStaffShifts.length === 0 ? (
                <div className="text-gray-500 text-sm">No staff shifts today</div>
              ) : (
                otherStaffShifts.map((s) => {
                  const present = Boolean(s.attendance?.checkIn?.time)
                  return (
                    <div key={`staff-${s._id}`} className="p-4 rounded-xl border border-pink-100 bg-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {present ? <CircleCheck className="h-5 w-5 text-green-600" /> : <Circle className="h-5 w-5 text-gray-300" />}
                        <div>
                          <div className="font-medium text-gray-900">{s.staffId?.name} {s.staffId?.employeeId ? `(${s.staffId.employeeId})` : ""}</div>
                          <div className="text-sm text-gray-600 flex gap-3 flex-wrap">
                            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {s.startTime} - {s.endTime}</span>
                            {s.shiftType ? <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{s.shiftType}</span> : null}
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">{s.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-700">
                        <div>Check-In: <span className="font-semibold">{s.attendance?.checkIn?.time ? new Date(s.attendance.checkIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</span></div>
                        <div>Check-Out: <span className="font-semibold">{s.attendance?.checkOut?.time ? new Date(s.attendance.checkOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</span></div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


