"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { CalendarIcon, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

interface LeaveRequestFormProps {
  onSubmit?: () => void
  onCancel?: () => void
}

export default function LeaveRequestForm({ onSubmit, onCancel }: LeaveRequestFormProps) {
  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    is_full_day: true,
    reason: "",
    emergency_contact: "",
    replacement_doctor: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableDoctors, setAvailableDoctors] = useState([])
  const [submitStatus, setSubmitStatus] = useState("")

  const leaveTypes = [
    { value: "sick_leave", label: "Sick Leave" },
    { value: "vacation", label: "Vacation" },
    { value: "emergency", label: "Emergency" },
    { value: "personal", label: "Personal" },
    { value: "conference", label: "Conference/Training" },
    { value: "other", label: "Other" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.leave_type || !formData.start_date || !formData.end_date || !formData.reason) {
      toast.error("Please fill in all required fields")
      return
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      toast.error("End date must be after start date")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("Submitting request...")

    try {
      console.log('Submitting leave request:', formData)
      
      const response = await fetch('/api/doctor/leave-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      console.log('Response status:', response.status)
      const responseData = await response.json()
      console.log('Response data:', responseData)

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to submit leave request')
      }

      toast.success("Leave request submitted successfully!")
      console.log('Leave request created:', responseData)
      setSubmitStatus("Request submitted successfully!")
      
      // Reset form
      setFormData({
        leave_type: "",
        start_date: "",
        end_date: "",
        start_time: "",
        end_time: "",
        is_full_day: true,
        reason: "",
        emergency_contact: "",
        replacement_doctor: "",
      })

      onSubmit?.()
    } catch (error) {
      console.error('Error submitting leave request:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setSubmitStatus(`Error: ${errorMessage}`)
      toast.error(errorMessage || "Failed to submit leave request. Please try again.")
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setSubmitStatus(""), 3000)
    }
  }

  return (
    <Card className="border-pink-100">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-pink-600" />
          Request Leave/Break
        </CardTitle>
        <CardDescription>
          Submit a leave request that will be sent to administration for approval
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Leave Type */}
          <div className="space-y-2">
            <Label htmlFor="leave_type">Leave Type *</Label>
            <Select value={formData.leave_type} onValueChange={(value) => setFormData({ ...formData, leave_type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  min={formData.start_date || new Date().toISOString().split('T')[0]}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Full Day Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_full_day"
              checked={formData.is_full_day}
              onCheckedChange={(checked) => setFormData({ ...formData, is_full_day: checked })}
            />
            <Label htmlFor="is_full_day">Full day leave</Label>
          </div>

          {/* Time Range (if not full day) */}
          {!formData.is_full_day && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Leave *</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a detailed reason for your leave request..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
            />
          </div>

          {/* Emergency Contact */}
          <div className="space-y-2">
            <Label htmlFor="emergency_contact">Emergency Contact Number</Label>
            <Input
              id="emergency_contact"
              type="tel"
              placeholder="Phone number where you can be reached"
              value={formData.emergency_contact}
              onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
            />
          </div>

          {/* Replacement Doctor */}
          <div className="space-y-2">
            <Label htmlFor="replacement_doctor">Suggested Replacement Doctor (Optional)</Label>
            <Input
              id="replacement_doctor"
              placeholder="Doctor ID or name who can cover your duties"
              value={formData.replacement_doctor}
              onChange={(e) => setFormData({ ...formData, replacement_doctor: e.target.value })}
            />
          </div>

          {/* Status Display */}
          {submitStatus && (
            <div className={`p-3 rounded-lg text-sm ${
              submitStatus.includes('Error') 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : submitStatus.includes('success') 
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {submitStatus}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
