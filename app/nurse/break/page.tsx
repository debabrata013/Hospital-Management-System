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
      // Calculate initial elapsed time from break start
      const startTime = new Date(activeBreak.start_time).getTime()
      const currentTime = new Date().getTime()
      const elapsedSeconds = Math.floor((currentTime - startTime) / 1000)
      
      console.log('[BREAK-TIMER] Break start time:', activeBreak.start_time)
      console.log('[BREAK-TIMER] Current time:', new Date().toISOString())
      console.log('[BREAK-TIMER] Elapsed seconds:', elapsedSeconds)
      
      setTimer(Math.max(0, elapsedSeconds)) // Ensure timer is never negative
      
      // Update timer every second
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
      const response = await fetch("/api/staff/fetch_Breaks", { cache: "no-store" })
      const data = await response.json()
      console.log('[BREAK-PAGE] Fetched breaks data:', data)

      if (data.success) {
        const completedBreaks = data.breaks.filter((b: Break) => b.end_time)
        const activeBreakItem = data.breaks.find((b: Break) => !b.end_time) || null
        
        console.log('[BREAK-PAGE] Completed breaks:', completedBreaks.length)
        console.log('[BREAK-PAGE] Active break:', activeBreakItem)
        
        // Check if active break is too old (more than 2 hours)
        if (activeBreakItem) {
          const breakStartTime = new Date(activeBreakItem.start_time).getTime()
          const currentTime = new Date().getTime()
          const hoursElapsed = (currentTime - breakStartTime) / (1000 * 60 * 60)
          
          console.log('[BREAK-PAGE] Active break hours elapsed:', hoursElapsed)
          
          if (hoursElapsed > 2) {
            console.log('[BREAK-PAGE] Active break is too old, auto-ending it...')
            // Auto-end the old break
            await handleEndBreak(activeBreakItem.id, true)
            // Refresh data after auto-ending
            setTimeout(() => fetchBreaks(), 1000)
            return
          }
        }
        
        setBreaks(completedBreaks)
        setActiveBreak(activeBreakItem)
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
        console.log('[BREAK-START] Break started:', data.break)
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

  const handleEndBreak = async (breakId?: number, isAutoEnd?: boolean) => {
    const targetBreakId = breakId || activeBreak?.id
    if (!targetBreakId) return
    
    if (!isAutoEnd) setSubmitting(true)

    try {
      const response = await fetch("/api/staff/break/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ break_id: targetBreakId }),
      })
      const data = await response.json()

      if (data.success) {
        if (isAutoEnd) {
          toast.success("Old break automatically ended.")
          console.log('[BREAK-END] Auto-ended old break:', data.break)
        } else {
          toast.success("Break ended.")
          console.log('[BREAK-END] Break ended:', data.break)
        }
        
        setActiveBreak(null)
        // Manually add the completed break to the history to avoid re-fetching
        setBreaks(prevBreaks => [data.break, ...prevBreaks])
        
        if (!isAutoEnd) {
          // Refresh the break data to get updated totals
          fetchBreaks()
        }
      } else {
        if (!isAutoEnd) {
          toast.error(data.error || "Failed to end break.")
        }
      }
    } catch (error) {
      console.error("Error ending break:", error)
      if (!isAutoEnd) {
        toast.error("An unexpected error occurred.")
      }
    } finally {
      if (!isAutoEnd) setSubmitting(false)
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Break Management</h1>
          </div>
          {activeBreak && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const hoursElapsed = (new Date().getTime() - new Date(activeBreak.start_time).getTime()) / (1000 * 60 * 60)
                if (hoursElapsed > 1) {
                  handleEndBreak(activeBreak.id, true)
                }
              }}
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              Reset Old Break
            </Button>
          )}
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
                onClick={() => handleEndBreak()}
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
