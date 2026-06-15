"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setAttendance } from "@/lib/store/slices/studentSlice"
import { apiFetch } from "@/lib/api"
import {
  RiArrowLeftLine,
  RiCalendarCheckLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from "@remixicon/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { format, addMonths, subMonths, addWeeks, subWeeks, addYears, subYears } from "date-fns"

interface Stats {
  present: number
  absent: number
  leave: number
  holiday: number
  unmarked: number
  percentage: number
}

interface AttendanceDay {
  date: string
  status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'HOLIDAY' | 'UNMARKED'
  title?: string
}

interface ApiResponse {
  startDate: string
  endDate: string
  days: AttendanceDay[]
  stats: Stats
}

export default function AttendancePage() {
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)
  const { profile } = useAppSelector((state) => state.student)
  
  const [range, setRange] = useState<'weekly' | 'monthly' | 'yearly'>('monthly')
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [days, setDays] = useState<AttendanceDay[]>([])
  const [holidays, setHolidays] = useState<any[]>([])
  const [stats, setStats] = useState<Stats>({
    present: 0,
    absent: 0,
    leave: 0,
    holiday: 0,
    unmarked: 0,
    percentage: 100,
  })

  useEffect(() => {
    const fetchAttendanceData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()
        const dateStr = currentDate.toISOString().split('T')[0]
        
        let url = `/attendance/me?range=${range}&date=${dateStr}`
        if (range === 'monthly') {
          url += `&month=${month}&year=${year}`
        } else if (range === 'yearly') {
          url += `&year=${year}`
        }

        const data: ApiResponse = await apiFetch(url)
        setDays(data.days)
        setStats(data.stats)
      } catch (err: any) {
        setError(err.message || "Failed to load attendance")
      } finally {
        setIsLoading(false)
      }
    }
    fetchAttendanceData()
  }, [range, currentDate])

  useEffect(() => {
    const fetchHolidays = async () => {
      if (!user?.School_id) return
      try {
        const data = await apiFetch(`/academics/events?schoolId=${user.School_id}`)
        const hList = Array.isArray(data) ? data.filter((e: any) => e.type === "HOLIDAY") : []
        const studentSectionId = profile?.section?.id || (profile as any)?.section_id
        
        const filtered = hList.filter((h: any) => 
          h.section_id === null || h.section_id === undefined || h.section_id === studentSectionId
        )
        setHolidays(filtered)
      } catch (err) {
        console.error("Failed to load holidays", err)
      }
    }
    fetchHolidays()
  }, [user, profile])

  const navigate = (direction: 'prev' | 'next') => {
    if (range === 'weekly') {
      setCurrentDate(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1))
    } else if (range === 'yearly') {
      setCurrentDate(prev => direction === 'prev' ? subYears(prev, 1) : addYears(prev, 1))
    } else {
      setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1))
    }
  }

  const getPeriodLabel = () => {
    if (range === 'weekly') {
      return `Week of ${format(currentDate, 'MMM d, yyyy')}`
    } else if (range === 'yearly') {
      return format(currentDate, 'yyyy')
    } else {
      return format(currentDate, 'MMMM yyyy')
    }
  }

  const statusConfig = {
    PRESENT: { label: 'Present', style: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', dot: 'bg-emerald-500' },
    ABSENT:  { label: 'Absent',  style: 'bg-red-500/10 text-red-600 border-red-500/20',           dot: 'bg-red-500'     },
    LEAVE:   { label: 'Leave',   style: 'bg-amber-500/10 text-amber-600 border-amber-500/20',     dot: 'bg-amber-500'   },
    HOLIDAY: { label: 'Holiday', style: 'bg-blue-500/10 text-blue-600 border-blue-500/20',         dot: 'bg-blue-500'    },
    UNMARKED: { label: 'Unmarked', style: 'bg-muted/40 text-muted-foreground border-border/50',    dot: 'bg-muted'       },
  }

  return (
    <div className="min-h-screen pb-10 relative z-0">
      <div className="absolute top-0 left-0 w-full h-[220px] bg-[#0A4EA6] rounded-b-[3rem] -z-10" />

      {/* Top Bar */}
      <div className="px-5 pt-12 pb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0 text-white"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black tracking-tight text-white">Attendance</h1>
          <p className="text-xs text-white/70 font-medium">Your interactive record & analysis</p>
        </div>
        <button
          onClick={() => router.push('/leave')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white text-[#0A4EA6] font-bold text-xs hover:bg-white/90 shadow-lg shadow-black/10 transition-all animate-pulse"
        >
          Apply Leave
        </button>
      </div>

      <div className="px-5 space-y-5">
        {/* Range Selector */}
        <div className="flex bg-white/10 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
          {(['weekly', 'monthly', 'yearly'] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                setRange(r)
                setCurrentDate(new Date())
              }}
              className={cn(
                "flex-1 py-2.5 text-xs font-bold rounded-xl transition-all capitalize",
                range === r
                  ? "bg-white text-[#0A4EA6] shadow-md"
                  : "text-white hover:bg-white/5"
              )}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Date Selector */}
        <div className="flex items-center justify-between px-2 bg-background/40 backdrop-blur-md border border-border/30 rounded-2xl py-2">
          <button
            onClick={() => navigate('prev')}
            className="w-8 h-8 rounded-xl bg-background/80 flex items-center justify-center hover:bg-muted border border-border/50 text-foreground transition-all"
          >
            <RiArrowLeftSLine className="w-5 h-5" />
          </button>
          <span className="text-sm font-black text-foreground tracking-tight">{getPeriodLabel()}</span>
          <button
            onClick={() => navigate('next')}
            className="w-8 h-8 rounded-xl bg-background/80 flex items-center justify-center hover:bg-muted border border-border/50 text-foreground transition-all"
          >
            <RiArrowRightSLine className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <RiLoader4Line className="w-8 h-8 animate-spin text-[#0A4EA6]" />
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
            <RiErrorWarningLine className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
        ) : (
          <>
            {/* Summary Card */}
            <Card className="rounded-3xl border-border/50 bg-background/60 backdrop-blur-md overflow-hidden shadow-xl">
              <CardContent className="p-6 space-y-5">
                {/* Ring + % */}
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted/20" />
                      <circle
                        cx="18" cy="18" r="15.9" fill="none" strokeWidth="2.5"
                        strokeDasharray={`${stats.percentage} ${100 - stats.percentage}`}
                        strokeLinecap="round"
                        className={cn(
                          stats.percentage >= 75 ? "text-emerald-500" :
                          stats.percentage >= 50 ? "text-amber-500" : "text-red-500"
                        )}
                        stroke="currentColor"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={cn(
                        "text-xl font-black",
                        stats.percentage >= 75 ? "text-emerald-500" :
                        stats.percentage >= 50 ? "text-amber-500" : "text-red-500"
                      )}>
                        {stats.percentage}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 flex-1">
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl text-center">
                      <p className="text-xl font-black text-emerald-500">{stats.present}</p>
                      <p className="text-[8px] font-black uppercase tracking-wider text-emerald-600/80">Present</p>
                    </div>
                    <div className="bg-red-500/5 border border-red-500/10 p-2.5 rounded-xl text-center">
                      <p className="text-xl font-black text-red-500">{stats.absent}</p>
                      <p className="text-[8px] font-black uppercase tracking-wider text-red-600/80">Absent</p>
                    </div>
                    <div className="bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl text-center">
                      <p className="text-xl font-black text-amber-500">{stats.leave}</p>
                      <p className="text-[8px] font-black uppercase tracking-wider text-amber-600/80">Leave</p>
                    </div>
                    <div className="bg-blue-500/5 border border-blue-500/10 p-2.5 rounded-xl text-center">
                      <p className="text-xl font-black text-blue-500">{stats.holiday}</p>
                      <p className="text-[8px] font-black uppercase tracking-wider text-blue-600/80">Holidays</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-center border-t border-border/30">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    Percentage calculation excludes Holidays and Leaves from denominator
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* List of Days */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Detailed Log</h3>
              {days.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                  <div className="w-14 h-14 rounded-3xl bg-muted/50 flex items-center justify-center">
                    <RiCalendarCheckLine className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground font-semibold text-sm">No records for this period</p>
                </div>
              ) : (
                days
                  .slice()
                  .reverse()
                  .map((record, i) => {
                    const cfg = statusConfig[record.status] || statusConfig.UNMARKED
                    const dateObj = new Date(record.date)
                    const formattedDate = format(dateObj, 'EEEE, MMM d, yyyy')
                    
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-4 px-4 py-3.5 rounded-2xl bg-background/60 border border-border/40 backdrop-blur-sm shadow-sm transition-all hover:bg-background/80"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", cfg.dot)} />
                          <div>
                            <p className="text-sm font-bold text-foreground">{formattedDate}</p>
                            {record.title && (
                              <p className="text-[10px] text-blue-500 font-semibold mt-0.5">{record.title}</p>
                            )}
                          </div>
                        </div>
                        <Badge className={cn("text-[9px] font-black uppercase tracking-widest border px-2.5 py-1", cfg.style)}>
                          {cfg.label}
                        </Badge>
                      </div>
                    )
                  })
              )}
            </div>

            {/* School Holiday List */}
            {holidays.length > 0 && (
              <div className="space-y-2.5 pt-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Upcoming School Holidays</h3>
                <div className="grid grid-cols-1 gap-2.5">
                  {holidays.map((event, idx) => {
                    const startFmt = format(new Date(event.startDate), "MMM d, yyyy")
                    const endFmt = event.endDate ? format(new Date(event.endDate), "MMM d, yyyy") : null
                    return (
                      <Card key={idx} className="border border-border/40 bg-background/50 shadow-sm rounded-2xl overflow-hidden">
                        <CardContent className="p-4 flex justify-between items-center gap-3">
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-sm text-foreground leading-snug">{event.title}</h4>
                            {event.description && <p className="text-xs text-muted-foreground">{event.description}</p>}
                            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">
                              {endFmt ? `${startFmt} — ${endFmt}` : startFmt}
                            </p>
                          </div>
                          <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest shrink-0">
                            Holiday
                          </Badge>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
