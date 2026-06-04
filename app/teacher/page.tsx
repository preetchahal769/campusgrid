"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setTimetable, setLeaveRequests, setLoading, setError, setTeacherProfile } from "@/lib/store/slices/teacherSlice"
import { logout } from "@/lib/store/slices/authSlice"
import { apiFetch } from "@/lib/api"
import {
  RiAddCircleLine,
  RiCalendarCheckLine,
  RiNotification3Line,
  RiLogoutBoxLine,
  RiBookOpenLine,
  RiUserLine,
  RiLoader4Line,
  RiDashboard3Line,
  RiMegaphoneLine,
  RiTimeLine,
  RiCheckLine,
} from "@remixicon/react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ColorfulCard } from "@/components/ui/colorful-card"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function TeacherDashboardPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { timetable, leaveRequests, isLoading, profile } = useAppSelector((state) => state.teacher)
  const [mounted, setMounted] = useState(false)

  // Use teacher profile name if available, fallback to auth user name
  const firstName = (profile?.users?.name || user?.name)?.split(' ')[0] || 'Teacher'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const todayClasses = timetable.filter(t => t.dayOfWeek === todayName).sort((a, b) => a.lectureNo - b.lectureNo)
  const pendingLeaves = leaveRequests.filter(l => l.status === 'PENDING')

  useEffect(() => {
    setMounted(true)
    // Role-based protection
    if (user && user.role !== 'TEACHER') {
      router.replace(`/${user.role.toLowerCase()}`)
      return
    }

    const fetchData = async () => {
      dispatch(setLoading(true))
      try {
        const [profileData, leavesData] = await Promise.all([
          apiFetch('/teachers/me'),
          apiFetch('/academics/leaves'),
        ])
        dispatch(setTeacherProfile(profileData))
        dispatch(setLeaveRequests(leavesData))

        // Fetch timetable using the teacher profile ID
        if (profileData?.id) {
          const timetableData = await apiFetch(`/academics/timetable/teacher/${profileData.id}`)
          dispatch(setTimetable(Array.isArray(timetableData) ? timetableData : []))
        }
      } catch (err: any) {
        dispatch(setError(err.message))
      } finally {
        dispatch(setLoading(false))
      }
    }
    fetchData()
  }, [dispatch])

  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to terminate session on backend during logout:', error)
      }
    }
    dispatch(logout())
    router.push('/login')
  }

  if (!mounted) return null
  if (user && user.role !== 'TEACHER') return null

  return (
    <div className="relative overflow-x-hidden min-h-full pb-10">
      {/* Blue Sweeping Header Background */}
      <div className="absolute top-0 left-0 w-full h-[280px] bg-[#0A4EA6] rounded-b-[3rem] -z-10" />

      <main className="px-5 md:px-8 pt-6 space-y-8">
        {/* School Updates Banner (Overlapping) */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-sm font-bold text-white mb-3 px-1">School Updates</h2>
          <Card className="rounded-3xl border-none shadow-lg bg-white overflow-hidden flex flex-col md:flex-row gap-4">
            <div className="p-6 md:p-8 flex-1">
              <h3 className="text-xl md:text-2xl font-black text-zinc-900 mb-2">Welcome Back!</h3>
              <p className="text-sm md:text-base text-zinc-600 font-medium">Your schedule is ready for today. You have {todayClasses.length} classes scheduled.</p>
            </div>
            <div className="w-full md:w-1/3 bg-blue-50/50 min-h-[120px]" />
          </Card>
        </section>

        {/* Academics Grid (3 Column) */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 mt-8">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 mb-4 px-1">Academics</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {[
              { label: 'Homework', icon: RiBookOpenLine, route: '/teacher/homework', color: 'text-[#FA5D5D]', bg: 'bg-[#FA5D5D]/10' },
              { label: 'Attendance', icon: RiCheckLine, route: '/teacher/attendance', color: 'text-[#6FCA72]', bg: 'bg-[#6FCA72]/10' },
              { label: 'Leaves', icon: RiCalendarCheckLine, route: '/teacher/leaves', badge: pendingLeaves.length, color: 'text-[#FDB543]', bg: 'bg-[#FDB543]/10' },
              { label: 'Broadcast', icon: RiMegaphoneLine, route: '/teacher/broadcast', color: 'text-[#45A3F5]', bg: 'bg-[#45A3F5]/10' },
              { label: 'Schedule', icon: RiTimeLine, route: '/teacher/schedule', color: 'text-[#825CD6]', bg: 'bg-[#825CD6]/10' },
            ].map(({ label, icon: Icon, route, color, bg, badge }) => (
              <Card
                key={label}
                className="cursor-pointer hover:shadow-md transition-all rounded-3xl border border-zinc-100 shadow-sm aspect-square flex flex-col items-center justify-center p-3 relative group"
                onClick={() => router.push(route)}
              >
                {badge != null && badge > 0 && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-[#FA5D5D] text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-md z-10">
                    {badge}
                  </span>
                )}
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", bg, color)}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="font-bold text-[11px] md:text-sm text-center text-zinc-700 leading-tight">{label}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Today's Schedule */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
            Today's Classes — {todayName}
          </h2>
          {isLoading ? (
            <div className="flex justify-center py-8"><RiLoader4Line className="w-6 h-6 animate-spin text-primary opacity-50" /></div>
          ) : todayClasses.length === 0 ? (
            <Card className="rounded-3xl border-dashed border-border/60 bg-background/40">
              <CardContent className="p-6 text-center text-muted-foreground font-semibold text-sm">
                No classes scheduled for today
              </CardContent>
            </Card>
          ) : (
            todayClasses.map((entry, i) => {
              const subject = entry.teachersubjectsection?.subject ?? entry.subject
              const section = entry.teachersubjectsection?.section ?? entry.section
              
              return (
                <Card key={entry.id ?? i} className="rounded-3xl border-border/50 bg-background/60 backdrop-blur-md overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="w-20 bg-muted/30 border-r border-border/30 flex flex-col items-center justify-center p-4 gap-1 shrink-0">
                        <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/60">L{entry.lectureNo}</span>
                        {entry.startTime && <span className="text-xs font-black">{entry.startTime}</span>}
                        {entry.endTime && (
                          <>
                            <div className="w-px h-3 bg-border/40" />
                            <span className="text-xs font-bold opacity-40">{entry.endTime}</span>
                          </>
                        )}
                      </div>
                      <div className="flex-1 p-4 space-y-2">
                        <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase">
                          {subject?.name ?? '—'}
                        </Badge>
                        <div>
                          <p className="font-black text-base">{section?.grade?.name} — {section?.name}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </section>
      </main>

    </div>
  )
}
