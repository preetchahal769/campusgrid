"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/store/hooks"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { apiFetch } from "@/lib/api"
import {
  RiArrowLeftLine,
  RiCalendarEventLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiAddLine,
  RiDeleteBinLine,
} from "@remixicon/react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SchoolEvent {
  id: string
  title: string
  description?: string
  startDate: string
  endDate?: string
  type: string
  section?: { name: string; grade?: { name: string } }
}

export default function PrincipalCalendarPage() {
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)

  const [events, setEvents] = useState<SchoolEvent[]>([])
  const [sections, setSections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedSectionId, setSelectedSectionId] = useState("all")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchEvents = async () => {
    if (!user?.School_id) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiFetch(`/academics/events?schoolId=${user.School_id}`)
      setEvents(data.filter((e: SchoolEvent) => e.type === "HOLIDAY"))
    } catch (err: any) {
      setError(err.message || "Failed to load events")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSections = async () => {
    try {
      const data = await apiFetch('/academics/sections')
      setSections(data)
    } catch (err) {
      console.error("Failed to load sections", err)
    }
  }

  useEffect(() => {
    fetchEvents()
    fetchSections()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.School_id) return
    if (!title || !startDate) return

    setIsSubmitting(true)
    setError(null)
    try {
      await apiFetch("/academics/events", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          startDate,
          endDate: endDate || undefined,
          type: "HOLIDAY",
          School_id: user.School_id,
          section_id: selectedSectionId === "all" ? undefined : selectedSectionId,
        }),
      })

      // Reset form
      setTitle("")
      setDescription("")
      setStartDate("")
      setEndDate("")
      setSelectedSectionId("all")
      
      // Reload events list
      await fetchEvents()
    } catch (err: any) {
      setError(err.message || "Failed to create holiday")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] relative z-0 text-foreground">
      {/* Header Banner */}
      <div className="absolute top-0 left-0 w-full h-[220px] bg-[#0A4EA6] rounded-b-[3rem] -z-10" />

      <div className="px-6 pt-12 pb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0 text-white"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black tracking-tight text-white">Holiday Planner</h1>
          <p className="text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-widest mt-0.5 truncate">
            Declare School Holidays & Calendar Events
          </p>
        </div>
      </div>

      <div className="px-6 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
        {/* Create Holiday Form */}
        <Card className="rounded-[2rem] border-border/40 bg-background/60 backdrop-blur-md shadow-xl overflow-hidden h-fit">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
              <RiCalendarEventLine className="w-5 h-5 text-primary" />
              Declare New Holiday
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm font-semibold">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Holiday Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winter Break, Independence Day"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-muted/65 border border-border/45 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Description (Optional)</label>
                <textarea
                  placeholder="Additional details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-muted/65 border border-border/45 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground min-h-[80px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Applicable Class / Scope</label>
                <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
                  <SelectTrigger className="w-full h-11 rounded-2xl bg-muted/65 border border-border/45 text-sm font-semibold text-left">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/50 shadow-xl overflow-hidden bg-background">
                    <SelectItem value="all" className="text-xs sm:text-sm font-semibold cursor-pointer">All Classes (School-wide)</SelectItem>
                    {sections.map(s => (
                      <SelectItem key={s.id} value={s.id} className="text-xs sm:text-sm font-semibold cursor-pointer">
                        {s.grade?.name} - {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-muted/65 border border-border/45 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">End Date (Optional)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-muted/65 border border-border/45 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-full text-base font-bold bg-primary hover:bg-primary/90 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  <RiLoader4Line className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <RiAddLine className="w-5 h-5" />
                    <span>Create Holiday</span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Holidays List */}
        <Card className="rounded-[2rem] border-border/40 bg-background/60 backdrop-blur-md shadow-xl overflow-hidden flex flex-col h-[520px]">
          <div className="p-6 border-b border-border/40 shrink-0">
            <h2 className="text-lg font-black tracking-tight">Declared Holidays</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Sundays are automatically marked and not shown here.</p>
          </div>

          <ScrollArea className="flex-1 w-full p-6">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <RiLoader4Line className="w-8 h-8 animate-spin text-[#0A4EA6]" />
              </div>
            ) : error ? (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
                <RiErrorWarningLine className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="font-semibold text-sm">{error}</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground font-semibold text-sm">
                No custom school holidays declared yet.
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => {
                  const startFmt = format(new Date(event.startDate), "MMM d, yyyy")
                  const endFmt = event.endDate ? format(new Date(event.endDate), "MMM d, yyyy") : null

                  return (
                    <Card key={event.id} className="p-4 rounded-2xl border border-border/45 bg-background shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-bold text-sm text-foreground">{event.title}</h3>
                          {event.description && <p className="text-xs text-muted-foreground">{event.description}</p>}
                          {event.section && (
                            <p className="text-[10px] text-amber-600 font-bold">
                              Class: {event.section.grade?.name} - {event.section.name} only
                            </p>
                          )}
                          <p className="text-[10px] text-primary font-black uppercase tracking-wider pt-1">
                            {endFmt ? `${startFmt} — ${endFmt}` : startFmt}
                          </p>
                        </div>
                        <Badge className="bg-red-500/10 text-red-600 border border-red-500/20 text-[9px] font-black uppercase tracking-widest shrink-0">
                          Holiday
                        </Badge>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>
    </div>
  )
}
