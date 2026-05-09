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
    try { await apiFetch('/auth/logout', { method: 'POST' }) } catch {}
    dispatch(logout())
    router.push('/login')
  }

  if (!mounted) return null
  if (user && user.role !== 'TEACHER') return null

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="fixed top-0 left-0 w-full h-64 bg-primary/10 blur-[120px] -z-10" />

      {/* Header */}
      <header className="px-6 pt-12 pb-8 space-y-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary animate-in fade-in slide-in-from-left-4 duration-500">
              {greeting}
            </p>
            <h1 className="text-3xl font-black tracking-tight animate-in fade-in slide-in-from-left-6 duration-700">
              {firstName} <span className="text-muted-foreground/30">.</span>
            </h1>
            <p className="text-xs text-muted-foreground font-medium">Teacher Portal</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/teacher/leaves')}
              className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center hover:bg-muted transition-colors relative"
            >
              <RiCalendarCheckLine className="w-5 h-5" />
              {pendingLeaves.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-[9px] font-black flex items-center justify-center">
                  {pendingLeaves.length}
                </span>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <RiLogoutBoxLine className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 space-y-8">
        {/* Quick Action Cards */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 px-1">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Manage Homework', icon: RiBookOpenLine, route: '/teacher/homework', color: 'bg-primary/10 text-primary', border: 'hover:border-primary/40' },
              { label: 'Mark Attendance', icon: RiCheckLine, route: '/teacher/attendance', color: 'bg-blue-500/10 text-blue-600', border: 'hover:border-blue-500/40' },
              { label: 'Leave Requests', icon: RiCalendarCheckLine, route: '/teacher/leaves', color: 'bg-amber-500/10 text-amber-600', border: 'hover:border-amber-500/40', badge: pendingLeaves.length },
              { label: 'Send Broadcast', icon: RiMegaphoneLine, route: '/teacher/broadcast', color: 'bg-emerald-500/10 text-emerald-600', border: 'hover:border-emerald-500/40' },
              { label: 'My Schedule', icon: RiTimeLine, route: '/teacher/schedule', color: 'bg-purple-500/10 text-purple-600', border: 'hover:border-purple-500/40' },
            ].map(({ label, icon: Icon, route, color, border, badge }) => (
              <button
                key={label}
                onClick={() => router.push(route)}
                className={cn("rounded-3xl border border-border/50 bg-background/60 backdrop-blur-md p-5 text-left transition-all duration-200 active:scale-[0.97]", border)}
              >
                <div className="space-y-4">
                  <div className="relative inline-flex">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {badge != null && badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-primary-foreground rounded-full text-[9px] font-black flex items-center justify-center">
                        {badge}
                      </span>
                    )}
                  </div>
                  <p className="font-black text-sm leading-tight">{label}</p>
                </div>
              </button>
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

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full h-20 bg-background/80 backdrop-blur-xl border-t border-border/40 px-6 flex items-center justify-between z-50">
        <button onClick={() => router.push('/teacher')} className="flex flex-col items-center gap-1 text-primary">
          <RiDashboard3Line className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Dash</span>
        </button>
        <button onClick={() => router.push('/teacher/homework')} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          <RiBookOpenLine className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Homework</span>
        </button>
        <button onClick={() => router.push('/teacher/leaves')} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors relative">
          <RiCalendarCheckLine className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Leaves</span>
          {pendingLeaves.length > 0 && <span className="absolute top-0 right-2 w-2 h-2 bg-primary rounded-full" />}
        </button>
        <button onClick={() => router.push('/teacher/broadcast')} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          <RiMegaphoneLine className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Broadcast</span>
        </button>
        <button onClick={() => router.push('/teacher/profile')} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          <RiUserLine className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
        </button>
      </nav>
    </div>
  )
}
