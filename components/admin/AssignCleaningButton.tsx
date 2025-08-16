"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Room {
  id: string
  roomNumber: string
  type: string
  status: string
}

interface AssignCleaningButtonProps {
  room: Room
  onCleaningAssigned?: () => void
}

export default function AssignCleaningButton({ room, onCleaningAssigned }: AssignCleaningButtonProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium')
  const [cleaningType, setCleaningType] = useState<'Regular Clean' | 'Deep Clean' | 'Sanitization' | 'Maintenance'>('Regular Clean')
  const [notes, setNotes] = useState('')
  const { toast } = useToast()

  const handleAssignCleaning = async () => {
    try {
      const response = await fetch('/api/admin/cleaning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assignCleaning',
          roomId: room.id,
          roomNumber: room.roomNumber,
          priority,
          cleaningType,
          notes
        })
      })

      if (response.ok) {
        toast({ title: 'Cleaning assigned successfully' })
        setShowDialog(false)
        setPriority('Medium')
        setCleaningType('Regular Clean')
        setNotes('')
        onCleaningAssigned?.()
      } else {
        const error = await response.json()
        toast({ title: error.error || 'Error assigning cleaning', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error assigning cleaning:', error)
      toast({ title: 'Error assigning cleaning', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-red-600 border-red-200">
          <Sparkles className="mr-1 h-3 w-3" />
          Assign Cleaning
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Cleaning - Room {room.roomNumber}</DialogTitle>
          <DialogDescription>
            Automatically assign cleaning to available staff for this room.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <Select value={priority} onValueChange={val => setPriority(val as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Cleaning Type</label>
            <Select value={cleaningType} onValueChange={val => setCleaningType(val as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select cleaning type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Regular Clean">Regular Clean</SelectItem>
                <SelectItem value="Deep Clean">Deep Clean</SelectItem>
                <SelectItem value="Sanitization">Sanitization</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
            <Textarea 
              placeholder="Any special instructions or notes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
          
          <Button onClick={handleAssignCleaning} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            Assign Cleaning
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
