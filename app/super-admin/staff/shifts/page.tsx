"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, Users, Filter, Plus, RefreshCw } from "lucide-react"

interface StaffOption {
	userId: string
	name: string
	employeeId?: string
	department?: string
	role?: string
}

interface ShiftItem {
	_id: string
	staffId: { _id: string; name: string; employeeId?: string; role?: string; department?: string }
	shiftDate: string
	shiftType: string
	startTime: string
	endTime: string
	status: string
	department?: string
	notes?: string
}

export default function ManageShiftsPage() {
	const { toast } = useToast()
	const [loading, setLoading] = useState(false)
	const [staff, setStaff] = useState<StaffOption[]>([])
	const [shifts, setShifts] = useState<ShiftItem[]>([])
	const [accessError, setAccessError] = useState<string>("")

	// Filters
	const ALL = "ALL"
	const [filterStaffId, setFilterStaffId] = useState<string>(ALL)
	const [filterDepartment, setFilterDepartment] = useState<string>(ALL)
	const [filterShiftType, setFilterShiftType] = useState<string>(ALL)

	// Create form
	const [form, setForm] = useState({
		staffId: "",
		shiftDate: "",
		shiftType: "Morning",
		startTime: "09:00",
		endTime: "17:00",
		department: "",
		notes: "",
	})

	const departments = useMemo(
		() => Array.from(new Set(staff.map((s) => s.department).filter(Boolean))) as string[],
		[staff]
	)

	async function fetchStaff() {
		try {
			setLoading(true)
			const collected: Record<string, StaffOption> = {}
			let page = 1
			const limit = 200
			while (true) {
			const res = await fetch(`/api/staff/profiles?page=${page}&limit=${limit}&sortBy=name&sortOrder=asc`, { credentials: "include", cache: "no-store" })
				if (res.status === 401 || res.status === 403) {
					setAccessError(res.status === 401 ? "Please log in to manage shifts." : "Access denied. Only admin and super-admin can manage shifts.")
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
					}
					collected[opt.userId] = opt
				}
				const totalPages = data.pagination?.totalPages || 1
				if (page >= totalPages) break
				page += 1
			}
			const options = Object.values(collected)
			setStaff(options)
			if (!form.department && options[0]?.department) {
				setForm((prev) => ({ ...prev, department: options[0].department || "" }))
			}
		} catch (e) {
			console.error(e)
		} finally {
			setLoading(false)
		}
	}

	async function fetchShifts() {
		try {
			const q = new URLSearchParams()
			if (filterStaffId && filterStaffId !== ALL) q.set("staffId", filterStaffId)
			if (filterDepartment && filterDepartment !== ALL) q.set("department", filterDepartment)
			if (filterShiftType && filterShiftType !== ALL) q.set("shiftType", filterShiftType)
			q.set("limit", "50")
			const res = await fetch(`/api/staff/shifts?${q.toString()}`, { credentials: "include", cache: "no-store" })
			if (res.status === 401 || res.status === 403) {
				setAccessError(res.status === 401 ? "Please log in to manage shifts." : "Access denied. Only admin and super-admin can manage shifts.")
				return
			}
			const data = await res.json()
			if (data?.success) setShifts(data.data || [])
		} catch (e) {
			console.error(e)
		}
	}

	useEffect(() => {
		fetchStaff()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		fetchShifts()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filterStaffId, filterDepartment, filterShiftType])

	async function handleCreateShift() {
		if (!form.staffId || !form.shiftDate || !form.department) {
			toast({ title: "Missing fields", description: "Please fill staff, date and department", variant: "destructive" })
			return
		}
		setLoading(true)
		try {
			const res = await fetch("/api/staff/shifts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "create",
					staffId: form.staffId,
					shiftDate: new Date(form.shiftDate).toISOString(),
					shiftType: form.shiftType,
					startTime: form.startTime,
					endTime: form.endTime,
					department: form.department,
					notes: form.notes || undefined,
				}),
			})
			const data = await res.json()
			if (!res.ok) {
				throw new Error(data?.error || "Failed to create shift")
			}
			toast({ title: "Shift created", description: `Shift assigned successfully` })
			setForm((p) => ({ ...p, notes: "" }))
			fetchShifts()
		} catch (e: any) {
			toast({ title: "Error", description: e.message || "Could not create shift", variant: "destructive" })
		} finally {
			setLoading(false)
		}
	}

	async function updateShiftStatus(shiftId: string, status: "Completed" | "Cancelled") {
		try {
			const res = await fetch("/api/staff/shifts", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ shiftId, updates: { status } }),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data?.error || "Failed to update shift")
			toast({ title: "Shift updated", description: `Status set to ${status}` })
			fetchShifts()
		} catch (e: any) {
			toast({ title: "Error", description: e.message, variant: "destructive" })
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-3xl font-bold text-gray-900 flex items-center">
					<Calendar className="h-8 w-8 mr-3 text-blue-500" /> Manage Shifts
				</h1>
				<div className="flex gap-2">
					<Link href="/super-admin/staff">
						<Button variant="outline">Back to Staff</Button>
					</Link>
					<Button variant="outline" onClick={fetchShifts}>
						<RefreshCw className="h-4 w-4 mr-2" /> Refresh
					</Button>
				</div>
			</div>

			{accessError ? (
				<Card className="border-red-200 bg-red-50">
					<CardContent className="p-6 text-red-700">{accessError}</CardContent>
				</Card>
			) : null}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<Card className="lg:col-span-1 border-blue-100">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Plus className="h-5 w-5 text-blue-600" /> Create Shift
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label>Staff</Label>
							<Select value={form.staffId} onValueChange={(v) => setForm((p) => ({ ...p, staffId: v }))}>
								<SelectTrigger>
									<SelectValue placeholder="Select staff" />
								</SelectTrigger>
								<SelectContent>
									{staff.map((s) => (
										<SelectItem key={s.userId} value={s.userId}>
											{`${s.name}${s.employeeId ? ` (${s.employeeId})` : ""}${s.department ? ` • ${s.department}` : ""}${s.role ? ` • ${s.role}` : ""}`}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-2">
								<Label>Date</Label>
								<Input type="date" value={form.shiftDate} onChange={(e) => setForm((p) => ({ ...p, shiftDate: e.target.value }))} />
							</div>
							<div className="space-y-2">
								<Label>Shift Type</Label>
								<Select value={form.shiftType} onValueChange={(v) => setForm((p) => ({ ...p, shiftType: v }))}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{["Morning", "Evening", "Night", "Full Day", "Emergency", "On-Call"].map((t) => (
											<SelectItem key={t} value={t}>{t}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-2">
								<Label>Start Time</Label>
								<Input type="time" value={form.startTime} onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} />
							</div>
							<div className="space-y-2">
								<Label>End Time</Label>
								<Input type="time" value={form.endTime} onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} />
							</div>
						</div>

						<div className="space-y-2">
							<Label>Department</Label>
							<Select value={form.department} onValueChange={(v) => setForm((p) => ({ ...p, department: v }))}>
								<SelectTrigger>
									<SelectValue placeholder="Select department" />
								</SelectTrigger>
								<SelectContent>
									{departments.map((d) => (
										<SelectItem key={d} value={d}>{d}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>Notes</Label>
							<Input placeholder="Optional" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
						</div>

						<Button onClick={handleCreateShift} disabled={loading} className="w-full">
							{loading ? "Creating..." : "Create Shift"}
						</Button>
					</CardContent>
				</Card>

				<Card className="lg:col-span-2 border-blue-100">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5 text-blue-600" /> Scheduled Shifts
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							<Select value={filterStaffId} onValueChange={setFilterStaffId}>
								<SelectTrigger>
									<SelectValue placeholder="Filter by staff" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={ALL}>All Staff</SelectItem>
									{staff.map((s) => (
										<SelectItem key={s.userId} value={s.userId}>{`${s.name}${s.employeeId ? ` (${s.employeeId})` : ""}${s.department ? ` • ${s.department}` : ""}${s.role ? ` • ${s.role}` : ""}`}</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select value={filterDepartment} onValueChange={setFilterDepartment}>
								<SelectTrigger>
									<SelectValue placeholder="Filter by department" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={ALL}>All Departments</SelectItem>
									{departments.map((d) => (
										<SelectItem key={d} value={d}>{d}</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select value={filterShiftType} onValueChange={setFilterShiftType}>
								<SelectTrigger>
									<SelectValue placeholder="Filter by shift type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={ALL}>All Types</SelectItem>
									{["Morning", "Evening", "Night", "Full Day", "Emergency", "On-Call"].map((t) => (
										<SelectItem key={t} value={t}>{t}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="divide-y">
							{shifts.length === 0 ? (
								<div className="text-center py-8 text-gray-500">No shifts found</div>
							) : (
								shifts.map((s) => (
									<div key={s._id} className="py-3 flex items-center justify-between">
										<div>
											<div className="font-medium text-gray-900">
												{s.staffId?.name} {s.staffId?.employeeId ? `(${s.staffId.employeeId})` : ""}
											</div>
											<div className="text-sm text-gray-600 flex gap-3">
												<span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(s.shiftDate).toDateString()}</span>
												<span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {s.startTime} - {s.endTime}</span>
												<span>{s.shiftType}</span>
												<span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">{s.status}</span>
											</div>
											{ s.notes ? <div className="text-xs text-gray-500 mt-1">{s.notes}</div> : null }
										</div>
										<div className="flex gap-2">
											<Button variant="outline" onClick={() => updateShiftStatus(s._id, "Completed")}>Mark Completed</Button>
											<Button variant="outline" className="border-red-200 text-red-600" onClick={() => updateShiftStatus(s._id, "Cancelled")}>Cancel</Button>
										</div>
									</div>
								))
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
