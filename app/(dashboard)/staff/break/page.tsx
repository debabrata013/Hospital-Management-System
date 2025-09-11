"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Timer, Loader2, PlayCircle, StopCircle, ChevronLeft } from "lucide-react"
import { toast } from "sonner"
import { format, intervalToDuration } from "date-fns"

interface Break {
  id: number
  start_time: string
  end_time: string | null
  duration: number | null
}

export default function BreakPage() {
  const router = useRouter()
  const [breaks, setBreaks] = useState<Break[]>([])
  const [activeBreak, setActiveBreak] = useState<Break | null>(null)
  const [timer, setTimer] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchBreaks()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (activeBreak) {
      setTimer(Math.floor((new Date().getTime() - new Date(activeBreak.start_time).getTime()) / 1000))
      intervalRef.current = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      setTimer(0)
    }
  }, [activeBreak])

  const fetchBreaks = async () => {
    try {
      // Add { cache: "no-store" } to prevent browser caching issues
      const response = await fetch("/api/staff/breaks", { cache: "no-store" })
      const data = await response.json()

      if (data.success) {
        setBreaks(data.breaks.filter((b: Break) => b.end_time))
        setActiveBreak(data.breaks.find((b: Break) => !b.end_time) || null)
      }
    } catch (error) {
      console.error("Error fetching breaks:", error)
      toast.error("Failed to load break history.")
    }
  }

  const handleStartBreak = async () => {
    setSubmitting(true)
    try {
      const response = await fetch("/api/staff/break/start", { method: "POST" })
      const data = await response.json()

      if (data.success) {
        toast.success("Break started.")
        setActiveBreak(data.break)
      } else {
        toast.error(data.error || "Failed to start break.")
      }
    } catch (error) {
      console.error("Error starting break:", error)
      toast.error("An unexpected error occurred.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEndBreak = async () => {
    if (!activeBreak) return
    setSubmitting(true)

    try {
      const response = await fetch("/api/staff/break/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ break_id: activeBreak.id }),
      })
      const data = await response.json()

      if (data.success) {
        toast.success("Break ended.")
        setActiveBreak(null)
        // Manually add the completed break to the history to avoid re-fetching
        setBreaks(prevBreaks => [data.break, ...prevBreaks])
      } else {
        toast.error(data.error || "Failed to end break.")
      }
    } catch (error) {
      console.error("Error ending break:", error)
      toast.error("An unexpected error occurred.")
    } finally {
      setSubmitting(false)
    }
  }

  // Correctly format the timer with manual padding
  const formatTimer = (totalSeconds: number) => {
    if (totalSeconds < 0) totalSeconds = 0;
    const duration = intervalToDuration({ start: 0, end: totalSeconds * 1000 });
    const hours = (duration.hours ?? 0).toString().padStart(2, '0');
    const minutes = (duration.minutes ?? 0).toString().padStart(2, '0');
    const seconds = (duration.seconds ?? 0).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Break Management</h1>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Break Management</CardTitle>
          <CardDescription>Start or end your break.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {activeBreak ? (
            <div className="space-y-4">
              <p className="text-lg font-medium">Currently on break</p>
              <div className="flex items-center justify-center space-x-2 text-4xl font-bold text-primary">
                <Timer className="h-10 w-10" />
                <span>{formatTimer(timer)}</span>
              </div>
              <Button
                size="lg"
                onClick={handleEndBreak}
                disabled={submitting}
                className="bg-red-500 hover:bg-red-600"
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <StopCircle className="mr-2 h-5 w-5" />
                )}
                End Break
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              onClick={handleStartBreak}
              disabled={submitting}
              className="bg-green-500 hover:bg-green-600"
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlayCircle className="mr-2 h-5 w-5" />
              )}
              Start Break
            </Button>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Break History</CardTitle>
          <CardDescription>Your past breaks for today.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breaks.length > 0 ? (
                breaks.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>{format(new Date(b.start_time), "PPP p")}</TableCell>
                    <TableCell>{b.end_time ? format(new Date(b.end_time), "PPP p") : "-"}</TableCell>
                    <TableCell>
                      {b.duration != null ? formatTimer(b.duration) : "-"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No breaks recorded today.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
