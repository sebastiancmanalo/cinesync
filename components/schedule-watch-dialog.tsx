"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

interface ScheduleWatchDialogProps {
  isOpen: boolean
  onClose: () => void
  watchlistId: string
  watchlistItemId: string
  movieTitle: string
  estimatedDuration: number
}

export function ScheduleWatchDialog({
  isOpen,
  onClose,
  watchlistId,
  watchlistItemId,
  movieTitle,
  estimatedDuration,
}: ScheduleWatchDialogProps) {
  const [title, setTitle] = useState(movieTitle)
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [time, setTime] = useState("19:00")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSchedule = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = await createClient()

      // Calculate start and end times
      const [hours, minutes] = time.split(":").map(Number)
      const startTime = new Date(date)
      startTime.setHours(hours, minutes, 0, 0)

      const endTime = new Date(startTime)
      endTime.setMinutes(endTime.getMinutes() + estimatedDuration)

      // Create watchlist event
      const { data: event, error: eventError } = await supabase
        .from("watchlist_events")
        .insert({
          watchlist_id: watchlistId,
          watchlist_item_id: watchlistItemId,
          title,
          description,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
        })
        .select()
        .single()

      if (eventError) throw eventError

      // Create Google Calendar event
      const { error: calendarError } = await supabase.functions.invoke("create-calendar-event", {
        body: {
          eventId: event.id,
          title,
          description,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        },
      })

      if (calendarError) throw calendarError

      onClose()
    } catch (error) {
      console.error("Error scheduling watch:", error)
      setError("Failed to schedule watch. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white/95">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
            Schedule Watch
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-900">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/95 text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-900">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional details..."
              className="min-h-[100px] bg-white/95 text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-900">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-white/95 text-gray-900"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white/95">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time" className="text-gray-900">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-white/95 text-gray-900"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="bg-white/95 text-gray-900">
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={loading}
            className="bg-gradient-to-r from-pink-500 to-yellow-400 hover:from-pink-600 hover:to-yellow-500 text-black"
          >
            {loading ? "Scheduling..." : "Schedule Watch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 