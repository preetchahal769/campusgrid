"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setTimetable, setTeacherProfile } from "@/lib/store/slices/teacherSlice"
import { apiFetch } from "@/lib/api"
import {
  RiArrowLeftLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiCalendarCheckLine,
  RiBookOpenLine,
  RiGroupLine,
  RiArrowRightSLine,
} from "@remixicon/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function TeacherSchedulePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { timetable, profile } = useAppSelector((state) => state.teacher)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const defaultDay = DAYS.includes(todayName) ? todayName : 'Monday'
  const [selectedDay, setSelectedDay] = useState(defaultDay)

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Step 1: get teacher profile to extract teacher record ID
        const teacherProfile = profile?.id
          ? profile
          : await apiFetch('/teachers/me').then(p => { dispatch(setTeacherProfile(p)); return p })

        // Step 2: fetch schedule using teacher profile ID
        const data = await apiFetch(`/academics/timetable/teacher/${teacherProfile.id}`)
        console.log('🗓️ Timetable API raw response:', data)
        const entries = Array.isArray(data) ? data : []
        dispatch(setTimetable(entries))

        // Auto-select first day with classes if today has none
        const todayHasClasses = entries.some(
          (t: any) => t.dayOfWeek?.toLowerCase() === defaultDay.toLowerCase()
        )
        if (!todayHasClasses && entries.length > 0) {
          const firstDayWithClasses = DAYS.find(day =>
            entries.some((t: any) => t.dayOfWeek?.toLowerCase() === day.toLowerCase())
          )
          if (firstDayWithClasses) setSelectedDay(firstDayWithClasses)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [dispatch, profile?.id])

  // Normalize day comparison — API may return any casing
  const filteredSchedule = timetable
    .filter(t => t.dayOfWeek?.toLowerCase() === selectedDay.toLowerCase())
    .sort((a, b) => a.lectureNo - b.lectureNo)

  const weekSummary = DAYS.map(day => ({
    day,
    count: timetable.filter(t => t.dayOfWeek?.toLowerCase() === day.toLowerCase()).length,
  }))

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="fixed top-0 left-0 w-full h-48 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black tracking-tight">My Schedule</h1>
          <p className="text-xs text-muted-foreground font-medium">Your weekly teaching timetable</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">
          {timetable.length} lectures/wk
        </Badge>
      </div>

      {/* Weekly Load Grid */}
      {timetable.length > 0 && (
        <div className="px-5 mb-6">
          <div className="grid grid-cols-6 gap-1.5">
            {weekSummary.map(({ day, count }) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all duration-200",
                  selectedDay === day
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : count > 0
                      ? "bg-background/60 border-border/50 text-muted-foreground hover:border-primary/30"
                      : "bg-muted/20 border-dashed border-border/40 text-muted-foreground/40"
                )}
              >
                <span className="text-[10px] font-black uppercase tracking-wide">{day.substring(0, 3)}</span>
                <span className={cn(
                  "text-lg font-black leading-none",
                  selectedDay === day ? "text-primary-foreground" : count > 0 ? "text-foreground" : "text-muted-foreground/30"
                )}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Day Label */}
      <div className="px-5 mb-4 flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          {selectedDay} — {filteredSchedule.length} class{filteredSchedule.length !== 1 ? 'es' : ''}
        </h2>
        {selectedDay === todayName && (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold">Today</Badge>
        )}
      </div>

      <div className="px-5 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RiLoader4Line className="w-8 h-8 animate-spin text-primary opacity-50" />
            <p className="text-xs text-muted-foreground font-medium">Fetching your schedule...</p>
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
            <RiErrorWarningLine className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
        ) : filteredSchedule.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center">
              <RiCalendarCheckLine className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <div>
              <p className="font-bold text-muted-foreground">No classes on {selectedDay}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Select another day above</p>
            </div>
          </div>
        ) : (
          filteredSchedule.map((entry, index) => {
            // API returns subject/section nested under teachersubjectsection
            // Fallback to flat structure if backend changes
            const subject = entry.teachersubjectsection?.subject ?? entry.subject
            const section = entry.teachersubjectsection?.section ?? entry.section

            return (
              <Card
                key={index}
                className="rounded-3xl border-border/50 bg-background/60 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Lecture Number Column */}
                    <div className="w-16 bg-primary/10 flex flex-col items-center justify-center py-5 shrink-0 border-r border-primary/10">
                      <span className="text-[9px] font-black uppercase tracking-wider text-primary/50">Lec</span>
                      <span className="text-2xl font-black text-primary leading-tight">{entry.lectureNo}</span>
                    </div>

                    {/* Details Column */}
                    <div className="flex-1 p-5 space-y-2.5">
                      <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px] uppercase tracking-tighter">
                        {subject?.name ?? '—'}
                      </Badge>
                      <p className="font-black text-base leading-tight">
                        {section?.grade?.name} — {section?.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {subject?.name} · {entry.dayOfWeek}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
