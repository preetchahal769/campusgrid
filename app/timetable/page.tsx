"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setTimetable } from "@/lib/store/slices/studentSlice"
import { apiFetch } from "@/lib/api"
import {
  RiArrowLeftLine,
  RiCalendarCheckLine,
  RiTimeLine,
  RiUserLine,
  RiBookOpenLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiCalendarEventLine,
  RiArrowRightSLine,
} from "@remixicon/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function TimetablePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { profile, timetable } = useAppSelector((state) => state.student)
  
  const [selectedDay, setSelectedDay] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize selected day to current day if valid, otherwise Monday
  useEffect(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    if (DAYS.includes(today)) {
      setSelectedDay(today)
    } else {
      setSelectedDay("Monday")
    }
  }, [])

  useEffect(() => {
    if (!profile?.section?.id) return

    const fetchTimetable = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await apiFetch(`/academics/timetable/section/${profile.section.id}`)
        dispatch(setTimetable(data))
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTimetable()
  }, [dispatch, profile?.section?.id])

  const filteredTimetable = timetable
    .filter(t => t.dayOfWeek === selectedDay)
    .sort((a, b) => a.lectureNo - b.lectureNo)

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Decorative header bg */}
      <div className="fixed top-0 left-0 w-full h-48 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight">Schedule</h1>
          <p className="text-xs text-muted-foreground font-medium">Your weekly academic journey</p>
        </div>
      </div>

      {/* Day Selector */}
      <div className="px-5 mb-8">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {DAYS.map((day) => {
            const isSelected = selectedDay === day
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 border",
                  isSelected 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105" 
                    : "bg-background/40 border-border/50 text-muted-foreground hover:border-primary/30"
                )}
              >
                {day.substring(0, 3)}
              </button>
            )
          })}
        </div>
      </div>

      <main className="px-5 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RiLoader4Line className="w-8 h-8 animate-spin text-primary opacity-50" />
            <p className="text-sm font-medium text-muted-foreground">Syncing schedule...</p>
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
            <RiErrorWarningLine className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
        ) : filteredTimetable.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center">
              <RiCalendarCheckLine className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-muted-foreground font-bold">No classes scheduled</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Enjoy your free time!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTimetable.map((entry, index) => (
              <Card 
                key={entry.id}
                className={cn(
                  "rounded-3xl border-border/50 bg-background/60 backdrop-blur-md overflow-hidden transition-all duration-500",
                  "animate-in fade-in slide-in-from-bottom-4"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Time Column */}
                    <div className="w-24 bg-muted/30 border-r border-border/30 flex flex-col items-center justify-center p-4 gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Lecture {entry.lectureNo}</span>
                      <span className="text-xs font-black tracking-tight">{entry.startTime}</span>
                      <div className="w-px h-4 bg-border/40" />
                      <span className="text-xs font-black tracking-tight opacity-40">{entry.endTime}</span>
                    </div>
                    
                    {/* Details Column */}
                    <div className="flex-1 p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold text-[10px] uppercase tracking-tighter">
                          {entry.teachersubjectsection.subject.name}
                        </Badge>
                        <RiArrowRightSLine className="w-4 h-4 text-muted-foreground/30" />
                      </div>
                      
                      <div className="space-y-1.5">
                        <h3 className="font-black text-lg tracking-tight leading-tight">
                          {entry.teachersubjectsection.subject.name} Exploration
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                          <RiUserLine className="w-3.5 h-3.5 text-primary/60" />
                          <span>{entry.teachersubjectsection.teachers.users.name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                          <RiCalendarEventLine className="w-3.5 h-3.5" />
                          Room 402
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                          <RiTimeLine className="w-3.5 h-3.5" />
                          1h 00m
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
