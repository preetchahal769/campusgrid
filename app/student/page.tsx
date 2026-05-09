"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { apiFetch, getImageUrl } from "@/lib/api"
import { 
  setLoading, 
  setProfile, 
  setAssignments, 
  setBroadcasts, 
  setTimetable, 
  setAttendance,
  setError 
} from "@/lib/store/slices/studentSlice"
import { 
  RiNotification3Line, 
  RiCalendarEventLine, 
  RiBookOpenLine, 
  RiPulseLine, 
  RiSearchLine,
  RiArrowRightSLine,
  RiDashboard3Line,
  RiFocus2Line,
  RiChatSmile3Line,
  RiUserLine,
  RiCheckLine,
} from "@remixicon/react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function StudentDashboardPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)
  const { profile, assignments, broadcasts, attendance, isLoading } = useAppSelector((state) => state.student)
  const [mounted, setMounted] = useState(false)
  
  // Real attendance % computed from Redux state
  const totalDays = attendance.length
  const presentDays = attendance.filter(a => a.status === 'PRESENT').length
  const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : null
  
  // Profile name is the real student name from /students/me
  // Fall back to auth user name from login response, then generic
  const fullName = profile?.users?.name || user?.name || "Student"
  const firstName = fullName.split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening"

  useEffect(() => {
    setMounted(true)
    // Role-based protection
    if (user && user.role !== 'STUDENT') {
      router.replace(`/${user.role.toLowerCase()}`)
      return
    }

    const fetchData = async () => {
      dispatch(setLoading(true))
      try {
        const [profileData, assignmentsData, broadcastsData, timetableData, attendanceData] = await Promise.all([
          apiFetch('/students/me'),
          apiFetch('/academics/assignments'),
          apiFetch('/communications/broadcasts'),
          apiFetch('/academics/timetable/section/me').catch(async () => {
            const p = await apiFetch('/students/me')
            return apiFetch(`/academics/timetable/section/${p.section.id}`)
          }),
          apiFetch('/attendance/me'),
        ])

        dispatch(setProfile(profileData))
        dispatch(setAssignments(assignmentsData))
        dispatch(setBroadcasts(broadcastsData))
        dispatch(setTimetable(timetableData))
        dispatch(setAttendance(attendanceData))
      } catch (err: any) {
        dispatch(setError(err.message))
      } finally {
        dispatch(setLoading(false))
      }
    }

    fetchData()
  }, [dispatch])

  if (!mounted) return null
  if (user && user.role !== 'STUDENT') return null

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Dynamic Background Blur */}
      <div className="fixed top-0 left-0 w-full h-64 bg-primary/10 blur-[120px] -z-10" />
      
      {/* Header Section */}
      <header className="px-6 pt-12 pb-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary animate-in fade-in slide-in-from-left-4 duration-500">
              {greeting}
            </h2>
            <h1 className="text-3xl font-black tracking-tight animate-in fade-in slide-in-from-left-6 duration-700">
              {firstName} <span className="text-muted-foreground/30">.</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/notices')}
              className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center hover:bg-muted transition-colors relative group"
            >
              <RiNotification3Line className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {broadcasts.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
              )}
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform overflow-hidden"
            >
              {user?.photoUrl ? (
                <img src={getImageUrl(user.photoUrl)} alt={firstName} className="w-full h-full object-cover" />
              ) : (
                firstName[0]
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search lessons, tests..." 
            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-muted/40 border-border/40 focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all font-medium outline-none"
          />
        </div>
      </header>

      <main className="px-6 space-y-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <button
            onClick={() => router.push('/attendance')}
            className="rounded-3xl border border-border/50 bg-background/60 backdrop-blur-md overflow-hidden group hover:border-emerald-500/40 text-left transition-colors active:scale-[0.97]"
          >
            <div className="p-5 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <RiPulseLine className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Attendance</p>
                <h3 className="text-2xl font-black tracking-tight">
                  {attendancePct !== null ? (
                    <>{attendancePct}<span className="text-sm font-bold text-muted-foreground/60">%</span></>
                  ) : (
                    <span className="text-lg text-muted-foreground/40">—</span>
                  )}
                </h3>
              </div>
            </div>
          </button>
          <Card className="rounded-3xl border-border/50 bg-background/60 backdrop-blur-md overflow-hidden group hover:border-primary/30 transition-colors">
            <CardContent className="p-5 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <RiFocus2Line className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Global Rank</p>
                <h3 className="text-2xl font-black tracking-tight">
                  {profile?.users?.globalRank ? (
                    <>#{ profile.users.globalRank}<span className="text-sm font-bold text-muted-foreground/60"></span></>
                  ) : (
                    <span className="text-lg text-muted-foreground/40">—</span>
                  )}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments Learning Track */}
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <RiBookOpenLine className="w-5 h-5 text-primary" />
              Homework
            </h3>
            <Button variant="ghost" size="sm" onClick={() => router.push('/homework')} className="text-xs font-bold text-primary gap-1">
              View All <RiArrowRightSLine className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {assignments.length === 0 ? (
              [1, 2].map((i) => (
                <div key={i} className="min-w-[280px] h-40 rounded-3xl bg-muted/30 border border-dashed border-border/60 flex items-center justify-center text-muted-foreground animate-pulse">
                  <span className="text-xs font-bold italic opacity-30">Loading assignments...</span>
                </div>
              ))
            ) : (
              assignments.map((assignment) => (
                <Card 
                  key={assignment.id} 
                  className={cn(
                    "min-w-[280px] rounded-3xl border-border/50 bg-gradient-to-br from-background to-muted/20 hover:border-primary/40 transition-all overflow-hidden group",
                    assignment.isSubmitted && "opacity-60 grayscale-[30%]"
                  )}
                >
                  <CardContent className="p-5 flex flex-col justify-between h-full">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="rounded-full px-3 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-tighter">
                          {assignment.subject.name}
                        </Badge>
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {assignment.isSubmitted ? "Completed" : "Due in 2 days"}
                        </span>
                      </div>
                      <h4 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">
                        {assignment.title}
                      </h4>
                    </div>
                    <Button 
                      variant={assignment.isSubmitted ? "outline" : "default"}
                      onClick={() => router.push('/homework')}
                      className={cn(
                        "w-full mt-4 rounded-xl font-bold text-xs h-10 transition-all",
                        assignment.isSubmitted ? "border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/5" : "shadow-md shadow-primary/20"
                      )}
                    >
                      {assignment.isSubmitted ? (
                        <>
                          <RiCheckLine className="w-4 h-4 mr-1.5" />
                          Submitted
                        </>
                      ) : (
                        "Submit Work"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Schedule Preview */}
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700 pb-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <RiCalendarEventLine className="w-5 h-5 text-primary" />
              Next Up
            </h3>
          </div>
          <Card className="rounded-3xl border-border/50 bg-background/60 backdrop-blur-md overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-black leading-none opacity-60">09</span>
                  <span className="text-xl font-black leading-none">30</span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Mathematics</span>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[8px] h-4">Live Now</Badge>
                  </div>
                  <h4 className="font-bold text-base">Advanced Calculus - Room 402</h4>
                  <p className="text-[10px] font-medium text-muted-foreground">Prof. Anderson . 1h 20m remaining</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Floating Chat Button */}
      <button className="fixed bottom-28 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40">
        <RiChatSmile3Line className="w-7 h-7" />
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full h-20 bg-background/80 backdrop-blur-xl border-t border-border/40 px-8 flex items-center justify-between z-50">
        <button onClick={() => router.push('/student')} className="flex flex-col items-center gap-1 text-primary">
          <RiDashboard3Line className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Dash</span>
        </button>
        <button onClick={() => router.push('/homework')} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          <RiBookOpenLine className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Learn</span>
        </button>
        <button onClick={() => router.push('/timetable')} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          <RiCalendarEventLine className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Dates</span>
        </button>
        <button onClick={() => router.push('/profile')} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          <RiUserLine className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
        </button>
      </nav>
    </div>
  )
}
