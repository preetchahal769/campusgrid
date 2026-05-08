"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setAttendance } from "@/lib/store/slices/studentSlice"
import { apiFetch } from "@/lib/api"
import {
  RiArrowLeftLine,
  RiCalendarCheckLine,
  RiCalendarCloseLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiLeafLine,
} from "@remixicon/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"

export default function AttendancePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { attendance } = useAppSelector((state) => state.student)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await apiFetch('/attendance/me')
        dispatch(setAttendance(data))
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [dispatch])

  const totalDays = attendance.length
  const presentDays = attendance.filter(a => a.status === 'PRESENT').length
  const absentDays = attendance.filter(a => a.status === 'ABSENT').length
  const leaveDays = attendance.filter(a => a.status === 'LEAVE').length
  const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

  const statusConfig = {
    PRESENT: { label: 'Present', style: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', dot: 'bg-emerald-500' },
    ABSENT:  { label: 'Absent',  style: 'bg-red-500/10 text-red-600 border-red-500/20',           dot: 'bg-red-500'     },
    LEAVE:   { label: 'Leave',   style: 'bg-amber-500/10 text-amber-600 border-amber-500/20',     dot: 'bg-amber-500'   },
  }

  return (
    <div className="min-h-screen bg-background pb-10">
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
          <h1 className="text-xl font-black tracking-tight">Attendance</h1>
          <p className="text-xs text-muted-foreground font-medium">Your full attendance record</p>
        </div>
        <button
          onClick={() => router.push('/leave')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold text-xs hover:bg-primary hover:text-primary-foreground transition-all"
        >
          Leave
        </button>
      </div>

      <div className="px-5 space-y-5">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <RiLoader4Line className="w-8 h-8 animate-spin text-primary opacity-50" />
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
            <RiErrorWarningLine className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
        ) : (
          <>
            {/* Summary Card */}
            <Card className="rounded-3xl border-border/50 bg-background/60 backdrop-blur-md overflow-hidden">
              <CardContent className="p-6 space-y-5">
                {/* Ring + % */}
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted/30" />
                      <circle
                        cx="18" cy="18" r="15.9" fill="none" strokeWidth="2.5"
                        strokeDasharray={`${attendancePct} ${100 - attendancePct}`}
                        strokeLinecap="round"
                        className={cn(
                          attendancePct >= 75 ? "text-emerald-500" :
                          attendancePct >= 50 ? "text-amber-500" : "text-red-500"
                        )}
                        stroke="currentColor"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={cn(
                        "text-xl font-black",
                        attendancePct >= 75 ? "text-emerald-500" :
                        attendancePct >= 50 ? "text-amber-500" : "text-red-500"
                      )}>
                        {attendancePct}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 flex-1">
                    <div className="text-center space-y-1">
                      <p className="text-2xl font-black text-emerald-500">{presentDays}</p>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Present</p>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-2xl font-black text-red-500">{absentDays}</p>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Absent</p>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-2xl font-black text-amber-500">{leaveDays}</p>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Leave</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="h-3 rounded-full bg-muted/40 overflow-hidden flex gap-0.5">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${(presentDays / totalDays) * 100}%` }}
                    />
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-700"
                      style={{ width: `${(leaveDays / totalDays) * 100}%` }}
                    />
                    <div
                      className="h-full bg-red-500 rounded-full transition-all duration-700"
                      style={{ width: `${(absentDays / totalDays) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium text-right">{totalDays} total recorded days</p>
                </div>
              </CardContent>
            </Card>

            {/* Full Record List */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Full Record</h3>
              {attendance.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                  <div className="w-14 h-14 rounded-3xl bg-muted/50 flex items-center justify-center">
                    <RiCalendarCheckLine className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground font-semibold text-sm">No attendance records found</p>
                </div>
              ) : (
                attendance
                  .slice()
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((record, i) => {
                    const cfg = statusConfig[record.status] ?? statusConfig.ABSENT
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-background/60 border border-border/40 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", cfg.dot)} />
                        <div className="flex-1">
                          <p className="text-sm font-bold">
                            {format(parseISO(record.date), 'EEEE, MMM d, yyyy')}
                          </p>
                        </div>
                        <Badge className={cn("text-[10px] font-bold border", cfg.style)}>
                          {cfg.label}
                        </Badge>
                      </div>
                    )
                  })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
