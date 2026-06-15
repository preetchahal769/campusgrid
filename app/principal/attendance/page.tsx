"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiFetch } from "@/lib/api"
import {
  RiArrowLeftLine,
  RiCalendarEventLine,
  RiSearchLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiCloseLine,
  RiLineChartLine,
  RiUserStarLine,
  RiTeamLine,
} from "@remixicon/react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface AttendanceDay {
  date: string
  status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'HOLIDAY' | 'UNMARKED'
  title?: string
}

interface UserRecord {
  user: {
    id: string
    name: string
    email: string
    role: string
    students?: Array<{
      rollNumber: number
      section: { id: string; name: string }
    }>
  }
  days: AttendanceDay | AttendanceDay[]
  stats: {
    present: number
    absent: number
    leave: number
    holiday: number
    unmarked: number
    percentage: number
  }
}

interface ApiResponse {
  startDate: string
  endDate: string
  records: UserRecord[]
}

export default function PrincipalAttendancePage() {
  const router = useRouter()
  const [sections, setSections] = useState<any[]>([])
  const [selectedSectionId, setSelectedSectionId] = useState<string>("all")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [range, setRange] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily')
  const [date, setDate] = useState<Date>(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [records, setRecords] = useState<UserRecord[]>([])
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserRecord | null>(null)

  // Fetch all school sections
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const data = await apiFetch('/academics/sections')
        setSections(Array.isArray(data) ? data : [])
      } catch (err: any) {
        setError(err.message || "Failed to load sections")
      }
    }
    fetchSections()
  }, [])

  // Fetch attendance records based on filters
  useEffect(() => {
    const fetchAttendance = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const month = date.getMonth() + 1
        const year = date.getFullYear()

        let url = `/attendance?date=${format(date, 'yyyy-MM-dd')}`
        
        if (selectedSectionId && selectedSectionId !== 'all') {
          url += `&section_id=${selectedSectionId}`
        }
        if (selectedRole && selectedRole !== 'all') {
          url += `&targetRole=${selectedRole}`
        }
        if (range !== 'daily') {
          url += `&range=${range}`
          if (range === 'monthly') {
            url += `&month=${month}&year=${year}`
          } else if (range === 'yearly') {
            url += `&year=${year}`
          }
        }

        const data: ApiResponse = await apiFetch(url)
        setRecords(data?.records || [])
      } catch (err: any) {
        setError(err.message || "Failed to fetch attendance records")
      } finally {
        setIsLoading(false)
      }
    }
    fetchAttendance()
  }, [selectedSectionId, selectedRole, range, date])

  const filteredRecords = records.filter(r => 
    r.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const statusConfig = {
    PRESENT: { label: 'Present', style: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', dot: 'bg-emerald-500' },
    ABSENT:  { label: 'Absent',  style: 'bg-red-500/10 text-red-600 border-red-500/20',           dot: 'bg-red-500'     },
    LEAVE:   { label: 'Leave',   style: 'bg-amber-500/10 text-amber-600 border-amber-500/20',     dot: 'bg-amber-500'   },
    HOLIDAY: { label: 'Holiday', style: 'bg-blue-500/10 text-blue-600 border-blue-500/20',         dot: 'bg-blue-500'    },
    UNMARKED: { label: 'Unmarked', style: 'bg-muted/40 text-muted-foreground border-border/50',    dot: 'bg-muted'       },
  }

  return (
    <div className="flex flex-col min-h-[100dvh] relative z-0 text-foreground">
      {/* Header Banner */}
      <div className="absolute top-0 left-0 w-full h-[220px] bg-[#0A4EA6] rounded-b-[3rem] -z-10" />

      <div className="sticky top-0 z-10 px-6 pt-12 pb-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0 text-white"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black tracking-tight text-white">School Attendance</h1>
            <p className="text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-widest mt-0.5 truncate">
              Principal School-wide Panel
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
              <SelectTrigger className="flex-1 min-w-[120px] h-11 rounded-2xl bg-background/60 shadow-sm border-border/50 text-xs font-semibold">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/50 shadow-xl overflow-hidden">
                <SelectItem value="all" className="text-xs sm:text-sm font-semibold cursor-pointer">All Classes</SelectItem>
                {sections.map(s => (
                  <SelectItem key={s.id} value={s.id} className="text-xs sm:text-sm font-semibold cursor-pointer">
                    {s.grade?.name} - {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="flex-1 min-w-[120px] h-11 rounded-2xl bg-background/60 shadow-sm border-border/50 text-xs font-semibold">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/50 shadow-xl overflow-hidden">
                <SelectItem value="all" className="text-xs sm:text-sm font-semibold cursor-pointer">All Roles</SelectItem>
                <SelectItem value="STUDENT" className="text-xs sm:text-sm font-semibold cursor-pointer">Students</SelectItem>
                <SelectItem value="TEACHER" className="text-xs sm:text-sm font-semibold cursor-pointer">Teachers</SelectItem>
                <SelectItem value="STAFF" className="text-xs sm:text-sm font-semibold cursor-pointer">Staff</SelectItem>
              </SelectContent>
            </Select>

            <Select value={range} onValueChange={(r: any) => setRange(r)}>
              <SelectTrigger className="w-[100px] h-11 rounded-2xl bg-background/60 shadow-sm border-border/50 text-xs font-semibold">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/50 shadow-xl overflow-hidden">
                <SelectItem value="daily" className="text-xs sm:text-sm font-semibold cursor-pointer">Daily</SelectItem>
                <SelectItem value="weekly" className="text-xs sm:text-sm font-semibold cursor-pointer">Weekly</SelectItem>
                <SelectItem value="monthly" className="text-xs sm:text-sm font-semibold cursor-pointer">Monthly</SelectItem>
                <SelectItem value="yearly" className="text-xs sm:text-sm font-semibold cursor-pointer">Yearly</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("h-11 rounded-2xl bg-background/60 shadow-sm border-border/50 flex-1 min-w-[140px] justify-start text-left font-semibold text-xs", !date && "text-muted-foreground")}>
                  <RiCalendarEventLine className="mr-2 h-4 w-4 opacity-50 text-blue-600 shrink-0" />
                  {date ? format(date, "MMM d, yyyy") : <span>Pick date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl border-border/50 shadow-xl" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  disabled={(d) => d > new Date()}
                  initialFocus
                  className="p-3"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-3 rounded-full bg-background/60 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-md transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 w-full p-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <RiLoader4Line className="w-8 h-8 animate-spin text-white" />
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive m-2">
            <RiErrorWarningLine className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
        ) : (
          <div className="space-y-3 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredRecords.map((record) => {
              const hasSingleDay = range === 'daily'
              const dayRecord = hasSingleDay ? (record.days as AttendanceDay) : null
              const cfg = dayRecord ? (statusConfig[dayRecord.status] || statusConfig.UNMARKED) : null

              return (
                <Card
                  key={record.user.id}
                  onClick={() => setSelectedUserDetail(record)}
                  className="p-4 rounded-2xl border shadow-sm border-border/40 bg-background/60 hover:bg-background/80 hover:border-primary/20 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                      record.user.role === 'TEACHER' ? "bg-amber-500/10 text-amber-600" :
                      record.user.role === 'STUDENT' ? "bg-blue-500/10 text-blue-600" : "bg-purple-500/10 text-purple-600"
                    )}>
                      {record.user.role === 'TEACHER' ? <RiUserStarLine className="w-5 h-5" /> : <RiTeamLine className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm leading-tight text-foreground truncate">
                        {record.user.name}
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-1 font-semibold uppercase tracking-wider">
                        {record.user.role} {record.user.students?.[0]?.section ? `• ${record.user.students[0].section.name}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {hasSingleDay && cfg ? (
                      <div className={cn("px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border", cfg.style)}>
                        {cfg.label}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 bg-muted/40 border border-border/40 px-3 py-1.5 rounded-xl text-xs font-bold text-foreground">
                        <RiLineChartLine className="w-4 h-4 text-[#0A4EA6]" />
                        <span>{record.stats.percentage}%</span>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}

            {filteredRecords.length === 0 && (
              <div className="text-center py-16 text-muted-foreground text-sm font-semibold">
                No attendance logs found matching these parameters.
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* User drill-down model */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-background w-full sm:max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-border/40 shadow-2xl p-6 space-y-6 animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight">{selectedUserDetail.user.name}</h2>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">
                  Role: {selectedUserDetail.user.role} • Detailed Log
                </p>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted border border-border/50 text-foreground transition-all"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            {/* Micro analysis */}
            <div className="grid grid-cols-2 gap-4 bg-muted/20 border border-border/30 rounded-3xl p-5">
              <div className="flex flex-col justify-center">
                <span className="text-3xl font-black text-primary">{selectedUserDetail.stats.percentage}%</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">Attendance Rate</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-1.5 rounded-xl">
                  <p className="text-emerald-500 font-black">{selectedUserDetail.stats.present}</p>
                  <p className="text-[8px] text-emerald-600 uppercase">Present</p>
                </div>
                <div className="bg-red-500/5 border border-red-500/10 p-1.5 rounded-xl">
                  <p className="text-red-500 font-black">{selectedUserDetail.stats.absent}</p>
                  <p className="text-[8px] text-red-600 uppercase">Absent</p>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/10 p-1.5 rounded-xl">
                  <p className="text-amber-500 font-black">{selectedUserDetail.stats.leave}</p>
                  <p className="text-[8px] text-amber-600 uppercase">Leave</p>
                </div>
                <div className="bg-blue-500/5 border border-blue-500/10 p-1.5 rounded-xl">
                  <p className="text-blue-500 font-black">{selectedUserDetail.stats.holiday}</p>
                  <p className="text-[8px] text-blue-600 uppercase">Holiday</p>
                </div>
              </div>
            </div>

            <ScrollArea className="max-h-[300px] w-full border border-border/40 rounded-2xl">
              <div className="p-3 space-y-2">
                {Array.isArray(selectedUserDetail.days) ? (
                  selectedUserDetail.days.map((day, idx) => {
                    const cfg = statusConfig[day.status] || statusConfig.UNMARKED
                    return (
                      <div key={idx} className="flex justify-between items-center bg-background border border-border/30 rounded-xl p-3">
                        <div>
                          <p className="text-sm font-bold">{format(new Date(day.date), 'EEEE, MMM d, yyyy')}</p>
                          {day.title && <p className="text-[10px] text-blue-500 font-bold mt-0.5">{day.title}</p>}
                        </div>
                        <Badge className={cn("text-[9px] font-black uppercase border px-2 py-0.5", cfg.style)}>
                          {cfg.label}
                        </Badge>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex justify-between items-center bg-background border border-border/30 rounded-xl p-3">
                    <div>
                      <p className="text-sm font-bold">
                        {format(new Date((selectedUserDetail.days as AttendanceDay).date), 'EEEE, MMM d, yyyy')}
                      </p>
                      {(selectedUserDetail.days as AttendanceDay).title && (
                        <p className="text-[10px] text-blue-500 font-bold mt-0.5">{(selectedUserDetail.days as AttendanceDay).title}</p>
                      )}
                    </div>
                    <Badge className={cn("text-[9px] font-black uppercase border px-2 py-0.5", (statusConfig[(selectedUserDetail.days as AttendanceDay).status] || statusConfig.UNMARKED).style)}>
                      {(statusConfig[(selectedUserDetail.days as AttendanceDay).status] || statusConfig.UNMARKED).label}
                    </Badge>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  )
}
